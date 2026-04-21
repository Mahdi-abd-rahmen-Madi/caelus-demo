import React from 'react';
import { Box, Switch, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LayerToggle from './shared/LayerToggle';
import LayerGroupSection from './shared/LayerGroupSection';
import ColorIndicator from './shared/ColorIndicator';
import type { PCILayers, BDTOPOLayers } from './types/layerControlTypes';

export interface IGNVectorControlsProps {
  showPCINetwork: boolean;
  pciLayers: PCILayers;
  showBDTOPONetwork: boolean;
  bdtopoLayers: BDTOPOLayers;
  onPCINetworkToggle: (visible: boolean) => void;
  onPCILayerToggle: (layer: string, visible: boolean) => void;
  onBDTOPONetworkToggle: (visible: boolean) => void;
  onBDTOPOLayerToggle: (layer: string, visible: boolean) => void;
}

const IGNVectorControls: React.FC<IGNVectorControlsProps> = ({
  showPCINetwork,
  pciLayers,
  showBDTOPONetwork,
  bdtopoLayers,
  onPCINetworkToggle,
  onPCILayerToggle,
  onBDTOPONetworkToggle,
  onBDTOPOLayerToggle
}) => {
  const { t } = useTranslation();

  const handleParcelsAndBuildingsToggle = () => {
    const newState = !(showPCINetwork && showBDTOPONetwork);
    // Toggle both networks and their layers together
    onPCINetworkToggle(newState);
    onBDTOPONetworkToggle(newState);
    onPCILayerToggle('main', newState);
    onBDTOPOLayerToggle('buildings', newState);
  };

  return (
    <LayerGroupSection
      title={t('ign_vector_layers')}
      color="#DF9C9A"
      backgroundColor="rgba(223, 156, 154, 0.03)"
    >
      {/* Enhanced Parcels & Buildings Toggle */}
      <LayerToggle
        checked={showPCINetwork && showBDTOPONetwork}
        onChange={handleParcelsAndBuildingsToggle}
        label={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
            <Typography variant="caption" sx={{
              fontSize: '9px',
              color: 'rgba(0, 0, 0, 0.8)',
              fontWeight: 500
            }}>
              {t('parcels_and_buildings')}
            </Typography>
          </Box>
        }
        color="#D82626"
        indicator={
          <Box sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #D82626 50%, #DF9C9A 50%)',
            border: '1px solid #fff'
          }} />
        }
      />

      {/* Individual Layer Controls */}
      {(showPCINetwork || showBDTOPONetwork) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, px: 1, mt: 0.5 }}>
          {/* BDTOPO Buildings Control */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 0.3,
            borderRadius: 0.5,
            backgroundColor: 'rgba(223, 156, 154, 0.1)',
            border: '1px solid rgba(223, 156, 154, 0.2)',
            opacity: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ColorIndicator color="#DF9C9A" size={6} border="2px solid #fff" />
              <Typography variant="caption" sx={{
                fontSize: '8px',
                color: 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600
              }}>
                {t('buildings')}
              </Typography>
              <Box sx={{
                px: 0.3,
                py: 0.1,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderRadius: 0.25,
                fontSize: '5px',
                color: '#22c55e',
                fontWeight: 600,
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                {t('active')}
              </Box>
            </Box>
            <Switch
              checked={bdtopoLayers.buildings}
              onChange={() => onBDTOPOLayerToggle('buildings', !bdtopoLayers.buildings)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#DF9C9A',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'rgba(223, 156, 154, 0.3)',
                },
              }}
            />
          </Box>

          {/* PCI Parcels Control */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 0.3,
            borderRadius: 0.5,
            backgroundColor: 'rgba(216, 38, 38, 0.1)',
            border: '1px solid rgba(216, 38, 38, 0.2)',
            opacity: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ColorIndicator color="#D82626" size={6} border="2px solid #fff" />
              <Typography variant="caption" sx={{
                fontSize: '8px',
                color: 'rgba(0, 0, 0, 0.8)',
                fontWeight: 600
              }}>
                {t('parcels_ign')}
              </Typography>
              <Box sx={{
                px: 0.3,
                py: 0.1,
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderRadius: 0.25,
                fontSize: '5px',
                color: '#22c55e',
                fontWeight: 600,
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                {t('active')}
              </Box>
            </Box>
            <Switch
              checked={pciLayers.main}
              onChange={() => onPCILayerToggle('main', !pciLayers.main)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#D82626',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'rgba(216, 38, 38, 0.3)',
                },
              }}
            />
          </Box>
        </Box>
      )}
    </LayerGroupSection>
  );
};

export default IGNVectorControls;
