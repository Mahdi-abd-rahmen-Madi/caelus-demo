import type { BaseMapType } from '../../types/dashboard';
import { preloadTilesForViewport, registerMaptilerFallbackHandler } from '../../utils/tileLoader';
import { MAP_CONFIG } from '../../config/mapConfig';

// Basemap configuration for dynamic source updates
export interface BaseMapConfig {
  id: BaseMapType;
  name: string;
  tiles: string[];
  attribution: string;
  tileUrl?: string; // Raw tile URL for preloading
  isMaptiler?: boolean; // Flag for MapTiler tiles
}

// Unified base style with updateable raster source
export const BASE_STYLE = {
  version: 8,
  sources: {
    'basemap-tiles': {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    },
    // Add geojson source placeholder to allow adding geojson layers later
    'geojson-placeholder': {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    }
  },
  layers: [
    {
      id: 'basemap-layer',
      type: 'raster',
      source: 'basemap-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const BASEMAP_CONFIGS: Record<BaseMapType, BaseMapConfig> = {
  'osm': {
    id: 'osm',
    name: 'OpenStreetMap',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors',
    tileUrl: '{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    isMaptiler: false
  },
  'osm-hot': {
    id: 'osm-hot',
    name: 'OSM Humanitarian',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png', 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
    tileUrl: '{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    isMaptiler: false
  },
  'carto-positron': {
    id: 'carto-positron',
    name: 'Carto Positron (Light)',
    tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'],
    attribution: '© OpenStreetMap contributors © CARTO',
    tileUrl: 'basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    isMaptiler: false
  },
  'carto-darkmatter': {
    id: 'carto-darkmatter',
    name: 'Carto Dark Matter (Dark)',
    tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
    attribution: '© OpenStreetMap contributors © CARTO',
    tileUrl: 'basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    isMaptiler: false
  },
  'maptiler-satellite': {
    id: 'maptiler-satellite',
    name: 'Satellite Imagery',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    attribution: '© Esri © OpenStreetMap contributors',
    tileUrl: 'server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    isMaptiler: false
  }
};

export const getBaseMapStyle = (): any => {
  if (MAP_CONFIG.hideBasemap) {
    // Return empty style with geojson support when basemap is hidden
    return {
      version: 8,
      sources: {
        'geojson-placeholder': {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        }
      },
      layers: []
    };
  }
  // Return unified base style
  return BASE_STYLE;
};

// Debounce mechanism to prevent rapid successive basemap changes
let basemapChangeTimeout: number | null = null;

/**
 * Update basemap source dynamically without changing the entire style
 */
export const updateBasemapSource = (map: any, baseMapType: BaseMapType): void => {
  const config = BASEMAP_CONFIGS[baseMapType];
  if (!config || !map || typeof map.getSource !== 'function') return;

  // Clear any pending basemap change
  if (basemapChangeTimeout) {
    clearTimeout(basemapChangeTimeout);
  }

  // Capture map reference to avoid undefined issues in timeout
  const mapRef = map;

  // Debounce basemap changes to prevent rapid successive calls
  basemapChangeTimeout = window.setTimeout(() => {
    try {
      // Double-check map reference is still valid
      if (!mapRef || typeof mapRef.getSource !== 'function') return;

      const source = mapRef.getSource('basemap-tiles') as any;
      if (source) {
        source.setTiles(config.tiles);
        // Note: setAttribution is not available on raster sources in MapLibre
        // Attribution is handled in the source definition

        // Dispatch mapStyleChanged event to notify all components
        window.dispatchEvent(new CustomEvent('mapStyleChanged', {
          detail: { baseMapType, source: 'basemap-update' }
        }));
      }
    } catch (error) {
      console.warn('Failed to update basemap source:', error);
    }
    basemapChangeTimeout = null;
  }, 50); // 50ms debounce
};

export const getBaseMapConfig = (baseMapType: BaseMapType): BaseMapConfig => {
  return BASEMAP_CONFIGS[baseMapType];
};

export const getAllBaseMaps = (): BaseMapConfig[] => {
  return Object.values(BASEMAP_CONFIGS);
};

/**
 * Preload tiles for a specific basemap around a viewport
 */
export async function preloadBasemapTiles(
  baseMapType: BaseMapType,
  center: { lng: number; lat: number },
  zoom: number,
  authToken: string | null = null
): Promise<void> {
  const config = BASEMAP_CONFIGS[baseMapType];
  if (!config.tileUrl) return;

  try {
    await preloadTilesForViewport(center, zoom, authToken, config.isMaptiler);
  } catch (error) {
    console.warn(`Failed to preload tiles for ${baseMapType}:`, error);
  }
}

/**
 * Initialize MapTiler fallback handling
 */
export function initializeMaptilerFallback(): void {
  registerMaptilerFallbackHandler((isOverused: boolean) => {
    if (isOverused) {
      console.warn('MapTiler API rate limit reached. Consider switching to OSM tiles.');
      // You could emit an event or update state here to notify the UI
    }
  });
}
