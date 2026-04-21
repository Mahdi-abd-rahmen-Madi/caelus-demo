import {
  AreaChart,
  ExpandLess,
  ExpandMore,
  FlightTakeoff
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Skeleton,
  Tooltip,
  Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParcelSelectionState } from '../context/AppStateSelectors';
import { getSuitableParcels, type SuitableParcel } from '../services/api';
import type { EnhancedFilterProps } from '../types/dashboard';

interface SuitableParcelsListProps {
  location: [number, number];
  radius: number;
  onFlyToParcel: (parcel: any) => void;
  enhancedFilters?: EnhancedFilterProps;
  selectedZoneTypes?: string[];
}

export const SuitableParcelsList = ({
  location,
  radius,
  onFlyToParcel,
  enhancedFilters,
  selectedZoneTypes = []
}: SuitableParcelsListProps) => {
  const { t } = useTranslation();
  const { selectedParcel } = useParcelSelectionState();

  // Helper function to check if a parcel is selected
  const isParcelSelected = useCallback((parcelId: string): boolean => {
    return selectedParcel?.parcel_id === parcelId;
  }, [selectedParcel]);

  const [expanded, setExpanded] = useState(true);
  const [parcels, setParcels] = useState<SuitableParcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[1] - point1[1]) * Math.PI / 180;
    const dLon = (point2[0] - point1[0]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1[1] * Math.PI / 180) * Math.cos(point2[1] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  const fetchParcels = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
      setLoadingMore(true);
      setParcels([]);
      setOffset(0);
      setHasMore(true);
      setHasFetched(false);
    }

    setError(null);

    try {
      // Get all suitable parcels
      const response = await getSuitableParcels();

      if (reset) {
        setParcels(response);
      } else {
        setParcels(prev => [...prev, ...response]);
      }

      setOffset(currentOffset + response.length);
      const totalCount = 0; // No total count available for real data
      setHasMore(response.length === 10 && totalCount > currentOffset + response.length);
      setHasFetched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failed_to_fetch_parcels'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Apply client-side filtering for consistency with map display and enhanced filters
  const filteredParcels = parcels.filter(parcel => {
    // If location and radius are provided, filter by distance
    if (location && radius && location[0] !== 0 && location[1] !== 0) {
      const parcelLocation: [number, number] = [parcel.longitude, parcel.latitude];
      const distance = calculateDistance(location, parcelLocation);
      if (distance > radius) {
        return false; // Outside radius
      }
    }

    // Apply enhanced filters
    if (enhancedFilters) {
      // Area filtering
      if (enhancedFilters.minArea !== undefined || enhancedFilters.maxArea !== undefined) {
        const area = parcel.area !== undefined && parcel.area !== null && !isNaN(parcel.area) 
          ? parseFloat(String(parcel.area)) 
          : 0;
        const minArea = enhancedFilters.minArea || 0;
        const maxArea = enhancedFilters.maxArea || Infinity;

        if (area < minArea || area > maxArea) {
          return false;
        }
      }
    }

    // Zone type filtering
    if (selectedZoneTypes && selectedZoneTypes.length > 0) {
      const pluZoneCode = parcel.plu_zone_code;
      if (!pluZoneCode) {
        return false;
      }

      const hasMatchingZone = selectedZoneTypes.some(selectedZone => {
        return pluZoneCode === selectedZone || pluZoneCode.startsWith(selectedZone);
      });

      if (!hasMatchingZone) {
        return false;
      }
    }

    return true; // Passes all filters
  }).sort((a, b) => {
    // Sort by area descending, handling undefined/null values
    const areaA = a.area !== undefined && a.area !== null && !isNaN(a.area) ? a.area : 0;
    const areaB = b.area !== undefined && b.area !== null && !isNaN(b.area) ? b.area : 0;
    return areaB - areaA;
  });

  // Update filteredParcels when dependencies change
  useEffect(() => {
    // This effect ensures filteredParcels is recalculated when dependencies change
    // The actual filtering is done in the computed variable above
  }, [parcels, location, radius, calculateDistance, enhancedFilters, selectedZoneTypes]);

  // No need to reset mode - we always use highest score parcels

  useEffect(() => {
    if (expanded && parcels.length === 0) {
      fetchParcels(true);
    }
  }, [expanded, location, radius]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (expanded && !hasFetched) {
      fetchParcels(true);
    }
  }, [expanded, hasFetched]);

  // Refresh parcels when filters change
  useEffect(() => {
    if (expanded && parcels.length > 0) {
      fetchParcels(true);
    }
  }, [enhancedFilters, selectedZoneTypes, location, radius]);

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100 && hasMore && !loadingMore && !loading) {
      fetchParcels(false);
    }
  };



  const formatArea = (area: number | undefined | null) => {
    if (area === undefined || area === null || isNaN(area)) {
      return 'N/A m²';
    }
    return `${area.toFixed(0)} m²`;
  };

  // Always show the component with all available parcels

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      {/* Header */}
      <Box
        sx={{
          p: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '11px', fontWeight: 600 }}>
            📍 {filteredParcels.length} of {parcels.length} {t('parcels')}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ p: 0.5 }}>
          {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 1,
            pb: 1,
            maxHeight: '400px', // Limit height to prevent overflow
            overflowY: 'auto',   // Make scrollable
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.5)',
              },
            }
          }}
          onScroll={handleScroll}
        >
          {/* No Results State */}
          {!loading && !error && hasFetched && parcels.length === 0 && (
            <Box sx={{
              textAlign: 'center',
              py: 3,
              px: 2,
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              borderRadius: 1,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}>
              <Typography variant="caption" sx={{ fontSize: '11px', color: '#64748b', mb: 1, display: 'block' }}>
                {t('no_parcels_found_in_area')}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '10px', color: '#94a3b8', mb: 2, display: 'block' }}>
                {t('try_different_location')}
              </Typography>
            </Box>
          )}

          {/* Parcels List */}
          {!loading && !error && filteredParcels.map((parcel, index) => (
            <Card
              key={`${parcel.parcel_id}-${index}`}
              sx={{
                mb: 1,
                backgroundColor: isParcelSelected(parcel.parcel_id)
                  ? 'rgba(99, 102, 241, 0.1)'
                  : 'rgba(255, 255, 255, 0.8)',
                border: isParcelSelected(parcel.parcel_id)
                  ? '2px solid rgba(99, 102, 241, 0.5)'
                  : '1px solid rgba(148, 163, 184, 0.2)',
                boxShadow: isParcelSelected(parcel.parcel_id)
                  ? '0 4px 16px rgba(99, 102, 241, 0.3)'
                  : 'none',
                transition: 'all 0.3s ease',
                transform: isParcelSelected(parcel.parcel_id) ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  backgroundColor: isParcelSelected(parcel.parcel_id)
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(255, 255, 255, 0.95)',
                  boxShadow: isParcelSelected(parcel.parcel_id)
                    ? '0 6px 20px rgba(99, 102, 241, 0.4)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transform: 'scale(1.03)'
                }
              }}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                {/* Header with ID and Fly To button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '10px' }}>
                    {parcel.parcel_id}
                  </Typography>
                  <Tooltip title={t('fly_to_parcel')}>
                    <IconButton
                      size="small"
                      onClick={() => onFlyToParcel(parcel)}
                      sx={{ p: 0.5 }}
                    >
                      <FlightTakeoff fontSize="small" sx={{ fontSize: '12px' }} />
                    </IconButton>
                  </Tooltip>
                </Box>


                {/* Key Metrics */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                  {/* Area */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AreaChart sx={{ fontSize: '10px', color: '#6b7280' }} />
                    <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280' }}>
                      {t('area')}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '10px' }}>
                      {formatArea(parcel.area)}
                    </Typography>
                  </Box>

                  {/* PLU Zone Code */}
                  {parcel.plu_zone_code && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontSize: '10px', color: '#6b7280' }}>
                        {t('plu_zone')}:
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '10px' }}>
                        {parcel.plu_zone_code}
                      </Typography>
                    </Box>
                  )}

                </Box>
              </CardContent>
            </Card>
          ))}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 1, fontSize: '11px' }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} height={80} sx={{ mb: 1 }} />
              ))}
            </Box>
          )}

          {/* Load More Button */}
          {!loading && !error && hasMore && parcels.length > 0 && (
            <Button
              size="small"
              fullWidth
              variant="outlined"
              sx={{ mt: 1, fontSize: '10px' }}
              onClick={() => fetchParcels(false)}
              disabled={loadingMore}
            >
              {loadingMore ? t('loading') : t('load_more')}
            </Button>
          )}

          {/* End of Results */}
          {!loading && !error && !hasMore && parcels.length > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                fontSize: '10px',
                color: '#64748b'
              }}
            >
              {parcels.length} {t('parcels_loaded')}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};
