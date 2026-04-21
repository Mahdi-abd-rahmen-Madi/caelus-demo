import maplibregl from 'maplibre-gl';
import { LayerDebugger } from './layerDebugging';

export interface ToggleValidationResult {
  layerId: string;
  toggleState: boolean;
  actualVisibility: boolean;
  isConsistent: boolean;
  error?: string;
}

/**
 * Validation utilities for ensuring toggle states match actual layer visibility
 */
export class LayerValidator {
  /**
   * Validate all layer toggles match their actual visibility
   */
  static validateAllToggles(
    map: maplibregl.Map | null,
    toggleStates: Record<string, boolean>
  ): ToggleValidationResult[] {
    if (!map) {
      console.warn('[LayerValidator] Map is null, cannot validate toggles');
      return [];
    }

    const results: ToggleValidationResult[] = [];

    Object.entries(toggleStates).forEach(([layerId, toggleState]) => {
      try {
        const info = LayerDebugger.getLayerInfo(map, layerId);
        
        if (!info) {
          results.push({
            layerId,
            toggleState,
            actualVisibility: false,
            isConsistent: false,
            error: 'Layer not found'
          });
          return;
        }

        const isConsistent = info.visible === toggleState;
        results.push({
          layerId,
          toggleState,
          actualVisibility: info.visible,
          isConsistent
        });

        if (!isConsistent) {
          console.warn(`[LayerValidator] Toggle state mismatch for ${layerId}`, {
            toggleState,
            actualVisibility: info.visible
          });
        }
      } catch (error) {
        results.push({
          layerId,
          toggleState,
          actualVisibility: false,
          isConsistent: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    return results;
  }

  /**
   * Get a summary of validation results
   */
  static getValidationSummary(results: ToggleValidationResult[]): {
    total: number;
    consistent: number;
    inconsistent: number;
    errors: number;
    inconsistentLayers: string[];
  } {
    const total = results.length;
    const consistent = results.filter(r => r.isConsistent).length;
    const inconsistent = results.filter(r => !r.isConsistent && !r.error).length;
    const errors = results.filter(r => r.error).length;
    const inconsistentLayers = results
      .filter(r => !r.isConsistent)
      .map(r => r.layerId);

    return {
      total,
      consistent,
      inconsistent,
      errors,
      inconsistentLayers
    };
  }

  /**
   * Auto-fix inconsistent toggles by setting actual visibility to match toggle state
   */
  static fixInconsistentToggles(
    map: maplibregl.Map | null,
    results: ToggleValidationResult[]
  ): void {
    if (!map) return;

    results.forEach(result => {
      if (!result.isConsistent && !result.error) {
        try {
          if (map.getLayer(result.layerId)) {
            map.setLayoutProperty(
              result.layerId,
              'visibility',
              result.toggleState ? 'visible' : 'none'
            );
            
            console.log(`[LayerValidator] Fixed ${result.layerId}: set visibility to ${result.toggleState ? 'visible' : 'none'}`);
          }
        } catch (error) {
          console.error(`[LayerValidator] Failed to fix ${result.layerId}:`, error);
        }
      }
    });
  }

  /**
   * Validate a single layer toggle
   */
  static validateSingleToggle(
    map: maplibregl.Map | null,
    layerId: string,
    toggleState: boolean
  ): ToggleValidationResult {
    if (!map) {
      return {
        layerId,
        toggleState,
        actualVisibility: false,
        isConsistent: false,
        error: 'Map is null'
      };
    }

    try {
      const info = LayerDebugger.getLayerInfo(map, layerId);
      
      if (!info) {
        return {
          layerId,
          toggleState,
          actualVisibility: false,
          isConsistent: false,
          error: 'Layer not found'
        };
      }

      const isConsistent = info.visible === toggleState;
      return {
        layerId,
        toggleState,
        actualVisibility: info.visible,
        isConsistent
      };
    } catch (error) {
      return {
        layerId,
        toggleState,
        actualVisibility: false,
        isConsistent: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
