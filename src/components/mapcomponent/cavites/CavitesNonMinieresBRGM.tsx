import maplibregl from 'maplibre-gl';
import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface CavitesNonMinieresBRGMProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (properties: any) => void;
}

// CAVITE_LOCALISEE layer configuration
const CAVITES_BRGM_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'CAVITE_LOCALISEE',
  sourceId: 'cavites-non-minieres-brgm-source',
  layerId: 'cavites-non-minieres-brgm-layer',
  displayName: 'Cavités Non Minières BRGM',
  baseUrl: 'mapsref',
  minZoom: 0,
  maxZoom: 20
} as const;

const CavitesNonMinieresBRGM: React.FC<CavitesNonMinieresBRGMProps> = ({
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
      layerConfig={CAVITES_BRGM_CONFIG}
    />
  );
};

export default CavitesNonMinieresBRGM;
