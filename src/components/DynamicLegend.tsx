import {
    LegendToggle
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Typography
} from '@mui/material';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MAP_CONFIG } from '../config/mapConfig';
import { getPluInformationLegendContent, getPluPrescriptionsLegendContent, getPluZoningLegendContent } from './mapcomponent/legend/PLUlegend';

interface DynamicLegendProps {
  visible?: boolean;
  showSevesoInstallations?: boolean;
  showSeismicZones?: boolean;
  showInondationV1?: boolean;
  showAlearg?: boolean;
  showMvtLocalise?: boolean;
  showCavitesNonMinieresBRGM?: boolean;
  showCanalisationsNetwork?: boolean;
  showIndustrialInstallations?: boolean;
  showSspEtablissement?: boolean;
  showSspClassificationSis?: boolean;
  showSspInstruction?: boolean;
  showPluInformation?: boolean;
  showPluZoning?: boolean;
  showPluPrescriptions?: boolean;
  showRTENetwork?: boolean;
  showPprnPerimetreInond?: boolean;
  showPprnSeisme?: boolean;
  showSeismicV1?: boolean;
}

interface LegendItem {
  content: React.ReactNode;
  name: string;
  color: string;
}

interface LegendIndicator {
  name: string;
  color: string;
}

const DynamicLegend: React.FC<DynamicLegendProps> = ({
  visible = true,
  showSevesoInstallations = false,
  showSeismicZones = false,
  showInondationV1 = false,
  showAlearg = false,
  showMvtLocalise = false,
  showCavitesNonMinieresBRGM = false,
  showCanalisationsNetwork = false,
  showIndustrialInstallations = false,
  showSspEtablissement = false,
  showSspClassificationSis = false,
  showSspInstruction = false,
  showPluInformation = false,
  showPluZoning = false,
  showPluPrescriptions = false,
  showRTENetwork = false,
  showPprnPerimetreInond = true,
  showPprnSeisme = true,
  showSeismicV1 = false,
}) => {
  const { t } = useTranslation();
  if ((!MAP_CONFIG.enableRiskVisualization || !visible) && !showSevesoInstallations && !showSeismicZones && !showInondationV1 && !showAlearg && !showMvtLocalise && !showCavitesNonMinieresBRGM && !showCanalisationsNetwork && !showIndustrialInstallations && !showSspEtablissement && !showSspClassificationSis && !showSspInstruction && !showPluInformation && !showPluZoning && !showPluPrescriptions && !showRTENetwork && !showPprnPerimetreInond && !showPprnSeisme && !showSeismicV1) {
    return null;
  }

  const getSevesoLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            ICPE - Classifications Seveso
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#d32f2f', borderRadius: '50%' }} />
            <Typography variant="caption">Seuil Haut</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, backgroundColor: '#f57c00', borderRadius: '50%' }} />
            <Typography variant="caption">Seuil Bas</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, backgroundColor: '#757575', borderRadius: '50%' }} />
            <Typography variant="caption">Non Seveso</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getSeismicLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Zones Sismiques
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
          <img
            src="/media/seismic-zones-legend.png"
            alt="Seismic Zones Legend"
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '4px',
              alignSelf: 'flex-start'
            }}
            onError={(e) => {
              // Fallback to custom legend if image fails to load
              console.warn('Seismic zones legend image failed to load, using fallback');
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallbackDiv = document.createElement('div');
                fallbackDiv.innerHTML = `
                  <div style="display: flex; flex-direction: column; gap: 1.5px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background-color: #10b981; border-radius: 50%;"></div>
                      <span style="font-size: 12px;">Zone 1 - Très faible</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background-color: #84cc16; border-radius: 50%;"></div>
                      <span style="font-size: 12px;">Zone 2 - Faible</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background-color: #f59e0b; border-radius: 50%;"></div>
                      <span style="font-size: 12px;">Zone 3 - Modérée</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background-color: #f97316; border-radius: 50%;"></div>
                      <span style="font-size: 12px;">Zone 4 - Forte</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 12px; height: 12px; background-color: #ef4444; border-radius: 50%;"></div>
                      <span style="font-size: 12px;">Zone 5 - Très forte</span>
                    </div>
                  </div>
                `;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  const getRTELegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Réseau RTE - Tensions
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#10b981', borderRadius: '50%' }} />
            <Typography variant="caption">45kV - Distribution locale</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: '50%' }} />
            <Typography variant="caption">63kV - Distribution locale</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f59e0b', borderRadius: '50%' }} />
            <Typography variant="caption">90kV - Transport régional</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f97316', borderRadius: '50%' }} />
            <Typography variant="caption">150kV - Transport régional</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#ef4444', borderRadius: '50%' }} />
            <Typography variant="caption">225kV - Transport national</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#dc2626', borderRadius: '50%' }} />
            <Typography variant="caption">400kV - Transport national</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          Couleurs indiquent le niveau de tension des lignes électriques
        </Typography>
        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
          Lignes aériennes: jaune (défaut) | Souterrain: bleu (défaut)
        </Typography>
      </Box>
    );
  };

  const getInondationV1LegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            BRGM Inondation
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#87CEEB', borderRadius: '50%' }} />
            <Typography variant="caption">Prescription hors zone d'aléa</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#4682B4', borderRadius: '50%' }} />
            <Typography variant="caption">Prescription</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#FFB6C1', borderRadius: '50%' }} />
            <Typography variant="caption">Interdiction</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#DC143C', borderRadius: '50%' }} />
            <Typography variant="caption">Interdiction stricte</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#9370DB', borderRadius: '50%' }} />
            <Typography variant="caption">Délaissement possible</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#4B0082', borderRadius: '50%' }} />
            <Typography variant="caption">Expropriation possible</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#808080', borderRadius: '50%' }} />
            <Typography variant="caption">Non renseingé</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#1E90FF', borderRadius: '50%' }} />
            <Typography variant="caption">Zone à risque d'inondation entraînant une servitude d'utilité publique</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getAleargLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Argiles - Gonflement Retrait
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#ff6b6b', borderRadius: '50%' }} />
            <Typography variant="caption">{t('clay_swelling_high')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#fb923c', borderRadius: '50%' }} />
            <Typography variant="caption">{t('clay_swelling_moderate')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#fbbf24', borderRadius: '50%' }} />
            <Typography variant="caption">{t('clay_swelling_low')}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getCavitesNonMinieresBRGMLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Cavités Souterraines Abandonnées Non Minières (BRGM)
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#87CEEB', borderRadius: '2px' }} />
            <Typography variant="caption">Cave</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#90EE90', transform: 'rotate(45deg)' }} />
            <Typography variant="caption">Carrière</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '10px solid #FFD700' }} />
            <Typography variant="caption">Naturelle</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#FFFFFF', border: '2px solid #FF0000', borderRadius: '50%' }} />
            <Typography variant="caption">Indéterminée</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #000000' }} />
            <Typography variant="caption">Galerie</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 16, color: '#0000FF', lineHeight: 1 }}>*</Box>
            </Box>
            <Typography variant="caption">Ouvrage Civil</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#800080', borderRadius: '50%' }} />
            <Typography variant="caption">Ouvrage militaire</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 16, color: '#87CEEB', lineHeight: 1 }}>★</Box>
            </Box>
            <Typography variant="caption">Puits</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#6600FF', borderRadius: '50%' }} />
            <Typography variant="caption">Souterrain</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getSspEtablissementLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Anciens sites industriels (BRGM)
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#4F4CA6', borderRadius: '2px' }} />
          <Typography variant="caption">SSP Établissement</Typography>
        </Box>
      </Box>
    );
  };

  const getSspClassificationSisLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Classification SIS (BRGM)
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#E7C354', borderRadius: '2px' }} />
          <Typography variant="caption">SSP Classification SIS</Typography>
        </Box>
      </Box>
    );
  };

  const getSspInstructionLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Instruction (BRGM)
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#EC9FB4', borderRadius: '2px' }} />
          <Typography variant="caption">SSP Instruction</Typography>
        </Box>
      </Box>
    );
  };

  const getMvtLocaliseLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Mouvements de terrain localisés
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#E78181', borderRadius: '2px' }} />
            <Typography variant="caption">Glissement</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#7FFE7F', transform: 'rotate(45deg)' }} />
            <Typography variant="caption">Eboulement</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid #FEFE7F' }} />
            <Typography variant="caption">Coulee</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 32, color: '#7A80D9', lineHeight: 1 }}>*</Box>
            </Box>
            <Typography variant="caption">Effondrement</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '12px solid #FE7FFE' }} />
            <Typography variant="caption">Erosion des berges</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getPprnPerimetreInondLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            PPRN Inondation
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#80AAB1', borderRadius: '2px' }} />
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              Flood Risk Prevention Plan Perimeters
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getPprnSeismeLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            PPRN Sismique
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#E38B86', borderRadius: '2px' }} />
            <Typography variant="body2" sx={{ fontSize: '12px' }}>
              Seismic Risk Prevention Plans
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getCanalisationsLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Canalisations
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#F91A1E', borderRadius: '50%' }} />
            <Typography variant="caption">Hydrocarbures</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#D0B852', borderRadius: '50%' }} />
            <Typography variant="caption">Produits Chimiques</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#72A1FD', borderRadius: '50%' }} />
            <Typography variant="caption">Gaz</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const getIndustrialInstallationsLegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Installations Industrielles
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#9333ea', borderRadius: '50%' }} />
          <Typography variant="caption">Installations Industrielles</Typography>
        </Box>
      </Box>
    );
  };

  const getSeismicV1LegendContent = (showTitle = true) => {
    return (
      <Box>
        {showTitle && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Sismique Commune
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#d3d3d3', borderRadius: '2px' }} />
            <Typography variant="caption">Ressenti par certains</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#32cd32', borderRadius: '2px' }} />
            <Typography variant="caption">Ressenti par la plupart, objets vibrent</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ffff00', borderRadius: '2px' }} />
            <Typography variant="caption">Frayeur, chute d'objets</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ffa500', borderRadius: '2px' }} />
            <Typography variant="caption">Dégâts légers (fissuration plâtres)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ff0000', borderRadius: '2px' }} />
            <Typography variant="caption">Dégâts (chutes cheminées, fissures murs)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ff00ff', borderRadius: '2px' }} />
            <Typography variant="caption">Dégâts importants (effondrements murs)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#4b0082', borderRadius: '2px' }} />
            <Typography variant="caption">Destructions</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  // Calculate legend items once
  const legendItems: LegendItem[] = React.useMemo(() => {
    const items: LegendItem[] = [];
    if (showPluZoning) {
      items.push({ content: getPluZoningLegendContent(false), name: 'PluZoning', color: '#E60000' });
    }
    if (showPluInformation) {
      // Use the imported PLU Information content function
      items.push({ content: getPluInformationLegendContent(false), name: 'PluInformation', color: '#56AA02' });
    }
    if (showPluPrescriptions) {
      items.push({ content: getPluPrescriptionsLegendContent(false), name: 'PluPrescriptions', color: '#059669' });
    }
    if (showSevesoInstallations) {
      items.push({ content: getSevesoLegendContent(false), name: 'Seveso', color: '#d32f2f' });
    }
    if (showSeismicZones) {
      items.push({ content: getSeismicLegendContent(false), name: 'Seismic', color: '#10b981' });
    }
    if (showInondationV1) {
      items.push({ content: getInondationV1LegendContent(false), name: 'InondationV1', color: '#06b6d4' });
    }
    if (showAlearg) {
      items.push({ content: getAleargLegendContent(false), name: 'ALEARG', color: '#8B4513' });
    }
    if (showMvtLocalise) {
      items.push({ content: getMvtLocaliseLegendContent(false), name: 'MvtLocalise', color: '#E78181' });
    }
    if (showCavitesNonMinieresBRGM) {
      items.push({ content: getCavitesNonMinieresBRGMLegendContent(false), name: 'CavitesBRGM', color: '#9333ea' });
    }
    if (showCanalisationsNetwork) {
      items.push({ content: getCanalisationsLegendContent(false), name: 'Canalisations', color: '#ef4444' });
    }
    if (showIndustrialInstallations) {
      items.push({ content: getIndustrialInstallationsLegendContent(false), name: 'Industrial', color: '#9333ea' });
    }
    if (showSspEtablissement) {
      items.push({ content: getSspEtablissementLegendContent(false), name: 'SspEtablissement', color: '#4F4CA6' });
    }
    if (showSspClassificationSis) {
      items.push({ content: getSspClassificationSisLegendContent(false), name: 'SspClassificationSis', color: '#E7C354' });
    }
    if (showSspInstruction) {
      items.push({ content: getSspInstructionLegendContent(false), name: 'SspInstruction', color: '#EC9FB4' });
    }
    if (showRTENetwork) {
      items.push({ content: getRTELegendContent(false), name: 'RTE', color: '#dc2626' });
    }
    if (showPprnPerimetreInond) {
      items.push({ content: getPprnPerimetreInondLegendContent(false), name: 'PprnPerimetreInond', color: '#80AAB1' });
    }
    if (showPprnSeisme) {
      items.push({ content: getPprnSeismeLegendContent(false), name: 'PprnSeisme', color: '#E38B86' });
    }
    if (showSeismicV1) {
      items.push({ content: getSeismicV1LegendContent(false), name: 'SeismicV1', color: '#ff0000' });
    }
    return items;
  }, [
    showPluZoning, showPluInformation, showPluPrescriptions,
    showSevesoInstallations, showSeismicZones,
    showInondationV1, showAlearg,
    showCavitesNonMinieresBRGM,
    showCanalisationsNetwork, showIndustrialInstallations,
    showSspEtablissement, showSspClassificationSis, showSspInstruction,
    showRTENetwork, showPprnPerimetreInond, showPprnSeisme, showSeismicV1
  ]);

  // Auto-expand sections based on legend items count and PLU Information priority
  React.useEffect(() => {
    const hasPluInformation = legendItems.some(item => item.name === 'PluInformation');

    if (hasPluInformation) {
      // When PLU Information is present, expand it and minimize others
      const expandedSet = new Set<string>();
      expandedSet.add('PluInformation');

      // Only expand other sections if there are very few items
      if (legendItems.length <= 2) {
        legendItems.forEach(item => expandedSet.add(item.name));
      }

      setExpandedSections(expandedSet);
    } else {
      // Normal behavior when PLU Information is not present
      if (legendItems.length <= 3) {
        setExpandedSections(new Set(legendItems.map(item => item.name)));
      } else {
        setExpandedSections(new Set([legendItems[0]?.name || '']));
      }
    }
  }, [legendItems.length, legendItems]);

  const getLegendContent = () => {
    if (legendItems.length === 0) return null;
    if (legendItems.length === 1) {
      // For single legend, show title by calling the function with showTitle={true}
      const singleItem = legendItems[0];
      let contentWithTitle;
      
      switch (singleItem.name) {
        case 'PluZoning':
          contentWithTitle = getPluZoningLegendContent(true);
          break;
        case 'PluInformation':
          contentWithTitle = getPluInformationLegendContent(true);
          break;
        case 'PluPrescriptions':
          contentWithTitle = getPluPrescriptionsLegendContent(true);
          break;
        case 'Seveso':
          contentWithTitle = getSevesoLegendContent(true);
          break;
        case 'Seismic':
          contentWithTitle = getSeismicLegendContent(true);
          break;
        case 'InondationV1':
          contentWithTitle = getInondationV1LegendContent(true);
          break;
        case 'ALEARG':
          contentWithTitle = getAleargLegendContent(true);
          break;
        case 'MvtLocalise':
          contentWithTitle = getMvtLocaliseLegendContent(true);
          break;
        case 'CavitesBRGM':
          contentWithTitle = getCavitesNonMinieresBRGMLegendContent(true);
          break;
        case 'Canalisations':
          contentWithTitle = getCanalisationsLegendContent(true);
          break;
        case 'Industrial':
          contentWithTitle = getIndustrialInstallationsLegendContent(true);
          break;
        case 'SspEtablissement':
          contentWithTitle = getSspEtablissementLegendContent(true);
          break;
        case 'SspClassificationSis':
          contentWithTitle = getSspClassificationSisLegendContent(true);
          break;
        case 'SspInstruction':
          contentWithTitle = getSspInstructionLegendContent(true);
          break;
        case 'RTE':
          contentWithTitle = getRTELegendContent(true);
          break;
        case 'PprnPerimetreInond':
          contentWithTitle = getPprnPerimetreInondLegendContent(true);
          break;
        case 'PprnSeisme':
          contentWithTitle = getPprnSeismeLegendContent(true);
          break;
        case 'SeismicV1':
          contentWithTitle = getSeismicV1LegendContent(true);
          break;
        default:
          contentWithTitle = singleItem.content;
      }
      
      return contentWithTitle;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {legendItems.map((item, index) => {
          const isExpanded = expandedSections.has(item.name);
          return (
            <Box key={item.name}>
              <Box
                onClick={() => toggleSection(item.name)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <Typography variant="subtitle2" sx={{
                  fontWeight: 600,
                  fontSize: '12px',
                  color: '#1e293b',
                  flex: 1
                }}>
                  {item.name === 'Seveso' ? 'ICPE - Classifications Seveso' :
                    item.name === 'Seismic' ? 'Zones Sismiques' :
                      item.name === 'Flood' ? 'Zones d\'Inondation' :
                        item.name === 'Nuclear' ? 'Réacteurs Nucléaires' :
                          item.name === 'InondationV1' ? 'BRGM Inondation' :
                            item.name === 'CavitesBRGM' ? 'Cavités Non Minières BRGM' :
                              item.name === 'Canalisations' ? 'Canalisations' :
                                item.name === 'Industrial' ? 'Installations Industrielles' :
                                  item.name === 'PluZoning' ? 'PLU Zoning' :
                                    item.name === 'PluInformation' ? 'PLU Information' :
                                      item.name === 'PluPrescriptions' ? 'PLU Prescriptions' :
                                        item.name === 'PprnPerimetreInond' ? 'PPRN Inondation' :
                                          item.name === 'PprnSeisme' ? 'PPRN Sismique' :
                                            item.name === 'SeismicV1' ? 'Sismique Commune' : item.name}
                </Typography>
                <Typography sx={{
                  fontSize: '10px',
                  color: '#64748b',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▶
                </Typography>
              </Box>

              <Box sx={{
                overflow: 'hidden',
                maxHeight: isExpanded ? 'none' : '0px',
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.3s ease, max-height 0.3s ease'
              }}>
                <Box sx={{ px: 1, pb: 1 }}>
                  {item.content}
                </Box>
              </Box>

              {index < legendItems.length - 1 && (
                <Divider sx={{ mx: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // If any custom layers are active, show their legends
  if (showSevesoInstallations || showSeismicZones || showInondationV1 || showAlearg || showMvtLocalise || showCavitesNonMinieresBRGM || showCanalisationsNetwork || showIndustrialInstallations || showSspEtablissement || showSspClassificationSis || showSspInstruction || showPluInformation || showPluZoning || showPluPrescriptions || showRTENetwork || showPprnPerimetreInond || showPprnSeisme || showSeismicV1) {
    const legendItems: LegendIndicator[] = [];
    if (showPluZoning) legendItems.push({ name: 'PluZoning', color: '#E60000' });
    if (showPluInformation) legendItems.push({ name: 'PluInformation', color: '#56AA02' });
    if (showPluPrescriptions) legendItems.push({ name: 'PluPrescriptions', color: '#059669' });
    if (showSevesoInstallations) legendItems.push({ name: 'Seveso', color: '#d32f2f' });
    if (showSeismicZones) legendItems.push({ name: 'Seismic', color: '#10b981' });
    if (showInondationV1) legendItems.push({ name: 'InondationV1', color: '#06b6d4' });
    if (showAlearg) legendItems.push({ name: 'ALEARG', color: '#8B4513' });
    if (showMvtLocalise) legendItems.push({ name: 'MVT_LOCALISE', color: '#ff6b35' });
    if (showCavitesNonMinieresBRGM) legendItems.push({ name: 'CavitesBRGM', color: '#9333ea' });
    if (showCanalisationsNetwork) legendItems.push({ name: 'Canalisations', color: '#ef4444' });
    if (showIndustrialInstallations) legendItems.push({ name: 'Industrial', color: '#9333ea' });
    if (showSspEtablissement) legendItems.push({ name: 'SspEtablissement', color: '#4F4CA6' });
    if (showSspClassificationSis) legendItems.push({ name: 'SspClassificationSis', color: '#E7C354' });
    if (showSspInstruction) legendItems.push({ name: 'SspInstruction', color: '#EC9FB4' });
    if (showRTENetwork) legendItems.push({ name: 'RTE', color: '#dc2626' });
    if (showPprnPerimetreInond) legendItems.push({ name: 'PprnPerimetreInond', color: '#80AAB1' });
    if (showPprnSeisme) legendItems.push({ name: 'PprnSeisme', color: '#E38B86' });
    if (showSeismicV1) legendItems.push({ name: 'SeismicV1', color: '#ff0000' });

    // Use consistent width for all legend content
    const cardWidth = 350;
    const cardMaxWidth = 400;

    return (
      <Card sx={{
        minWidth: cardWidth,
        maxWidth: cardMaxWidth,
        maxHeight: '70vh',
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        borderRadius: 2,
        border: "1px solid rgba(0, 0, 0, 0.08)",
        transition: 'min-width 0.3s ease, max-width 0.3s ease'
      }}>
        <CardContent sx={{ p: 2, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexShrink: 0 }}>
            <LegendToggle sx={{ fontSize: 18, mr: 1, color: "#3b82f6" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", fontSize: '16px' }}>
              {t("map_legend")}
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
              {legendItems.slice(0, 3).map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    opacity: 0.7
                  }}
                />
              ))}
              {legendItems.length > 3 && (
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px' }}>
                  +{legendItems.length - 3}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{
            flex: 1,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.3)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)'
          }}>
            {getLegendContent()}
          </Box>

          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const legendContent = (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
        {t('default_view')}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 12, height: 12, backgroundColor: '#e74c3c', borderRadius: 1 }} />
        <Typography variant="caption">{t('all_parcels_default_color')}</Typography>
      </Box>
    </Box>
  );

  return (
    <Card sx={{
      minWidth: 350,
      maxWidth: 400,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(8px)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      borderRadius: 2,
      transition: 'min-width 0.3s ease, max-width 0.3s ease'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <LegendToggle sx={{ fontSize: 18, mr: 1, color: "#3b82f6" }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
            {t("map_legend")}
          </Typography>
        </Box>
        {legendContent}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0" }}>
        </Box>
      </CardContent>
    </Card>
  );
};

export default memo(DynamicLegend);
