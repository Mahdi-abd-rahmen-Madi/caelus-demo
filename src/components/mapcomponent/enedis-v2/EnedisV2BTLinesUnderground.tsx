import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2BTLinesUndergroundProps extends EnedisV2ComponentProps {}

const EnedisV2BTLinesUnderground: React.FC<EnedisV2BTLinesUndergroundProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.btLinesUnderground}
    />
  );
};

export default EnedisV2BTLinesUnderground;
