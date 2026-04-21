import React, { useCallback, useEffect, useRef } from 'react';
import { safeGetLayer, safeSetLayoutProperty, safeSetPaintProperty } from './mapSafety';
import { useWMSPreconnection } from './wmsPreconnection';

// IGN Vector Tile Service Configuration
export interface IGNVectorTileConfig {
  serviceType: 'pci' | 'bdtopo';
  sourceId: string;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
}

// Layer Configuration
export interface IGNLayerConfig {
  id: string;
  type: 'line' | 'fill' | 'circle' | 'symbol';
  sourceLayer: string;
  paint: Record<string, any>;
  layout?: Record<string, any>;
}

// Component Props
export interface IGNVectorTileProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  config: IGNVectorTileConfig;
  layers: IGNLayerConfig[];
  layerVisibility?: Record<string, boolean>;
  onLoadError?: (layerId: string, error: string) => void;
  onFeatureClick?: (feature: any, layerId: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// Service URLs
const IGN_SERVICE_URLS = {
  pci: 'https://data.geopf.fr/tms/1.0.0/PCI/{z}/{x}/{y}.pbf',
  bdtopo: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/{z}/{x}/{y}.pbf'
} as const;

const IGNVectorTileLayer: React.FC<IGNVectorTileProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 0,
  maxZoom = 20,
  config,
  layers,
  layerVisibility = {},
  onLoadError,
  onFeatureClick,
  onLoadingChange
}) => {
  const initializedRef = useRef(false);
  const sourcesRef = useRef<Set<string>>(new Set());
  const layersRef = useRef<Set<string>>(new Set());
  const mapRef = useRef(map);
  const { preconnectVectorService } = useWMSPreconnection();

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Check if current zoom is within visibility range
  const isZoomInRange = useCallback(() => {
    if (!mapRef.current) return false;
    const currentZoom = mapRef.current.getZoom();
    return currentZoom >= minZoom && currentZoom <= maxZoom;
  }, [minZoom, maxZoom]);

  // Handle load errors
  const handleLoadError = useCallback((layerId: string, error: string) => {
    onLoadError?.(layerId, error);
    onLoadingChange?.(false);
  }, [onLoadError, onLoadingChange]);

  // Handle feature clicks
  const handleFeatureClick = useCallback((feature: any, layerId: string) => {
    onFeatureClick?.(feature, layerId);
  }, [onFeatureClick]);

  // Initialize source and layers
  const initializeSource = useCallback(() => {
    if (!map || !map.isStyleLoaded() || initializedRef.current) return;

    onLoadingChange?.(true);

    try {
      // Add IGN vector tile source
      if (!map.getSource(config.sourceId)) {
        map.addSource(config.sourceId, {
          type: 'vector',
          tiles: [IGN_SERVICE_URLS[config.serviceType]],
          minzoom: config.minZoom ?? 0,
          maxzoom: config.maxZoom ?? 20,
          attribution: config.attribution || '© IGN'
        } as any);
        sourcesRef.current.add(config.sourceId);
      }

      // Add layers
      layers.forEach((layerConfig) => {
        const layerId = `${config.sourceId}-${layerConfig.id}`;

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: layerConfig.type,
            source: config.sourceId as any,
            'source-layer': layerConfig.sourceLayer,
            paint: {
              ...layerConfig.paint,
              // Apply opacity to paint properties
              ...(layerConfig.type === 'line' && { 'line-opacity': opacity }),
              ...(layerConfig.type === 'fill' && { 'fill-opacity': opacity }),
              ...(layerConfig.type === 'circle' && { 'circle-opacity': opacity }),
              ...(layerConfig.type === 'symbol' && { 'text-opacity': opacity, 'icon-opacity': opacity })
            },
            layout: {
              ...layerConfig.layout,
              visibility: 'none'
            }
          } as any);

          // Add click handler for interactive layers
          if (onFeatureClick) {
            map.on('click', layerId, (e) => {
              if (e.features && e.features.length > 0) {
                handleFeatureClick(e.features[0], layerId);
              }
            });
          }

          layersRef.current.add(layerId);
        }
      });

      initializedRef.current = true;
      onLoadingChange?.(false);

      // Trigger immediate visibility update after initialization
      setTimeout(() => {
        updateLayerVisibility();
      }, 50);
    } catch (error) {
      handleLoadError(config.sourceId, `Failed to initialize: ${error}`);
    }
  }, [map, config, layers, opacity, handleLoadError, handleFeatureClick, onLoadingChange]);

  // Update layer visibility
  const updateLayerVisibility = useCallback(() => {
    if (!map || !initializedRef.current) return;

    const zoomInRange = isZoomInRange();
    const shouldShow = visible && zoomInRange;

    layersRef.current.forEach((layerId) => {
      if (safeGetLayer(map, layerId)) {
        // Check if this specific layer should be visible
        const layerConfigId = layerId.replace(`${config.sourceId}-`, '');
        const layerVisible = layerVisibility[layerConfigId] !== false; // Default to visible
        
        safeSetLayoutProperty(map, layerId, 'visibility', 
          shouldShow && layerVisible ? 'visible' : 'none');
      }
    });
  }, [map, visible, config.sourceId, layerVisibility, isZoomInRange]);

  // Update layer opacity
  const updateLayerOpacity = useCallback(() => {
    if (!map || !initializedRef.current) return;

    layers.forEach((layerConfig) => {
      const layerId = `${config.sourceId}-${layerConfig.id}`;
      
      if (safeGetLayer(map, layerId)) {
        // Update opacity based on layer type
        if (layerConfig.type === 'line') {
          safeSetPaintProperty(map, layerId, 'line-opacity', opacity);
        } else if (layerConfig.type === 'fill') {
          safeSetPaintProperty(map, layerId, 'fill-opacity', opacity);
        } else if (layerConfig.type === 'circle') {
          safeSetPaintProperty(map, layerId, 'circle-opacity', opacity);
        } else if (layerConfig.type === 'symbol') {
          safeSetPaintProperty(map, layerId, 'text-opacity', opacity);
          safeSetPaintProperty(map, layerId, 'icon-opacity', opacity);
        }
      }
    });
  }, [map, config.sourceId, layers, opacity]);

  // Handle style changes
  const handleStyleChange = useCallback(() => {
    setTimeout(() => {
      if (map && map.isStyleLoaded()) {
        // Only reset if source was actually removed (style change)
        if (!map.getSource(config.sourceId)) {
          initializedRef.current = false;
          initializeSource();
        }
      }
    }, 100);
  }, [map, config.sourceId, initializeSource]);

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

  // Preconnect to IGN service and initialize
  useEffect(() => {
    if (!map) return;

    // Preconnect to IGN service for better performance
    preconnectVectorService(config.serviceType);

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
  }, [map, config.serviceType, handleStyleChange, tryInitialize, preconnectVectorService]);

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
      layersRef.current.clear();
      sourcesRef.current.clear();
      initializedRef.current = false;
    };
  }, []);

  return null;
};

export default IGNVectorTileLayer;
