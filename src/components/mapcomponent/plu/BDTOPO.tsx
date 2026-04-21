import React from 'react';
import type { IGNLayerConfig, IGNVectorTileConfig } from '../../../utils/ignVectorTileLayer';
import IGNVectorTileLayer from '../../../utils/ignVectorTileLayer';
import type { BDTOPOFeature, BDTOPOLayerType, BDTOPOProps } from './types';

const BDTOPO: React.FC<BDTOPOProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 12,
  maxZoom = 20,
  bdtopoLayers,
  onLoadError,
  onFeatureClick
}) => {
  // BDTOPO configuration using the new utility
  const config: IGNVectorTileConfig = {
    serviceType: 'bdtopo',
    sourceId: 'bdtopo-source',
    minZoom: 0,
    maxZoom: 20,
    attribution: '© IGN'
  };

  // BDTOPO building layers with multiple source-layer fallbacks for robustness
  const layers: IGNLayerConfig[] = [
    {
      id: 'batiment',
      type: 'fill',
      sourceLayer: 'batiment',
      paint: {
        'fill-color': '#DF9C9A'
      }
    },
    {
      id: 'building',
      type: 'fill',
      sourceLayer: 'building',
      paint: {
        'fill-color': '#DF9C9A'
      }
    },
    {
      id: 'buildings',
      type: 'fill',
      sourceLayer: 'buildings',
      paint: {
        'fill-color': '#DF9C9A'
      }
    },
    {
      id: 'bati',
      type: 'fill',
      sourceLayer: 'bati',
      paint: {
        'fill-color': '#DF9C9A'
      }
    },
    {
      id: 'BATIMENT',
      type: 'fill',
      sourceLayer: 'BATIMENT',
      paint: {
        'fill-color': '#DF9C9A'
      }
    }
  ];

  // Layer visibility - only show buildings layer when enabled
  const layerVisibility = {
    'batiment': bdtopoLayers?.buildings || false,
    'building': bdtopoLayers?.buildings || false,
    'buildings': bdtopoLayers?.buildings || false,
    'bati': bdtopoLayers?.buildings || false,
    'BATIMENT': bdtopoLayers?.buildings || false
  };

  // Handle feature clicks
  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      const bdtopoFeature = feature as BDTOPOFeature;
      const layerType: BDTOPOLayerType = 'buildings';
      onFeatureClick(bdtopoFeature, layerType);
    }
  };

  // Handle load errors
  const handleLoadError = (_layerId: string, error: string) => {
    if (onLoadError) {
      const layerType: BDTOPOLayerType = 'buildings';
      onLoadError(layerType, error);
    }
  };

  return (
    <IGNVectorTileLayer
      map={map}
      visible={visible}
      opacity={opacity * 0.8} // Apply the 0.8 factor from original code
      minZoom={minZoom}
      maxZoom={maxZoom}
      config={config}
      layers={layers}
      layerVisibility={layerVisibility}
      onFeatureClick={handleFeatureClick}
      onLoadError={handleLoadError}
    />
  );
};

export default BDTOPO;
