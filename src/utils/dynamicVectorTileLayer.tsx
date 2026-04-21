import maplibregl from 'maplibre-gl';
import React, { useCallback, useEffect, useRef } from 'react';

// Dynamic Vector Tile Service Configuration
export interface DynamicVectorTileConfig {
  sourceId: string;
  baseUrl: string;
  sourceLayer?: string;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
}

// Layer Configuration
export interface DynamicLayerConfig {
  id: string;
  type: 'line' | 'fill' | 'circle' | 'symbol';
  paint: Record<string, any>;
  layout?: Record<string, any>;
  filter?: maplibregl.FilterSpecification;
}

// Dynamic Parameters
export interface DynamicParameters {
  [key: string]: string | number | boolean | [number, number];
}

// Component Props
export interface DynamicVectorTileProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  config: DynamicVectorTileConfig;
  layers: DynamicLayerConfig[];
  layerVisibility?: Record<string, boolean>;
  parameters?: DynamicParameters;
  onFeatureClick?: (feature: any, layerId: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
}

const DynamicVectorTileLayer: React.FC<DynamicVectorTileProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 0,
  maxZoom = 20,
  config,
  layers,
  layerVisibility = {},
  parameters = {},
  onFeatureClick,
  onLoadingChange,
  onLoadError
}) => {
  const initializedRef = useRef(false);
  const sourcesRef = useRef<string[]>([]);
  const layersRef = useRef<string[]>([]);
  const mapRef = useRef(map);
  const lastParametersRef = useRef<DynamicParameters>({});

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Check if current zoom is within visibility range
  const isZoomInRange = useCallback(() => {
    if (!mapRef.current) return false;
    const currentZoom = mapRef.current.getZoom();
    return currentZoom >= minZoom && currentZoom <= maxZoom;
  }, [minZoom, maxZoom]);

  // Build tile URL with dynamic parameters
  const buildTileUrl = useCallback(() => {
    const params = new URLSearchParams();
    
    // Process parameters based on common patterns
    Object.keys(parameters).forEach((key: string) => {
      const value = parameters[key];
      if (value === undefined || value === null || value === '') return;
      
      // Handle special cases
      if (key === 'voltageRange' && Array.isArray(value)) {
        const [min, max] = value as [number, number];
        // Only add voltage range if it's not the full range
        if (min !== 45 || max !== 400) {
          params.set('voltage_min', `${min}kV`);
          params.set('voltage_max', `${max}kV`);
        }
      } else if (typeof value === 'boolean') {
        if (value) {
          params.set(key, 'true');
        }
      } else if (Array.isArray(value)) {
        // Handle boolean arrays for line types
        const [aerien, souterrain] = value as unknown as [boolean, boolean];
        if (aerien && !souterrain) {
          params.set('line_type', 'aerien');
        } else if (souterrain && !aerien) {
          params.set('line_type', 'souterrain');
        }
        // If both are true or both are false, don't add filter (show all)
      } else {
        params.set(key, String(value));
      }
    });

    const paramString = params.toString();
    return `${config.baseUrl}{z}/{x}/{y}${paramString ? '?' + paramString : ''}`;
  }, [config.baseUrl, parameters]);

  // Check if parameters have changed
  const hasParametersChanged = useCallback(() => {
    const currentParams = JSON.stringify(parameters);
    const lastParams = JSON.stringify(lastParametersRef.current);
    return currentParams !== lastParams;
  }, [parameters]);

  // Handle loading changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // Handle feature clicks
  const handleFeatureClick = useCallback((feature: any, layerId: string) => {
    onFeatureClick?.(feature, layerId);
  }, [onFeatureClick]);

  // Handle load errors
  const handleLoadError = useCallback((error: string) => {
    onLoadError?.(error);
    handleLoadingChange(false);
  }, [onLoadError, handleLoadingChange]);

  // Initialize source and layers
  const initializeSource = useCallback(() => {
    if (!map || !map.isStyleLoaded()) return;

    handleLoadingChange(true);

    try {
      const tileUrl = buildTileUrl();

      // Remove existing layers first (before source)
      layersRef.current.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
      });

      // Remove source only after layers are removed
      if (map.getSource(config.sourceId)) {
        map.removeSource(config.sourceId);
      }

      sourcesRef.current = [];
      layersRef.current = [];

      // Add new source with dynamic URL
      map.addSource(config.sourceId, {
        type: 'vector',
        tiles: [tileUrl],
        minzoom: config.minZoom ?? 0,
        maxzoom: config.maxZoom ?? 20,
        attribution: config.attribution
      });
      sourcesRef.current.push(config.sourceId);

      // Add layers
      layers.forEach((layerConfig) => {
        const layerId = `${config.sourceId}-${layerConfig.id}`;

        map.addLayer({
          id: layerId,
          type: layerConfig.type,
          source: config.sourceId as any,
          'source-layer': config.sourceLayer || 'default',
          paint: {
            ...layerConfig.paint,
            // Apply opacity based on layer type
            ...(layerConfig.type === 'line' && { 'line-opacity': opacity }),
            ...(layerConfig.type === 'fill' && { 'fill-opacity': opacity }),
            ...(layerConfig.type === 'circle' && { 'circle-opacity': opacity }),
            ...(layerConfig.type === 'symbol' && { 'text-opacity': opacity, 'icon-opacity': opacity })
          },
          layout: {
            ...layerConfig.layout,
            visibility: 'none'
          },
          filter: layerConfig.filter
        } as any);

        // Add click handler
        if (onFeatureClick) {
          map.on('click', layerId, (e) => {
            if (e.features && e.features.length > 0) {
              handleFeatureClick(e.features[0], layerId);
            }
          });
        }

        layersRef.current.push(layerId);
      });

      initializedRef.current = true;
      lastParametersRef.current = { ...parameters };
      handleLoadingChange(false);

      // Trigger immediate visibility update after initialization
      setTimeout(() => {
        updateLayerVisibility();
      }, 50);
    } catch (error) {
      handleLoadError(`Failed to initialize: ${error}`);
    }
  }, [map, config, layers, opacity, parameters, buildTileUrl, handleLoadingChange, handleFeatureClick, handleLoadError]);

  // Update layer visibility
  const updateLayerVisibility = useCallback(() => {
    if (!map || !initializedRef.current) return;

    const zoomInRange = isZoomInRange();
    const shouldShow = visible && zoomInRange;

    layersRef.current.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        // Check if this specific layer should be visible
        const layerConfigId = layerId.replace(`${config.sourceId}-`, '');
        const layerVisible = layerVisibility[layerConfigId] !== false; // Default to visible
        
        map.setLayoutProperty(layerId, 'visibility', 
          shouldShow && layerVisible ? 'visible' : 'none');
      }
    });
  }, [map, visible, config.sourceId, layerVisibility, isZoomInRange]);

  // Update layer opacity
  const updateLayerOpacity = useCallback(() => {
    if (!map || !initializedRef.current) return;

    layers.forEach((layerConfig) => {
      const layerId = `${config.sourceId}-${layerConfig.id}`;
      
      if (map.getLayer(layerId)) {
        // Update opacity based on layer type
        if (layerConfig.type === 'line') {
          map.setPaintProperty(layerId, 'line-opacity', opacity);
        } else if (layerConfig.type === 'fill') {
          map.setPaintProperty(layerId, 'fill-opacity', opacity);
        } else if (layerConfig.type === 'circle') {
          map.setPaintProperty(layerId, 'circle-opacity', opacity);
        } else if (layerConfig.type === 'symbol') {
          map.setPaintProperty(layerId, 'text-opacity', opacity);
          map.setPaintProperty(layerId, 'icon-opacity', opacity);
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

  // Initialize source and layers
  useEffect(() => {
    if (!map) return;

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
  }, [map, handleStyleChange, tryInitialize]);

  // Reinitialize when parameters change
  useEffect(() => {
    if (initializedRef.current && hasParametersChanged()) {
      initializeSource();
    }
  }, [parameters, initializeSource, hasParametersChanged]);

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
      layersRef.current = [];
      sourcesRef.current = [];
      initializedRef.current = false;
    };
  }, []);

  return null;
};

export default DynamicVectorTileLayer;
