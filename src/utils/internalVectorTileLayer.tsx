import maplibregl from 'maplibre-gl';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Internal Vector Tile Service Configuration
export interface InternalVectorTileConfig {
  sourceId: string;
  layerId: string;
  tileUrl: string;
  sourceLayer?: string;
  minZoom?: number;
  maxZoom?: number;
  attribution?: string;
}

// Layer Configuration
export interface InternalLayerConfig {
  type: 'circle' | 'fill' | 'line' | 'symbol';
  paint: Record<string, any>;
  layout?: Record<string, any>;
  filter?: maplibregl.FilterSpecification;
}

// Component Props
export interface InternalVectorTileProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  config: InternalVectorTileConfig;
  layerConfig: InternalLayerConfig;
  highlightConfig?: {
    enabled: boolean;
    paint: Record<string, any>;
  };
  filters?: Record<string, any>;
  onFeatureClick?: (properties: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  onHighlightChange?: (featureId: string | null, coords: [number, number] | null) => void;
}

const InternalVectorTileLayer: React.FC<InternalVectorTileProps> = ({
  map,
  visible = false,
  opacity = 1.0,
  minZoom = 0,
  maxZoom = 20,
  config,
  layerConfig,
  highlightConfig = { enabled: false, paint: {} },
  filters = {},
  onFeatureClick,
  onLoadingChange,
  onHighlightChange
}) => {
  const initializedRef = useRef(false);
  const mapRef = useRef(map);
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<string | null>(null);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Create filter based on filters prop
  const activeFilter = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return layerConfig.filter;
    }

    // Handle ICPE-style filters (classification based)
    if (filters.seveso_classification) {
      const activeFilters = Object.entries(filters.seveso_classification)
        .filter(([_, enabled]) => enabled)
        .map(([classification, _]) => ['==', ['get', 'seveso_classification'], classification]);

      if (activeFilters.length === 0) {
        return ['==', ['get', 'seveso_classification'], ''] as maplibregl.FilterSpecification;
      } else if (activeFilters.length === 1) {
        return activeFilters[0] as maplibregl.FilterSpecification;
      } else {
        return ['any', ...activeFilters] as maplibregl.FilterSpecification;
      }
    }

    return layerConfig.filter;
  }, [filters, layerConfig.filter]);

  // Handle loading changes
  const handleLoadingChange = useCallback((loading: boolean) => {
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  // Handle feature clicks
  const handleFeatureClick = useCallback((feature: any) => {
    if (onFeatureClick && feature.properties) {
      onFeatureClick(feature.properties);
    }
  }, [onFeatureClick]);

  // Handle highlight changes
  const handleHighlightChange = useCallback((featureId: string | null, coords: [number, number] | null) => {
    setHighlightedFeatureId(featureId);
    onHighlightChange?.(featureId, coords);
  }, [onHighlightChange]);

  // Initialize source and layers
  const initializeSource = useCallback(() => {
    if (!map || !map.isStyleLoaded() || initializedRef.current) return;

    handleLoadingChange(true);

    try {
      // Add vector tile source (backend handles decompression)
      if (!map.getSource(config.sourceId)) {
        map.addSource(config.sourceId, {
          type: 'vector',
          tiles: [config.tileUrl],
          minzoom: config.minZoom ?? 0,
          maxzoom: config.maxZoom ?? 20,
          attribution: config.attribution
        } as any);
      }

      // Add main layer
      if (!map.getLayer(config.layerId)) {
        map.addLayer({
          id: config.layerId,
          type: layerConfig.type,
          source: config.sourceId as any,
          'source-layer': config.sourceLayer || 'default',
          paint: {
            ...layerConfig.paint,
            // Apply opacity based on layer type
            ...(layerConfig.type === 'circle' && { 'circle-opacity': opacity }),
            ...(layerConfig.type === 'fill' && { 'fill-opacity': opacity }),
            ...(layerConfig.type === 'line' && { 'line-opacity': opacity }),
            ...(layerConfig.type === 'symbol' && { 'text-opacity': opacity, 'icon-opacity': opacity })
          },
          layout: {
            ...layerConfig.layout,
            visibility: 'none'
          },
          filter: activeFilter
        } as any);

        // Add click handler
        if (onFeatureClick) {
          map.on('click', config.layerId, (e) => {
            if (e.features && e.features.length > 0) {
              handleFeatureClick(e.features[0]);
            }
          });
        }

        // Add hover handler for highlighting
        if (highlightConfig.enabled) {
          map.on('mousemove', config.layerId, (e) => {
            if (e.features && e.features.length > 0) {
              const feature = e.features[0];
              if (feature.id && feature.id !== highlightedFeatureId) {
                handleHighlightChange(feature.id.toString(), e.lngLat.toArray() as [number, number]);
              }
            }
          });

          map.on('mouseleave', config.layerId, () => {
            handleHighlightChange(null, null);
          });
        }
      }

      // Add highlight layer if enabled
      if (highlightConfig.enabled && !map.getLayer(`${config.layerId}-highlight`)) {
        map.addLayer({
          id: `${config.layerId}-highlight`,
          type: layerConfig.type,
          source: config.sourceId as any,
          'source-layer': config.sourceLayer || 'default',
          paint: highlightConfig.paint,
          layout: {
            visibility: 'none'
          },
          filter: ['==', ['id'], '']
        } as any);
      }

      initializedRef.current = true;
      handleLoadingChange(false);

      // Trigger immediate visibility update after initialization
      setTimeout(() => {
        updateLayerVisibility();
      }, 50);
    } catch (error) {
      console.error('Failed to initialize internal vector tile layer:', error);
      handleLoadingChange(false);
    }
  }, [map, config, layerConfig, highlightConfig, opacity, activeFilter, handleLoadingChange, handleFeatureClick, handleHighlightChange, highlightedFeatureId]);

  // Update layer visibility
  const updateLayerVisibility = useCallback(() => {
    if (!map || !initializedRef.current) return;

    const currentZoom = map.getZoom();
    const zoomInRange = currentZoom >= minZoom && currentZoom <= maxZoom;
    const shouldShow = visible && zoomInRange;

    if (map.getLayer(config.layerId)) {
      map.setLayoutProperty(config.layerId, 'visibility', shouldShow ? 'visible' : 'none');
    }

    if (highlightConfig.enabled && map.getLayer(`${config.layerId}-highlight`)) {
      map.setLayoutProperty(`${config.layerId}-highlight`, 'visibility', shouldShow ? 'visible' : 'none');
    }
  }, [map, visible, minZoom, maxZoom, config.layerId, highlightConfig.enabled]);

  // Update layer opacity
  const updateLayerOpacity = useCallback(() => {
    if (!map || !initializedRef.current) return;

    if (map.getLayer(config.layerId)) {
      if (layerConfig.type === 'circle') {
        map.setPaintProperty(config.layerId, 'circle-opacity', opacity);
      } else if (layerConfig.type === 'fill') {
        map.setPaintProperty(config.layerId, 'fill-opacity', opacity);
      } else if (layerConfig.type === 'line') {
        map.setPaintProperty(config.layerId, 'line-opacity', opacity);
      } else if (layerConfig.type === 'symbol') {
        map.setPaintProperty(config.layerId, 'text-opacity', opacity);
        map.setPaintProperty(config.layerId, 'icon-opacity', opacity);
      }
    }
  }, [map, config.layerId, layerConfig.type, opacity]);

  // Update highlight
  const updateHighlight = useCallback(() => {
    if (!map || !initializedRef.current || !highlightConfig.enabled) return;

    const highlightLayerId = `${config.layerId}-highlight`;
    if (map.getLayer(highlightLayerId)) {
      if (highlightedFeatureId) {
        map.setPaintProperty(highlightLayerId, 'visibility', 'visible');
        map.setFilter(highlightLayerId, ['==', ['id'], highlightedFeatureId]);
      } else {
        map.setPaintProperty(highlightLayerId, 'visibility', 'none');
        map.setFilter(highlightLayerId, ['==', ['id'], '']);
      }
    }
  }, [map, config.layerId, highlightConfig.enabled, highlightedFeatureId]);

  // Update filter
  const updateFilter = useCallback(() => {
    if (!map || !initializedRef.current) return;

    if (map.getLayer(config.layerId)) {
      map.setFilter(config.layerId, activeFilter);
    }
  }, [map, config.layerId, activeFilter]);

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

  // Update visibility when dependencies change
  useEffect(() => {
    updateLayerVisibility();
  }, [updateLayerVisibility]);

  // Update opacity when dependencies change
  useEffect(() => {
    updateLayerOpacity();
  }, [updateLayerOpacity]);

  // Update highlight when dependencies change
  useEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  // Update filter when dependencies change
  useEffect(() => {
    updateFilter();
  }, [updateFilter]);

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

export default InternalVectorTileLayer;
