import maplibregl from 'maplibre-gl';
import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface SspEtablissementProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (properties: any) => void;
}

// SSP Etablissement layer configuration
const SSP_ETABLISSEMENT_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'SSP_ETABLISSEMENT',
  sourceId: 'ssp-etablissement-source',
  layerId: 'ssp-etablissement-layer',
  displayName: 'Anciens Sites Industriels',
  baseUrl: 'mapsref',
  version: '1.1.1',
  styles: 'default',
  srs: 'EPSG:3857',
  minZoom: 0,
  maxZoom: 20
} as const;

const SspEtablissement: React.FC<SspEtablissementProps> = ({
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
      layerConfig={SSP_ETABLISSEMENT_CONFIG}
    />
  );
};

export default SspEtablissement;
