import React from 'react';
import EnedisV2WMSLayer from './EnedisV2WMSLayer';
import { ENEDIS_V2_LAYERS, type EnedisV2ComponentProps } from './types';

interface EnedisV2BTLinesProps extends EnedisV2ComponentProps {}

const EnedisV2BTLines: React.FC<EnedisV2BTLinesProps> = (props) => {
  return (
    <EnedisV2WMSLayer
      {...props}
      layerConfig={ENEDIS_V2_LAYERS.btLines}
    />
  );
};

export default EnedisV2BTLines;
