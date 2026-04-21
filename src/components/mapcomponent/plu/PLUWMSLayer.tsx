import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';
import { PLU_WMS_CONFIG, type PluComponentProps, type PluFeature, type PluLayerConfig } from './types';

interface PluWMSLayerProps extends PluComponentProps {
  layerConfig: PluLayerConfig;
}

const PluWMSLayer: React.FC<PluWMSLayerProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 8,
  maxZoom = 20,
  onLoadingChange,
  onLoadError,
  onFeatureClick,
  layerConfig
}) => {
  // Convert PluLayerConfig to BRGMWMSLayerConfig
  const brgmConfig: BRGMWMSLayerConfig = {
    layerName: layerConfig.layerName,
    sourceId: layerConfig.sourceId,
    layerId: layerConfig.layerId,
    displayName: layerConfig.displayName,
    customBaseUrl: PLU_WMS_CONFIG.baseUrl,
    minZoom,
    maxZoom,
    crs: layerConfig.crs
  };

  // Convert BRGMFeature to PluFeature format
  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      const pluFeature: PluFeature = {
        geometry: feature.geometry,
        properties: {
          layer: feature.properties.layer,
          displayName: layerConfig.displayName,
          description: layerConfig.description,
          clickedAt: feature.properties.clickedAt
        }
      };
      onFeatureClick(pluFeature);
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

export default PluWMSLayer;
