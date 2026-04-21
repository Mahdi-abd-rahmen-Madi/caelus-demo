/**
 * Utility functions for safe map operations to prevent race conditions
 */

export const safeGetLayer = (map: any, layerId: string) => {
  return map && map.getLayer && map.getLayer(layerId);
};

export const safeGetSource = (map: any, sourceId: string) => {
  return map && map.getSource && map.getSource(sourceId);
};

export const safeIsStyleLoaded = (map: any) => {
  return map && map.isStyleLoaded && map.isStyleLoaded();
};

export const safeRemoveLayer = (map: any, layerId: string) => {
  if (map && map.getLayer && map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
};

export const safeRemoveSource = (map: any, sourceId: string) => {
  if (map && map.getSource && map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
};

export const safeSetLayoutProperty = (map: any, layerId: string, property: string, value: any) => {
  if (map && map.getLayer && map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, property, value);
  }
};

export const safeSetPaintProperty = (map: any, layerId: string, property: string, value: any) => {
  if (map && map.getLayer && map.getLayer(layerId)) {
    map.setPaintProperty(layerId, property, value);
  }
};

/**
 * Wait for map style to be loaded with timeout
 */
export const waitForStyleLoad = (map: any, timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!map) {
      resolve(false);
      return;
    }

    if (safeIsStyleLoaded(map)) {
      resolve(true);
      return;
    }

    const checkStyle = () => {
      if (safeIsStyleLoaded(map)) {
        resolve(true);
      } else {
        setTimeout(checkStyle, 100);
      }
    };

    checkStyle();
    setTimeout(() => resolve(false), timeout);
  });
};
