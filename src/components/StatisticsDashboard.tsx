import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  Warning,
  CheckCircle,
  LocationOn
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ParcelStatistics } from '../types/dashboard';
import { MAP_CONFIG } from '../config/mapConfig';

interface StatisticsDashboardProps {
  statistics: ParcelStatistics | null;
  isLoading?: boolean;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  statistics,
  isLoading = false
}) => {
  const { t } = useTranslation();
  if (!MAP_CONFIG.enableStatistics) return null;

  if (isLoading) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('loading_statistics')}
        </Typography>
        <LinearProgress />
      </Card>
    );
  }

  if (!statistics) {
    return (
      <Card sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('no_data_available')}
        </Typography>
      </Card>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    if (score >= 40) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getRiskDistribution = () => {
    const total = statistics.riskLevelDistribution.low +
      statistics.riskLevelDistribution.medium +
      statistics.riskLevelDistribution.high;

    if (total === 0) return { low: 0, medium: 0, high: 0 };

    return {
      low: (statistics.riskLevelDistribution.low / total) * 100,
      medium: (statistics.riskLevelDistribution.medium / total) * 100,
      high: (statistics.riskLevelDistribution.high / total) * 100
    };
  };

  const riskDistribution = getRiskDistribution();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
        <Assessment sx={{ mr: 1, color: '#3b82f6' }} />
        {t('statistics_title')}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Overview Cards */}
        <Box sx={{ minWidth: 200, flex: 1 }}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <LocationOn sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {statistics.totalParcels.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('total_parcels')}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ minWidth: 200, flex: 1 }}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f0f9ff' }}>
            <TrendingUp sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {statistics.averageCandidateScore.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('average_score')}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ minWidth: 200, flex: 1 }}>
        </Box>

        <Box sx={{ minWidth: 200, flex: 1 }}>
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <Warning sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              {riskDistribution.high.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('high_risk_parcels')}
            </Typography>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
          <TrendingUp sx={{ mr: 1, color: '#10b981' }} />
          {t('suitable_parcels')}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ minWidth: 250, flex: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Candidate Score Distribution
            </Typography>
            <LinearProgress
              variant="determinate"
              value={statistics.averageCandidateScore}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3b82f6',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Average: {statistics.averageCandidateScore.toFixed(1)}/100
            </Typography>
          </Box>

        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Detailed Scores
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>Candidate Score</Typography>
                  <Typography variant="body2" fontWeight={600} color={getScoreColor(statistics.averageCandidateScore)}>
                    {statistics.averageCandidateScore.toFixed(1)}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistics.averageCandidateScore}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(statistics.averageCandidateScore),
                      borderRadius: 3
                    }
                  }}
                />
              </Box>


              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>Power Proximity Score</Typography>
                  <Typography variant="body2" fontWeight={600} color={getScoreColor(statistics.averagePowerProximityScore)}>
                    {statistics.averagePowerProximityScore.toFixed(1)}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={statistics.averagePowerProximityScore}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(statistics.averagePowerProximityScore),
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>Seismic Risk (lower is better)</Typography>
                  <Typography variant="body2" fontWeight={600} color={getScoreColor(100 - statistics.averageSeismicRisk)}>
                    {statistics.averageSeismicRisk.toFixed(1)}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100 - statistics.averageSeismicRisk}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(100 - statistics.averageSeismicRisk),
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>Flood Risk (lower is better)</Typography>
                  <Typography variant="body2" fontWeight={600} color={getScoreColor(100 - statistics.averageFloodRisk)}>
                    {statistics.averageFloodRisk.toFixed(1)}/100
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={100 - statistics.averageFloodRisk}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(100 - statistics.averageFloodRisk),
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Risk Distribution */}
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Risk Distribution
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CheckCircle sx={{ fontSize: 16, mr: 0.5, color: '#10b981' }} />
                    <Typography variant="body2" fontWeight={500}>{t('risk_class_low')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {statistics.riskLevelDistribution.low} ({riskDistribution.low.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.low}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#10b981',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ fontSize: 16, mr: 0.5, color: '#f59e0b' }} />
                    <Typography variant="body2" fontWeight={500}>{t('risk_class_medium')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {statistics.riskLevelDistribution.medium} ({riskDistribution.medium.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.medium}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#f59e0b',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ fontSize: 16, mr: 0.5, color: '#ef4444' }} />
                    <Typography variant="body2" fontWeight={500}>{t('risk_class_high')}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {statistics.riskLevelDistribution.high} ({riskDistribution.high.toFixed(1)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={riskDistribution.high}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#ef4444',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Zone Type Distribution */}
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Zone Type Distribution
              </Typography>
              <List dense>
                {Object.entries(statistics.zoneTypeDistribution)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([zoneType, count]) => (
                    <ListItem key={zoneType} sx={{ px: 0 }}>
                      <ListItemText
                        primary={zoneType}
                        secondary={`${count} parcels`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip
                        label={count as number}
                        size="small"
                        sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Department Breakdown */}
        <Box sx={{ minWidth: 300, flex: 1 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Department Breakdown
              </Typography>
              <List dense>
                {Object.entries(statistics.departmentBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([department, count]) => (
                    <ListItem key={department} sx={{ px: 0 }}>
                      <ListItemText
                        primary={`Department ${department}`}
                        secondary={`${count} parcels`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip
                        label={count}
                        size="small"
                        sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                      />
                    </ListItem>
                  ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default StatisticsDashboard;
