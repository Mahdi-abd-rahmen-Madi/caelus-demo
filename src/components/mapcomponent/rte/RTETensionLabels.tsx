import React, { useEffect, useRef, memo } from 'react';
import maplibregl from 'maplibre-gl';

export type RTETensionLabelsProps = {
    map: maplibregl.Map | null;
    visible: boolean;
    layers: {
        aerien: boolean;
        souterrain: boolean;
        voltageRange: [number, number];
    };
    opacity?: number;
    onLoadingChange?: (layer: string, loading: boolean) => void;
    onLoadError?: (error: string) => void;
};

const RTETensionLabels: React.FC<RTETensionLabelsProps> = ({
    map,
    visible = false,
    layers,
    opacity = 0.7,
    onLoadingChange,
    onLoadError
}) => {
    const sourceId = 'rte-source'; // Share same source as RTE component
    const aerienLabelLayerId = 'rte-tension-labels-aerien';
    const souterrainLabelLayerId = 'rte-tension-labels-souterrain';
    const initializedRef = useRef(false);

    // Initialize tension label layers when map is available
    useEffect(() => {
        if (!map || !visible) return;

        function initializeLabels() {
            if (!map || !map.isStyleLoaded()) return;

            onLoadingChange?.('rte-tension-labels', true);

            // Remove existing label layers if they exist
            if (map.getLayer(aerienLabelLayerId)) {
                map.removeLayer(aerienLabelLayerId);
            }
            if (map.getLayer(souterrainLabelLayerId)) {
                map.removeLayer(souterrainLabelLayerId);
            }

            try {
                // Check if RTE source exists (created by main RTE component)
                if (!map.getSource(sourceId)) {
                    onLoadError?.('RTE source not found - enable RTE network first');
                    onLoadingChange?.('rte-tension-labels', false);
                    return;
                }

                // Aerien tension indicators (using circles instead of text to avoid glyphs issues)
                map.addLayer({
                    id: aerienLabelLayerId,
                    type: 'circle',
                    source: sourceId,
                    'source-layer': 'rte_tile',
                    filter: [
                        'all',
                        ['==', ['get', 'line_type'], 'aerien'],
                        ['has', 'tension']
                    ],
                    paint: {
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            12, 3,
                            16, 6
                        ],
                        'circle-color': [
                            'match',
                            ['get', 'tension'],
                            '45kV', '#22c55e',  // Green for low voltage
                            '63kV', '#22c55e',  // Green for low voltage
                            '90kV', '#f59e0b',  // Amber for medium voltage
                            '150kV', '#f59e0b', // Amber for medium voltage
                            '225kV', '#ef4444', // Red for high voltage
                            '400kV', '#ef4444', // Red for high voltage
                            '#6b7280'          // Gray for unknown
                        ],
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 2,
                        'circle-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            12, 0,
                            13, 0.7,
                            14, 1
                        ]
                    },
                    minzoom: 12
                });

                // Souterrain tension indicators (using circles instead of text to avoid glyphs issues)
                map.addLayer({
                    id: souterrainLabelLayerId,
                    type: 'circle',
                    source: sourceId,
                    'source-layer': 'rte_tile',
                    filter: [
                        'all',
                        ['==', ['get', 'line_type'], 'souterrain'],
                        ['has', 'tension']
                    ],
                    paint: {
                        'circle-radius': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            12, 3,
                            16, 6
                        ],
                        'circle-color': [
                            'match',
                            ['get', 'tension'],
                            '45kV', '#22c55e',  // Green for low voltage
                            '63kV', '#22c55e',  // Green for low voltage
                            '90kV', '#f59e0b',  // Amber for medium voltage
                            '150kV', '#f59e0b', // Amber for medium voltage
                            '225kV', '#ef4444', // Red for high voltage
                            '400kV', '#ef4444', // Red for high voltage
                            '#6b7280'          // Gray for unknown
                        ],
                        'circle-stroke-color': '#ffffff',
                        'circle-stroke-width': 2,
                        'circle-opacity': [
                            'interpolate',
                            ['linear'],
                            ['zoom'],
                            12, 0,
                            13, 0.7,
                            14, 1
                        ]
                    },
                    minzoom: 12
                });

                initializedRef.current = true;
                onLoadingChange?.('rte-tension-labels', false);
                onLoadError?.('');

            } catch (error) {
                console.error('Error initializing RTE tension labels:', error);
                onLoadError?.('Failed to load RTE tension labels');
                onLoadingChange?.('rte-tension-labels', false);
            }
        }

        // Handle style changes
        const handleStyleChange = () => {
            setTimeout(() => {
                if (map && map.isStyleLoaded()) {
                    initializeLabels();
                }
            }, 100);
        };

        window.addEventListener('mapStyleChanged', handleStyleChange);

        // Wait for style to be loaded before initialization
        if (!map.isStyleLoaded()) {
            const handleStyleData = () => {
                setTimeout(() => {
                    if (map && map.isStyleLoaded()) {
                        initializeLabels();
                    }
                }, 50);
                map.off('styledata', handleStyleData);
            };
            map.on('styledata', handleStyleData);
        } else {
            setTimeout(initializeLabels, 50);
        }

        return () => {
            window.removeEventListener('mapStyleChanged', handleStyleChange);
        };
    }, [map, visible, layers, opacity]);

    // Update label visibility when props change
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;

        // For circle layers, we need to remove and recreate them when visibility changes
        // since circle layers don't have visibility property that works well with our setup
        if (visible && layers.aerien) {
            // Aerien layer will be recreated in the main effect if needed
        } else {
            if (map.getLayer(aerienLabelLayerId)) {
                map.removeLayer(aerienLabelLayerId);
            }
        }

        if (visible && layers.souterrain) {
            // Souterrain layer will be recreated in the main effect if needed
        } else {
            if (map.getLayer(souterrainLabelLayerId)) {
                map.removeLayer(souterrainLabelLayerId);
            }
        }
    }, [map, visible, layers.aerien, layers.souterrain]);

    return null;
};

export default memo(RTETensionLabels);
