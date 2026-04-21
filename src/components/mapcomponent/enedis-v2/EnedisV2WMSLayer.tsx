import React from 'react';
import type { WMSConfig, WMSLayerConfig } from '../../../utils/enedisWMSLayer';
import EnedisWMSLayer from '../../../utils/enedisWMSLayer';
import { ENEDIS_V2_WMS_CONFIG, type EnedisV2ComponentProps, type EnedisV2Feature, type EnedisV2LayerConfig } from './types';

interface EnedisV2WMSLayerProps extends EnedisV2ComponentProps {
  layerConfig: EnedisV2LayerConfig;
}

const EnedisV2WMSLayer: React.FC<EnedisV2WMSLayerProps> = ({
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
  // WMS configuration using the new utility
  const wmsConfig: WMSConfig = {
    baseUrl: ENEDIS_V2_WMS_CONFIG.baseUrl,
    version: ENEDIS_V2_WMS_CONFIG.version,
    format: ENEDIS_V2_WMS_CONFIG.format,
    transparent: ENEDIS_V2_WMS_CONFIG.transparent,
    crs: ENEDIS_V2_WMS_CONFIG.crs,
    styles: ENEDIS_V2_WMS_CONFIG.styles
  };

  // Layer configuration
  const layerConfigForUtility: WMSLayerConfig = {
    layerId: layerConfig.layerId,
    sourceId: layerConfig.sourceId,
    layerName: layerConfig.layerName,
    displayName: layerConfig.displayName
  };

  // Handle feature clicks - convert WMS click to EnedisV2Feature format
  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      // For WMS layers, the utility provides a basic point feature
      // Convert it to the expected EnedisV2Feature format
      const enedisFeature: EnedisV2Feature = {
        geometry: feature.geometry,
        properties: {
          layer: layerConfig.layerName,
          clickedAt: new Date().toISOString(),
          ...feature.properties
        }
      };
      onFeatureClick(enedisFeature);
    }
  };

  // Handle load errors
  const handleLoadError = (error: string) => {
    if (onLoadError) {
      onLoadError(`Failed to initialize ${layerConfig.displayName}: ${error}`);
    }
  };

  return (
    <EnedisWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      minZoom={minZoom}
      maxZoom={maxZoom}
      wmsConfig={wmsConfig}
      layerConfig={layerConfigForUtility}
      onFeatureClick={handleFeatureClick}
      onLoadingChange={onLoadingChange}
      onLoadError={handleLoadError}
    />
  );
};

export default EnedisV2WMSLayer;
