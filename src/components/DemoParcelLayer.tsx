import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { getParcelsByLocation } from '../services/api';

// Define local interface since VacantParcelProperties is not available
interface LocalVacantParcelProperties {
    parcel_id?: string;
    area?: number;
    plu_zone_code?: string;
    seismic_zone_class?: string;
    flood_zone_class?: string;
    department_code?: string;
    nearest_enedis_distance_m?: number;
    nearest_railway_distance_m?: number;
    nearest_hta_souterrain_distance_m?: number;
    slope_value?: number;
    candidate_score?: number;
}

// Define the types locally since they're not in the demo
interface EnhancedParcelProperties extends LocalVacantParcelProperties {
    longitude: number;
    latitude: number;
    plu_zone_type?: string;
    radon_class?: number;
    gonfle?: any;
    georisques_data?: any;
}

interface DemoParcelLayerProps {
    map: maplibregl.Map | null;
    id?: string;
    sourceId?: string;
    visible?: boolean;
    onParcelClick?: (properties: LocalVacantParcelProperties | EnhancedParcelProperties) => void;
    paintProperties?: {
        fillColor?: string;
        fillOpacity?: number;
        fillOutlineColor?: string;
    };
    highlightedParcelId?: string | null;
}

// Default layer style
const defaultStyle = {
    fill: { 'fill-color': '#8b5cf6', 'fill-opacity': 0.7 },
    outline: { 'line-color': '#7c3aed', 'line-width': 1 }
};

const DemoParcelLayerComponent: React.FC<DemoParcelLayerProps> = memo(({
    map,
    id = 'demo-parcel-layer',
    sourceId = 'demo-parcel-source',
    visible = true,
    onParcelClick,
    paintProperties,
    highlightedParcelId
}) => {
    const initializedRef = useRef(false);

    // Get current style based on paint properties
    const getCurrentStyle = useCallback(() => {
        if (paintProperties?.fillColor) {
            return {
                fill: {
                    'fill-color': paintProperties.fillColor,
                    'fill-opacity': paintProperties.fillOpacity || 0.7
                },
                outline: {
                    'line-color': paintProperties.fillOutlineColor || '#c0392b',
                    'line-width': 1
                }
            };
        }
        return defaultStyle;
    }, [paintProperties]);

    // Load real parcel data from API
    const [parcelData, setParcelData] = useState<any>(null);
    
    const loadRealParcels = useCallback(async () => {
        try {
            const response = await getParcelsByLocation();
            setParcelData(response);
        } catch (error) {
            console.error('Failed to load real parcel data:', error);
        }
    }, []);

    // Load real parcel data on mount
    useEffect(() => {
        loadRealParcels();
    }, [loadRealParcels]);

    // Initialize source and layers
    useEffect(() => {
        if (!map || !visible || !parcelData) return;

        function initializeSource() {
            if (!map || !map.isStyleLoaded()) return;

            // Add GeoJSON source with real parcel data
            if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: parcelData,
                    generateId: true
                });
            }

            // Add fill layer
            const fillLayerId = `${id}-fill`;
            if (!map.getLayer(fillLayerId)) {
                const currentStyle = getCurrentStyle();
                map.addLayer({
                    id: fillLayerId,
                    type: 'fill',
                    source: sourceId,
                    paint: currentStyle.fill,
                    layout: { visibility: visible ? 'visible' : 'none' }
                });

                // Add click handler
                if (onParcelClick) {
                    map.on('click', fillLayerId, (e) => {
                        if (e.features && e.features.length > 0) {
                            const feature = e.features[0];
                            const properties = feature.properties as any;
                            onParcelClick(properties);
                        }
                    });

                    // Change cursor on hover
                    map.on('mouseenter', fillLayerId, () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });
                    map.on('mouseleave', fillLayerId, () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            }

            // Add outline layer
            const outlineLayerId = `${id}-outline`;
            if (!map.getLayer(outlineLayerId)) {
                const currentStyle = getCurrentStyle();
                map.addLayer({
                    id: outlineLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: currentStyle.outline,
                    layout: { visibility: visible ? 'visible' : 'none' }
                });
            }

            // Add highlight layer
            const highlightLayerId = `${id}-highlight`;
            if (!map.getLayer(highlightLayerId)) {
                map.addLayer({
                    id: highlightLayerId,
                    type: 'line',
                    source: sourceId,
                    paint: {
                        'line-color': '#fbbf24',
                        'line-width': 3,
                        'line-opacity': 1
                    },
                    layout: { visibility: 'none' }
                });
            }

            initializedRef.current = true;
        }

        // Handle style changes
        const handleStyleChange = () => {
            setTimeout(() => {
                if (map && map.isStyleLoaded()) {
                    if (!map.getSource(sourceId)) {
                        initializedRef.current = false;
                        initializeSource();
                    }
                }
            }, 100);
        };

        window.addEventListener('mapStyleChanged', handleStyleChange);

        if (!map.isStyleLoaded()) {
            const handleStyleData = () => {
                initializeSource();
                map.off('styledata', handleStyleData);
            };
            map.on('styledata', handleStyleData);
        } else {
            initializeSource();
        }

        return () => {
            window.removeEventListener('mapStyleChanged', handleStyleChange);
        };
    }, [map, visible, sourceId, id, getCurrentStyle, onParcelClick, parcelData]);

    // Handle visibility changes
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;
        
        const fillLayer = map.getLayer(`${id}-fill`);
        if (fillLayer) {
            map.setLayoutProperty(`${id}-fill`, 'visibility', visible ? 'visible' : 'none');
        }
        
        const outlineLayer = map.getLayer(`${id}-outline`);
        if (outlineLayer) {
            map.setLayoutProperty(`${id}-outline`, 'visibility', visible ? 'visible' : 'none');
        }

        const highlightLayer = map.getLayer(`${id}-highlight`);
        if (highlightLayer) {
            map.setLayoutProperty(`${id}-highlight`, 'visibility', visible ? 'visible' : 'none');
        }
    }, [map, visible, id]);

    // Update highlight filter when highlightedParcelId changes
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;
        
        const highlightLayerId = `${id}-highlight`;
        if (map.getLayer(highlightLayerId)) {
            if (highlightedParcelId) {
                // Show highlight for the selected parcel
                map.setFilter(highlightLayerId, ['==', ['get', 'parcel_id'], highlightedParcelId]);
                map.setLayoutProperty(highlightLayerId, 'visibility', 'visible');
            } else {
                // Hide highlight when no parcel is selected
                map.setFilter(highlightLayerId, ['==', ['get', 'parcel_id'], '']);
                map.setLayoutProperty(highlightLayerId, 'visibility', 'none');
            }
        }
    }, [map, highlightedParcelId, id]);

    return null;
});

export default DemoParcelLayerComponent;
