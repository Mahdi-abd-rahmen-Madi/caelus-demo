import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';
import { CANALISATIONS_CONFIG, type CanalisationsFeature, type CanalisationsProps } from './types';

const Canalisations: React.FC<CanalisationsProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 6,
  maxZoom = 20,
  onLoadingChange,
  onLoadError,
  onFeatureClick
}) => {
  // Convert CANALISATIONS_CONFIG to BRGMWMSLayerConfig
  const brgmConfig: BRGMWMSLayerConfig = {
    layerName: CANALISATIONS_CONFIG.layerName,
    sourceId: CANALISATIONS_CONFIG.sourceId,
    layerId: CANALISATIONS_CONFIG.layerId,
    displayName: CANALISATIONS_CONFIG.displayName,
    baseUrl: 'mapsref',
    minZoom,
    maxZoom
  };

  // Convert BRGMFeature to CanalisationsFeature format
  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      const canalisationsFeature: CanalisationsFeature = {
        geometry: feature.geometry,
        properties: {
          layer: feature.properties.layer,
          displayName: CANALISATIONS_CONFIG.displayName,
          clickedAt: feature.properties.clickedAt
        }
      };
      onFeatureClick(canalisationsFeature);
    }
  };

  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      minZoom={minZoom}
      maxZoom={maxZoom}
      onLoadingChange={onLoadingChange}
      onLoadError={onLoadError}
      onFeatureClick={handleFeatureClick}
      layerConfig={brgmConfig}
    />
  );
};

export default Canalisations;
