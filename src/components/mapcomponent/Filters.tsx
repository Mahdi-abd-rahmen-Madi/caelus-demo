import { useCallback } from 'react';
import { Box, Typography, Slider, Chip, Tooltip } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import { useTranslation } from 'react-i18next';
import type { EnhancedFilterProps } from '../../types/dashboard';
import { MAP_CONFIG } from '../../config/mapConfig';
import { useUserFeatures } from '../../hooks/useUserFeatures';

const ZONE_TYPES = [
  { code: 'U', label: 'Urban', color: '#e74c3c' },
  { code: 'AUC', label: 'Urban Expansion', color: '#f39c12' },
  { code: 'AUS', label: 'Urban Expansion', color: '#e67e22' },
  { code: 'NH', label: 'Natural', color: '#5dade2' },
  { code: 'AH', label: 'Agricultural with Housing', color: '#27ae60' }
];

interface FiltersProps {
  enhancedFilters?: EnhancedFilterProps;
  onEnhancedFilterChange?: (filters: EnhancedFilterProps) => void;
  selectedZoneTypes?: string[];
  onZoneTypeChange?: (zoneType: string, checked: boolean) => void;
}

export const Filters = ({
  enhancedFilters,
  onEnhancedFilterChange,
  selectedZoneTypes = [],
  onZoneTypeChange
}: FiltersProps) => {
  const { t } = useTranslation();
  const { hasRailwayDistanceFeature } = useUserFeatures();

  // Debug logging
  const railwayFeatureEnabled = hasRailwayDistanceFeature();
  console.log('🎛️ Filters Debug:', {
    MAP_CONFIG_enableAdvancedFiltering: MAP_CONFIG.enableAdvancedFiltering,
    railwayFeatureEnabled,
    enhancedFilters,
    shouldShowRailwaySlider: MAP_CONFIG.enableAdvancedFiltering && railwayFeatureEnabled
  });

  const handleAreaChange = useCallback((_: any, newValue: any) => {
    const [min, max] = newValue as [number, number];
    onEnhancedFilterChange?.({
      ...enhancedFilters,
      minArea: min,
      maxArea: max
    });
  }, [enhancedFilters, onEnhancedFilterChange]);

  const handleRailwayDistanceChange = useCallback((_: any, newValue: any) => {
    const maxDistance = newValue as number;
    onEnhancedFilterChange?.({
      ...enhancedFilters,
      maxRailwayDistance: maxDistance
    });
  }, [enhancedFilters, onEnhancedFilterChange]);

  if (!MAP_CONFIG.enableAdvancedFiltering) {
    console.log('❌ Filters not rendered: enableAdvancedFiltering is false');
    return null;
  }

  return (
    <Box sx={{
      width: '100%',
      mt: 2,
      pt: 2,
      borderTop: '1px solid rgba(148, 163, 184, 0.1)',
      position: 'relative',
      ...(MAP_CONFIG.disableFiltersInteractivity && {
        opacity: 0.5,
        pointerEvents: 'none',
        filter: 'grayscale(0.3)'
      })
    }}>
      {/* Demo Mode Overlay */}
      {MAP_CONFIG.disableFiltersInteractivity && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(128, 128, 128, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          pointerEvents: 'none'
        }}>
          <Box sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {t('demo_mode_not_functional')}
          </Box>
        </Box>
      )}
      <Box sx={{ px: 1, mb: 2, position: 'relative', zIndex: 0 }}>
        <Typography variant="caption" sx={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#1e293b',
          mb: 1,
          display: 'block'
        }}>
          {t('advanced_filters')}
        </Typography>
      </Box>

      {/* Area Range Slider */}
      <Box sx={{ mb: 2, px: 1, position: 'relative', zIndex: 0 }}>
        <Typography variant="caption" sx={{
          fontWeight: 500,
          mb: 1,
          fontSize: '10px',
          color: '#64748b',
          display: 'block'
        }}>
          {t('area_range')}: {enhancedFilters?.minArea || 0} - {enhancedFilters?.maxArea || 30000} m²
        </Typography>
        <Box sx={{ px: 1 }}>
          <Slider
            value={[
              enhancedFilters?.minArea || 0,
              enhancedFilters?.maxArea || 30000
            ]}
            onChange={handleAreaChange}
            valueLabelDisplay="auto"
            min={0}
            max={30000}
            step={100}
            marks={[
              { value: 0, label: '0' },
              { value: 10000, label: '10k' },
              { value: 20000, label: '20k' },
              { value: 30000, label: '30k' }
            ]}
            sx={{
              color: '#f59e0b',
              '& .MuiSlider-thumb': {
                width: 16,
                height: 16,
              },
              '& .MuiSlider-track': {
                height: 4,
              },
              '& .MuiSlider-rail': {
                height: 4,
              }
            }}
          />
        </Box>
      </Box>

      {/* Railway Distance Slider - Only show if user has feature access */}
      {railwayFeatureEnabled && (
        <>
          {console.log('✅ Rendering railway distance slider')}
          <Box sx={{ mb: 1, px: 1, position: 'relative', zIndex: 0 }}>
            <Typography variant="caption" sx={{
              fontWeight: 500,
              mb: 1,
              fontSize: '10px',
              color: '#64748b',
              display: 'block'
            }}>
              {t('railway_distance')}: ≤ {enhancedFilters?.maxRailwayDistance || 5000} m
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={enhancedFilters?.maxRailwayDistance || 5000}
                onChange={handleRailwayDistanceChange}
                valueLabelDisplay="auto"
                min={0}
                max={5000}
                step={50}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1000, label: '1km' },
                  { value: 2500, label: '2.5km' },
                  { value: 5000, label: '5km' }
                ]}
                sx={{
                  color: '#8b5cf6',
                  '& .MuiSlider-thumb': {
                    width: 16,
                    height: 16,
                  },
                  '& .MuiSlider-track': {
                    height: 4,
                  },
                  '& .MuiSlider-rail': {
                    height: 4,
                  }
                }}
              />
            </Box>
          </Box>
        </>
      )}

      {/* Zone Types */}
      <Box sx={{ mb: 2, px: 1, position: 'relative', zIndex: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            mr: 1
          }}>
            <CategoryIcon sx={{ color: 'white', fontSize: 14 }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '10px', color: '#1e293b' }}>
            {t('zone_types')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {ZONE_TYPES.map((zone) => (
            <Tooltip
              key={zone.code}
              title={zone.label}
              arrow
              placement="top"
              sx={{
                '& .MuiTooltip-tooltip': {
                  fontSize: '0.75rem',
                  backgroundColor: '#1e293b',
                }
              }}
            >
              <Chip
                label={zone.code}
                size="small"
                onClick={() => onZoneTypeChange?.(zone.code, !selectedZoneTypes.includes(zone.code))}
                sx={{
                  backgroundColor: selectedZoneTypes.includes(zone.code) ? zone.color : '#f1f5f9',
                  color: selectedZoneTypes.includes(zone.code) ? 'white' : '#64748b',
                  fontWeight: selectedZoneTypes.includes(zone.code) ? 600 : 400,
                  fontSize: '0.7rem',
                  height: 20,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedZoneTypes.includes(zone.code) ? zone.color : `${zone.color}20`,
                  }
                }}
              />
            </Tooltip>
          ))}
        </Box>

        {selectedZoneTypes.length > 0 && (
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '9px' }}>
            {selectedZoneTypes.length} zone{selectedZoneTypes.length > 1 ? 's' : ''} selected
          </Typography>
        )}
      </Box>

    </Box>
  );
};
