import maplibregl from 'maplibre-gl';
import React, { memo } from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface MvtLocaliseComponentProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
}

// MVT_LOCALISE layer configuration
const MVT_LOCALISE_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'MVT_LOCALISE',
  sourceId: 'mvt-localise-wms-source',
  layerId: 'mvt-localise-wms-layer',
  displayName: 'MVT_LOCALISE',
  baseUrl: 'mapsref'
} as const;

const MvtLocaliseComponent: React.FC<MvtLocaliseComponentProps> = ({
  map,
  visible = true,
  opacity = 0.7
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      layerConfig={MVT_LOCALISE_CONFIG}
    />
  );
};

export default memo(MvtLocaliseComponent);
