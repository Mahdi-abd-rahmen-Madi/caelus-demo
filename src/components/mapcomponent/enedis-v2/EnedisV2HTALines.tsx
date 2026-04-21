import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2HTALinesProps extends EnedisV2ComponentProps {}

const EnedisV2HTALines: React.FC<EnedisV2HTALinesProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.htaLines}
    />
  );
};

export default EnedisV2HTALines;
