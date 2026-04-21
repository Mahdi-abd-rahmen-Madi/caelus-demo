import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

interface HeatwaveTrackerProps {
  map: maplibregl.Map | null;
  injectedData?: any;
  isLoading?: boolean;
}

interface HeatwaveRiskInfo {
  risk_level: string | null;
  risk_color: string;
  mean_summer_utci: number;
  max_summer_utci: number;
  heatwave_days_per_year: number;
  extreme_heat_days: number;
  trend_10_years: string | null;
  description: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
  data_source?: string;
  data_quality?: string;
  commune_info?: {
    commune_id: string;
    commune_name: string;
    distance_km: number;
  };
}

interface TrackerState {
  riskInfo: HeatwaveRiskInfo | null;
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
const coordinateCache = new Map<string, HeatwaveRiskInfo | null>();
const getCoordinateKey = (lng: number, lat: number): string => `${lng.toFixed(4)},${lat.toFixed(4)}`;

// Clear cache function for debugging
const clearCoordinateCache = () => {
  coordinateCache.clear();
};

// Helper functions for data source mapping


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

export const HeatwaveTracker: React.FC<HeatwaveTrackerProps> = memo(({ map, injectedData, isLoading = false }) => {
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

  // Fetch heatwave risk for given coordinates
  const fetchHeatwaveRisk = useCallback(async (lng: number, lat: number): Promise<HeatwaveRiskInfo | null> => {
    const coordKey = getCoordinateKey(lng, lat);

    // Check cache first
    const cached = coordinateCache.get(coordKey);
    if (cached) {
      return cached;
    }

    try {
      // Call internal Django API
      const apiUrl = `http://localhost:8000/api/geodata/heatwave/risk/${lng}/${lat}/`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to internal format
      let riskInfo: HeatwaveRiskInfo | null = null;

      if (data.found && data.heatwave_risk) {
        const heatwaveData = data.heatwave_risk;

        riskInfo = {
          risk_level: heatwaveData.risk_level,
          risk_color: heatwaveData.risk_color,
          mean_summer_utci: heatwaveData.mean_summer_utci || 0,
          max_summer_utci: heatwaveData.max_summer_utci || 0,
          heatwave_days_per_year: heatwaveData.heatwave_days_per_year || 0,
          extreme_heat_days: heatwaveData.extreme_heat_days || 0,
          trend_10_years: heatwaveData.trend_10_years || null,
          description: heatwaveData.description,
          coordinates: { lng, lat },
          found: true,
          data_source: data.data_source,
          data_quality: heatwaveData.data_quality,
          commune_info: data.commune_info
        };

      } else {
        // No heatwave data found
        riskInfo = {
          risk_level: 'no_data',
          risk_color: '#94a3b8',
          mean_summer_utci: 0,
          max_summer_utci: 0,
          heatwave_days_per_year: 0,
          extreme_heat_days: 0,
          trend_10_years: null,
          description: 'Données de canicule indisponibles',
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
      console.error('HeatwaveTracker: Failed to fetch risk data:', error);
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
      const riskInfo = await fetchHeatwaveRisk(lng, lat);
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
          error: 'Failed to fetch heatwave risk data'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error fetching heatwave risk'
      }));
    }
  }, [map, fetchHeatwaveRisk]);

  // Debounced version of updateRiskInfo to avoid excessive API calls (2 second grace period for heatwave data)
  const debouncedUpdateRiskInfo = useCallback(debounce(updateRiskInfo, 2000), [updateRiskInfo]);

  // Set up map event listeners only if no injected data
  useEffect(() => {
    // Skip API calls if data is injected or currently loading from parent
    if (injectedData !== undefined || isLoading) {
      try {
        // Use injected data
        if (injectedData) {
          console.log('HeatwaveTracker: Using injected data', injectedData);
          // Extract the nested heatwave_risk data
          const heatwaveData = injectedData.heatwave_risk || injectedData;
          setState({
            riskInfo: heatwaveData,
            loading: false,
            error: null
          });
        } else if (isLoading) {
          console.log('HeatwaveTracker: Using parent loading state');
          setState(prev => ({ ...prev, loading: true, error: null }));
        }
      } catch (error) {
        console.error('HeatwaveTracker: Error processing injected data', error);
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
    const { risk_level, risk_color, mean_summer_utci, heatwave_days_per_year, extreme_heat_days, trend_10_years } = state.riskInfo;

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
          Risque Canicule
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Informations Canicule</Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>UTCI (Universal Thermal Climate Index) :</strong><br />
                Indice qui mesure le stress thermique ressenti par le corps humain en tenant compte de la température, humidité, vent et rayonnement solaire.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Jour canicule :</strong><br />
                Jour où l'UTCI atteint ou dépasse 38°C (stress thermique extrême).
              </Typography>

              <Typography variant="body2">
                <strong>Niveaux de stress thermique UTCI :</strong><br />
                • 26-32°C : Stress modéré<br />
                • 32-38°C : Stress fort<br />
                • 38-46°C : Stress très fort<br />
                • &gt;46°C : Stress extrême
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

      {/* Additional heatwave metrics */}
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
          UTCI Été: {mean_summer_utci !== undefined ? mean_summer_utci.toFixed(1) : 'N/A'}°C
        </Typography>
        {heatwave_days_per_year !== undefined && heatwave_days_per_year > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Jours canicule/an: {heatwave_days_per_year}
          </Typography>
        )}
        {extreme_heat_days !== undefined && extreme_heat_days > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Jours extrêmes: {extreme_heat_days}
          </Typography>
        )}
        {trend_10_years && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            Tendance 10 ans: {trend_10_years}
          </Typography>
        )}
      </Box>

    </Box>
  );
  } catch (error) {
    console.error('HeatwaveTracker: Render error', error);
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

HeatwaveTracker.displayName = 'HeatwaveTracker';

export default HeatwaveTracker;
