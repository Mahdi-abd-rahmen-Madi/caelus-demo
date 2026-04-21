import maplibregl, { VectorTileSource } from 'maplibre-gl';
import React, { memo, useEffect, useRef } from 'react';

export type RTEFeature = {
    type: 'Feature';
    geometry: {
        type: 'LineString' | 'MultiLineString';
        coordinates: number[][];
    };
    properties: {
        line_type: string;
        tension: string;
        etat: string;
        code_ligne: string;
    };
};

export type RTEProps = {
    map: maplibregl.Map | null;
    visible: boolean;
    layers: {
        aerien: boolean;
        souterrain: boolean;
        voltageRange: [number, number];
    };
    tensionMode?: boolean;
    opacity?: number;
    onLoadingChange?: (layer: string, loading: boolean) => void;
    onLoadError?: (error: string) => void;
    onFeatureClick?: (feature: RTEFeature, layerType: string) => void;
};

const RTE: React.FC<RTEProps> = memo(({
    map,
    visible,
    layers,
    tensionMode = false,
    opacity = 0.7,
    onLoadingChange,
    onLoadError,
    onFeatureClick
}) => {
    const sourceId = 'rte-source';
    const aerienLayerId = 'rte-aerien';
    const souterrainLayerId = 'rte-souterrain';
    const initializedRef = useRef(false);
    const mapRef = useRef(map);

    // Update mapRef when map prop changes
    useEffect(() => {
        mapRef.current = map;
    }, [map]);

    // Initialize source and layers when map is available
    useEffect(() => {
        if (!map) return;

        function initializeSource() {
            if (!map || !map.isStyleLoaded()) return;

            onLoadingChange?.('rte', true);

            // Remove existing layers first (before source)
            if (map.getLayer(aerienLayerId)) {
                map.removeLayer(aerienLayerId);
            }
            if (map.getLayer(souterrainLayerId)) {
                map.removeLayer(souterrainLayerId);
            }
            // Remove source only after layers are removed
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }

            try {
                // Add source
                map.addSource(sourceId, {
                    type: 'vector',
                    tiles: [
                        // Build tile URL with filters - only include non-empty parameters
                        (() => {
                            const params = new URLSearchParams();
                            if (layers.aerien && !layers.souterrain) {
                                params.set('line_type', 'aerien');
                            } else if (layers.souterrain && !layers.aerien) {
                                params.set('line_type', 'souterrain');
                            }
                            // Only add voltage range if it's not the full range
                            if (layers.voltageRange[0] !== 45 || layers.voltageRange[1] !== 400) {
                                params.set('voltage_min', `${layers.voltageRange[0]}kV`);
                                params.set('voltage_max', `${layers.voltageRange[1]}kV`);
                            }
                            const paramString = params.toString();
                            return `${window.location.origin}/api/geodata/tiles/rte/{z}/{x}/{y}/${paramString ? '?' + paramString : ''}`;
                        })()
                    ],
                    minzoom: 6,
                    maxzoom: 16,
                    attribution: '© RTE - Réseau de Transport d\'Électricité'
                });

                // Add aerien layer with voltage-specific colors
                map.addLayer({
                    id: aerienLayerId,
                    type: 'line',
                    source: sourceId,
                    'source-layer': 'rte_tile',
                    filter: ['==', ['get', 'line_type'], 'aerien'],
                    paint: {
                        'line-color': [
                            'match',
                            ['get', 'tension'],
                            '45kV', '#10b981',  // Emerald green for 45kV
                            '63kV', '#22c55e',  // Green for 63kV
                            '90kV', '#f59e0b',  // Amber for 90kV
                            '150kV', '#f97316', // Orange for 150kV
                            '225kV', '#ef4444', // Red for 225kV
                            '400kV', '#dc2626', // Dark red for 400kV
                            '#fbbf24'           // Default yellow (fallback)
                        ],
                        'line-width': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            6, 1,
                            16, 3
                        ],
                        'line-opacity': opacity
                    },
                    layout: {
                        'visibility': visible && layers.aerien ? 'visible' : 'none'
                    }
                });

                // Add souterrain layer with voltage-specific colors
                map.addLayer({
                    id: souterrainLayerId,
                    type: 'line',
                    source: sourceId,
                    'source-layer': 'rte_tile',
                    filter: ['==', ['get', 'line_type'], 'souterrain'],
                    paint: {
                        'line-color': [
                            'match',
                            ['get', 'tension'],
                            '45kV', '#10b981',  // Emerald green for 45kV
                            '63kV', '#22c55e',  // Green for 63kV
                            '90kV', '#f59e0b',  // Amber for 90kV
                            '150kV', '#f97316', // Orange for 150kV
                            '225kV', '#ef4444', // Red for 225kV
                            '400kV', '#dc2626', // Dark red for 400kV
                            '#3b82f6'           // Default blue (fallback)
                        ],
                        'line-width': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            6, 2,
                            16, 6
                        ],
                        'line-opacity': opacity
                    },
                    layout: {
                        'visibility': visible && layers.souterrain ? 'visible' : 'none'
                    }
                });

                // Add click handlers
                const handleMapClick = (e: any) => {
                    if (!e.features || e.features.length === 0) return;

                    const feature = e.features[0] as RTEFeature;
                    const layerType = feature.properties.line_type;

                    onFeatureClick?.(feature, layerType);
                };

                map.on('click', [aerienLayerId, souterrainLayerId], handleMapClick);

                // Change cursor on hover
                const handleMouseEnter = () => {
                    map.getCanvas().style.cursor = 'pointer';
                };

                const handleMouseLeave = () => {
                    map.getCanvas().style.cursor = '';
                };

                map.on('mouseenter', aerienLayerId, handleMouseEnter);
                map.on('mouseleave', aerienLayerId, handleMouseLeave);
                map.on('mouseenter', souterrainLayerId, handleMouseEnter);
                map.on('mouseleave', souterrainLayerId, handleMouseLeave);

                initializedRef.current = true;
                onLoadingChange?.('rte', false);
                onLoadError?.('');

            } catch (error) {
                console.error('Error initializing RTE layers:', error);
                onLoadError?.('Failed to load RTE layers');
                onLoadingChange?.('rte', false);
            }
        }

        // Handle style changes
        const handleStyleChange = () => {
            setTimeout(() => {
                if (map && map.isStyleLoaded()) {
                    initializeSource();
                }
            }, 100);
        };

        window.addEventListener('mapStyleChanged', handleStyleChange);

        // FIXED: Always wait for style to be loaded before initialization
        if (!map.isStyleLoaded()) {
            const handleStyleData = () => {
                // Add a small delay to ensure style is fully processed
                setTimeout(() => {
                    if (map && map.isStyleLoaded()) {
                        initializeSource();
                    }
                }, 50);
                map.off('styledata', handleStyleData);
            };
            map.on('styledata', handleStyleData);
        } else {
            // Even if isStyleLoaded() returns true, add a small delay
            // to ensure the style is fully processed
            setTimeout(initializeSource, 50);
        }

        return () => {
            window.removeEventListener('mapStyleChanged', handleStyleChange);
        };
    }, [map, visible, layers, opacity, tensionMode]);

    // Update layer visibility and source URL when props change
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;

        // Update layer visibility and source URL when props change
        if (map.getLayer(aerienLayerId)) {
            map.setLayoutProperty(aerienLayerId, 'visibility',
                visible && layers.aerien ? 'visible' : 'none');
        }
        if (map.getLayer(souterrainLayerId)) {
            map.setLayoutProperty(souterrainLayerId, 'visibility',
                visible && layers.souterrain ? 'visible' : 'none');
        }

        const source = map.getSource(sourceId) as VectorTileSource;
        if (source) {
            // Build clean tile URL without empty parameters
            const params = new URLSearchParams();
            if (layers.aerien && !layers.souterrain) {
                params.set('line_type', 'aerien');
            } else if (layers.souterrain && !layers.aerien) {
                params.set('line_type', 'souterrain');
            }
            // Only add voltage range if it's not the full range
            if (layers.voltageRange[0] !== 45 || layers.voltageRange[1] !== 400) {
                params.set('voltage_min', `${layers.voltageRange[0]}kV`);
                params.set('voltage_max', `${layers.voltageRange[1]}kV`);
            }
            const paramString = params.toString();
            const newTiles = [
                `${window.location.origin}/api/geodata/tiles/rte/{z}/{x}/{y}/${paramString ? '?' + paramString : ''}`
            ];
            source.tiles = newTiles;
        }
    }, [map, visible, layers.aerien, layers.souterrain, layers.voltageRange]);

    return null;
});

export default memo(RTE);
