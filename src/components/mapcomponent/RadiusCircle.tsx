import React, { useEffect, useCallback, memo, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';

interface RadiusCircleProps {
    map: maplibregl.Map | null;
    center: [number, number];
    radius: number; // in kilometers
    visible: boolean;
    hasSearched?: boolean;
}

const RadiusCircle: React.FC<RadiusCircleProps> = ({
    map,
    center,
    radius,
    visible,
    hasSearched = false
}) => {
    const layerId = 'radius-circle-layer';
    const sourceId = 'radius-circle-source';
    const isInitializedRef = useRef(false);
    const lastCenterRef = useRef<[number, number] | null>(null);
    const lastRadiusRef = useRef<number | null>(null);
    const lastVisibilityRef = useRef<string | null>(null);

    // GeoJSON cache to prevent unnecessary regeneration - optimized for performance
    const geoJsonCache = useRef<Map<string, { data: any, timestamp: number }>>(new Map());
    const MAX_CACHE_SIZE = 200; // Increased cache size for better hit rate
    const CACHE_TTL = 10 * 60 * 1000; // 10 minutes TTL for longer caching

    // Generate circle GeoJSON with caching and TTL
    const generateCircleGeoJSON = useCallback((centerLng: number, centerLat: number, radiusKm: number) => {
        // Create cache key with better precision to avoid unnecessary recalculations
        const cacheKey = `${centerLng.toFixed(3)}_${centerLat.toFixed(3)}_${radiusKm.toFixed(1)}`;

        // Check cache first with TTL validation
        const cached = geoJsonCache.current.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return cached.data;
        }

        // Generate circle with fewer points for better performance
        const points = radiusKm > 50 ? 32 : 48; // Fewer points for large circles
        const coordinates: number[][] = [];

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            // Calculate point using Haversine formula for accuracy
            const lat = centerLat + (radiusKm / 111.32) * Math.cos(angle);
            const lng = centerLng + (radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
            coordinates.push([lng, lat]);
        }

        const result = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates]
                },
                properties: {}
            }]
        } as any;

        // Cache the result with timestamp
        if (geoJsonCache.current.size >= MAX_CACHE_SIZE) {
            // Remove oldest entries (simple LRU)
            const entries = Array.from(geoJsonCache.current.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)); // Remove 20% oldest
            toRemove.forEach(([key]) => geoJsonCache.current.delete(key));
        }
        geoJsonCache.current.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    }, []);

    // Memoize visibility calculation to prevent unnecessary updates
    const actualVisibility = useMemo(() => {
        return (visible && hasSearched) ? 'visible' : 'none';
    }, [visible, hasSearched]);
    // Initialize radius circle following Map Data Layer Design Pattern
    useEffect(() => {
        if (!map) {
            return;
        }

        // Handle style changes only (not movements)


        // Wait for map style to be loaded before adding source/layers
        const initializeSource = () => {
            if (!map || !map.isStyleLoaded()) return;

            // Add source with EMPTY data first (pattern requirement)
            if (!map.getSource(sourceId)) {
                try {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: { type: 'FeatureCollection', features: [] },
                        generateId: true
                    });
                } catch (error) {
                    return;
                }
            }

            // Add fill layer using empty source
            if (!map.getLayer(layerId)) {
                try {
                    map.addLayer({
                        id: layerId,
                        type: 'fill',
                        source: sourceId,
                        paint: {
                            'fill-color': 'rgba(59, 130, 246, 0.15)',
                            'fill-opacity': 0.6
                        },
                        layout: {
                            visibility: actualVisibility
                        }
                    });

                    // Add border layer using same source
                    map.addLayer({
                        id: `${layerId}-border`,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': '#3b82f6',
                            'line-width': 2,
                            'line-opacity': 0.7
                        },
                        layout: {
                            visibility: actualVisibility
                        }
                    });

                    isInitializedRef.current = true;
                    lastVisibilityRef.current = actualVisibility;
                } catch (error) {
                }
            }
        };

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
        };
    }, [map, actualVisibility]); // Only depend on map and visibility

    // Consolidated effect for data and visibility updates (only if initialized)
    useEffect(() => {
        if (!map || !isInitializedRef.current) return;

        // Check if center or radius actually changed
        const centerChanged = !lastCenterRef.current ||
            Math.abs(center[0] - lastCenterRef.current[0]) > 0.0001 ||
            Math.abs(center[1] - lastCenterRef.current[1]) > 0.0001;
        const radiusChanged = !lastRadiusRef.current || Math.abs(radius - lastRadiusRef.current) > 0.001;
        const visibilityChanged = lastVisibilityRef.current !== actualVisibility;

        // Update source data if center or radius changed
        if (centerChanged || radiusChanged) {
            const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
            if (source) {
                const newGeoJSON = generateCircleGeoJSON(center[0], center[1], radius);
                source.setData(newGeoJSON);
                lastCenterRef.current = center;
                lastRadiusRef.current = radius;
            }
        }

        // Update visibility if it changed
        if (visibilityChanged) {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, 'visibility', actualVisibility);
            }
            if (map.getLayer(`${layerId}-border`)) {
                map.setLayoutProperty(`${layerId}-border`, 'visibility', actualVisibility);
            }
            lastVisibilityRef.current = actualVisibility;
        }
    }, [map, center, radius, actualVisibility, generateCircleGeoJSON]);

    // Cleanup only when component unmounts
    useEffect(() => {
        return () => {
            // Clear cache on component unmount
            geoJsonCache.current.clear();

            // Only cleanup if map is being destroyed
            if (map && isInitializedRef.current && map.getLayer && map.getSource) {
                try {
                    if (map.getLayer(layerId)) {
                        map.removeLayer(layerId);
                    }
                    if (map.getLayer(`${layerId}-border`)) {
                        map.removeLayer(`${layerId}-border`);
                    }
                    if (map.getSource(sourceId)) {
                        map.removeSource(sourceId);
                    }
                } catch (error) {
                }
                isInitializedRef.current = false;
            }
        };
    }, []); // Only run on unmount

    return null; // This component doesn't render anything, it just manages map layers
};

export default memo(RadiusCircle);
