import maplibregl from 'maplibre-gl';
import React, { memo, useEffect, useRef } from 'react';

interface NuclearSourceProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onNuclearClick?: (properties: any) => void;
}

export const NuclearSource: React.FC<NuclearSourceProps> = ({
  map,
  visible = true,
  opacity = 1.0,
  minZoom = 0,
  maxZoom = 20,
  onNuclearClick
}) => {
  const sourceId = 'nuclear-vector-source';
  const layerId = 'nuclear-reactors';
  const initializedRef = useRef(false);

  // Initialize source and layers (following parcel layer pattern)
  useEffect(() => {
    if (!map) return;

    // Handle style changes
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
      const onStyleData = () => {
        tryInitialize();
        map.off('styledata', onStyleData);
      };
      map.on('styledata', onStyleData);

      // Also try initializing after a delay as fallback
      setTimeout(() => tryInitialize(), 200);
    } else {
      tryInitialize();
    }

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };

    function initializeSource() {
      if (!map || !map.isStyleLoaded()) return;

      // Add vector tile source (backend handles decompression)
      if (!map.getSource(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'vector',
            tiles: ['http://localhost:8000/api/geodata/tiles/simple/nuclear/{z}/{x}/{y}/'],
            minzoom: 0,
            maxzoom: 18
          });
        } catch (error) {
          // Error handling without console log
          return;
        }
      }

      // Add nuclear reactors layer if it doesn't exist
      if (!map.getLayer(layerId)) {
        try {
          map.addLayer({
            id: layerId,
            type: 'circle',
            source: sourceId,
            'source-layer': 'nuclear_installations', // Required for vector tiles
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],
                ['to-number', ['get', 'puissance_nette']],
                800, 6,
                1000, 8,
                1300, 10,
                1500, 12
              ],
              'circle-color': [
                'case',
                ['==', ['get', 'palier'], 'N4'], '#ff6b6b',
                ['==', ['get', 'palier'], 'P\'4'], '#4ecdc4',
                ['==', ['get', 'palier'], 'P4'], '#45b7d1',
                ['==', ['get', 'palier'], 'CP2'], '#96ceb4',
                ['==', ['get', 'palier'], 'CP1'], '#feca57',
                ['==', ['get', 'palier'], 'CP0'], '#ff9ff3',
                '#95afc0'
              ],
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2,
              'circle-opacity': opacity
            },
            layout: {
              visibility: visible ? 'visible' : 'none'
            }
          });
        } catch (error) {
          // Error handling without console log
        }
      }

      // Add click handlers for interaction
      if (onNuclearClick) {
        (map as any).on('click', layerId, (e: any) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const props = feature.properties;
            onNuclearClick(props);
          }
        });

        (map as any).on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        (map as any).on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      initializedRef.current = true;
    }

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };
  }, [map, sourceId, layerId, minZoom, maxZoom, opacity, onNuclearClick]);


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
      map.setPaintProperty(layerId, 'circle-opacity', opacity);
    }
  }, [map, opacity, layerId]);

  return null;
};

// Memoize component to prevent unnecessary re-renders
export default memo(NuclearSource);
