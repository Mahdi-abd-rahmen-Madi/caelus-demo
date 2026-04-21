import maplibregl from 'maplibre-gl';
import React from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface SspInstructionProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (properties: any) => void;
}

// SSP Instruction layer configuration
const SSP_INSTRUCTION_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'SSP_INSTRUCTION',
  sourceId: 'ssp-instruction-source',
  layerId: 'ssp-instruction-layer',
  displayName: 'Sites Pollués (Instruction)',
  baseUrl: 'mapsref',
  version: '1.1.1',
  styles: 'default',
  srs: 'EPSG:3857',
  minZoom: 0,
  maxZoom: 20
} as const;

const SspInstruction: React.FC<SspInstructionProps> = ({
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
      layerConfig={SSP_INSTRUCTION_CONFIG}
    />
  );
};

export default SspInstruction;
