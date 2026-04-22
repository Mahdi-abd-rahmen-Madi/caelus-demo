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
  // Individual loading states for progressive rendering
  inondationLoading: boolean;
  heatwaveLoading: boolean;
  seismicLoading: boolean;
  thunderLoading: boolean;
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
    lastUpdated: 0,
    inondationLoading: false,
    heatwaveLoading: false,
    seismicLoading: false,
    thunderLoading: false
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

  // Update tracker data with non-blocking async approach and progressive loading
  const updateTrackerData = useCallback((lng: number, lat: number) => {
    if (!hasCoordinatesChanged(lng, lat)) return;

    lastCoordinatesRef.current = { lng, lat };
    
    // Set loading state immediately without blocking
    setTrackerData(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      inondationLoading: true,
      heatwaveLoading: true,
      seismicLoading: true,
      thunderLoading: true
    }));

    // Schedule data fetching during idle time or with delay
    const scheduleDataFetch = () => {
      // Use requestIdleCallback if available, otherwise fallback to setTimeout
      const scheduleCallback = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(callback, { timeout: 2000 });
        } else {
          setTimeout(callback, 100);
        }
      };

      scheduleCallback(async () => {
        try {
          // Start performance tracking
          layerPerformanceMonitor.startLayerLoad('RiskTrackers', 'low');
          
          // Fetch individual tracker data progressively
          const fetchIndividualTracker = async (trackerType: keyof Pick<TrackerData, 'inondation' | 'heatwave' | 'seismic' | 'thunder'>) => {
            try {
              let data: any;
              switch (trackerType) {
                case 'inondation':
                  data = await mapDataCoordinator.fetchInondationData(lng, lat);
                  break;
                case 'heatwave':
                  data = await mapDataCoordinator.fetchHeatwaveData(lng, lat);
                  break;
                case 'seismic':
                  data = await mapDataCoordinator.fetchSeismicData(lng, lat);
                  break;
                case 'thunder':
                  data = await mapDataCoordinator.fetchThunderData(lng, lat);
                  break;
              }
              
              // Update individual tracker state as data arrives
              setTrackerData(prev => ({
                ...prev,
                [trackerType]: data,
                [`${trackerType}Loading`]: false
              }));
            } catch (error) {
              console.error(`Failed to fetch ${trackerType} data:`, error);
              setTrackerData(prev => ({
                ...prev,
                [`${trackerType}Loading`]: false
              }));
            }
          };

          // Fetch all trackers in parallel but update state individually
          await Promise.allSettled([
            fetchIndividualTracker('inondation'),
            fetchIndividualTracker('heatwave'),
            fetchIndividualTracker('seismic'),
            fetchIndividualTracker('thunder')
          ]);
          
          // Mark overall loading as complete
          setTrackerData(prev => ({
            ...prev,
            loading: false,
            lastUpdated: Date.now()
          }));
          
          // End performance tracking
          layerPerformanceMonitor.endLayerLoad('RiskTrackers');
          
          // Log performance summary asynchronously
          setTimeout(() => {
            layerPerformanceMonitor.logSummary();
          }, 1000);
          
        } catch (error) {
          console.error('Failed to fetch tracker data:', error);
          layerPerformanceMonitor.endLayerLoad('RiskTrackers');
          setTrackerData(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            inondationLoading: false,
            heatwaveLoading: false,
            seismicLoading: false,
            thunderLoading: false
          }));
        }
      });
    };

    scheduleDataFetch();
  }, [hasCoordinatesChanged]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((lng: number, lat: number) => {
      updateTrackerData(lng, lat);
    }, 2000), // Increased to 2000ms debounce for better async behavior
    [updateTrackerData]
  );

  // Initialize and handle map movements with delay to prevent blocking other layers
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

      // Use simple timeout instead of requestIdleCallback to prevent blocking
      const scheduleUpdate = () => {
        updateTimeoutRef.current = window.setTimeout(() => {
          debouncedUpdate(lng, lat);
        }, 100);
      };

      scheduleUpdate();
    };

    // Delayed initial load to let parcels and buildings load first
    if (!isInitialized) {
      setIsInitialized(true);
      // Add 1500ms delay before initial tracker load to allow critical layers to render
      setTimeout(() => {
        handleMapMove();
      }, 1500);
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

  // Render individual tracker with data injection and individual loading states
  const renderTracker = (TrackerComponent: React.ComponentType<any>, data: any, trackerType: string) => {
    const isLoading = trackerData[`${trackerType}Loading` as keyof TrackerData] as boolean;
    console.log(`OptimizedTrackersWrapper: Rendering ${trackerType} with data:`, data, 'loading:', isLoading);
    return (
      <Box sx={getTrackerStyles(trackerType as any)}>
        <Suspense fallback={<div />}>
          <TrackerComponent 
            map={map} 
            injectedData={data}
            isLoading={isLoading}
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
