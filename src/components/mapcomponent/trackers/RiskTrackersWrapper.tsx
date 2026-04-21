import { Box } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { lazy, memo, Suspense } from 'react';
import { useAppState } from '../../../context/AppStateContext';

// Lazy load the tracker components
const SeismicZoneTracker = lazy(() => import('./SeismicZoneTracker'));
const HeatwaveTracker = lazy(() => import('./HeatwaveTracker'));
const ThunderTracker = lazy(() => import('./ThunderTracker'));
const InondationTracker = lazy(() => import('./InondationTracker'));

interface RiskTrackersWrapperProps {
  map: maplibregl.Map | null;
  isPopupVisible: boolean;
  visible?: boolean;
}

const RiskTrackersWrapper: React.FC<RiskTrackersWrapperProps> = memo(({ map, isPopupVisible, visible = true }) => {
  const { state: { dvfPopupOpen, dvfTransactionListShown } } = useAppState();
  
  // Hide component when DVF popup is open and transaction list is shown
  const shouldHide = dvfPopupOpen && dvfTransactionListShown;

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Position styles based on popup visibility
  const getWrapperStyles = () => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 1,
      transform: shouldHide ? 'translateX(-450px)' : 'translateX(0)',
      opacity: shouldHide ? 0 : 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: shouldHide ? 'none' as const : 'auto' as const,
    };

    if (isPopupVisible) {
      // L-shape formation in bottom-left when popup is visible
      return {
        position: 'absolute' as const,
        bottom: 20,
        left: 20,
        zIndex: 1001,
        ...baseStyles,
      };
    } else {
      // Vertical stack on right side when no popup (normal state)
      return {
        position: 'absolute' as const,
        top: 20,
        right: 20,
        zIndex: 1001,
        ...baseStyles,
      };
    }
  };

  // Individual tracker positioning for L-shape layout
  const getTrackerStyles = (trackerType: 'seismic' | 'heatwave' | 'thunder' | 'inondation') => {
    if (isPopupVisible) {
      switch (trackerType) {
        case 'seismic':
          // Seismic tracker at bottom-left corner of L-shape
          return {
            position: 'relative' as const,
          };
        case 'heatwave':
          // Heatwave tracker above seismic (vertical part of L)
          return {
            position: 'relative' as const,
          };
        case 'inondation':
          // Inondation tracker above heatwave (vertical part of L)
          return {
            position: 'relative' as const,
          };
        case 'thunder':
          // Thunder tracker to the right of seismic (horizontal part of L)
          return {
            position: 'absolute' as const,
            bottom: 0,
            left: 230, // Position to the right of seismic tracker (reduced from 250)
          };
        default:
          return {
            position: 'relative' as const,
          };
      }
    } else {
      // Normal vertical stacking - no individual positioning needed
      return {
        position: 'relative' as const,
      };
    }
  };

  return (
    <Box sx={getWrapperStyles()}>
      <Suspense fallback={<div />}>
        {/* Inondation Tracker - Always rendered first */}
        <Box sx={getTrackerStyles('inondation')}>
          <InondationTracker map={map} />
        </Box>
      </Suspense>

      <Suspense fallback={<div />}>
        {/* Heatwave Tracker - Always rendered second */}
        <Box sx={getTrackerStyles('heatwave')}>
          <HeatwaveTracker map={map} />
        </Box>
      </Suspense>

      <Suspense fallback={<div />}>
        {/* Seismic Tracker - Always rendered third */}
        <Box sx={getTrackerStyles('seismic')}>
          <SeismicZoneTracker map={map} />
        </Box>
      </Suspense>

      <Suspense fallback={<div />}>
        {/* Thunder Tracker - Always rendered fourth */}
        <Box sx={getTrackerStyles('thunder')}>
          <ThunderTracker map={map} />
        </Box>
      </Suspense>
    </Box>
  );
});

RiskTrackersWrapper.displayName = 'RiskTrackersWrapper';

export default RiskTrackersWrapper;
