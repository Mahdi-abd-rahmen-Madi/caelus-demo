import { useEffect, useCallback, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { safeGetLayer, safeSetLayoutProperty, safeIsStyleLoaded } from '../utils/mapSafety';

export interface UseLayerVisibilityOptions {
  map: maplibregl.Map | null;
  layerIds: string | string[];
  visible: boolean;
  onVisibilityChange?: (layerId: string, isVisible: boolean) => void;
  debugMode?: boolean;
}

/**
 * Unified hook for managing layer visibility consistently across all components
 * Follows the MapLibre crash prevention pattern from user rules
 */
export const useLayerVisibility = ({
  map,
  layerIds,
  visible,
  onVisibilityChange,
  debugMode = false
}: UseLayerVisibilityOptions) => {
  const previousVisibilityRef = useRef<boolean>(visible);
  const layerIdArray = Array.isArray(layerIds) ? layerIds : [layerIds];

  const setVisibility = useCallback((isVisible: boolean) => {
    if (!map || !safeIsStyleLoaded(map)) {
      if (debugMode) {
        console.log(`[useLayerVisibility] Map not ready for visibility change`);
      }
      return;
    }

    layerIdArray.forEach(layerId => {
      if (safeGetLayer(map, layerId)) {
        safeSetLayoutProperty(map, layerId, 'visibility', isVisible ? 'visible' : 'none');
        
        if (debugMode) {
          console.log(`[useLayerVisibility] Set ${layerId} visibility to: ${isVisible ? 'visible' : 'none'}`);
        }

        if (onVisibilityChange) {
          onVisibilityChange(layerId, isVisible);
        }
      } else {
        if (debugMode) {
          console.warn(`[useLayerVisibility] Layer ${layerId} not found for visibility change`);
        }
      }
    });
  }, [map, layerIdArray, onVisibilityChange, debugMode]);

  // Handle visibility changes
  useEffect(() => {
    if (previousVisibilityRef.current !== visible) {
      setVisibility(visible);
      previousVisibilityRef.current = visible;
    }
  }, [visible, setVisibility]);

  // Handle style changes - reapply visibility when style changes
  useEffect(() => {
    if (!map) return;

    const handleStyleChange = () => {
      setTimeout(() => {
        if (map && safeIsStyleLoaded(map)) {
          setVisibility(visible);
        }
      }, 100);
    };

    window.addEventListener('mapStyleChanged', handleStyleChange);

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };
  }, [map, visible, setVisibility]);

  return {
    setVisibility,
    isReady: !!(map && safeIsStyleLoaded(map))
  };
};
