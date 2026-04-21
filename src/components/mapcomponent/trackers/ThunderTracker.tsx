import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

interface ThunderTrackerProps {
  map: maplibregl.Map | null;
  injectedData?: any;
  isLoading?: boolean;
}

interface ThunderRiskInfo {
  risk_level: string | null;
  risk_color: string;
  mean_cape: number;
  max_cape: number;
  mean_k_index: number;
  max_k_index: number;
  thunderstorm_days_per_year: number;
  severe_thunder_days: number;
  trend_10_years: string | null;
  description: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
  // Enhanced Nsg (lightning strike density) fields
  nsg_value?: number;
  nsg_unit?: string;
  nsg_confidence?: string;
  nsg_method?: string;
  base_nsg?: number;
  nsg_adjustments?: any;
  data_quality?: string;
  data_source?: string;
}

interface TrackerState {
  riskInfo: ThunderRiskInfo | null;
  loading: boolean;
  error: string | null;
}

// Debounce utility function
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  }) as T;
};

// Cache for recent coordinates to avoid duplicate API calls
const coordinateCache = new Map<string, ThunderRiskInfo | null>();
const getCoordinateKey = (lng: number, lat: number): string => `${lng.toFixed(4)},${lat.toFixed(4)}`;

// Clear cache function for debugging
const clearCoordinateCache = () => {
  coordinateCache.clear();
};

// Helper functions for data quality display
const getDataQualityText = (quality: string): string => {
  const qualityMap: Record<string, string> = {
    'excellent': 'Excellent',
    'good': 'Bon',
    'fair': 'Correct',
    'poor': 'Médiocre',
    'very_poor': 'Très médiocre'
  };
  return qualityMap[quality] || quality;
};

const getDataQualityColor = (quality: string): string => {
  const colorMap: Record<string, string> = {
    'excellent': '#10b981',  // green
    'good': '#22c55e',      // light green
    'fair': '#f59e0b',      // yellow
    'poor': '#f97316',      // orange
    'very_poor': '#ef4444'  // red
  };
  return colorMap[quality] || '#94a3b8';
};


const getNsgUnitText = (unit: string): string => {
  const unitMap: Record<string, string> = {
    'strikes/km²/year': 'nsg/km²/an',
    'strikes/km²/an': 'nsg/km²/an',
    'strikes/km2/year': 'nsg/km²/an',
    'strikes/km2/an': 'nsg/km²/an'
  };
  return unitMap[unit] || unit;
};

const getRiskLevelText = (riskLevel: string): string => {
  const riskMap: Record<string, string> = {
    'low': 'Faible',
    'moderate': 'Modéré',
    'high': 'Élevé',
    'very_high': 'Très élevé',
    'outside_france': 'Hors France',
    'no_data': 'Indisponible',
    'error': 'Erreur',
    'unknown': 'Inconnu'
  };
  return riskMap[riskLevel] || riskLevel;
};

const getRiskLevelEmoji = (riskLevel: string): string => {
  const emojiMap: Record<string, string> = {
    'low': '🟢',
    'moderate': '🟡',
    'high': '🟠',
    'very_high': '🔴',
    'outside_france': '🌍',
    'no_data': '❓',
    'error': '⚠️',
    'unknown': '❓'
  };
  return emojiMap[riskLevel] || '❓';
};

export const ThunderTracker: React.FC<ThunderTrackerProps> = memo(({ map, injectedData, isLoading = false }) => {
  const [state, setState] = useState<TrackerState>({
    riskInfo: null,
    loading: false,
    error: null
  });

  // Keep track of the last fetched coordinates to avoid unnecessary updates
  const lastCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  // Timer ref to manage loading state delay
  const loadingTimerRef = useRef<number | null>(null);

  // Clear cache on component mount to get fresh data
  useEffect(() => {
    clearCoordinateCache();
  }, []);

  // Fetch thunderstorm risk for given coordinates
  const fetchThunderRisk = useCallback(async (lng: number, lat: number): Promise<ThunderRiskInfo | null> => {
    const coordKey = getCoordinateKey(lng, lat);

    // Check cache first
    const cached = coordinateCache.get(coordKey);
    if (cached) {
      return cached;
    }

    try {
      // Call internal Django API
      const apiUrl = `http://localhost:8000/api/geodata/thunder/risk/${lng}/${lat}/`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to internal format
      let riskInfo: ThunderRiskInfo | null = null;

      if (data.found && data.thunder_risk) {
        const thunderData = data.thunder_risk;

        riskInfo = {
          risk_level: thunderData.risk_level,
          risk_color: thunderData.risk_color,
          mean_cape: thunderData.mean_cape || 0,
          max_cape: thunderData.max_cape || 0,
          mean_k_index: thunderData.mean_k_index || 0,
          max_k_index: thunderData.max_k_index || 0,
          thunderstorm_days_per_year: thunderData.thunderstorm_days_per_year || 0,
          severe_thunder_days: thunderData.severe_thunder_days || 0,
          trend_10_years: thunderData.nsg_trend_10_years || thunderData.trend_10_years,
          description: thunderData.description,
          coordinates: { lng, lat },
          found: true,
          // Enhanced Nsg (lightning strike density) fields - accessed from thunderData object
          nsg_value: thunderData.nsg_value,
          nsg_unit: thunderData.nsg_unit,
          nsg_confidence: thunderData.nsg_confidence,
          nsg_method: thunderData.nsg_method,
          base_nsg: thunderData.base_nsg,
          nsg_adjustments: thunderData.nsg_adjustments,
          data_quality: thunderData.data_quality,
          data_source: thunderData.data_source
        };

      } else {
        // No thunderstorm data found
        riskInfo = {
          risk_level: 'no_data',
          risk_color: '#94a3b8',
          mean_cape: 0,
          max_cape: 0,
          mean_k_index: 0,
          max_k_index: 0,
          thunderstorm_days_per_year: 0,
          severe_thunder_days: 0,
          trend_10_years: null,
          description: 'Données orageuses indisponibles',
          coordinates: { lng, lat },
          found: false
        };
      }

      // Cache the result
      coordinateCache.set(coordKey, riskInfo);

      // Clean up old cache entries periodically
      if (coordinateCache.size > 100) {
        coordinateCache.clear();
      }

      return riskInfo;
    } catch (error) {
      console.error('ThunderTracker: Failed to fetch risk data:', error);
      return null;
    }
  }, []);

  // Update risk info when map center changes
  const updateRiskInfo = useCallback(async () => {
    if (!map) return;

    const center = map.getCenter();
    const lng = center.lng;
    const lat = center.lat;

    // Check if we've already fetched for these coordinates (with some tolerance)
    if (lastCoordsRef.current) {
      const lngDiff = Math.abs(lng - lastCoordsRef.current.lng);
      const latDiff = Math.abs(lat - lastCoordsRef.current.lat);

      // If the change is very small, don't update
      if (lngDiff < 0.001 && latDiff < 0.001) {
        return;
      }
    }

    lastCoordsRef.current = { lng, lat };

    // Only show loading if we don't have cached data
    const coordKey = getCoordinateKey(lng, lat);
    const cached = coordinateCache.get(coordKey);

    if (!cached) {
      // Clear any existing loading timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      // Only show loading after 1.5 seconds to avoid flicker
      loadingTimerRef.current = window.setTimeout(() => {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }, 1500);
    }

    try {
      const riskInfo = await fetchThunderRisk(lng, lat);
      if (riskInfo) {
        setState({
          riskInfo,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch thunderstorm risk data'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error fetching thunderstorm risk'
      }));
    }
  }, [map, fetchThunderRisk]);

  // Debounced version of updateRiskInfo to avoid excessive API calls (2 second grace period for thunder data)
  const debouncedUpdateRiskInfo = useCallback(debounce(updateRiskInfo, 2000), [updateRiskInfo]);

  // Set up map event listeners only if no injected data
  useEffect(() => {
    // Skip API calls if data is injected or currently loading from parent
    if (injectedData !== undefined || isLoading) {
      try {
        // Use injected data
        if (injectedData) {
          console.log('ThunderTracker: Using injected data', injectedData);
          // Extract the nested thunder_risk data
          const thunderData = injectedData.thunder_risk || injectedData;
          setState({
            riskInfo: thunderData,
            loading: false,
            error: null
          });
        } else if (isLoading) {
          console.log('ThunderTracker: Using parent loading state');
          setState(prev => ({ ...prev, loading: true, error: null }));
        }
      } catch (error) {
        console.error('ThunderTracker: Error processing injected data', error);
        setState(prev => ({ ...prev, loading: false, error: 'Error processing injected data' }));
      }
      return;
    }

    if (!map) return;

    // Initial load
    debouncedUpdateRiskInfo();

    // Listen for map movements
    const handleMoveEnd = () => {
      debouncedUpdateRiskInfo();
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      // Cleanup loading timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [map, debouncedUpdateRiskInfo, injectedData, isLoading]);

  // Render loading state (only show if no cached data)
  if ((state.loading && !state.riskInfo) || isLoading) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          padding: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: 200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Chargement...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Render error state
  if (state.error && !state.riskInfo) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          padding: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: 200,
        }}
      >
        <Typography variant="body2" color="error">
          Erreur: {state.error}
        </Typography>
      </Box>
    );
  }

  // Render risk info or placeholder
  if (!state.riskInfo) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          padding: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: 200,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Chargement...
        </Typography>
      </Box>
    );
  }

  try {
    const { risk_level, risk_color, mean_cape, thunderstorm_days_per_year, severe_thunder_days, trend_10_years, nsg_value, nsg_unit, data_quality } = state.riskInfo;

    return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: 2,
        padding: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: 200,
        maxWidth: 220,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Risque Orageux
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Informations Orages & Foudre
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>CAPE (Convective Available Potential Energy) :</strong><br />
                Énergie potentielle convective disponible. Mesure l'instabilité de l'atmosphère et le potentiel de développement d'orages.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Nsg (Densité de foudre) :</strong><br />
                Densité de points de foudre au sol par kilomètre carré par an (norme IEC 62858).
                Calculée avec les données ARCO ERA5 et corrélée avec les observations météorologiques.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Niveaux de CAPE :</strong><br />
                • Faible : &lt; 1000 J/kg (peu favorable aux orages)<br />
                • Modéré : 1000-2500 J/kg (orages possibles)<br />
                • Élevé : 2500-3500 J/kg (orages probables)<br />
                • Très élevé : &gt; 3500 J/kg (orages violents possibles)
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Niveaux de Nsg (foudre/km²/an) :</strong><br />
                • Très faible : &lt; 0.2 (activité orageuse minimale)<br />
                • Faible : 0.2-0.8 (activité orageuse faible)<br />
                • Modéré : 0.8-2.0 (activité modérée)<br />
                • Élevé : 2.0-4.0 (activité élevée)<br />
                • Très élevé : &gt; 4.0 (activité très élevée)
              </Typography>

            </Box>
          }
          placement="left"
          arrow
        >
          <IconButton size="small" sx={{ p: 0.5 }}>
            <InfoOutlinedIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          {getRiskLevelEmoji(risk_level || 'unknown')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={getRiskLevelText(risk_level || 'unknown')}
          size="small"
          sx={{
            backgroundColor: risk_color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      {/* Enhanced thunderstorm metrics with Nsg prominence */}
      <Box sx={{ mt: 1 }}>
        {/* Prominent Nsg display */}
        {nsg_value !== undefined && nsg_value !== null && (
          <Box sx={{
            mb: 1.5,
            p: 1.5,
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
            borderRadius: 1.5,
            border: '1.5px solid',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Lightning bolt icon decoration */}
            <Box sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              fontSize: '2rem',
              opacity: 0.1,
              transform: 'rotate(15deg)',
              color: '#3b82f6'
            }}>
              ⚡
            </Box>

            {/* Header with icon */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Box sx={{
                fontSize: '0.9rem',
                color: '#3b82f6',
                filter: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.3))'
              }}>
                ⚡
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}>
                Densité de foudre
              </Typography>
            </Box>

            {/* Main value display */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
              <Typography variant="h6" sx={{
                fontWeight: 'bold',
                color: '#1e40af',
                fontSize: '1.1rem',
                lineHeight: 1,
                textShadow: '0 1px 2px rgba(30, 64, 175, 0.1)'
              }}>
                {nsg_value.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{
                color: '#64748b',
                fontSize: '0.7rem',
                fontWeight: 500
              }}>
                {getNsgUnitText(nsg_unit || 'strikes/km²/an')}
              </Typography>
            </Box>

            {/* Quality indicator only */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {data_quality && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.3,
                  px: 0.8,
                  py: 0.3,
                  backgroundColor: `${getDataQualityColor(data_quality)}15`,
                  borderRadius: 0.8,
                  border: `1px solid ${getDataQualityColor(data_quality)}30`
                }}>
                  <Box sx={{
                    fontSize: '0.6rem',
                    color: getDataQualityColor(data_quality)
                  }}>
                    {data_quality === 'excellent' ? '★' : data_quality === 'good' ? '☆' : '○'}
                  </Box>
                  <Typography variant="caption" sx={{
                    fontSize: '0.55rem',
                    fontWeight: 600,
                    color: getDataQualityColor(data_quality)
                  }}>
                    {getDataQualityText(data_quality)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* Traditional CAPE information */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
          CAPE Moyen: {mean_cape !== undefined ? mean_cape.toFixed(0) : 'N/A'} J/kg
        </Typography>

        {thunderstorm_days_per_year !== undefined && thunderstorm_days_per_year > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Jours orageux/an: {thunderstorm_days_per_year}
          </Typography>
        )}

        {severe_thunder_days !== undefined && severe_thunder_days > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Orages sévères: {severe_thunder_days}
          </Typography>
        )}

        {trend_10_years && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Tendance 10 ans: {trend_10_years}
          </Typography>
        )}

      </Box>
    </Box >
  );
  } catch (error) {
    console.error('ThunderTracker: Render error', error);
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          padding: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minWidth: 200,
        }}
      >
        <Typography variant="body2" color="error">
          Erreur de rendu: {error instanceof Error ? error.message : 'Erreur inconnue'}
        </Typography>
      </Box>
    );
  }
});

ThunderTracker.displayName = 'ThunderTracker';

export default ThunderTracker;
