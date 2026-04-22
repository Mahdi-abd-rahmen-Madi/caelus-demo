import {
    Assessment,
    Business,
    Close,
    Factory,
    Warning
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    Skeleton,
    Typography
} from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EnhancedParcelProperties } from '../types/dashboard';
import RiskDetailsSidePanel from './RiskDetailsSidePanel';

interface DetailedPopupProps {
  properties: EnhancedParcelProperties | null;
  onClose?: () => void;
}

const DetailedPopup: React.FC<DetailedPopupProps> = ({ properties, onClose }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [selectedRiskType, setSelectedRiskType] = useState<'natural' | 'technological' | null>(null);

  // Check if essential data is loaded
  useEffect(() => {
    if (!properties) {
      setIsLoading(true);
      return;
    }

    setIsLoading(true);

    const hasRealInfrastructureData =
      properties.nearest_enedis_distance_m !== null &&
      properties.nearest_railway_distance_m !== null;

    const isDataReady = properties.parcel_id &&
      properties.area !== null &&
      properties.department_code &&
      hasRealInfrastructureData;

    setIsLoading(!isDataReady);
  }, [properties]);

  // Side panel handlers
  const openSidePanel = (riskType: 'natural' | 'technological') => {
    setSelectedRiskType(riskType);
    setSidePanelVisible(true);
  };

  const closeSidePanel = () => {
    setSidePanelVisible(false);
    setSelectedRiskType(null);
  };

  const handlePopupClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  if (!properties) return null;

  if (isLoading) {
    return (
      <Card sx={{
        maxWidth: 320,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}>
        <CardContent sx={{ p: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="rectangular" width={60} height={24} />
          </Box>
          <Box sx={{ mb: 1.5 }}>
            <Skeleton variant="text" width={100} height={16} sx={{ mb: 0.6 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width={80} height={14} />
                  <Skeleton variant="text" width={60} height={14} />
                </Box>
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mb: 1.2 }}>
            <Skeleton variant="text" width={140} height={16} sx={{ mb: 0.6 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton variant="text" width={100} height={14} />
                  <Skeleton variant="text" width={50} height={14} />
                </Box>
              ))}
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ mb: 1.2 }}>
            <Skeleton variant="text" width={80} height={16} sx={{ mb: 0.6 }} />
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" width="100%" height={32} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" width="100%" height={32} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="rectangular" width="100%" height={32} />
              </Box>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box>
            <Skeleton variant="text" width={120} height={16} sx={{ mb: 0.6 }} />
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                <Skeleton variant="rectangular" width={80} height={24} sx={{ mr: 1 }} />
                <Skeleton variant="text" width={80} height={14} />
              </Box>
              <Skeleton variant="text" width="100%" height={14} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const getLineTypeDescription = (lineType: string): string => {
    if (!lineType) return 'N/A';

    const descriptions: Record<string, string> = {
      'BT_aerien': t('low_voltage_aerial'),
      'BT_souterrain': t('low_voltage_underground'),
      'HTA_aerien': t('high_voltage_aerial'),
      'HTA_souterrain': t('high_voltage_underground')
    };

    return descriptions[lineType] || lineType;
  };

  const calculateDatacenterSuitability = (properties: EnhancedParcelProperties): {
    score: number;
    level: string;
    color: string;
    description: string;
    riskFactors: string[];
  } => {
    let riskPenalties = 0;
    let infrastructureBonus = 0;
    const riskFactors: string[] = [];
    let maxScore = 100;
    let moderateRiskCount = 0;

    if (properties.georisques_data) {
      Object.entries(properties.georisques_data.risquesNaturels).forEach(([, risk]) => {
        if (risk.present) {
          riskFactors.push(`${risk.libelle} (présent)`);

          if (risk.libelle.toLowerCase().includes('inondation') || risk.libelle.toLowerCase().includes('flood')) {
            maxScore = Math.min(maxScore, 60);
          }

          if (properties.georisques_data?.risquesNaturels.seisme.present) {
            maxScore = Math.min(maxScore, 60);
          }

          if (risk.libelle.toLowerCase().includes('modéré') || risk.libelle.toLowerCase().includes('moderate') ||
            risk.libelle.toLowerCase().includes('élevé') || risk.libelle.toLowerCase().includes('high') ||
            risk.libelle.toLowerCase().includes('très élevé') || risk.libelle.toLowerCase().includes('very high')) {
            moderateRiskCount++;
          }

          if (risk.libelle.toLowerCase().includes('très élevé') || risk.libelle.toLowerCase().includes('very high')) {
            riskPenalties += 60;
          } else if (risk.libelle.toLowerCase().includes('élevé') || risk.libelle.toLowerCase().includes('high')) {
            riskPenalties += 40;
          } else if (risk.libelle.toLowerCase().includes('modéré') || risk.libelle.toLowerCase().includes('moderate')) {
            riskPenalties += 25;
          } else if (risk.libelle.toLowerCase().includes('faible') || risk.libelle.toLowerCase().includes('low')) {
            riskPenalties += 10;
          }
        }
      });
    }

    if (properties.georisques_data) {
      Object.entries(properties.georisques_data.risquesTechnologiques).forEach(([, risk]) => {
        if (risk.present) {
          riskFactors.push(`${risk.libelle} (présent)`);

          if (risk.libelle.toLowerCase().includes('très élevé') || risk.libelle.toLowerCase().includes('very high')) {
            maxScore = Math.min(maxScore, 40);
          }

          if (risk.libelle.toLowerCase().includes('modéré') || risk.libelle.toLowerCase().includes('moderate') ||
            risk.libelle.toLowerCase().includes('élevé') || risk.libelle.toLowerCase().includes('high') ||
            risk.libelle.toLowerCase().includes('très élevé') || risk.libelle.toLowerCase().includes('very high')) {
            moderateRiskCount++;
          }

          if (risk.libelle.toLowerCase().includes('très élevé') || risk.libelle.toLowerCase().includes('very high')) {
            riskPenalties += 50;
          } else if (risk.libelle.toLowerCase().includes('élevé') || risk.libelle.toLowerCase().includes('high')) {
            riskPenalties += 30;
          } else if (risk.libelle.toLowerCase().includes('modéré') || risk.libelle.toLowerCase().includes('moderate')) {
            riskPenalties += 15;
          } else if (risk.libelle.toLowerCase().includes('faible') || risk.libelle.toLowerCase().includes('low')) {
            riskPenalties += 6;
          }
        }
      });
    }

    if (moderateRiskCount >= 3) {
      maxScore = Math.min(maxScore, 60);
    }

    if (properties.nearest_enedis_distance_m && properties.nearest_enedis_distance_m < 1000) {
      infrastructureBonus += 5;
    }
    if (properties.nearest_railway_distance_m && properties.nearest_railway_distance_m < 2000) {
      infrastructureBonus += 3;
    }
    if (properties.nearest_hta_souterrain_distance_m && properties.nearest_hta_souterrain_distance_m < 500) {
      infrastructureBonus += 2;
    }

    let finalScore = Math.max(0, 100 - riskPenalties + infrastructureBonus);
    finalScore = Math.min(finalScore, maxScore);

    let level: string;
    let color: string;
    let description: string;

    if (finalScore >= 80) {
      level = t('excellent');
      color = '#10b981';
      description = t('excellent_suitability_description');
    } else if (finalScore >= 60) {
      level = t('good');
      color = '#f59e0b';
      description = t('good_suitability_description');
    } else if (finalScore >= 40) {
      level = t('moderate');
      color = '#f97316';
      description = t('moderate_suitability_description');
    } else {
      level = t('poor');
      color = '#ef4444';
      description = t('poor_suitability_description');
    }

    return {
      score: Math.round(finalScore),
      level,
      color,
      description,
      riskFactors
    };
  };

  return (
    <>
      <Card sx={{
        maxWidth: 400,
        maxHeight: 1200,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}>
        <CardContent sx={{ p: 1.5, maxHeight: 1050, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8832rem' }}>
              {t('parcel_details')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                label={`ID: ${properties.parcel_id}`}
                size="small"
                sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
              />
              {onClose && (
                <IconButton
                  onClick={handlePopupClose}
                  size="small"
                  sx={{
                    color: '#64748b',
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      color: '#475569'
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6, color: '#1e293b', fontSize: '0.79488rem' }}>
              {t('basic_information')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  Parcel ID:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.parcel_id || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  {t('area')}:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.area ? `${properties.area.toLocaleString()} m²` : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  Department:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.department_code || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  PLU Zone:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {t(properties.plu_zone_type) || properties.plu_zone_type || 'N/A'} ({properties.plu_zone_code || 'N/A'})
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ mb: 1.2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6, color: '#64748b', fontSize: '0.75072rem' }}>
              <Assessment sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {t('electrical_infrastructure_proximity')}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  {t('distance_to_nearest_electrical_line_enedis')}:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.nearest_enedis_distance_m
                    ? `${properties.nearest_enedis_distance_m.toFixed(0)} m`
                    : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  {t('nearest_line_type_voltage_installation')}:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {getLineTypeDescription(properties.nearest_enedis_line_type || '')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  {t('distance_to_underground_high_voltage_line_hta')}:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.nearest_hta_souterrain_distance_m
                    ? `${properties.nearest_hta_souterrain_distance_m.toFixed(0)} m`
                    : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                  {t('distance_to_nearest_railway_fibre_line')}:
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.6624rem' }}>
                  {properties.nearest_railway_distance_m
                    ? `${properties.nearest_railway_distance_m.toFixed(0)} m`
                    : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ mb: 1.2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.8, color: '#64748b', fontSize: '0.75072rem' }}>
              <Warning sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {t('risk_analysis')}
            </Typography>

            <Box sx={{ mb: 0.8 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Warning sx={{ fontSize: 14 }} />}
                onClick={() => openSidePanel('natural')}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                {t('natural_risks_georisques')}
                {properties.georisques_data && (
                  <Chip
                    label={Object.entries(properties.georisques_data.risquesNaturels).filter(([_, risk]) => risk.present).length}
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 20
                    }}
                  />
                )}
              </Button>
            </Box>

            <Box sx={{ mb: 0.8 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Factory sx={{ fontSize: 14 }} />}
                onClick={() => openSidePanel('technological')}
                sx={{
                  justifyContent: 'flex-start',
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                {t('technological_risks_georisques')}
                {properties.georisques_data && (
                  <Chip
                    label={Object.values(properties.georisques_data.risquesTechnologiques).filter(risk => risk.present).length}
                    size="small"
                    sx={{
                      ml: 1,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 20
                    }}
                  />
                )}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.6, color: '#64748b', fontSize: '0.75072rem' }}>
              <Business sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {t('datacenter_suitability')}
            </Typography>
            {(() => {
              const suitability = calculateDatacenterSuitability(properties);
              return (
                <Box sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: `${suitability.color}10`,
                  border: `1px solid ${suitability.color}30`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                    <Chip
                      label={suitability.level}
                      size="small"
                      sx={{
                        backgroundColor: suitability.color,
                        color: 'white',
                        fontWeight: 600,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.6624rem' }}>
                      {t('overall_assessment')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.6624rem', mb: 0.8 }}>
                    {suitability.description}
                  </Typography>
                  {suitability.riskFactors.length > 0 && (
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.59216rem', mb: 0.4, display: 'block' }}>
                        {t('risk_factors')}:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {suitability.riskFactors.slice(0, 3).map((factor, index) => (
                          <Chip
                            key={index}
                            label={factor}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.52816rem',
                              height: 18,
                              borderColor: suitability.color,
                              color: suitability.color
                            }}
                          />
                        ))}
                        {suitability.riskFactors.length > 3 && (
                          <Chip
                            label={`+${suitability.riskFactors.length - 3} ${t('more')}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.52816rem',
                              height: 18,
                              borderColor: '#94a3b8',
                              color: '#94a3b8'
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })()}
          </Box>
          
          </CardContent>
      </Card>

      {/* Side panel rendered at root level to avoid width constraints */}
      {sidePanelVisible && selectedRiskType && properties && (
        <RiskDetailsSidePanel
          properties={properties}
          visible={sidePanelVisible}
          riskType={selectedRiskType}
          onClose={closeSidePanel}
        />
      )}
    </>
  );
};

export default memo(DetailedPopup);
