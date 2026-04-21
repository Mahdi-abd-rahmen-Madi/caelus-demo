import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';
import { wmsPreconnectionManager } from './wmsPreconnection';

// BRGM Base URLs Configuration
const BRGM_BASE_URLS = {
  mapsref: 'https://mapsref.brgm.fr/wxs/georisques/risques',
  geoservices: 'http://geoservices.brgm.fr/risques'
} as const;

// Default WMS Configuration
const DEFAULT_WMS_CONFIG = {
  version: '1.3.0',
  format: 'image/png',
  transparent: 'TRUE',
  crs: 'EPSG:3857',
  styles: '',
  tileSize: 256,
  attribution: '© BRGM - French Geological Survey'
} as const;

// Type Definitions
export type BRGMBaseUrl = keyof typeof BRGM_BASE_URLS;

export interface BRGMWMSLayerConfig {
  layerName: string;
  sourceId: string;
  layerId: string;
  displayName: string;
  baseUrl?: BRGMBaseUrl;
  customBaseUrl?: string;
  minZoom?: number;
  maxZoom?: number;
  opacity?: number;
  crs?: string;
  tiled?: boolean;
  // SSP-specific options
  version?: string;
  styles?: string;
  srs?: string; // Alternative to CRS for some services
}

export interface BRGMWMSLayerProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  layerConfig: BRGMWMSLayerConfig;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: any) => void;
}

export interface BRGMFeature {
  geometry: GeoJSON.Geometry;
  properties: {
    layer: string;
    displayName: string;
    clickedAt: string;
    [key: string]: any;
  };
}

// Helper Functions
const getBaseUrl = (config: BRGMWMSLayerConfig): string => {
  if (config.customBaseUrl) {
    return config.customBaseUrl;
  }
  if (config.baseUrl) {
    return BRGM_BASE_URLS[config.baseUrl];
  }
  // Default to mapsref for newer layers
  return BRGM_BASE_URLS.mapsref;
};

const buildWMSTileUrl = (config: BRGMWMSLayerConfig): string => {
  const baseUrl = getBaseUrl(config);
  const crs = config.srs || config.crs || DEFAULT_WMS_CONFIG.crs;
  const tiled = config.tiled !== false; // Default to true
  const version = config.version || DEFAULT_WMS_CONFIG.version;
  const styles = config.styles !== undefined ? config.styles : DEFAULT_WMS_CONFIG.styles;
  
  // Different BRGM services expect different TRANSPARENT formats
  const transparentValue = baseUrl.includes('mapsref') ? 'true' : 'TRUE';
  
  // Use SRS for SSP layers (those with explicit version), CRS for all other layers
  const coordinateParam = config.version ? 'SRS' : 'CRS';
  
  let tileUrl = `${baseUrl}?`;
  tileUrl += `SERVICE=WMS&`;
  tileUrl += `VERSION=${version}&`;
  tileUrl += `REQUEST=GetMap&`;
  tileUrl += `LAYERS=${config.layerName}&`;
  tileUrl += `FORMAT=${DEFAULT_WMS_CONFIG.format}&`;
  tileUrl += `TRANSPARENT=${transparentValue}&`;
  tileUrl += `${coordinateParam}=${crs}&`;
  tileUrl += `STYLES=${styles}&`;
  tileUrl += `WIDTH=${DEFAULT_WMS_CONFIG.tileSize}&`;
  tileUrl += `HEIGHT=${DEFAULT_WMS_CONFIG.tileSize}&`;
  
  if (tiled) {
    tileUrl += `TILED=true&`;
  }
  
  tileUrl += `BBOX={bbox-epsg-3857}`;
  
  return tileUrl;
};

const getPreconnectionServiceId = (config: BRGMWMSLayerConfig): string => {
  if (config.customBaseUrl) {
    return 'custom-brgm';
  }
  if (config.baseUrl === 'geoservices') {
    return 'brgm-geoservices';
  }
  return 'brgm-mapsref';
};

// Main Component
const BRGMWMSLayer: React.FC<BRGMWMSLayerProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 6,
  maxZoom = 20,
  onLoadingChange,
  onLoadError,
  onFeatureClick,
  layerConfig
}) => {
  const initializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!map || !map.getSource || !map.getLayer) return;

    // Preconnect to BRGM service for performance
    const serviceId = getPreconnectionServiceId(layerConfig);
    wmsPreconnectionManager.preconnectService(serviceId);

    const initializeSource = () => {
      if (!map || !map.isStyleLoaded() || !map.getSource || !map.getLayer) return;

      try {
        // Add WMS source
        if (!map.getSource(layerConfig.sourceId)) {
          const tileUrl = buildWMSTileUrl(layerConfig);
          
          map.addSource(layerConfig.sourceId, {
            type: 'raster',
            tiles: [tileUrl],
            tileSize: DEFAULT_WMS_CONFIG.tileSize,
            minzoom: minZoom,
            maxzoom: maxZoom,
            attribution: DEFAULT_WMS_CONFIG.attribution
          });

          // Mark source as prewarmed for performance tracking
          wmsPreconnectionManager.markSourceAsPrewarmed(layerConfig.sourceId);
        }

        // Add raster layer
        if (!map.getLayer(layerConfig.layerId)) {
          map.addLayer({
            id: layerConfig.layerId,
            type: 'raster',
            source: layerConfig.sourceId,
            paint: {
              'raster-opacity': opacity,
              'raster-fade-duration': 0
            },
            layout: {
              visibility: visible ? 'visible' : 'none'
            },
            minzoom: minZoom,
            maxzoom: maxZoom
          });
        }

        // Add click handler for feature info
        if (onFeatureClick) {
          map.on('click', layerConfig.layerId, (e) => {
            const feature: BRGMFeature = {
              geometry: {
                type: 'Point',
                coordinates: [e.lngLat.lng, e.lngLat.lat]
              } as GeoJSON.Geometry,
              properties: {
                layer: layerConfig.layerName,
                displayName: layerConfig.displayName,
                clickedAt: new Date().toISOString()
              }
            };
            onFeatureClick(feature);
          });

          // Change cursor on hover
          map.on('mouseenter', layerConfig.layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', layerConfig.layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        }

        initializedRef.current = true;
        setIsInitialized(true);
        onLoadingChange?.(false);
      } catch (error) {
        console.error(`Error initializing ${layerConfig.displayName} layer:`, error);
        onLoadError?.(`Failed to initialize ${layerConfig.displayName}: ${error}`);
        onLoadingChange?.(false);
      }
    };

    const resetAndReinitialize = () => {
      if (!map || !map.getSource) return;
      if (!map.getSource(layerConfig.sourceId)) {
        initializedRef.current = false;
        setIsInitialized(false);
        setTimeout(() => tryInitialize(), 50);
      }
    };

    const tryInitialize = (attempt = 0) => {
      if (!map) return;
      if (!map.isStyleLoaded()) {
        if (attempt < 20) {
          setTimeout(() => tryInitialize(attempt + 1), 100);
        }
        return;
      }
      initializeSource();
    };

    const handleStyleData = () => {
      // Covers both first load and style/basemap switches.
      resetAndReinitialize();
      tryInitialize();
    };

    map.on('styledata', handleStyleData);
    map.on('style.load', handleStyleData);
    // Immediate attempt for already-loaded style and startup races.
    tryInitialize();

    return () => {
      map.off('styledata', handleStyleData);
      map.off('style.load', handleStyleData);
    };
  }, [map, layerConfig, minZoom, maxZoom, onLoadingChange, onLoadError, onFeatureClick]);

  // Handle visibility changes
  useEffect(() => {
    if (!map || !isInitialized) return;
    if (map && map.getLayer && map.getLayer(layerConfig.layerId)) {
      map.setLayoutProperty(layerConfig.layerId, 'visibility', visible ? 'visible' : 'none');
    }
  }, [map, visible, isInitialized, layerConfig.layerId]);

  // Handle opacity changes
  useEffect(() => {
    if (!map || !isInitialized) return;
    if (map && map.getLayer && map.getLayer(layerConfig.layerId)) {
      map.setPaintProperty(layerConfig.layerId, 'raster-opacity', opacity);
    }
  }, [map, opacity, isInitialized, layerConfig.layerId]);

  // NO cleanup on unmount - MapLibre handles cleanup automatically during basemap changes
  // This prevents crashes during style changes per user rules

  return null;
};

export default BRGMWMSLayer;

// Export helper functions for external use
export { buildWMSTileUrl, getBaseUrl, getPreconnectionServiceId };
