import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2PoteauElectriqueProps extends EnedisV2ComponentProps {}

const EnedisV2PoteauElectrique: React.FC<EnedisV2PoteauElectriqueProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.poteauElectrique}
    />
  );
};

export default EnedisV2PoteauElectrique;
