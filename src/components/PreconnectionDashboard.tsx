import {
  AutoGraph as GraphIcon,
  Insights as InsightsIcon,
  NetworkCheck as NetworkIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  preconnectionMonitor,
  type AdvancedPerformanceMetrics,
  type PerformanceImprovement,
  type PredictiveMetrics
} from '../services/preconnection-monitor';

interface PreconnectionDashboardProps {
  visible?: boolean;
}

export const PreconnectionDashboard: React.FC<PreconnectionDashboardProps> = ({ visible = false }) => {
  const [metrics, setMetrics] = useState(preconnectionMonitor.getMetrics());
  const [improvement, setImprovement] = useState<PerformanceImprovement>(preconnectionMonitor.getPerformanceImprovement());
  const [predictiveMetrics, setPredictiveMetrics] = useState<PredictiveMetrics>(preconnectionMonitor.getPredictiveMetrics());
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedPerformanceMetrics>(preconnectionMonitor.getAdvancedMetrics());
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setMetrics(preconnectionMonitor.getMetrics());
      setImprovement(preconnectionMonitor.getPerformanceImprovement());
      setPredictiveMetrics(preconnectionMonitor.getPredictiveMetrics());
      setAdvancedMetrics(preconnectionMonitor.getAdvancedMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#84cc16';
      case 'C': return '#f59e0b';
      case 'D': return '#f97316';
      case 'F': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getNetworkQualityColor = (quality: string) => {
    switch (quality) {
      case 'fast': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'slow': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'aggressive': return '#10b981';
      case 'balanced': return '#3b82f6';
      case 'conservative': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 2000,
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        minWidth: 320,
        maxWidth: 400,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SpeedIcon sx={{ mr: 1, color: getGradeColor(improvement.overallGrade) }} />
        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
          Intelligent Preconnection
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Chip
            label={`Grade: ${improvement.overallGrade}`}
            size="small"
            sx={{
              backgroundColor: getGradeColor(improvement.overallGrade),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          <Tooltip title="Toggle Advanced Metrics">
            <IconButton 
              size="small" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              sx={{ 
                backgroundColor: showAdvanced ? 'primary.main' : 'grey.200',
                color: showAdvanced ? 'white' : 'text.secondary'
              }}
            >
              <InsightsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Basic Metrics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Connection Speed
          </Typography>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            {improvement.connectionSpeedup}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Network Quality
          </Typography>
          <Chip
            label={metrics.networkQualityScore}
            size="small"
            sx={{
              backgroundColor: getNetworkQualityColor(metrics.networkQualityScore),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Box>

      {/* Performance Progress Bars */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Connection Reuse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {metrics.totalRequests > 0 ? Math.round((metrics.connectionReuseCount / metrics.totalRequests) * 100) : 0}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={metrics.totalRequests > 0 ? (metrics.connectionReuseCount / metrics.totalRequests) * 100 : 0}
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Predictive Accuracy
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(predictiveMetrics.confidence * 100)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={predictiveMetrics.confidence * 100}
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Cache Hit Rate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(metrics.cacheHitRate * 100)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={metrics.cacheHitRate * 100}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Advanced Metrics Section */}
      <Collapse in={showAdvanced}>
        <Divider sx={{ my: 2 }} />
        
        {/* Predictive Analytics */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <PsychologyIcon sx={{ mr: 1, fontSize: '1rem', color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Predictive Analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Predicted Response
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(predictiveMetrics.predictedResponseTime)}ms
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Strategy
              </Typography>
              <Chip
                label={predictiveMetrics.recommendedStrategy}
                size="small"
                sx={{
                  backgroundColor: getStrategyColor(predictiveMetrics.recommendedStrategy),
                  color: 'white',
                  fontSize: '0.7rem',
                  height: 20
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Connection Quality */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <NetworkIcon sx={{ mr: 1, fontSize: '1rem', color: 'info.main' }} />
            <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Connection Quality
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Latency
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(advancedMetrics.connectionQuality.latency)}ms
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Jitter
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(advancedMetrics.connectionQuality.jitter)}ms
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Predictability
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(advancedMetrics.usagePattern.predictability * 100)}%
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Optimization Metrics */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <GraphIcon sx={{ mr: 1, fontSize: '1rem', color: 'success.main' }} />
            <Typography variant="subtitle2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Optimization Impact
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Preconnection Efficiency
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(advancedMetrics.optimization.preconnectionEfficiency * 100)}%
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                User Intent Accuracy
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {Math.round(advancedMetrics.optimization.userIntentAccuracy * 100)}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>

      {/* Footer Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="caption" color="text.secondary">
          {metrics.totalRequests} requests
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {metrics.connectionReuseCount} reused
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {metrics.predictivePreconnectionHits} predicted
        </Typography>
      </Box>
    </Paper>
  );
};
