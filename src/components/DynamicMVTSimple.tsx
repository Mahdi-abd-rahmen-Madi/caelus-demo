import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useLayerVisibility } from '../hooks/useLayerVisibility';
import type { VacantParcelProperties } from '../services/api';
import type { EnhancedParcelProperties } from '../types/dashboard';

interface DynamicMVTSimpleProps {
    map: maplibregl.Map | null;
    id?: string;
    sourceId?: string;
    visible?: boolean;
    onParcelClick?: (properties: VacantParcelProperties | EnhancedParcelProperties) => void;
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

export const DynamicMVTSimple: React.FC<DynamicMVTSimpleProps> = memo(({
    map,
    id = 'dynamic-mvt-simple',
    sourceId = 'dynamic-mvt-simple-source',
    visible = true,
    onParcelClick,
    paintProperties
}) => {
    const initializedRef = useRef(false);

    // Get current style based on paint properties
    const getCurrentStyle = useCallback(() => {
        if (paintProperties?.fillColor) {
            // Custom paint properties
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

    // Initialize source and layers following Pattern B from user rules
    useEffect(() => {
        if (!map || !visible) return;

        function initializeSource() {
            if (!map || !map.isStyleLoaded()) return;

            // Add vector tile source (backend handles decompression)
            if (!map.getSource(sourceId)) {
                map.addSource(sourceId, {
                    type: 'vector',
                    tiles: ['http://localhost:8000/api/geodata/tiles/simple/parcels/{z}/{x}/{y}/'],
                    minzoom: 10,
                    maxzoom: 17
                });
            }

            // Add fill layer using vector source with source-layer
            const fillLayerId = `${id}-fill`;
            if (!map.getLayer(fillLayerId)) {
                const currentStyle = getCurrentStyle();
                map.addLayer({
                    id: fillLayerId,
                    type: 'fill',
                    source: sourceId,
                    'source-layer': 'vacant_parcels', // Required for vector tiles
                    paint: currentStyle.fill,
                    layout: { visibility: visible ? 'visible' : 'none' }
                });
            }

            // Add outline layer using vector source with source-layer
            const outlineLayerId = `${id}-outline`;
            if (!map.getLayer(outlineLayerId)) {
                const currentStyle = getCurrentStyle();
                map.addLayer({
                    id: outlineLayerId,
                    type: 'line',
                    source: sourceId,
                    'source-layer': 'vacant_parcels', // Required for vector tiles
                    paint: currentStyle.outline,
                    layout: { visibility: visible ? 'visible' : 'none' }
                });
            }

            initializedRef.current = true;
        }

        // Handle style changes only
        const handleStyleChange = () => {
            setTimeout(() => {
                if (map && map.isStyleLoaded()) {
                    initializeSource();
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
    }, [map, visible, sourceId, id, getCurrentStyle]);

    // Use standardized visibility management - handles visibility automatically
    useLayerVisibility({
        map,
        layerIds: [`${id}-fill`, `${id}-outline`],
        visible: visible || false,
        debugMode: false
    });

    // Update layer style when color mode or paint properties change
    useEffect(() => {
        if (!map || !map.isStyleLoaded() || !initializedRef.current) return;

        const fillLayerId = `${id}-fill`;
        const outlineLayerId = `${id}-outline`;
        const currentStyle = getCurrentStyle();

        if (map.getLayer(fillLayerId)) {
            // Update fill paint properties
            Object.entries(currentStyle.fill).forEach(([key, value]) => {
                map.setPaintProperty(fillLayerId, key, value);
            });
        }

        if (map.getLayer(outlineLayerId)) {
            // Update outline paint properties
            Object.entries(currentStyle.outline).forEach(([key, value]) => {
                map.setPaintProperty(outlineLayerId, key, value);
            });
        }
    }, [map, paintProperties, id, getCurrentStyle]);

    // Handle parcel clicks
    useEffect(() => {
        if (!map || !onParcelClick || !visible) return;

        const handleClick = (e: any) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: [`${id}-fill`, `${id}-outline`]
            });

            if (features.length > 0) {
                const feature = features[0];
                onParcelClick(feature.properties as VacantParcelProperties | EnhancedParcelProperties);
            }
        };

        map.on('click', handleClick);

        return () => {
            map.off('click', handleClick);
        };
    }, [map, onParcelClick, id, visible]);

    // MapLibre handles cleanup automatically - no manual cleanup needed
    // This prevents crashes during basemap changes

    return null; // This component doesn't render any DOM elements
});

export default DynamicMVTSimple;
