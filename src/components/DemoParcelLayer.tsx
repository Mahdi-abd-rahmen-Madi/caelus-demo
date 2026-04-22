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
    minZoom?: number;
    maxZoom?: number;
    onParcelClick?: (properties: LocalVacantParcelProperties | EnhancedParcelProperties) => void;
    paintProperties?: {
        fillColor?: string;
        fillOpacity?: number;
        fillOutlineColor?: string;
    };
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
    minZoom = 14,
    maxZoom = 20,
    onParcelClick,
    paintProperties
}) => {
    const initializedRef = useRef(false);

    // Check if current zoom is within visibility range
    const isZoomInRange = useCallback(() => {
        if (!map) return false;
        const currentZoom = map.getZoom();
        return currentZoom >= minZoom && currentZoom <= maxZoom;
    }, [map, minZoom, maxZoom]);

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

            initializedRef.current = true;
            
            // Enhanced visibility triggers for high zoom levels
            const currentZoom = map.getZoom();
            const delay = currentZoom >= 14 ? 200 : 50;
            
            setTimeout(() => {
                updateLayerVisibility();
            }, delay);

            // Additional check for high zoom levels
            if (currentZoom >= 14) {
                setTimeout(() => {
                    updateLayerVisibility();
                }, 300);
            }
        }

        // Update layer visibility function
        const updateLayerVisibility = () => {
            if (!map || !initializedRef.current) return;
            
            const zoomInRange = isZoomInRange();
            const shouldShow = visible && zoomInRange;
            
            const fillLayer = map.getLayer(`${id}-fill`);
            if (fillLayer) {
                map.setLayoutProperty(`${id}-fill`, 'visibility', shouldShow ? 'visible' : 'none');
            }
            
            const outlineLayer = map.getLayer(`${id}-outline`);
            if (outlineLayer) {
                map.setLayoutProperty(`${id}-outline`, 'visibility', shouldShow ? 'visible' : 'none');
            }
        };

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
    }, [map, visible, sourceId, id, getCurrentStyle, onParcelClick, parcelData, isZoomInRange]);

    // Handle visibility changes
    useEffect(() => {
        if (!map || !map.isStyleLoaded()) return;
        
        const zoomInRange = isZoomInRange();
        const shouldShow = visible && zoomInRange;
        
        const fillLayer = map.getLayer(`${id}-fill`);
        if (fillLayer) {
            map.setLayoutProperty(`${id}-fill`, 'visibility', shouldShow ? 'visible' : 'none');
        }
        
        const outlineLayer = map.getLayer(`${id}-outline`);
        if (outlineLayer) {
            map.setLayoutProperty(`${id}-outline`, 'visibility', shouldShow ? 'visible' : 'none');
        }
    }, [map, visible, id, isZoomInRange]);

    // Add map event listeners for immediate visibility
    useEffect(() => {
        if (!map || !visible) return;

        const updateLayerVisibility = () => {
            if (!map || !initializedRef.current) return;
            
            const zoomInRange = isZoomInRange();
            const shouldShow = visible && zoomInRange;
            
            const fillLayer = map.getLayer(`${id}-fill`);
            if (fillLayer) {
                map.setLayoutProperty(`${id}-fill`, 'visibility', shouldShow ? 'visible' : 'none');
            }
            
            const outlineLayer = map.getLayer(`${id}-outline`);
            if (outlineLayer) {
                map.setLayoutProperty(`${id}-outline`, 'visibility', shouldShow ? 'visible' : 'none');
            }
        };

        const handleMapLoad = () => {
            setTimeout(() => {
                updateLayerVisibility();
            }, 50);
        };

        const handleMapMove = () => {
            if (map.getZoom() >= 14) {
                setTimeout(() => {
                    updateLayerVisibility();
                }, 100);
            }
        };

        const handleMapZoom = () => {
            setTimeout(() => {
                updateLayerVisibility();
            }, 150);
        };

        map.on('load', handleMapLoad);
        map.on('moveend', handleMapMove);
        map.on('zoomend', handleMapZoom);

        if (map.loaded()) {
            setTimeout(() => {
                updateLayerVisibility();
            }, 50);
        }

        return () => {
            if (map) {
                map.off('load', handleMapLoad);
                map.off('moveend', handleMapMove);
                map.off('zoomend', handleMapZoom);
            }
        };
    }, [map, visible, id, isZoomInRange]);

    return null;
});

export default DemoParcelLayerComponent;
