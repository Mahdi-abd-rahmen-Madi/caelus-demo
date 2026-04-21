import maplibregl from 'maplibre-gl';
import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface SeismicV1Props {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (properties: any) => void;
}

// SIS_INTENSITE layer configuration
const SEISMIC_V1_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'SIS_INTENSITE',
  sourceId: 'seismic-v1-source',
  layerId: 'seismic-v1-layer',
  displayName: 'Seismic V1',
  baseUrl: 'geoservices',
  minZoom: 0,
  maxZoom: 20
} as const;

const SeismicV1: React.FC<SeismicV1Props> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 0,
  maxZoom = 20,
  onLoadingChange,
  onLoadError,
  onFeatureClick
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      minZoom={minZoom}
      maxZoom={maxZoom}
      onLoadingChange={onLoadingChange}
      onLoadError={onLoadError}
      onFeatureClick={onFeatureClick}
      layerConfig={SEISMIC_V1_CONFIG}
    />
  );
};

export default SeismicV1;
