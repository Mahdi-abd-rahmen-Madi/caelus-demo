import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Paper, Tooltip, Typography } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EnhancedFilterProps } from '../../types/dashboard';
import { SuitableParcelsList } from '../SuitableParcelsList';
import { Filters } from './Filters';

interface SidePanelProps {
  tabValue: number;
  searchQuery: string;
  radius: number;
  location: [number, number];
  onSearchClick: () => void;
  onFlyToParcel?: (parcel: any) => void;
  enhancedFilters?: EnhancedFilterProps;
  onEnhancedFilterChange?: (filters: EnhancedFilterProps) => void;
  selectedZoneTypes?: string[];
  onZoneTypeChange?: (zoneType: string, checked: boolean) => void;
  onPinLocationChange?: (location: [number, number] | null) => void;
  // Pin state passed from Dashboard
  isPinMode?: boolean;
  pinLocation?: { lng: number; lat: number; isValid?: boolean } | null;
  onTogglePinMode?: () => void;
  onRemovePin?: () => void;
  hasSearched?: boolean;
}


export const SidePanel = ({
  radius,
  location,
  onSearchClick,
  onFlyToParcel,
  enhancedFilters,
  onEnhancedFilterChange,
  selectedZoneTypes = [],
  onZoneTypeChange,
  onPinLocationChange,
  isPinMode = false,
  pinLocation = null,
  onTogglePinMode,
  onRemovePin,
  hasSearched = false
}: SidePanelProps) => {
  const { t } = useTranslation();

  // Remove pin and notify parent
  const handleRemovePin = () => {
    if (onRemovePin) {
      onRemovePin();
    }
    if (onPinLocationChange) {
      onPinLocationChange(null);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '240px', // Reduced from 290px to give more space to map
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 0,
        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0
      }}
    >
      {/* Compact Sidebar Header */}
      <Box
        sx={{
          p: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          transition: 'background-color 0.15s ease',
          py: 0.75,
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          }
        }}
        onClick={onSearchClick}
      >
        {/* Compact Search and Pin Container */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          px: 0.5,
          gap: 0.5
        }}>
          {/* Compact Search and Pin Icons */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5
          }}>
            {/* Compact Search Icon */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                boxShadow: '0 3px 10px rgba(99, 102, 241, 0.4)'
              }
            }}>
              <SearchIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>

            {/* Compact Pin Icon */}
            <Tooltip title={isPinMode ? 'Cancel pin drop' : 'Drop pin on map'} arrow>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: isPinMode
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : pinLocation
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                boxShadow: isPinMode
                  ? '0 2px 6px rgba(239, 68, 68, 0.25)'
                  : pinLocation
                    ? '0 2px 6px rgba(16, 185, 129, 0.25)'
                    : '0 2px 6px rgba(100, 116, 139, 0.25)',
                transition: 'background-color 0.15s ease',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: isPinMode
                    ? '0 3px 10px rgba(239, 68, 68, 0.4)'
                    : pinLocation
                      ? '0 3px 10px rgba(16, 185, 129, 0.4)'
                      : '0 3px 10px rgba(100, 116, 139, 0.4)'
                }
              }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (pinLocation) {
                    handleRemovePin();
                  } else {
                    if (onTogglePinMode) {
                      onTogglePinMode();
                    }
                  }
                }}>
                <LocationOnIcon sx={{ color: 'white', fontSize: 18 }} />
              </Box>
            </Tooltip>

            {/* Pin coordinates only */}
            {pinLocation && (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0.25,
                ml: 0.5
              }}>
                <Typography variant="caption" sx={{
                  fontSize: '8px',
                  color: pinLocation.isValid ? '#10b981' : '#f59e0b',
                  lineHeight: 1,
                  fontWeight: 600
                }}>
                  Pin: {pinLocation.lat.toFixed(4)}, {pinLocation.lng.toFixed(4)}
                </Typography>
              </Box>
            )}
          </Box>

        </Box>

        {/* Pin Status for pin mode only */}
        {isPinMode && (
          <Box sx={{
            px: 0.5,
            py: 0.5,
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            background: 'rgba(239, 68, 68, 0.05)'
          }}>
            <Typography variant="caption" sx={{
              fontSize: '8px',
              color: '#ef4444',
              textAlign: 'center',
              display: 'block',
              lineHeight: 1,
              fontWeight: 600
            }}>
              Click on the map to drop a pin
            </Typography>
          </Box>
        )}
      </Box>

      {/* Placeholder for parcels list before search */}
      {!hasSearched && (
        <Box sx={{ px: 1, py: 2 }}>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
              backgroundColor: 'rgba(248, 250, 252, 0.8)',
              borderRadius: 1,
              border: '1px solid rgba(148, 163, 184, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            {/* Placeholder Text */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{
                fontSize: '12px',
                color: '#475569',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                {t('drop_pin_or_search_to_view_parcels')}
              </Typography>
              <Typography variant="caption" sx={{
                fontSize: '10px',
                color: '#94a3b8',
                textAlign: 'center',
                display: 'block'
              }}>
                {t('search_by_location_or_drop_pin_on_map')}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Suitable Parcels List */}
        {hasSearched && onFlyToParcel && (
          <SuitableParcelsList
            location={location}
            radius={radius}
            onFlyToParcel={onFlyToParcel}
            enhancedFilters={enhancedFilters}
            selectedZoneTypes={selectedZoneTypes}
          />
        )}
      </Box>

      {/* Advanced Filters - Fixed at bottom */}
      {hasSearched && (
        <Box sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          borderTop: '1px solid rgba(148, 163, 184, 0.1)',
          zIndex: 10
        }}>
          <Filters
            enhancedFilters={enhancedFilters}
            onEnhancedFilterChange={onEnhancedFilterChange}
            selectedZoneTypes={selectedZoneTypes}
            onZoneTypeChange={onZoneTypeChange}
          />
        </Box>
      )}

    </Paper>
  );
};

export default memo(SidePanel);