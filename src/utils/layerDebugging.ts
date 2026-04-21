import maplibregl from 'maplibre-gl';
import { safeGetLayer, safeGetSource } from './mapSafety';

export interface LayerDebugInfo {
  layerId: string;
  exists: boolean;
  visible: boolean;
  sourceId?: string;
  sourceExists: boolean;
  type?: string;
}

/**
 * Debug utilities for layer visibility and state management
 */
export class LayerDebugger {
  private static debugMode = false;

  static enable() {
    this.debugMode = true;
    console.log('[LayerDebugger] Debug mode enabled');
  }

  static disable() {
    this.debugMode = false;
  }

  static log(message: string, data?: any) {
    if (this.debugMode) {
      console.log(`[LayerDebugger] ${message}`, data);
    }
  }

  static warn(message: string, data?: any) {
    if (this.debugMode) {
      console.warn(`[LayerDebugger] ${message}`, data);
    }
  }

  static error(message: string, error?: any) {
    if (this.debugMode) {
      console.error(`[LayerDebugger] ${message}`, error);
    }
  }

  /**
   * Get comprehensive debug information about a layer
   */
  static getLayerInfo(map: maplibregl.Map | null, layerId: string): LayerDebugInfo | null {
    if (!map) {
      this.warn('Map is null, cannot get layer info');
      return null;
    }

    try {
      const layer = safeGetLayer(map, layerId);
      const exists = !!layer;
      
      if (!exists) {
        this.warn(`Layer ${layerId} does not exist`);
        return {
          layerId,
          exists: false,
          visible: false,
          sourceExists: false
        };
      }

      const visibility = map.getLayoutProperty(layerId, 'visibility');
      const isVisible = visibility !== 'none';
      const sourceId = (layer as any).source;
      const sourceExists = sourceId ? !!safeGetSource(map, sourceId) : false;
      const type = (layer as any).type;

      const info: LayerDebugInfo = {
        layerId,
        exists: true,
        visible: isVisible,
        sourceId,
        sourceExists,
        type
      };

      this.log(`Layer info for ${layerId}`, info);
      return info;
    } catch (error) {
      this.error(`Error getting layer info for ${layerId}`, error);
      return null;
    }
  }

  /**
   * Validate that toggle state matches actual layer visibility
   */
  static validateToggleState(
    map: maplibregl.Map | null, 
    layerId: string, 
    toggleState: boolean
  ): boolean {
    const info = this.getLayerInfo(map, layerId);
    if (!info) return false;

    const isConsistent = info.visible === toggleState;
    
    if (!isConsistent) {
      this.warn(`Toggle state mismatch for ${layerId}`, {
        toggleState,
        actualVisibility: info.visible
      });
    }

    return isConsistent;
  }

  /**
   * Get all layers that match a pattern
   */
  static getAllLayersMatchingPattern(map: maplibregl.Map | null, pattern: string): LayerDebugInfo[] {
    if (!map) return [];

    try {
      const style = map.getStyle();
      if (!style || !style.layers) return [];

      const regex = new RegExp(pattern);
      const matchingLayers: LayerDebugInfo[] = [];

      style.layers.forEach((layer: any) => {
        if (regex.test(layer.id)) {
          const info = this.getLayerInfo(map, layer.id);
          if (info) {
            matchingLayers.push(info);
          }
        }
      });

      this.log(`Found ${matchingLayers.length} layers matching pattern: ${pattern}`, matchingLayers);
      return matchingLayers;
    } catch (error) {
      this.error('Error getting layers matching pattern', error);
      return [];
    }
  }

  /**
   * Print comprehensive map state for debugging
   */
  static printMapState(map: maplibregl.Map | null) {
    if (!map) {
      this.warn('Map is null, cannot print state');
      return;
    }

    try {
      const style = map.getStyle();
      if (!style || !style.layers) {
        this.warn('Map style or layers not available');
        return;
      }

      const layerCount = style.layers.length;
      const sourceCount = Object.keys(style.sources || {}).length;
      const zoom = map.getZoom();
      const center = map.getCenter();

      this.log('Map State Summary', {
        layerCount,
        sourceCount,
        zoom,
        center: { lng: center.lng, lat: center.lat },
        styleLoaded: map.isStyleLoaded()
      });

      // Print first 10 layers for quick overview
      const firstLayers = style.layers.slice(0, 10).map((layer: any) => ({
        id: layer.id,
        type: layer.type,
        source: layer.source,
        visibility: map.getLayoutProperty(layer.id, 'visibility')
      }));

      this.log('First 10 layers', firstLayers);
    } catch (error) {
      this.error('Error printing map state', error);
    }
  }
}
