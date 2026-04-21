import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2PosteElectriqueProps extends EnedisV2ComponentProps {}

const EnedisV2PosteElectrique: React.FC<EnedisV2PosteElectriqueProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.posteElectrique}
    />
  );
};

export default EnedisV2PosteElectrique;
