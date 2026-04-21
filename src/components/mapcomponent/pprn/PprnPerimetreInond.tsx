import maplibregl from 'maplibre-gl';
import React, { memo } from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface PprnPerimetreInondProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
}

// PPRN_PERIMETRE_INOND layer configuration
const PPRN_PERIMETRE_INOND_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'PPRN_PERIMETRE_INOND',
  sourceId: 'pprn-perimetre-inond-wms-source',
  layerId: 'pprn-perimetre-inond-wms-layer',
  displayName: 'PPRN Périmètre Inondation',
  baseUrl: 'mapsref'
} as const;

export const PprnPerimetreInond: React.FC<PprnPerimetreInondProps> = ({
  map,
  visible = true,
  opacity = 0.7
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      layerConfig={PPRN_PERIMETRE_INOND_CONFIG}
    />
  );
};

export default memo(PprnPerimetreInond);
