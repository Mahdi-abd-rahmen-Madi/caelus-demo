import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Chip, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL, apiCache, getGeorisquesData, getGeorisquesDataDirect, type GeorisquesAPIResponse, type RiskInfo } from '../../../services/api';
import { PreconnectionStatus, georisquesPreconnection } from '../../../services/preconnection';

interface InondationTrackerProps {
  map: maplibregl.Map | null;
  injectedData?: any;
  isLoading?: boolean;
}

interface InondationInfo {
  code_national_tri: string | null;
  identifiant_tri: string | null;
  libelle_tri: string;
  cours_deau: string | null;
  type_inondation_code: string | null;
  type_inondation_libelle: string;
  scenario_code: string | null;
  scenario_libelle: string;
  date_arrete_carte: string | null;
  code_insee: string | null;
  libelle_commune: string;
  risk_level: string;
  risk_color: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
}

interface TrackerState {
  inondationInfo: InondationInfo | null;
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

// Helper function to get risk level from georisques RiskInfo
const getRiskLevelFromGeorisques = (riskInfo: RiskInfo): { level: string; color: string; label: string } => {
  if (!riskInfo.present) {
    return { level: 'unknown', color: '#94a3b8', label: 'Aucun risque' };
  }

  const status = riskInfo.libelleStatutAdresse || riskInfo.libelleStatutCommune || 'Risque présent';

  if (status.toLowerCase().includes('faible') || status.toLowerCase().includes('low')) {
    return { level: 'low', color: '#3b82f6', label: 'Faible' };
  } else if (status.toLowerCase().includes('modéré') || status.toLowerCase().includes('moderate')) {
    return { level: 'medium', color: '#f59e0b', label: 'Modéré' };
  } else if (status.toLowerCase().includes('élevé') || status.toLowerCase().includes('haut') || status.toLowerCase().includes('high')) {
    return { level: 'high', color: '#f97316', label: 'Élevé' };
  } else if (status.toLowerCase().includes('très élevé') || status.toLowerCase().includes('very high')) {
    return { level: 'very_high', color: '#ef4444', label: 'Très élevé' };
  }

  return { level: 'medium', color: '#f59e0b', label: 'Modéré' };
};

// Helper function to get alternative flood risk from georisques data
const getAlternativeFloodRisk = (georisquesData: GeorisquesAPIResponse): InondationInfo | null => {
  const risques = georisquesData.risquesNaturels;

  // Check for alternative flood risks in order of priority
  if (risques.remonteeNappe?.present) {
    const risk = getRiskLevelFromGeorisques(risques.remonteeNappe);
    return {
      code_national_tri: null,
      identifiant_tri: null,
      libelle_tri: 'Remontée de nappe',
      cours_deau: null,
      type_inondation_code: null,
      type_inondation_libelle: 'Remontée de nappe phréatique',
      scenario_code: null,
      scenario_libelle: risk.label,
      date_arrete_carte: null,
      code_insee: georisquesData.commune?.codeInsee,
      libelle_commune: georisquesData.commune?.libelle || 'Inconnue',
      risk_level: risk.level,
      risk_color: risk.color,
      coordinates: { lng: 0, lat: 0 }, // Will be set by caller
      found: true
    };
  }

  if (risques.risqueCotier?.present) {
    const risk = getRiskLevelFromGeorisques(risques.risqueCotier);
    return {
      code_national_tri: null,
      identifiant_tri: null,
      libelle_tri: 'Risque côtier',
      cours_deau: null,
      type_inondation_code: null,
      type_inondation_libelle: 'Risque d\'érosion côtière et de submersion marine',
      scenario_code: null,
      scenario_libelle: risk.label,
      date_arrete_carte: null,
      code_insee: georisquesData.commune?.codeInsee,
      libelle_commune: georisquesData.commune?.libelle || 'Inconnue',
      risk_level: risk.level,
      risk_color: risk.color,
      coordinates: { lng: 0, lat: 0 }, // Will be set by caller
      found: true
    };
  }

  if (risques.reculTraitCote?.present) {
    const risk = getRiskLevelFromGeorisques(risques.reculTraitCote);
    return {
      code_national_tri: null,
      identifiant_tri: null,
      libelle_tri: 'Recul du trait de côte',
      cours_deau: null,
      type_inondation_code: null,
      type_inondation_libelle: 'Recul du trait de côte par érosion marine',
      scenario_code: null,
      scenario_libelle: risk.label,
      date_arrete_carte: null,
      code_insee: georisquesData.commune?.codeInsee,
      libelle_commune: georisquesData.commune?.libelle || 'Inconnue',
      risk_level: risk.level,
      risk_color: risk.color,
      coordinates: { lng: 0, lat: 0 }, // Will be set by caller
      found: true
    };
  }

  return null;
};
const getRiskLevelFromScenario = (scenarioCode: string): string => {
  if (!scenarioCode) return 'unknown';

  // Extract the probability part from scenario code (e.g., "04Fai" -> "Fai")
  const probabilityPart = scenarioCode.slice(2);

  const riskMap: Record<string, string> = {
    'Fai': 'low',      // faible
    'Moy': 'medium',   // moyen
    'ELe': 'high',     // élevé
    'TrE': 'very_high' // très élevé
  };

  return riskMap[probabilityPart] || 'unknown';
};

const getRiskColor = (riskLevel: string): string => {
  const colorMap: Record<string, string> = {
    'low': '#3b82f6',      // blue
    'medium': '#f59e0b',   // yellow/orange
    'high': '#f97316',     // orange
    'very_high': '#ef4444', // red
    'unknown': '#94a3b8'    // gray
  };
  return colorMap[riskLevel] || '#94a3b8';
};

const getRiskLevelText = (riskLevel: string): string => {
  const riskMap: Record<string, string> = {
    'low': 'Faible',
    'medium': 'Moyen',
    'high': 'Élevé',
    'very_high': 'Très élevé',
    'unknown': 'Inconnu'
  };
  return riskMap[riskLevel] || riskLevel;
};

export const InondationTracker: React.FC<InondationTrackerProps> = memo(({ map, injectedData, isLoading = false }) => {
  const [state, setState] = useState<TrackerState>({
    inondationInfo: null,
    loading: false,
    error: null
  });

  // Keep track of the last fetched coordinates to avoid unnecessary updates
  const lastCoordsRef = useRef<{ lng: number; lat: number } | null>(null);
  // Timer ref to manage loading state delay
  const loadingTimerRef = useRef<number | null>(null);

  // Fetch inondation zone for given coordinates
  const fetchInondationZone = useCallback(async (lng: number, lat: number): Promise<InondationInfo | null> => {
    // Check preconnection status for optimal performance
    const preconnectionStatus = georisquesPreconnection.getStatus();
    if (preconnectionStatus === PreconnectionStatus.IDLE) {
      // Trigger health check to establish connection
      georisquesPreconnection.performHealthCheck().catch(() => {
        // Health check failed, but we'll proceed anyway
      });
    }

    const apiUrl = `${API_BASE_URL}/geodata/georisques/tri-zonage/?latlon=${lng}%2C${lat}`;
    const cacheKey = apiCache.generateKey(apiUrl);

    let inondationInfo: InondationInfo | null = null;

    try {
      // First try TRI API with enhanced caching

      const response = await apiCache.deduplicate(cacheKey, async () => {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      });


      // Transform API response to internal format
      if (response.results > 0 && response.data && response.data.length > 0) {
        const inondationData = response.data[0];
        const scenarioCode = inondationData.scenario?.code;
        const riskLevel = getRiskLevelFromScenario(scenarioCode || '');


        inondationInfo = {
          code_national_tri: inondationData.code_national_tri,
          identifiant_tri: inondationData.identifiant_tri,
          libelle_tri: inondationData.libelle_tri,
          cours_deau: inondationData.cours_deau,
          type_inondation_code: inondationData.typeInondation?.code,
          type_inondation_libelle: inondationData.typeInondation?.libelle || 'Inconnu',
          scenario_code: scenarioCode,
          scenario_libelle: inondationData.scenario?.libelle || 'Inconnu',
          date_arrete_carte: inondationData.date_arrete_carte,
          code_insee: inondationData.code_insee,
          libelle_commune: inondationData.libelle_commune,
          risk_level: riskLevel,
          risk_color: getRiskColor(riskLevel),
          coordinates: { lng, lat },
          found: true
        };

        // Cache the result for 30 minutes
        apiCache.set(cacheKey, inondationInfo, 30 * 60 * 1000);
      }
    } catch (error) {
    }

    // If TRI API didn't return data, try georisques fallback
    if (!inondationInfo) {
      try {
        // Ensure preconnection is active before calling external Georisques API
        const preconnectionStatus = georisquesPreconnection.getStatus();
        if (preconnectionStatus !== PreconnectionStatus.CONNECTED) {
          await georisquesPreconnection.performHealthCheck();
        }
        
        // Use direct API for optimal performance with fallback to proxy
        let georisquesData: GeorisquesAPIResponse;
        try {
          georisquesData = await getGeorisquesDataDirect(lng, lat);
        } catch (error) {
          console.warn('Direct Georisques API failed, falling back to proxy:', error);
          georisquesData = await getGeorisquesData(lng, lat);
        }

        const fallbackInfo = getAlternativeFloodRisk(georisquesData);
        if (fallbackInfo) {
          // Update coordinates
          fallbackInfo.coordinates = { lng, lat };
          inondationInfo = fallbackInfo;

          // Cache the fallback result
          apiCache.set(cacheKey, inondationInfo, 30 * 60 * 1000);
        }
      } catch (fallbackError) {
      }
    }

    // If still no data, return error (no default values)
    if (!inondationInfo) {
      throw new Error('No flood zone data available');
    }

    return inondationInfo;
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
    const apiUrl = `${API_BASE_URL}/geodata/georisques/tri-zonage/?latlon=${lng}%2C${lat}`;
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
      const inondationInfo = await fetchInondationZone(lng, lat);
      if (inondationInfo) {
        setState({
          inondationInfo,
          loading: false,
          error: null
        });
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch flood zone data'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error fetching flood zone'
      }));
    }
  }, [map, fetchInondationZone]);

  // Debounced version of updateZoneInfo to avoid excessive API calls (2 second grace period)
  const debouncedUpdateZoneInfo = useCallback(debounce(updateZoneInfo, 2000), [updateZoneInfo]);

  // Set up map event listeners only if no injected data
  useEffect(() => {
    // Skip API calls if data is injected or currently loading from parent
    if (injectedData !== undefined || isLoading) {
      // Use injected data
      if (injectedData) {
        console.log('InondationTracker: Using injected data', injectedData);
        // Data is already the correct structure, no need to extract nested fields
        const inondationData = injectedData;
        setState({
          inondationInfo: inondationData,
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

  // Render loading state (only show if no cached data)
  if ((state.loading && !state.inondationInfo) || isLoading) {
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
  if (state.error && !state.inondationInfo) {
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
  if (!state.inondationInfo) {
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

  const { libelle_tri, risk_level, risk_color, cours_deau, type_inondation_libelle, scenario_libelle, libelle_commune } = state.inondationInfo;

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
          Zone inondation
        </Typography>
        <Tooltip
          title={
            <Box sx={{ p: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Informations Inondation
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Territoires à Risque d'Inondation (TRI) :</strong><br />
                Zones définies par l'État présentant un risque d'inondation significatif.
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Types d'inondation :</strong><br />
                • Débordement de cours d'eau<br />
                • Ruissellement urbain<br />
                • Submersion marine
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Niveaux de risque :</strong><br />
                • Faible : aléa de faible probabilité<br />
                • Moyen : aléa de probabilité moyenne<br />
                • Élevé : aléa de forte probabilité<br />
                • Très élevé : aléa de très forte probabilité
              </Typography>

              <Typography variant="body2">
                <strong>Implications :</strong><br />
                Les zones TRI nécessitent une planification spécifique, des mesures de prévention et des plans d'évacuation pour protéger les populations et les biens.
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

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <Chip
          label={getRiskLevelText(risk_level)}
          size="small"
          sx={{
            backgroundColor: risk_color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
          }}
        />
        <Tooltip title={libelle_tri} placement="top" arrow>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.8rem',
              fontWeight: 500,
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {libelle_tri}
          </Typography>
        </Tooltip>
      </Box>

      {state.inondationInfo.found && (
        <Box>
          {type_inondation_libelle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
              Type: {type_inondation_libelle}
            </Typography>
          )}
          {scenario_libelle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
              Scénario: {scenario_libelle}
            </Typography>
          )}
          {cours_deau && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
              Cours d'eau: {cours_deau}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
            {libelle_commune}
          </Typography>
        </Box>
      )}
    </Box>
  );
});

InondationTracker.displayName = 'InondationTracker';

export default InondationTracker;
