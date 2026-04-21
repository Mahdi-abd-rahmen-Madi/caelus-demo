import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  ListItem,
  ListItemButton,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FlightTakeoff
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { SuitableParcel } from '../services/api';

interface VirtualizedParcelsListProps {
  parcels: SuitableParcel[];
  loading: boolean;
  onFlyToParcel: (lng: number, lat: number, parcelId: string) => void;
  itemHeight?: number;
  containerHeight?: number;
}

const ITEM_HEIGHT = 80; // Height of each parcel item in pixels
const CONTAINER_HEIGHT = 400; // Default container height

export const VirtualizedParcelsList = ({
  parcels,
  loading,
  onFlyToParcel,
  itemHeight = ITEM_HEIGHT,
  containerHeight = CONTAINER_HEIGHT
}: VirtualizedParcelsListProps) => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced loading state to prevent flickering
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayedParcels, setDisplayedParcels] = useState<SuitableParcel[]>(parcels);
  const parcelsRef = useRef(parcels);
  const updateTimeoutRef = useRef<number | null>(null);

  // Update parcels ref when parcels change
  useEffect(() => {
    parcelsRef.current = parcels;
  }, [parcels]);

  // Handle parcels change with debounced loading
  useEffect(() => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // If parcels are different, show loading state
    if (JSON.stringify(parcelsRef.current) !== JSON.stringify(displayedParcels)) {
      setIsUpdating(true);

      // Simulate loading delay and then update
      updateTimeoutRef.current = setTimeout(() => {
        setDisplayedParcels(parcelsRef.current);
        setIsUpdating(false);
      }, 300); // 300ms delay to simulate loading
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [parcels, displayedParcels]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(start + visibleCount + 2, displayedParcels.length); // +2 for overscan
    return { start: Math.max(0, start), end };
  }, [scrollTop, itemHeight, containerHeight, displayedParcels.length]);

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Memoize visible parcels
  const visibleParcels = useMemo(() => {
    return displayedParcels.slice(visibleRange.start, visibleRange.end);
  }, [displayedParcels, visibleRange]);

  // Memoize render item
  const RenderItem = useCallback((parcel: SuitableParcel, index: number) => {
    const actualIndex = visibleRange.start + index;
    return (
      <ListItem
        key={parcel.parcel_id}
        sx={{
          height: itemHeight,
          position: 'absolute',
          top: actualIndex * itemHeight,
          width: '100%',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 1,
          mb: 0.5,
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.04)'
          }
        }}
      >
        <ListItemButton
          dense
          selected={selectedIndex === actualIndex}
          onClick={() => {
            setSelectedIndex(actualIndex);
            onFlyToParcel(parcel.longitude || 0, parcel.latitude || 0, parcel.parcel_id);
          }}
          sx={{
            width: '100%',
            textAlign: 'left',
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                {parcel.parcel_id}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {parcel.plu_zone_code || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip
                size="small"
                label={parcel.area ? `${(parcel.area / 1000).toFixed(1)}k m²` : 'N/A'}
                color="primary"
                variant="outlined"
              />
            </Box>

            <Tooltip title={t('fly_to_parcel')}>
              <IconButton
                size="small"
                color="primary"
                sx={{ ml: 'auto' }}
              >
                <FlightTakeoff fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </ListItemButton>
      </ListItem>
    );
  }, [itemHeight, selectedIndex, onFlyToParcel, visibleRange.start]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      {(loading || isUpdating) ? (
        // Show skeletons while loading or updating - match exact layout of real items
        <Box sx={{ position: 'relative', height: displayedParcels.length * itemHeight }}>
          {Array.from({ length: Math.min(displayedParcels.length || 5, Math.floor(containerHeight / itemHeight) + 2) }).map((_, index) => (
            <Box
              key={index}
              sx={{
                height: itemHeight,
                position: 'absolute',
                top: index * itemHeight,
                width: '100%',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 1,
                mb: 0.5,
                p: 1,
                boxSizing: 'border-box'
              }}
            >
              <Skeleton variant="rectangular" height="100%" />
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ position: 'relative', height: displayedParcels.length * itemHeight }}>
          {visibleParcels.map((parcel, index) => RenderItem(parcel, index))}
        </Box>
      )}
    </Box>
  );
};
