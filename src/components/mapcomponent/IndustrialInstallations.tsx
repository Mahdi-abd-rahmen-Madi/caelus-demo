import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../utils/brgmWMSLayer';

interface IndustrialInstallationsProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: any) => void;
}

// Create a separate config for industrial installations
const INDUSTRIAL_INSTALLATIONS_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'INSTALLATIONS_CLASSEES_SIMPLIFIE',
  sourceId: 'industrial-installations-source',
  layerId: 'industrial-installations-layer',
  displayName: 'Industrial Installations',
  baseUrl: 'mapsref',
  minZoom: 6,
  maxZoom: 20
} as const;

const IndustrialInstallations: React.FC<IndustrialInstallationsProps> = (props) => {
  return (
    <BRGMWMSLayer
      {...props}
      layerConfig={INDUSTRIAL_INSTALLATIONS_CONFIG}
    />
  );
};

export default IndustrialInstallations;
