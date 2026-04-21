import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayerToggle from './shared/LayerToggle';
import LayerGroupSection from './shared/LayerGroupSection';
import ColorIndicator from './shared/ColorIndicator';
import ZoomIndicator from './shared/ZoomIndicator';
import type { PLULayers } from './types/layerControlTypes';

export interface UrbanPlanningControlsProps {
  showPluNetwork: boolean;
  pluLayers: PLULayers;
  currentZoom: number;
  onPluNetworkToggle: (visible: boolean) => void;
  onPluLayerToggle: (layer: string, visible: boolean) => void;
}

const UrbanPlanningControls: React.FC<UrbanPlanningControlsProps> = ({
  showPluNetwork,
  pluLayers,
  currentZoom,
  onPluNetworkToggle,
  onPluLayerToggle
}) => {
  const { t } = useTranslation();

  const handleZoningToggle = () => {
    const newState = !(showPluNetwork && pluLayers['zoning-sectors']);
    onPluNetworkToggle(newState);
    onPluLayerToggle('zoning-sectors', newState);
    // When toggling PLU zoning, ensure only zoning is enabled
    if (newState) {
      onPluLayerToggle('prescriptions', false);
      onPluLayerToggle('information', false);
    } else {
      // Turn off prescriptions and information when turning off zoning sectors
      onPluLayerToggle('prescriptions', false);
      onPluLayerToggle('information', false);
    }
  };

  return (
    <LayerGroupSection
      title={t('urban_planning')}
      color="#10b981"
      backgroundColor="rgba(16, 185, 129, 0.03)"
    >
      {/* PLU Zoning Sectors (Base Layer) */}
      <LayerToggle
        checked={showPluNetwork && pluLayers['zoning-sectors']}
        onChange={handleZoningToggle}
        label={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography variant="caption" sx={{
              fontSize: '9px',
              color: 'rgba(0, 0, 0, 0.8)',
              fontWeight: 500
            }}>
              PLU Zoning
            </Typography>
            <ZoomIndicator currentZoom={currentZoom} />
          </Box>
        }
        color="#10b981"
      />

      {/* PLU Information Layer - Optional supplementary layer */}
      {showPluNetwork && pluLayers['zoning-sectors'] && (
        <LayerToggle
          checked={pluLayers['information']}
          onChange={() => onPluLayerToggle('information', !pluLayers['information'])}
          label="Information"
          color="#047857"
          indicator={<ColorIndicator color="#047857" size={6} />}
          sx={{ px: 1, mt: 0.5 }}
        />
      )}

      {/* PLU Prescription Overlay - Only show when zoning is active */}
      {showPluNetwork && pluLayers['zoning-sectors'] && (
        <LayerToggle
          checked={pluLayers['prescriptions']}
          onChange={() => onPluLayerToggle('prescriptions', !pluLayers['prescriptions'])}
          label={
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.1 }}>
              <Typography variant="caption" sx={{
                fontSize: '8px',
                color: 'rgba(0, 0, 0, 0.7)',
                fontWeight: 500
              }}>
                Prescriptions
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: '6px',
                color: '#059669',
                fontWeight: 500
              }}>
                Symbols
              </Typography>
            </Box>
          }
          color="#059669"
          indicator={<ColorIndicator color="#059669" size={6} />}
          sx={{ px: 1, mt: 0.5 }}
        />
      )}
    </LayerGroupSection>
  );
};

export default UrbanPlanningControls;
