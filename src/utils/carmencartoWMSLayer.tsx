import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';
import wmsPreconnectionManager from './wmsPreconnection';

// CarmenCarto WMS Configuration
const CARMENCARTO_BASE_URL = 'https://ws.carmencarto.fr/WMS/168/zonage_sismique';

// Default WMS Configuration for CarmenCarto
const DEFAULT_WMS_CONFIG = {
  version: '1.1.1',
  format: 'image/png',
  transparent: 'TRUE',
  srs: 'EPSG:3857', // Web Mercator - matches MapLibre coordinate system
  styles: '',
  tileSize: 256,
  attribution: '© CarmenCarto / French Geological Survey'
} as const;

// Type Definitions
export interface CarmenCartoWMSLayerConfig {
  layerName: string;
  sourceId: string;
  layerId: string;
  displayName: string;
  minZoom?: number;
  maxZoom?: number;
  opacity?: number;
  tiled?: boolean;
  // Additional CarmenCarto-specific options
  version?: string;
  styles?: string;
}

export interface CarmenCartoWMSLayerProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  layerConfig: CarmenCartoWMSLayerConfig;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: any) => void;
}

export interface CarmenCartoFeature {
  geometry: GeoJSON.Geometry;
  properties: {
    layer: string;
    displayName: string;
    clickedAt: string;
    [key: string]: any;
  };
}

// Helper Functions
const getPreconnectionServiceId = (): string => {
  return 'carmencarto-seismic';
};

const buildWMSTileUrl = (config: CarmenCartoWMSLayerConfig): string => {
  const baseUrl = CARMENCARTO_BASE_URL;
  const tiled = config.tiled !== false; // Default to true
  const version = config.version || DEFAULT_WMS_CONFIG.version;
  const styles = config.styles !== undefined ? config.styles : DEFAULT_WMS_CONFIG.styles;
  
  let tileUrl = `${baseUrl}?`;
  tileUrl += `SERVICE=WMS&`;
  tileUrl += `VERSION=${version}&`;
  tileUrl += `REQUEST=GetMap&`;
  tileUrl += `LAYERS=${config.layerName}&`;
  tileUrl += `FORMAT=${DEFAULT_WMS_CONFIG.format}&`;
  tileUrl += `TRANSPARENT=${DEFAULT_WMS_CONFIG.transparent}&`;
  tileUrl += `SRS=${DEFAULT_WMS_CONFIG.srs}&`;
  tileUrl += `STYLES=${styles}&`;
  tileUrl += `WIDTH=${DEFAULT_WMS_CONFIG.tileSize}&`;
  tileUrl += `HEIGHT=${DEFAULT_WMS_CONFIG.tileSize}&`;
  
  if (tiled) {
    tileUrl += `TILED=true&`;
  }
  
  tileUrl += `BBOX={bbox-epsg-3857}`;
  
  return tileUrl;
};

// Main Component
const CarmenCartoWMSLayer: React.FC<CarmenCartoWMSLayerProps> = ({
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
    if (!map || !map.isStyleLoaded() || !map.getSource || !map.getLayer) return;

    // Check if service is already preconnected, only preconnect if needed
    const serviceId = getPreconnectionServiceId();
    if (!wmsPreconnectionManager.isSourcePrewarmed(layerConfig.sourceId)) {
      wmsPreconnectionManager.preconnectService(serviceId);
    }

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
            const feature: CarmenCartoFeature = {
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
      // No cleanup on unmount - MapLibre handles cleanup automatically during basemap changes
      // This prevents crashes during style changes per user rules
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

export default CarmenCartoWMSLayer;

// Export helper functions for external use
export { buildWMSTileUrl, getPreconnectionServiceId };
