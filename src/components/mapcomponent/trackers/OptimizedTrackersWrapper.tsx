import { Box } from '@mui/material';
import maplibregl from 'maplibre-gl';
import React, { Suspense, lazy, memo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppState } from '../../../context/AppStateContext';
import { mapDataCoordinator } from '../../../services/mapDataCoordinator';
import { layerPerformanceMonitor } from '../../../utils/layerPerformanceMonitor';

// Lazy load the tracker components
const SeismicZoneTracker = lazy(() => import('./SeismicZoneTracker'));
const HeatwaveTracker = lazy(() => import('./HeatwaveTracker'));
const ThunderTracker = lazy(() => import('./ThunderTracker'));
const InondationTracker = lazy(() => import('./InondationTracker'));

interface OptimizedTrackersWrapperProps {
  map: maplibregl.Map | null;
  isPopupVisible: boolean;
  visible?: boolean;
}

interface TrackerData {
  inondation: any;
  heatwave: any;
  seismic: any;
  thunder: any;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

// Debounce utility for map movements
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  }) as T;
};

const OptimizedTrackersWrapper: React.FC<OptimizedTrackersWrapperProps> = memo(({ 
  map, 
  isPopupVisible, 
  visible = true 
}) => {
  const { state: { dvfPopupOpen, dvfTransactionListShown } } = useAppState();
  const [trackerData, setTrackerData] = useState<TrackerData>({
    inondation: null,
    heatwave: null,
    seismic: null,
    thunder: null,
    loading: false,
    error: null,
    lastUpdated: 0
  });

  // Hide component when DVF popup is open and transaction list is shown
  const shouldHide = dvfPopupOpen && dvfTransactionListShown;

  const [isInitialized, setIsInitialized] = useState(false);
  const updateTimeoutRef = useRef<number | null>(null);
  const lastCoordinatesRef = useRef<{ lng: number; lat: number } | null>(null);

  // Check if coordinates have changed significantly
  const hasCoordinatesChanged = useCallback((lng: number, lat: number): boolean => {
    if (!lastCoordinatesRef.current) return true;
    
    const { lng: lastLng, lat: lastLat } = lastCoordinatesRef.current;
    const threshold = 0.001; // ~100m precision
    
    return Math.abs(lng - lastLng) > threshold || Math.abs(lat - lastLat) > threshold;
  }, []);

  // Update tracker data with error handling
  const updateTrackerData = useCallback(async (lng: number, lat: number) => {
    if (!hasCoordinatesChanged(lng, lat)) return;

    lastCoordinatesRef.current = { lng, lat };
    
    // Start performance tracking
    layerPerformanceMonitor.startLayerLoad('RiskTrackers', 'low');
    
    setTrackerData(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await mapDataCoordinator.fetchAllTrackerData(lng, lat);
      
      setTrackerData({
        ...data,
        loading: false,
        error: null,
        lastUpdated: Date.now()
      });
      
      // End performance tracking
      layerPerformanceMonitor.endLayerLoad('RiskTrackers');
      
      // Log performance summary
      setTimeout(() => {
        layerPerformanceMonitor.logSummary();
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch tracker data:', error);
      layerPerformanceMonitor.endLayerLoad('RiskTrackers');
      setTrackerData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [hasCoordinatesChanged]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((lng: number, lat: number) => {
      updateTrackerData(lng, lat);
    }, 2000), // 2000ms debounce
    [updateTrackerData]
  );

  // Initialize and handle map movements
  useEffect(() => {
    if (!map || !visible) return;

    const handleMapMove = () => {
      if (!map || !visible) return;
      
      const center = map.getCenter();
      const lng = center.lng;
      const lat = center.lat;

      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Use requestIdleCallback for non-blocking updates
      const scheduleUpdate = () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            debouncedUpdate(lng, lat);
          }, { timeout: 1000 });
        } else {
          // Fallback for browsers without requestIdleCallback
          updateTimeoutRef.current = window.setTimeout(() => {
            debouncedUpdate(lng, lat);
          }, 100);
        }
      };

      scheduleUpdate();
    };

    // Initial load
    if (!isInitialized) {
      setIsInitialized(true);
      handleMapMove();
    }

    // Listen to map movements
    map.on('moveend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [map, visible, isInitialized, debouncedUpdate]);

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
          return {
            position: 'relative' as const,
          };
        case 'heatwave':
          return {
            position: 'relative' as const,
          };
        case 'inondation':
          return {
            position: 'relative' as const,
          };
        case 'thunder':
          return {
            position: 'absolute' as const,
            bottom: 0,
            left: 230,
          };
        default:
          return {
            position: 'relative' as const,
          };
      }
    } else {
      return {
        position: 'relative' as const,
      };
    }
  };

  // Render individual tracker with data injection
  const renderTracker = (TrackerComponent: React.ComponentType<any>, data: any, trackerType: string) => {
    console.log(`OptimizedTrackersWrapper: Rendering ${trackerType} with data:`, data);
    return (
      <Box sx={getTrackerStyles(trackerType as any)}>
        <Suspense fallback={<div />}>
          <TrackerComponent 
            map={map} 
            injectedData={data}
            isLoading={trackerData.loading}
          />
        </Suspense>
      </Box>
    );
  };

  return (
    <Box sx={getWrapperStyles()}>
      {/* Inondation Tracker */}
      {renderTracker(InondationTracker, trackerData.inondation, 'inondation')}

      {/* Heatwave Tracker */}
      {renderTracker(HeatwaveTracker, trackerData.heatwave, 'heatwave')}

      {/* Seismic Tracker */}
      {renderTracker(SeismicZoneTracker, trackerData.seismic, 'seismic')}

      {/* Thunder Tracker */}
      {renderTracker(ThunderTracker, trackerData.thunder, 'thunder')}
    </Box>
  );
});

OptimizedTrackersWrapper.displayName = 'OptimizedTrackersWrapper';

export default OptimizedTrackersWrapper;
