import maplibregl from 'maplibre-gl';
import React, { memo } from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface PprnSeismeProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
}

// PPRN_SEISME layer configuration
const PPRN_SEISME_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'PPRN_SEISME',
  sourceId: 'pprn-seisme-wms-source',
  layerId: 'pprn-seisme-wms-layer',
  displayName: 'PPRN Séisme',
  baseUrl: 'mapsref'
} as const;

export const PprnSeisme: React.FC<PprnSeismeProps> = ({
  map,
  visible = true,
  opacity = 0.7
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      layerConfig={PPRN_SEISME_CONFIG}
    />
  );
};

export default memo(PprnSeisme);
