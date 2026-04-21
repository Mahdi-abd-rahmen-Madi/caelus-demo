import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2PosteSourceProps extends EnedisV2ComponentProps {}

const EnedisV2PosteSource: React.FC<EnedisV2PosteSourceProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.posteSource}
    />
  );
};

export default EnedisV2PosteSource;
