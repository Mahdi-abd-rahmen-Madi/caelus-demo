import React, { useEffect, memo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

interface RailwayNetworkProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  onTileLoad?: (features: number) => void;
  minZoom?: number;
  maxZoom?: number;
  onRailwayClick?: (properties: any) => void;
}

export const RailwayNetwork: React.FC<RailwayNetworkProps> = ({
  map,
  visible = true,
  opacity = 1.0,
  onTileLoad,
  minZoom = 0,
  maxZoom = 20,
  onRailwayClick
}) => {
  const sourceId = 'railway-network-geojson-source';
  const layerId = 'railway-network';
  const initializedRef = useRef(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);

  // Load GeoJSON data once
  useEffect(() => {
    const loadGeoJsonData = async () => {
      try {
        const response = await fetch('/railways.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGeoJsonData(data);
        if (onTileLoad) onTileLoad(data.features?.length || 0);
      } catch (error) {
        console.error('Failed to load railway network:', error);
      }
    };

    loadGeoJsonData();
  }, []);

  // Initialize source and layers (following parcel layer pattern)
  useEffect(() => {
    if (!map) return;

    function initializeSource() {
      if (!map || !map.isStyleLoaded()) return;

      // Add GeoJSON source (start with empty data like parcel layer)
      if (!map.getSource(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            generateId: true
          });

          // If data is already loaded, set it now (like PosteSource)
          if (geoJsonData) {
            const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
            if (source) {
              source.setData(geoJsonData);
            }
          }
        } catch (error) {
          console.error('Failed to add railway network source:', error);
          return;
        }
      }

      // Add railway network layer if it doesn't exist
      if (!map.getLayer(layerId)) {
        try {
          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            minzoom: minZoom,
            maxzoom: maxZoom,
            paint: {
              'line-color': '#4b5563',
              'line-width': 1.5,
              'line-opacity': opacity
            },
            layout: {
              visibility: visible ? 'visible' : 'none'
            }
          });

          // Add hover interaction for click events
          if (onRailwayClick) {
            (map as any).on('mouseenter', layerId, () => {
              map.getCanvas().style.cursor = 'pointer';
            });

            (map as any).on('mouseleave', layerId, () => {
              map.getCanvas().style.cursor = '';
            });
          }
        } catch (error) {
          console.error('Failed to add railway network layer:', error);
          return;
        }
      }

      initializedRef.current = true;
    }

    // Handle style changes only
    const handleStyleChange = () => {
      setTimeout(() => {
        if (map && map.isStyleLoaded()) {
          // Only reset if source was actually removed (style change)
          if (!map.getSource(sourceId)) {
            initializeSource();
          }
        }
      }, 100);
    };

    window.addEventListener('mapStyleChanged', handleStyleChange);

    // Improved style loading detection with retry mechanism
    const tryInitialize = (attempt = 0) => {
      if (!map || !map.isStyleLoaded()) {
        if (attempt < 5) {
          setTimeout(() => tryInitialize(attempt + 1), 100);
        } else {
          // Fallback: try anyway after timeout
          setTimeout(() => initializeSource(), 500);
        }
        return;
      }
      initializeSource();
    };

    if (!map.isStyleLoaded()) {
      const handleStyleData = () => {
        tryInitialize();
        map.off('styledata', handleStyleData);
      };
      map.on('styledata', handleStyleData);

      // Also try initializing after a delay as fallback
      setTimeout(() => tryInitialize(), 200);
    } else {
      tryInitialize();
    }

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };
  }, [map, sourceId, layerId, minZoom, maxZoom, opacity, onRailwayClick]);

  // Update source data when GeoJSON is loaded (like PosteSource)
  useEffect(() => {
    if (!map || !geoJsonData) return;

    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (source) {
      try {
        source.setData(geoJsonData);
      } catch (error) {
        console.error('Failed to update railway network source:', error);
      }
    }
  }, [map, geoJsonData, sourceId]);

  // Update visibility
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
  }, [map, visible, layerId]);

  // Update opacity
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, 'line-opacity', opacity);
    }
  }, [map, opacity, layerId]);

  return null;
};

// Memoize component to prevent unnecessary re-renders
export default memo(RailwayNetwork);
