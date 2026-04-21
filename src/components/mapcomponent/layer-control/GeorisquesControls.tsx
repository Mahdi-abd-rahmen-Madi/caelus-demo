import { Box, Switch, Typography } from '@mui/material';
import ColorIndicator from './shared/ColorIndicator';
import LayerGroupSection from './shared/LayerGroupSection';
import LayerToggle from './shared/LayerToggle';
import type { ICPEFilters } from './types/layerControlTypes';

export interface GeorisquesControlsProps {
  showCanalisationsNetwork: boolean;
  showIndustrialInstallations: boolean;
  icpeFilters: ICPEFilters;
  showSeismicZones: boolean;
  showSeismicV1: boolean;
  // seismicZoneFilters removed - WMS shows all zones by default
  showSevesoInstallationsVector: boolean;
  showInondationV1: boolean;
  showAlearg: boolean;
  showMvtLocalise: boolean;
  showCavitesNonMinieresBRGM: boolean;
  showPprnPerimetreInond: boolean;
  showPprnSeisme: boolean;
  showSspClassificationSis: boolean;
  showSspInstruction: boolean;
  showSspEtablissement: boolean;
  onCanalisationsNetworkToggle: (visible: boolean) => void;
  onIndustrialInstallationsToggle: (visible: boolean) => void;
  onICPEFilterToggle: (classification: string, visible: boolean) => void;
  onSeismicZonesToggle: (visible: boolean) => void;
  onSeismicV1Toggle: (visible: boolean) => void;
  // onSeismicZoneFilterToggle removed - WMS shows all zones by default
  onSevesoInstallationsVectorToggle: (visible: boolean) => void;
  onInondationV1Toggle: (visible: boolean) => void;
  onAleargToggle: (visible: boolean) => void;
  onMvtLocaliseToggle: (visible: boolean) => void;
  onCavitesNonMinieresBRGMToggle: (visible: boolean) => void;
  onSspClassificationSisToggle: (visible: boolean) => void;
  onSspInstructionToggle: (visible: boolean) => void;
  onSspEtablissementToggle: (visible: boolean) => void;
  onPprnPerimetreInondToggle: (visible: boolean) => void;
  onPprnSeismeToggle: (visible: boolean) => void;
}

const GeorisquesControls: React.FC<GeorisquesControlsProps> = ({
  showCanalisationsNetwork,
  showIndustrialInstallations,
  icpeFilters,
  showSeismicZones,
  showSeismicV1,
  // seismicZoneFilters removed - WMS shows all zones by default
  showSevesoInstallationsVector,
  showInondationV1,
  showAlearg,
  showMvtLocalise,
  showCavitesNonMinieresBRGM,
  showPprnPerimetreInond,
  showPprnSeisme,
  showSspClassificationSis,
  showSspInstruction,
  showSspEtablissement,
  onCanalisationsNetworkToggle,
  onIndustrialInstallationsToggle,
  onICPEFilterToggle,
  onSeismicZonesToggle,
  onSeismicV1Toggle,
  // onSeismicZoneFilterToggle removed - WMS shows all zones by default
  onSevesoInstallationsVectorToggle: _onSevesoInstallationsVectorToggle,
  onInondationV1Toggle,
  onAleargToggle,
  onMvtLocaliseToggle,
  onCavitesNonMinieresBRGMToggle,
  onPprnPerimetreInondToggle,
  onPprnSeismeToggle,
  onSspClassificationSisToggle,
  onSspInstructionToggle,
  onSspEtablissementToggle
}) => {
  
  const icpeClassifications = [
    { key: '1', label: 'Seuil Haut', color: '#d32f2f' },
    { key: '2', label: 'Seuil Bas', color: '#f57c00' },
    { key: '3', label: 'Non Seveso', color: '#757575' }
  ] as const;

  // seismicZoneConfigs removed - WMS shows all zones by default


  return (
    <LayerGroupSection
      title="Géorisques"
      color="#ef4444"
      backgroundColor="rgba(239, 68, 68, 0.03)"
    >
      {/* Industrial Risks Group */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'rgba(0, 0, 0, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          Risques Industriels
        </Typography>
        
        {/* ICPE Installations (Vector Tiles) */}
        <Box sx={{ opacity: 0.5, cursor: 'not-allowed' }}>
          <LayerToggle
            checked={false}
            onChange={() => {}}
            label="ICPE"
            color="#d32f2f"
            sx={{ pointerEvents: 'none' }}
            indicator={
              <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                <ColorIndicator color="#d32f2f" size={6} />
                <ColorIndicator color="#f57c00" size={5} />
                <ColorIndicator color="#757575" size={4} />
              </Box>
            }
          />
        </Box>

        {/* Individual ICPE Classification Toggles */}
        {showSevesoInstallationsVector && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1, mt: 0.5 }}>
            {icpeClassifications.map((classification) => (
              <Box key={classification.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{
                  fontSize: '8px',
                  color: 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  <ColorIndicator color={classification.color} size={5} />
                  {classification.label}
                </Typography>
                <Switch
                  checked={icpeFilters[classification.key as keyof typeof icpeFilters]}
                  onChange={() => onICPEFilterToggle(classification.key, !icpeFilters[classification.key as keyof typeof icpeFilters])}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: classification.color,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: `${classification.color}33`,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Industrial Installations Toggle */}
        <LayerToggle
          checked={showIndustrialInstallations}
          onChange={() => onIndustrialInstallationsToggle(!showIndustrialInstallations)}
          label="Industrial Sites"
          color="#9333ea"
          indicator={<ColorIndicator color="#9333ea" />}
        />

        {/* Canalisations Toggle */}
        <LayerToggle
          checked={showCanalisationsNetwork}
          onChange={() => onCanalisationsNetworkToggle(!showCanalisationsNetwork)}
          label="Canalisations"
          color="#ef4444"
          indicator={<ColorIndicator color="#ef4444" />}
        />

        {/* SSP Etablissement Toggle */}
        <LayerToggle
          checked={showSspEtablissement}
          onChange={() => onSspEtablissementToggle(!showSspEtablissement)}
          label="BRGM - Anciens sites industriels"
          color="#4F4CA6"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#4F4CA6" size={6} shape="square" />
              <ColorIndicator color="#4F4CA6" size={6} shape="square" />
            </Box>
          }
        />
      </Box>

      {/* Seismic Risks Group */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'rgba(0, 0, 0, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          Risques Sismiques
        </Typography>
        
        {/* Seismic Zones Toggle */}
        <LayerToggle
          checked={showSeismicZones}
          onChange={() => onSeismicZonesToggle(!showSeismicZones)}
          label="Sismique"
          color="#f97316"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#10b981" size={6} />
              <ColorIndicator color="#f59e0b" size={6} />
              <ColorIndicator color="#ef4444" size={6} />
            </Box>
          }
        />

        {/* Seismic Intensity Commune Toggle */}
        <LayerToggle
          checked={showSeismicV1}
          onChange={() => onSeismicV1Toggle(!showSeismicV1)}
          label="Sismique Commune"
          color="#06b6d4"
          indicator={<ColorIndicator color="#06b6d4" size={6} />}
        />

        {/* PPRN Seisme Toggle */}
        <LayerToggle
          checked={showPprnSeisme}
          onChange={() => onPprnSeismeToggle(!showPprnSeisme)}
          label="PPRN Sismique"
          color="#f97316"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#10b981" size={6} />
              <ColorIndicator color="#84cc16" size={6} />
              <ColorIndicator color="#f59e0b" size={6} />
            </Box>
          }
        />
      </Box>

      {/* Ground Movement & Stability Group */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'rgba(0, 0, 0, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          Mouvements de Terrain & Stabilité
        </Typography>
        
        {/* MVT_LOCALISE Ground Movement Toggle */}
        <LayerToggle
          checked={showMvtLocalise}
          onChange={() => onMvtLocaliseToggle(!showMvtLocalise)}
          label="BRGM - Mouvements de terrain localisés"
          color="#ff6b35"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#ff6b35" size={6} />
              <ColorIndicator color="#f7931e" size={6} />
              <ColorIndicator color="#ff4500" size={6} />
            </Box>
          }
        />

        {/* BRGM Cavités Non Minières Toggle */}
        <LayerToggle
          checked={showCavitesNonMinieresBRGM}
          onChange={() => onCavitesNonMinieresBRGMToggle(!showCavitesNonMinieresBRGM)}
          label="BRGM - Cavités Non Minières"
          color="#9333ea"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#87CEEB" size={6} shape="square" />
              <ColorIndicator color="#90EE90" size={6} shape="square" sx={{ transform: 'rotate(45deg)' }} />
              <ColorIndicator color="#FFD700" size={6} shape="diamond" />
            </Box>
          }
        />

        {/* ALEARG Clay Shrink-Swell Toggle */}
        <LayerToggle
          checked={showAlearg}
          onChange={() => onAleargToggle(!showAlearg)}
          label="BRGM - Argile (retrait-gonflement)"
          color="#8B4513"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#8B4513" size={6} />
              <ColorIndicator color="#A0522D" size={6} />
              <ColorIndicator color="#D2691E" size={6} />
            </Box>
          }
        />
      </Box>

      {/* Flooding Risks Group */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'rgba(0, 0, 0, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          Risques d'Inondation
        </Typography>
        
        {/* InondationV1 Toggle */}
        <LayerToggle
          checked={showInondationV1}
          onChange={() => onInondationV1Toggle(!showInondationV1)}
          label="BRGM - Inondation"
          color="#06b6d4"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#06b6d4" size={6} />
              <ColorIndicator color="#0891b2" size={6} />
              <ColorIndicator color="#0e7490" size={6} />
            </Box>
          }
        />

        {/* PPRN Perimetre Inond Toggle */}
        <LayerToggle
          checked={showPprnPerimetreInond}
          onChange={() => onPprnPerimetreInondToggle(!showPprnPerimetreInond)}
          label="PPRN Inondation"
          color="#06b6d4"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#06b6d4" size={6} />
            </Box>
          }
        />
      </Box>

      {/* Soil Pollution Group */}
      <Box>
        <Typography variant="caption" sx={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          color: 'rgba(0, 0, 0, 0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5
        }}>
          Sols Pollués
        </Typography>
        
        {/* SSP Classification SIS Toggle */}
        <LayerToggle
          checked={showSspClassificationSis}
          onChange={() => onSspClassificationSisToggle(!showSspClassificationSis)}
          label="BRGM - Secteurs d'Information sur les Sols (SIS)"
          color="#E7C354"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#E7C354" size={6} shape="square" />
              <ColorIndicator color="#E7C354" size={6} shape="square" />
            </Box>
          }
        />

        {/* SSP Instruction Toggle */}
        <LayerToggle
          checked={showSspInstruction}
          onChange={() => onSspInstructionToggle(!showSspInstruction)}
          label="BRGM - Sites Pollués (ex-BASOL)"
          color="#EC9FB4"
          indicator={
            <Box sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <ColorIndicator color="#EC9FB4" size={6} shape="square" />
              <ColorIndicator color="#EC9FB4" size={6} shape="square" />
            </Box>
          }
        />
      </Box>
    </LayerGroupSection>
  );
};

export default GeorisquesControls;
