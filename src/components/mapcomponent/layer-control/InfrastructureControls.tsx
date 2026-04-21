import React from 'react';
import { Box, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayerToggle from './shared/LayerToggle';
import LayerGroupSection from './shared/LayerGroupSection';
import ColorIndicator from './shared/ColorIndicator';
import type { EnedisV2Layers } from './types/layerControlTypes';

export interface InfrastructureControlsProps {
  showRailwayNetwork: boolean;
  showEnedisV2Network: boolean;
  enedisV2Layers: EnedisV2Layers;
  rteTensionMode: boolean;
  onRailwayNetworkToggle: (visible: boolean) => void;
  onEnedisV2NetworkToggle: (visible: boolean) => void;
  onEnedisV2LayerToggle: (layer: string, visible: boolean) => void;
  onRTETensionModeToggle: (visible: boolean) => void;
}

const InfrastructureControls: React.FC<InfrastructureControlsProps> = ({
  showRailwayNetwork,
  showEnedisV2Network,
  enedisV2Layers,
  rteTensionMode: _rteTensionMode,
  onRailwayNetworkToggle,
  onEnedisV2NetworkToggle,
  onEnedisV2LayerToggle,
  onRTETensionModeToggle: _onRTETensionModeToggle
}) => {
  const { t } = useTranslation();

  const enedisLayerConfigs = [
    { key: 'posteElectrique', label: t('poste_electrique'), color: '#8b5cf6' },
    { key: 'posteSource', label: t('poste_source'), color: '#a855f7' },
    { key: 'poteauElectrique', label: t('poteau_electrique'), color: '#c084fc' },
    { key: 'htaLines', label: t('hta_lines'), color: '#9333ea' },
    { key: 'btLines', label: t('bt_lines'), color: '#7c3aed' },
    { key: 'htaLinesUnderground', label: t('hta_underground'), color: '#6b21a8' },
    { key: 'btLinesUnderground', label: t('bt_underground'), color: '#4c1d95' }
  ] as const;

  return (
    <LayerGroupSection
      title={t('infrastructure')}
      color="#6366f1"
      backgroundColor="rgba(99, 102, 241, 0.03)"
    >
      {/* Railway Network Toggle */}
      <LayerToggle
        checked={showRailwayNetwork}
        onChange={() => onRailwayNetworkToggle(!showRailwayNetwork)}
        label={t('railways')}
        color="#4444ff"
        indicator={<ColorIndicator color="#4444ff" />}
        layerId="railway-network"
        debugMode={false}
      />

      {/* Enedis V2 Toggle */}
      <LayerToggle
        checked={showEnedisV2Network}
        onChange={() => onEnedisV2NetworkToggle(!showEnedisV2Network)}
        label={t('enedis_v2')}
        color="#9333ea"
        sx={{ mt: 0.5 }}
      />

      {/* Enedis V2 Sub-toggles */}
      {showEnedisV2Network && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1, mt: 0.5 }}>
          {enedisLayerConfigs.map((config) => (
            <Box key={config.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ColorIndicator color={config.color} />
                <Typography variant="caption" sx={{ fontSize: '8px', color: 'rgba(0, 0, 0, 0.7)' }}>
                  {config.label}
                </Typography>
              </Box>
              <Switch
                checked={enedisV2Layers[config.key]}
                onChange={() => onEnedisV2LayerToggle(config.key, !enedisV2Layers[config.key])}
                size="small"
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: config.color,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: `${config.color}33`,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* RTE Network Toggle */}
      <Box sx={{ opacity: 0.5, cursor: 'not-allowed' }}>
        <LayerToggle
          checked={false}
          onChange={() => {}}
          label="Réseau RTE"
          color="#dc2626"
          sx={{ mt: 0.5, pointerEvents: 'none' }}
        />
      </Box>
    </LayerGroupSection>
  );
};

export default InfrastructureControls;
