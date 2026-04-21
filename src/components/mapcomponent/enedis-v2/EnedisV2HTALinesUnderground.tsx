import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2HTALinesUndergroundProps extends EnedisV2ComponentProps {}

const EnedisV2HTALinesUnderground: React.FC<EnedisV2HTALinesUndergroundProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.htaLinesUnderground}
    />
  );
};

export default EnedisV2HTALinesUnderground;
