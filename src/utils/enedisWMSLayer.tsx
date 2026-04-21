import maplibregl from 'maplibre-gl';
import React, { useCallback, useEffect, useRef } from 'react';
import { useWMSPreconnection } from './wmsPreconnection';

// WMS Service Configuration
export interface WMSConfig {
  baseUrl: string;
  version: string;
  format: string;
  transparent: boolean;
  crs: string;
  styles: string;
  attribution?: string;
}

// WMS Layer Configuration
export interface WMSLayerConfig {
  sourceId: string;
  layerId: string;
  layerName: string;
  displayName: string;
}

// Component Props
export interface EnedisWMSLayerProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  wmsConfig: WMSConfig;
  layerConfig: WMSLayerConfig;
  onFeatureClick?: (feature: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
}

const EnedisWMSLayer: React.FC<EnedisWMSLayerProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 0,
  maxZoom = 20,
  wmsConfig,
  layerConfig,
  onFeatureClick,
  onLoadingChange,
  onLoadError
}) => {
  const initializedRef = useRef(false);
  const mapRef = useRef(map);
  const { preconnectService, markSourceAsPrewarmed } = useWMSPreconnection();

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Check if current zoom is within visibility range
  const isZoomInRange = useCallback(() => {
    if (!mapRef.current) return false;
    const currentZoom = mapRef.current.getZoom();
    return currentZoom >= minZoom && currentZoom <= maxZoom;
  }, [minZoom, maxZoom]);

  // Handle loading changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // Handle feature clicks
  const handleFeatureClick = useCallback((feature: any) => {
    onFeatureClick?.(feature);
  }, [onFeatureClick]);

  // Handle load errors
  const handleLoadError = useCallback((error: string) => {
    onLoadError?.(error);
    handleLoadingChange(false);
  }, [onLoadError, handleLoadingChange]);

  // Build WMS URL
  const buildWMSUrl = useCallback(() => {
    // For WMS 1.3.0, use CRS parameter, for older versions use SRS
    const crsParam = wmsConfig.version === '1.3.0' ? 'CRS' : 'SRS';
    
    return `${wmsConfig.baseUrl}?` +
      `SERVICE=WMS&` +
      `VERSION=${wmsConfig.version}&` +
      `REQUEST=GetMap&` +
      `LAYERS=${layerConfig.layerName}&` +
      `FORMAT=${wmsConfig.format}&` +
      `TRANSPARENT=${wmsConfig.transparent}&` +
      `${crsParam}=${wmsConfig.crs}&` +
      `STYLES=${wmsConfig.styles}&` +
      `WIDTH=256&` +
      `HEIGHT=256&` +
      `BBOX={bbox-epsg-3857}`;
  }, [wmsConfig, layerConfig.layerName]);

  // Initialize source and layers
  const initializeSource = useCallback(() => {
    if (!map || !map.isStyleLoaded() || initializedRef.current) return;

    handleLoadingChange(true);

    try {
      // Add WMS source
      if (!map.getSource(layerConfig.sourceId)) {
        map.addSource(layerConfig.sourceId, {
          type: 'raster',
          tiles: [buildWMSUrl()],
          tileSize: 256,
          minzoom: minZoom,
          maxzoom: maxZoom,
          ...(wmsConfig.attribution && { attribution: wmsConfig.attribution })
        });

        // Mark source as prewarmed for performance tracking
        markSourceAsPrewarmed(layerConfig.sourceId);
      }

      // Add raster layer
      if (!map.getLayer(layerConfig.layerId)) {
        const zoomInRange = isZoomInRange();
        const shouldShow = visible && zoomInRange;
        
        map.addLayer({
          id: layerConfig.layerId,
          type: 'raster',
          source: layerConfig.sourceId,
          paint: {
            'raster-opacity': opacity
          },
          layout: {
            visibility: shouldShow ? 'visible' : 'none'
          },
          minzoom: minZoom,
          maxzoom: maxZoom
        });

        // Add click handler for feature info
        if (onFeatureClick) {
          map.on('click', layerConfig.layerId, (e) => {
            // For WMS layers, we can't get direct feature info
            // But we can provide coordinates for potential GetFeatureInfo requests
            const feature = {
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
            handleFeatureClick(feature);
          });
        }
      }

      initializedRef.current = true;
      handleLoadingChange(false);
    } catch (error) {
      console.error(`Error initializing ${layerConfig.displayName} layer:`, error);
      handleLoadError(`Failed to initialize ${layerConfig.displayName}: ${error}`);
    }
  }, [map, layerConfig, minZoom, maxZoom, opacity, buildWMSUrl, handleLoadingChange, handleFeatureClick, handleLoadError, markSourceAsPrewarmed]);

  // Update layer visibility
  const updateLayerVisibility = useCallback(() => {
    if (!map || !initializedRef.current) return;

    const zoomInRange = isZoomInRange();
    const shouldShow = visible && zoomInRange;

    if (map.getLayer(layerConfig.layerId)) {
      map.setLayoutProperty(layerConfig.layerId, 'visibility', shouldShow ? 'visible' : 'none');
    }
  }, [map, visible, layerConfig.layerId, isZoomInRange]);

  // Update layer opacity
  const updateLayerOpacity = useCallback(() => {
    if (!map || !initializedRef.current) return;

    if (map.getLayer(layerConfig.layerId)) {
      map.setPaintProperty(layerConfig.layerId, 'raster-opacity', opacity);
    }
  }, [map, layerConfig.layerId, opacity]);

  // Handle style changes
  const handleStyleChange = useCallback(() => {
    setTimeout(() => {
      if (map && map.isStyleLoaded()) {
        // Only reset if source was actually removed (style change)
        if (!map.getSource(layerConfig.sourceId)) {
          initializedRef.current = false;
          initializeSource();
        }
      }
    }, 100);
  }, [map, layerConfig.sourceId, initializeSource]);

  // Initialize with retry mechanism
  const tryInitialize = useCallback((attempt = 0) => {
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
  }, [map, initializeSource]);

  // Initialize source and layers
  useEffect(() => {
    if (!map) return;

    // Preconnect to WMS service for better performance
    preconnectService('enedis-v2');

    // Handle style changes
    window.addEventListener('mapStyleChanged', handleStyleChange);

    if (!map.isStyleLoaded()) {
      const onStyleData = () => {
        tryInitialize();
        map.off('styledata', onStyleData);
      };
      map.on('styledata', onStyleData);
    } else {
      tryInitialize();
    }

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };
  }, [map, handleStyleChange, tryInitialize, preconnectService]);

  // Update visibility when dependencies change
  useEffect(() => {
    updateLayerVisibility();
  }, [updateLayerVisibility]);

  // Update opacity when dependencies change
  useEffect(() => {
    updateLayerOpacity();
  }, [updateLayerOpacity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: Following the crash prevention pattern, we don't remove layers/sources
      // MapLibre handles cleanup automatically during style changes
      initializedRef.current = false;
    };
  }, []);

  return null;
};

export default EnedisWMSLayer;
