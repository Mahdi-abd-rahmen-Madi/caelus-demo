import {
    Air,
    Close,
    Construction,
    DeleteSweep,
    Factory,
    Landscape,
    LinearScale,
    LocalFireDepartment,
    Construction as MiningIcon,
    Power,
    Terrain,
    Warning,
    WaterDrop,
    Waves
} from '@mui/icons-material';
import {
    Backdrop,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Slide,
    Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RiskInfo } from '../services/api';
import type { EnhancedParcelProperties } from '../types/dashboard';

interface RiskDetailsSidePanelProps {
  properties: EnhancedParcelProperties;
  onClose: () => void;
  visible: boolean;
  riskType: 'natural' | 'technological';
}

const RiskDetailsSidePanel: React.FC<RiskDetailsSidePanelProps> = ({
  properties,
  onClose,
  visible,
  riskType
}) => {
  const { t } = useTranslation();

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [visible, onClose]);



  const getSlopeTranslation = (slope: number | null | undefined): { label: string; color: string } => {
    if (slope === null || slope === undefined) {
      return { label: t('slope_unknown'), color: '#94a3b8' };
    }

    if (slope <= 2) {
      return { label: t('slope_flat'), color: '#10b981' };
    } else if (slope <= 5) {
      return { label: t('slope_gentle'), color: '#84cc16' };
    } else if (slope <= 15) {
      return { label: t('slope_moderate'), color: '#f59e0b' };
    } else if (slope <= 30) {
      return { label: t('slope_steep'), color: '#f97316' };
    } else {
      return { label: t('slope_very_steep'), color: '#ef4444' };
    }
  };

  const getGonfleRiskLevel = (gonfle: number | null | undefined): { label: string; color: string; description: string } => {
    if (gonfle === null || gonfle === undefined) {
      return { label: t('no_clay_swelling_risk'), color: '#10b981', description: t('no_clay_swelling_data') };
    }

    switch (gonfle) {
      case 1:
        return { label: t('low_risk'), color: '#10b981', description: t('clay_swelling_low') };
      case 2:
        return { label: t('moderate_risk'), color: '#f59e0b', description: t('clay_swelling_moderate') };
      case 3:
        return { label: t('high_risk'), color: '#ef4444', description: t('clay_swelling_high') };
      default:
        return { label: t('unknown_risk'), color: '#94a3b8', description: t('clay_swelling_unknown') };
    }
  };


  const getGeorisqueRiskLevel = (riskInfo: RiskInfo): { label: string; color: string; status: string } => {
    if (!riskInfo.present) {
      return { label: t('no_risk'), color: '#10b981', status: riskInfo.libelleStatutAdresse || t('no_risk_detected') };
    }

    const status = riskInfo.libelleStatutAdresse || riskInfo.libelleStatutCommune || t('risk_present');

    if (status.toLowerCase().includes('faible') || status.toLowerCase().includes('low')) {
      return { label: t('low_risk'), color: '#84cc16', status };
    } else if (status.toLowerCase().includes('modéré') || status.toLowerCase().includes('moderate')) {
      return { label: t('moderate_risk'), color: '#f59e0b', status };
    } else if (status.toLowerCase().includes('élevé') || status.toLowerCase().includes('haut') || status.toLowerCase().includes('high')) {
      return { label: t('high_risk'), color: '#ef4444', status };
    } else if (status.toLowerCase().includes('très élevé') || status.toLowerCase().includes('very high')) {
      return { label: t('very_high_risk'), color: '#dc2626', status };
    }

    return { label: t('risk_present'), color: '#f97316', status };
  };

  const getNaturalRiskIcon = (riskKey: string) => {
    switch (riskKey) {
      case 'inondation': return <Waves sx={{ fontSize: 16 }} />;
      case 'remonteeNappe': return <WaterDrop sx={{ fontSize: 16 }} />;
      case 'risqueCotier': return <Landscape sx={{ fontSize: 16 }} />;
      case 'seisme': return <Terrain sx={{ fontSize: 16 }} />;
      case 'mouvementTerrain': return <Landscape sx={{ fontSize: 16 }} />;
      case 'reculTraitCote': return <Terrain sx={{ fontSize: 16 }} />;
      case 'retraitGonflementArgile': return <Terrain sx={{ fontSize: 16 }} />;
      case 'avalanche': return <Terrain sx={{ fontSize: 16 }} />;
      case 'feuForet': return <LocalFireDepartment sx={{ fontSize: 16 }} />;
      case 'eruptionVolcanique': return <LocalFireDepartment sx={{ fontSize: 16 }} />;
      case 'cyclone': return <Air sx={{ fontSize: 16 }} />;
      case 'radon': return <Air sx={{ fontSize: 16 }} />;
      default: return <Warning sx={{ fontSize: 16 }} />;
    }
  };

  const getTechnologicalRiskIcon = (riskKey: string) => {
    switch (riskKey) {
      case 'icpe': return <Factory sx={{ fontSize: 16 }} />;
      case 'nucleaire': return <Power sx={{ fontSize: 16 }} />;
      case 'canalisationsMatieresDangereuses': return <LinearScale sx={{ fontSize: 16 }} />;
      case 'pollutionSols': return <DeleteSweep sx={{ fontSize: 16 }} />;
      case 'ruptureBarrage': return <Construction sx={{ fontSize: 16 }} />;
      case 'risqueMinier': return <MiningIcon sx={{ fontSize: 16 }} />;
      default: return <Factory sx={{ fontSize: 16 }} />;
    }
  };

  const renderNaturalRisks = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>
        <Warning sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
        {t('natural_risks_georisques')}
      </Typography>

      {/* Seismic Risk */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Terrain sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('seismic_risk')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {properties.georisques_data?.risquesNaturels.seisme.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.seisme).status
              : t('no_risk_detected')
            }
          </Typography>
        </Box>
        <Chip
          label={properties.georisques_data?.risquesNaturels.seisme.present
            ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.seisme).label
            : t('no_risk')
          }
          size="small"
          sx={{
            backgroundColor: properties.georisques_data?.risquesNaturels.seisme.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.seisme).color
              : '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Flood Risk */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Waves sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('flood_risk')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {properties.georisques_data?.risquesNaturels.inondation.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.inondation).status
              : t('no_risk_detected')
            }
          </Typography>
        </Box>
        <Chip
          label={properties.georisques_data?.risquesNaturels.inondation.present
            ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.inondation).label
            : t('no_risk')
          }
          size="small"
          sx={{
            backgroundColor: properties.georisques_data?.risquesNaturels.inondation.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.inondation).color
              : '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Radon Risk */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Air sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('radon_risk')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {properties.georisques_data?.risquesNaturels.radon.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.radon).status
              : t('no_risk_detected')
            }
          </Typography>
        </Box>
        <Chip
          label={properties.georisques_data?.risquesNaturels.radon.present
            ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.radon).label
            : t('no_risk')
          }
          size="small"
          sx={{
            backgroundColor: properties.georisques_data?.risquesNaturels.radon.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.radon).color
              : '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Clay Swelling */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Landscape sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('clay_swelling')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {getGonfleRiskLevel(properties.gonfle).description}
          </Typography>
        </Box>
        <Chip
          label={getGonfleRiskLevel(properties.gonfle).label}
          size="small"
          sx={{
            backgroundColor: getGonfleRiskLevel(properties.gonfle).color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Slope */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Terrain sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('slope')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {getSlopeTranslation(properties.slope_value).label}
          </Typography>
        </Box>
        <Chip
          label={getSlopeTranslation(properties.slope_value).label}
          size="small"
          sx={{
            backgroundColor: getSlopeTranslation(properties.slope_value).color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Ground Stability */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
        <Landscape sx={{ fontSize: 16 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
            {t('ground_stability')} (Georisques API)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
            {properties.georisques_data?.risquesNaturels.mouvementTerrain.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.mouvementTerrain).status
              : t('no_risk_detected')
            }
          </Typography>
        </Box>
        <Chip
          label={properties.georisques_data?.risquesNaturels.mouvementTerrain.present
            ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.mouvementTerrain).label
            : t('no_risk')
          }
          size="small"
          sx={{
            backgroundColor: properties.georisques_data?.risquesNaturels.mouvementTerrain.present
              ? getGeorisqueRiskLevel(properties.georisques_data.risquesNaturels.mouvementTerrain).color
              : '#10b981',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.59216rem'
          }}
        />
      </Box>

      {/* Other Natural Risks */}
      {properties.georisques_data && (() => {
        const allRisks = Object.entries(properties.georisques_data.risquesNaturels);
        const filteredRisks = allRisks.filter(([key]) => !['seisme', 'inondation', 'radon', 'mouvementTerrain'].includes(key));

        // Debug logging to see what risks are available
        console.log('All natural risks:', allRisks.map(([key, risk]) => ({ key, present: risk.present, libelle: risk.libelle })));
        console.log('Filtered other risks:', filteredRisks.map(([key, risk]) => ({ key, present: risk.present, libelle: risk.libelle })));

        return filteredRisks.map(([key, risk]) => {
          const riskLevel = getGeorisqueRiskLevel(risk);
          return (
            <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
              {getNaturalRiskIcon(key)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
                  {risk.libelle}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
                  {riskLevel.status}
                </Typography>
              </Box>
              <Chip
                label={riskLevel.label}
                size="small"
                sx={{
                  backgroundColor: riskLevel.color,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.59216rem',
                  height: 20
                }}
              />
            </Box>
          );
        });
      })()}
    </Box>
  );

  const renderTechnologicalRisks = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>
        <Factory sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
        {t('technological_risks_georisques')}
      </Typography>

      {/* Georisques Technological Risks */}
      {properties.georisques_data && Object.entries(properties.georisques_data.risquesTechnologiques).map(([key, risk]) => {
        const riskLevel = getGeorisqueRiskLevel(risk);
        return (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, backgroundColor: '#f8fafc', borderRadius: 1 }}>
            {getTechnologicalRiskIcon(key)}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.6624rem' }}>
                {risk.libelle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.59216rem' }}>
                {riskLevel.status}
              </Typography>
            </Box>
            <Chip
              label={riskLevel.label}
              size="small"
              sx={{
                backgroundColor: riskLevel.color,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.59216rem'
              }}
            />
          </Box>
        );
      })}
    </Box>
  );

  const getPanelTitle = () => {
    switch (riskType) {
      case 'natural':
        return t('natural_risks_georisques');
      case 'technological':
        return t('technological_risks_georisques');
      default:
        return '';
    }
  };

  const getPanelIcon = () => {
    switch (riskType) {
      case 'natural':
        return <Warning sx={{ fontSize: 18 }} />;
      case 'technological':
        return <Factory sx={{ fontSize: 18 }} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (riskType) {
      case 'natural':
        return renderNaturalRisks();
      case 'technological':
        return renderTechnologicalRisks();
      default:
        return null;
    }
  };

  return (
    <>
      <Backdrop
        open={visible}
        sx={{
          zIndex: 1299,
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }}
        onClick={onClose}
      />
      <Slide
        direction="left"
        in={visible}
        mountOnEnter
        unmountOnExit
      >
        <Card
          sx={{
            position: 'fixed',
            top: 64,
            right: { xs: 0, sm: '180px' },
            height: 'calc(100vh - 64px)',
            width: { xs: '100%', sm: '400px', md: '450px' },
            maxWidth: { xs: '100%', sm: '400px', md: '450px' },
            zIndex: 1300,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            borderRadius: 0
          }}
        >
          <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getPanelIcon()}
                <Typography variant="body2" sx={{ fontSize: '0.6624rem', fontWeight: 500 }}>
                  {getPanelTitle()}
                </Typography>
              </Box>
              <IconButton
                onClick={onClose}
                sx={{
                  color: '#64748b',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                    color: '#475569'
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2
            }}>
              {renderContent()}
            </Box>
          </CardContent>
        </Card>
      </Slide>
    </>
  );
};

export default RiskDetailsSidePanel;
