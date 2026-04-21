import maplibregl from 'maplibre-gl';
import React, { memo } from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface InondationV1Props {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
}

// InondationV1 layer configuration - uses custom rapport_risques endpoint
const INONDATION_V1_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'SUP_INOND',
  sourceId: 'inondation-v1-wms-source',
  layerId: 'inondation-v1-wms-layer',
  displayName: 'BRGM Inondation',
  customBaseUrl: 'https://mapsref.brgm.fr/wxs/georisques/rapport_risques'
} as const;

export const InondationV1: React.FC<InondationV1Props> = ({
  map,
  visible = true,
  opacity = 0.7
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      layerConfig={INONDATION_V1_CONFIG}
    />
  );
};

export default memo(InondationV1);
