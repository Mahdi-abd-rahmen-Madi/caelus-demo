import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, apiCache } from '../../../services/api';

interface SeismicZoneTrackerProps {
  map: maplibregl.Map | null;
  injectedData?: any;
  isLoading?: boolean;
}

interface SeismicZoneInfo {
  seismic_zone: string | null;
  zone_label: string;
  risk_level: string;
  risk_color: string;
  description: string;
  acceleration_coefficient: number | null;
  coordinates: { lng: number; lat: number };
  found: boolean;
}

interface TrackerState {
  zoneInfo: SeismicZoneInfo | null;
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

// Helper functions for zone mapping
const getRiskLevelFromZone = (zone: string): string => {
  const riskMap: Record<string, string> = {
    '1': 'very_low',
    '2': 'low',
    '3': 'medium',
    '4': 'high',
    '5': 'very_high'
  };
  return riskMap[zone] || 'unknown';
};

const getZoneColor = (zone: string): string => {
  const colorMap: Record<string, string> = {
    '1': '#10b981',  // green
    '2': '#84cc16',  // lime
    '3': '#f59e0b',  // yellow
    '4': '#f97316',  // orange
    '5': '#ef4444'   // red
  };
  return colorMap[zone] || '#94a3b8';  // gray for unknown
};

const getZoneDescription = (zone: string): string => {
  const descMap: Record<string, string> = {
    '1': 'Très faible sismicité',
    '2': 'Faible sismicité',
    '3': 'Sismicité modérée',
    '4': 'Forte sismicité',
    '5': 'Très forte sismicité'
  };
  return descMap[zone] || 'Zone inconnue';
};

export const SeismicZoneTracker: React.FC<SeismicZoneTrackerProps> = memo(({ map, injectedData, isLoading = false }) => {
  const [state, setState] = useState<TrackerState>({
    zoneInfo: null,
    loading: false,
    error: null
  });

  // Keep track of the last fetched coordinates to avoid unnecessary updates
  const lastCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  // Timer ref to manage loading state delay
  const loadingTimerRef = useRef<number | null>(null);

  // Fetch seismic zone for given coordinates
  const fetchSeismicZone = useCallback(async (lng: number, lat: number): Promise<SeismicZoneInfo | null> => {
    const apiUrl = `${API_BASE_URL}/geodata/georisques/seismic-zones/?rayon=10&latlon=${lng}%2C${lat}&page=1&page_size=10`;
    const cacheKey = apiCache.generateKey(apiUrl);

    try {
      // Use enhanced API cache with deduplication
      const response = await apiCache.deduplicate(cacheKey, async () => {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });

      // Transform external API response to internal format
      let zoneInfo: SeismicZoneInfo | null = null;

      if (response.data && response.data.length > 0) {
        const seismicData = response.data[0];
        const codeZone = seismicData.code_zone;

        // Map external zone code to internal format
        zoneInfo = {
          seismic_zone: codeZone,
          zone_label: `Zone ${codeZone}`,
          risk_level: getRiskLevelFromZone(codeZone),
          risk_color: getZoneColor(codeZone),
          description: getZoneDescription(codeZone),
          acceleration_coefficient: null, // Not provided by external API
          coordinates: { lng, lat },
          found: true
        };
      } else {
        // No seismic zone found
        zoneInfo = {
          seismic_zone: null,
          zone_label: "Hors zone",
          risk_level: "unknown",
          risk_color: "#94a3b8",
          description: "Coordonnées hors des zones sismiques définies",
          acceleration_coefficient: null,
          coordinates: { lng, lat },
          found: false
        };
      }

      // Cache the result for 30 minutes
      apiCache.set(cacheKey, zoneInfo, 30 * 60 * 1000);
      return zoneInfo;
    } catch (error) {
      console.error('SeismicZoneTracker: Failed to fetch zone data:', error);
      throw error; // Let component handle error
    }
  }, []);

  // Update zone info when map center changes
  const updateZoneInfo = useCallback(async () => {
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

    // Check if we have cached data
    const apiUrl = `${API_BASE_URL}/geodata/georisques/seismic-zones/?rayon=10&latlon=${lng}%2C${lat}&page=1&page_size=10`;
    const cacheKey = apiCache.generateKey(apiUrl);
    const cached = apiCache.get(cacheKey);

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
      const zoneInfo = await fetchSeismicZone(lng, lat);
      if (zoneInfo) {
        setState({
          zoneInfo,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch seismic zone data'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error fetching seismic zone'
      }));
    }
  }, [map, fetchSeismicZone]);

  // Debounced version of updateZoneInfo to avoid excessive API calls (2 second grace period for seismic zones)
  const debouncedUpdateZoneInfo = useCallback(debounce(updateZoneInfo, 2000), [updateZoneInfo]);

  // Set up map event listeners only if no injected data
  useEffect(() => {
    // Skip API calls if data is injected or currently loading from parent
    if (injectedData !== undefined || isLoading) {
      // Use injected data
      if (injectedData) {
        console.log('SeismicZoneTracker: Using injected data', injectedData);
        // Data is already the correct structure, no need to extract nested fields
        const seismicData = injectedData;
        setState({
          zoneInfo: seismicData,
          loading: false,
          error: null
        });
      } else if (isLoading) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }
      return;
    }

    if (!map) return;

    // Initial load
    debouncedUpdateZoneInfo();

    // Listen for map movements
    const handleMoveEnd = () => {
      debouncedUpdateZoneInfo();
    };

    map.on('moveend', handleMoveEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      // Cleanup loading timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [map, debouncedUpdateZoneInfo, injectedData, isLoading]);

  // Get risk level display text
  const getRiskLevelText = (riskLevel: string): string => {
    const riskMap: Record<string, string> = {
      'very_low': 'Très faible',
      'low': 'Faible',
      'medium': 'Modérée',
      'high': 'Forte',
      'very_high': 'Très forte',
      'unknown': 'Inconnue'
    };
    return riskMap[riskLevel] || riskLevel;
  };

  // Render loading state (only show if no cached data)
  if ((state.loading && !state.zoneInfo) || isLoading) {
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
  if (state.error && !state.zoneInfo) {
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

  // Render zone info or placeholder
  if (!state.zoneInfo) {
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

  const { zone_label, risk_level, risk_color } = state.zoneInfo;

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
          Zone sismique
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Informations Sismiques</Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Zones sismiques françaises :</strong><br />
                Classification du territoire français selon le risque sismique, de 1 (très faible) à 5 (très forte).
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Niveaux de risque :</strong><br />
                • Zone 1 : Très faible sismicité (risque minimal)<br />
                • Zone 2 : Faible sismicité<br />
                • Zone 3 : Sismicité modérée<br />
                • Zone 4 : Forte sismicité<br />
                • Zone 5 : Très forte sismicité (risque maximal)
              </Typography>

              <Typography variant="body2">
                <strong>Implications :</strong><br />
                Les zones à risque élevé (4-5) nécessitent des constructions parasismiques renforcées et des normes de construction spécifiques pour protéger les bâtiments et leurs occupants.
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
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={zone_label}
          size="small"
          sx={{
            backgroundColor: risk_color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {getRiskLevelText(risk_level)}
        </Typography>
      </Box>
    </Box>
  );
});

SeismicZoneTracker.displayName = 'SeismicZoneTracker';

export default SeismicZoneTracker;
