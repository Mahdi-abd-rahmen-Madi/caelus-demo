import LayersIcon from '@mui/icons-material/Layers';
import { Box, Divider, Paper, Typography } from '@mui/material';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAP_CONFIG } from '../../../config/mapConfig';
import type { BaseMapType } from '../../../types/dashboard';
import BaseMapControls from './BaseMapControls';
import GeorisquesControls from './GeorisquesControls';
import IGNVectorControls from './IGNVectorControls';
import InfrastructureControls from './InfrastructureControls';
import ParcelControls from './ParcelControls';
import SettingsControls from './SettingsControls';
import UrbanPlanningControls from './UrbanPlanningControls';
import type {
    BDTOPOLayers,
    EnedisV2Layers,
    ICPEFilters,
    PCILayers,
    // SeismicZoneFilters removed - WMS shows all zones by default
    PLULayers
} from './types/layerControlTypes';

interface LayerControlProps {
  internalSelectedBaseMap: BaseMapType;
  currentZoom: number;
  showRailwayNetwork: boolean;
  // Enedis V2 props
  showEnedisV2Network: boolean;
  enedisV2Layers: EnedisV2Layers;
  // Canalisations props
  showCanalisationsNetwork: boolean;
  showIndustrialInstallations: boolean;
  icpeFilters: ICPEFilters;
  showSeismicZones: boolean;
  showSeismicV1: boolean;
  // seismicZoneFilters removed - WMS shows all zones by default
  // Vector tile versions for testing
  showSevesoInstallationsVector: boolean;
  showInondationV1: boolean;
  showAlearg: boolean;
  showMvtLocalise: boolean;
  showCavitesNonMinieresBRGM: boolean;
  showPprnPerimetreInond: boolean;
  showPprnSeisme: boolean;
  // SSP (Sites et Sols Pollués) props
  showSspClassificationSis: boolean;
  showSspInstruction: boolean;
  showSspEtablissement: boolean;
  // RTE Network props
  rteTensionMode: boolean;
  // Dynamic MVT Simple props
  showDynamicMVTSimple: boolean;
  // PLU (Plan Local d'Urbanisme) props
  showPluNetwork: boolean;
  pluLayers: PLULayers;
  // Risk Trackers props
  showRiskTrackers: boolean;
  // IGN Vector Layers props
  showPCINetwork: boolean;
  pciLayers: PCILayers;
  showBDTOPONetwork: boolean;
  bdtopoLayers: BDTOPOLayers;
  onBaseMapChange: (value: BaseMapType) => void;
  onRailwayNetworkToggle: (visible: boolean) => void;
  // Enedis V2 handlers
  onEnedisV2NetworkToggle: (visible: boolean) => void;
  onEnedisV2LayerToggle: (layer: string, visible: boolean) => void;
  // Canalisations handlers
  onCanalisationsNetworkToggle: (visible: boolean) => void;
  onIndustrialInstallationsToggle: (visible: boolean) => void;
  onICPEFilterToggle: (classification: string, visible: boolean) => void;
  onSeismicZonesToggle: (visible: boolean) => void;
  onSeismicV1Toggle: (visible: boolean) => void;
  // onSeismicZoneFilterToggle removed - WMS shows all zones by default
  // Vector tile handlers for testing
  onSevesoInstallationsVectorToggle: (visible: boolean) => void;
  onInondationV1Toggle: (visible: boolean) => void;
  onAleargToggle: (visible: boolean) => void;
  onMvtLocaliseToggle: (visible: boolean) => void;
  onCavitesNonMinieresBRGMToggle: (visible: boolean) => void;
  onPprnPerimetreInondToggle: (visible: boolean) => void;
  onPprnSeismeToggle: (visible: boolean) => void;
  // SSP (Sites et Sols Pollués) handlers
  onSspClassificationSisToggle: (visible: boolean) => void;
  onSspInstructionToggle: (visible: boolean) => void;
  onSspEtablissementToggle: (visible: boolean) => void;
  // RTE Network handlers
  onRTETensionModeToggle: (visible: boolean) => void;
  // Dynamic MVT Simple handlers
  onDynamicMVTSimpleToggle: (visible: boolean) => void;
  // PLU handlers
  onPluNetworkToggle: (visible: boolean) => void;
  onPluLayerToggle: (layer: string, visible: boolean) => void;
  // Risk Trackers handlers
  onRiskTrackersToggle: (visible: boolean) => void;
  // IGN Vector Layers handlers
  onPCINetworkToggle: (visible: boolean) => void;
  onPCILayerToggle: (layer: string, visible: boolean) => void;
  onBDTOPONetworkToggle: (visible: boolean) => void;
  onBDTOPOLayerToggle: (layer: string, visible: boolean) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({
  internalSelectedBaseMap,
  currentZoom,
  showRailwayNetwork,
  // Enedis V2 props
  showEnedisV2Network,
  enedisV2Layers,
  // Canalisations props
  showCanalisationsNetwork,
  showIndustrialInstallations,
  icpeFilters,
  showSeismicZones,
  showSeismicV1,
  // seismicZoneFilters removed - WMS shows all zones by default
  // Vector tile versions for testing
  showSevesoInstallationsVector,
  showInondationV1,
  showAlearg,
  showMvtLocalise,
  showCavitesNonMinieresBRGM,
  showPprnPerimetreInond,
  showPprnSeisme,
  // SSP props
  showSspClassificationSis,
  showSspInstruction,
  showSspEtablissement,
  // RTE Network props
  rteTensionMode,
  // Dynamic MVT Simple props
  showDynamicMVTSimple,
  // PLU props
  showPluNetwork,
  pluLayers,
  // Risk Trackers props
  showRiskTrackers,
  // IGN Vector Layers props
  showPCINetwork,
  pciLayers,
  showBDTOPONetwork,
  bdtopoLayers,
  onBaseMapChange,
  onRailwayNetworkToggle,
  // Enedis V2 handlers
  onEnedisV2NetworkToggle,
  onEnedisV2LayerToggle,
  // Canalisations handlers
  onCanalisationsNetworkToggle,
  onIndustrialInstallationsToggle,
  onICPEFilterToggle,
  onSeismicZonesToggle,
  onSeismicV1Toggle,
  // onSeismicZoneFilterToggle removed - WMS shows all zones by default
  // Vector tile handlers for testing
  onSevesoInstallationsVectorToggle,
  onInondationV1Toggle,
  onAleargToggle,
  onMvtLocaliseToggle,
  onCavitesNonMinieresBRGMToggle,
  onPprnPerimetreInondToggle,
  onPprnSeismeToggle,
  // SSP handlers
  onSspClassificationSisToggle,
  onSspInstructionToggle,
  onSspEtablissementToggle,
  // RTE Network handlers
  onRTETensionModeToggle,
  // Dynamic MVT Simple handlers
  onDynamicMVTSimpleToggle,
  // PLU handlers
  onPluNetworkToggle,
  onPluLayerToggle,
  // Risk Trackers handlers
  onRiskTrackersToggle,
  // IGN Vector Layers handlers
  onPCINetworkToggle,
  onPCILayerToggle,
  onBDTOPONetworkToggle,
  onBDTOPOLayerToggle
}) => {
  const { t } = useTranslation();

  return (
    <Paper
      elevation={0}
      sx={{
        width: '180px',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        right: 0,
        top: 64,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 0,
        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0
      }}
    >
      {/* Sidebar Header */}
      <Box
        sx={{
          p: 1.25,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.25,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          transition: 'background-color 0.15s ease',
          py: 1.875,
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          flexShrink: 0,
          order: -1
        }}>
          <LayersIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>

        {/* Controls Display */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          width: '100%'
        }}>
          {/* Current Base Map Indicator */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5
          }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6366f1',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                opacity: 0.8
              }}
            >
              {internalSelectedBaseMap === 'osm' ? t('osm') :
                internalSelectedBaseMap === 'osm-hot' ? t('hot') :
                  internalSelectedBaseMap === 'carto-positron' ? t('light') :
                    internalSelectedBaseMap === 'carto-darkmatter' ? t('dark') :
                      internalSelectedBaseMap === 'maptiler-satellite' ? t('sat') : t('mode')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Scrollable Controls */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '4px'
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(99, 102, 241, 0.3)',
          borderRadius: '2px',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.5)'
          }
        }
      }}>
        {/* Base Map Controls */}
        <BaseMapControls
          internalSelectedBaseMap={internalSelectedBaseMap}
          onBaseMapChange={onBaseMapChange}
        />

        <Divider sx={{ mx: 1, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

        {/* Layer Controls */}
        {!MAP_CONFIG.hideLayersTitle && (
          <>
            {/* Infrastructure Section */}
            <InfrastructureControls
              showRailwayNetwork={showRailwayNetwork}
              showEnedisV2Network={showEnedisV2Network}
              enedisV2Layers={enedisV2Layers}
              rteTensionMode={rteTensionMode}
              onRailwayNetworkToggle={onRailwayNetworkToggle}
              onEnedisV2NetworkToggle={onEnedisV2NetworkToggle}
              onEnedisV2LayerToggle={onEnedisV2LayerToggle}
              onRTETensionModeToggle={onRTETensionModeToggle}
            />

            {/* Parcels Section */}
            <ParcelControls
              showDynamicMVTSimple={showDynamicMVTSimple}
              onDynamicMVTSimpleToggle={onDynamicMVTSimpleToggle}
            />

            <Divider sx={{ mx: 1, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

            {/* PLU Urban Planning Section */}
            <UrbanPlanningControls
              showPluNetwork={showPluNetwork}
              pluLayers={pluLayers}
              currentZoom={currentZoom}
              onPluNetworkToggle={onPluNetworkToggle}
              onPluLayerToggle={onPluLayerToggle}
            />

            <Divider sx={{ mx: 1, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

            {/* IGN Vector Layers Section */}
            <IGNVectorControls
              showPCINetwork={showPCINetwork}
              pciLayers={pciLayers}
              showBDTOPONetwork={showBDTOPONetwork}
              bdtopoLayers={bdtopoLayers}
              onPCINetworkToggle={onPCINetworkToggle}
              onPCILayerToggle={onPCILayerToggle}
              onBDTOPONetworkToggle={onBDTOPONetworkToggle}
              onBDTOPOLayerToggle={onBDTOPOLayerToggle}
            />

            {/* Géorisques Section */}
            <GeorisquesControls
              showCanalisationsNetwork={showCanalisationsNetwork}
              showIndustrialInstallations={showIndustrialInstallations}
              icpeFilters={icpeFilters}
              showSeismicZones={showSeismicZones}
              showSeismicV1={showSeismicV1}
              // seismicZoneFilters removed - WMS shows all zones by default
              showSevesoInstallationsVector={showSevesoInstallationsVector}
              showInondationV1={showInondationV1}
              showAlearg={showAlearg}
              showMvtLocalise={showMvtLocalise}
              showCavitesNonMinieresBRGM={showCavitesNonMinieresBRGM}
              showPprnPerimetreInond={showPprnPerimetreInond}
              showPprnSeisme={showPprnSeisme}
              showSspClassificationSis={showSspClassificationSis}
              showSspInstruction={showSspInstruction}
              showSspEtablissement={showSspEtablissement}
              onCanalisationsNetworkToggle={onCanalisationsNetworkToggle}
              onIndustrialInstallationsToggle={onIndustrialInstallationsToggle}
              onICPEFilterToggle={onICPEFilterToggle}
              onSeismicZonesToggle={onSeismicZonesToggle}
              onSeismicV1Toggle={onSeismicV1Toggle}
              // onSeismicZoneFilterToggle removed - WMS shows all zones by default
              onSevesoInstallationsVectorToggle={onSevesoInstallationsVectorToggle}
              onInondationV1Toggle={onInondationV1Toggle}
              onAleargToggle={onAleargToggle}
              onMvtLocaliseToggle={onMvtLocaliseToggle}
              onCavitesNonMinieresBRGMToggle={onCavitesNonMinieresBRGMToggle}
              onPprnPerimetreInondToggle={onPprnPerimetreInondToggle}
              onPprnSeismeToggle={onPprnSeismeToggle}
              onSspClassificationSisToggle={onSspClassificationSisToggle}
              onSspInstructionToggle={onSspInstructionToggle}
              onSspEtablissementToggle={onSspEtablissementToggle}
            />

            <Divider sx={{ mx: 1, borderColor: 'rgba(148, 163, 184, 0.2)' }} />

            {/* Settings Section */}
            <SettingsControls
              showRiskTrackers={showRiskTrackers}
              onRiskTrackersToggle={onRiskTrackersToggle}
            />
          </>
        )}
      </Box>
    </Paper>
  );
};

export default memo(LayerControl);
