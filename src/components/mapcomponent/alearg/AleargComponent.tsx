import maplibregl from 'maplibre-gl';
import React, { memo } from 'react';
import BRGMWMSLayer, { type BRGMWMSLayerConfig } from '../../../utils/brgmWMSLayer';

interface AleargComponentProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
}

// ALEARG layer configuration
const ALEARG_CONFIG: BRGMWMSLayerConfig = {
  layerName: 'ALEARG',
  sourceId: 'alearg-wms-source',
  layerId: 'alearg-wms-layer',
  displayName: 'ALEARG',
  baseUrl: 'mapsref'
} as const;

export const AleargComponent: React.FC<AleargComponentProps> = ({
  map,
  visible = true,
  opacity = 0.7
}) => {
  return (
    <BRGMWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      layerConfig={ALEARG_CONFIG}
    />
  );
};

export default memo(AleargComponent);
