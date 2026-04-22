import { Box } from '@mui/material';
import { Suspense, lazy, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { useParcelSelectionState } from '../../context/AppStateSelectors';
import { getParcelDetailWithGeorisques } from '../../services/api';
import type { BaseMapType, EnhancedParcelProperties } from '../../types/dashboard';
import { setupProj4 } from '../../utils/mapUtils';
import { performanceMonitor } from '../../utils/performanceMonitor';
import DVFPopup from '../DVFPopup';
import DetailedPopup from '../DetailedPopup';
import DynamicLegend from '../DynamicLegend';
import GeorisqueRapportDownload from '../GeorisqueRapportDownload';
import PageNavigation from '../PageNavigation';
import BufferZone from './BufferZone';
import MobileLayerControl from './LayerControl';
import RadiusCircle from './RadiusCircle';
import RulerTool from './RulerTool';
import { getBaseMapStyle, initializeMaptilerFallback, preloadBasemapTiles, updateBasemapSource } from './basemap';

// Performance optimization utilities
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delay);
  }) as T;
};

const throttle = <T extends (...args: any[]) => any>(fn: T, limit: number): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Lazy load vector layers to reduce initial bundle size
const DemoParcelLayer = lazy(() => import('../DemoParcelLayer'));
const EnedisV2 = lazy(() => import('./enedis-v2/EnedisV2'));
const Canalisations = lazy(() => import('./canalisations/Canalisations'));
const NuclearPopup = lazy(() => import('./nuclear/NuclearPopup'));
const RailwayNetwork = lazy(() => import('./source/railway-network.tsx'));
const SevesoInstallationsVector = lazy(() => import('./icpe/SevesoInstallationsVector'));
const SeismicZones = lazy(() => import('./seismic/SeismicZones'));
const SeismicV1 = lazy(() => import('./seismic/SeismicV1'));
const RiskTrackersWrapper = lazy(() => import('./trackers/OptimizedTrackersWrapper'));
// const CavityIncidents = lazy(() => import('./cavity/CavityIncidents'));  // Removed - cavity functionality no longer needed
// const CavityIncidentsVector = lazy(() => import('./cavity/CavityIncidentsVector'));  // Removed - cavity functionality no longer needed
const InondationV1 = lazy(() => import('./inondation/InondationV1'));
const AleargComponent = lazy(() => import('./alearg/AleargComponent'));
const MvtLocaliseComponent = lazy(() => import('./mvtlocalise/MvtLocaliseComponent'));
const CavitesNonMinieresBRGM = lazy(() => import('./cavites/CavitesNonMinieresBRGM'));
const PprnPerimetreInond = lazy(() => import('./pprn/PprnPerimetreInond'));
const PprnSeisme = lazy(() => import('./pprn/PprnSeisme'));
const RTE = lazy(() => import('./rte/RTE'));
const SspClassificationSis = lazy(() => import('./ssp/SspClassificationSis'));
const SspInstruction = lazy(() => import('./ssp/SspInstruction'));
const SspEtablissement = lazy(() => import('./ssp/SspEtablissement'));
const Plu = lazy(() => import('./plu/Plu'));
const PCIParcels = lazy(() => import('./plu/PCIParcels'));
const BDTOPO = lazy(() => import('./plu/BDTOPO'));
const IndustrialInstallations = lazy(() => import('./IndustrialInstallations'));
const PinMarker = lazy(() => import('./PinMarker'));

// Helper functions for map view persistence
const MAP_STORAGE_KEY = 'caelus_map_view';

interface MapViewState {
  center: [number, number];
  zoom: number;
  basemap: BaseMapType;
}

const getStoredMapView = (): Partial<MapViewState> => {
  try {
    const stored = localStorage.getItem(MAP_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
  }
  return {};
};

const saveMapView = (view: Partial<MapViewState>) => {
  try {
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(view));
  } catch (error) {
  }
};

interface MapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  onLoad?: (map: maplibregl.Map) => void;
  radius?: number;
  location?: [number, number];
  isPinMode?: boolean;
  onPinDrop?: (lng: number, lat: number) => void;
  pinLocation?: {
    lng: number;
    lat: number;
    isValid?: boolean;
  } | null;
  hasSearched?: boolean;
  // Ruler and Buffer Zone props
  showRulerTool?: boolean;
  showBufferZone?: boolean;
  bufferRadius?: number;
  bufferCenter?: [number, number];
  onBufferCenterChange?: (center: [number, number]) => void;
}

export const MapComponent = ({
  center = [4.7866, 43.9267], // Exact location specified
  zoom = 14, // Zoom level to show both WMS parcels (14+) and buildings (12+) on initial load
  onLoad,
  radius = 10,
  location = center,
  isPinMode = false,
  onPinDrop,
  pinLocation,
  hasSearched = false,
  showRulerTool = false,
  showBufferZone = false,
  bufferRadius = 1000,
  bufferCenter = [0, 0],
  onBufferCenterChange
}: MapProps) => {
  // Start performance monitoring
  useEffect(() => {
    performanceMonitor.startMonitoring();
  }, []);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [maplibregl, setMaplibregl] = useState<any>(null);

  // Dynamically import maplibre-gl
  useEffect(() => {
    import('maplibre-gl').then((module) => {
      setMaplibregl(module.default || module);
    }).catch((_err) => {
    });
  }, []);

  // Layer control state combined for better performance
  const [mapState, setMapState] = useState({
    internalSelectedBaseMap: 'maptiler-satellite' as BaseMapType,
    // Enedis V2 state
    showEnedisV2Network: false,
    enedisV2Layers: {
      posteElectrique: false,
      posteSource: false,
      poteauElectrique: false,
      htaLines: false,
      btLines: false,
      htaLinesUnderground: false,
      btLinesUnderground: false
    },
    // Canalisations state
    showCanalisationsNetwork: false,
    showIndustrialInstallations: false,
    showRailwayNetwork: false,
    icpeFilters: {
      '1': true, // Seuil Haut
      '2': true, // Seuil Bas
      '3': false // Non Seveso - hidden by default
    },
    showSeismicZones: false,
    showSeismicV1: false,
    // seismicZoneFilters removed - WMS shows all zones by default
    // Vector tile versions for testing
    showInondationV1: false,
    showAlearg: false,
    showMvtLocalise: false,
    showSevesoInstallationsVector: false,
    showCavitesNonMinieresBRGM: false,
    showPprnPerimetreInond: false,
    showPprnSeisme: false,
    // SSP (Sites et Sols Pollués) state
    showSspClassificationSis: false,
    showSspInstruction: false,
    showSspEtablissement: false,
    // RTE Network state
    rteTensionMode: false,
    rteLayers: {
      aerien: false,  // Start false, will be enabled when network is toggled
      souterrain: false,
      voltageRange: [45, 400] as [number, number]
    },
    // PLU state
    showPluNetwork: false,
    pluLayers: {
      'zoning-sectors': false,
      'prescriptions': false,
      'information': false
    },
    // Dynamic MVT Simple state
    showDynamicMVTSimple: true,
    // IGN Vector Layers state
    showPCINetwork: true,
    pciLayers: {
      main: true
    },
    showBDTOPONetwork: true,
    bdtopoLayers: {
      buildings: true
    },
    showMVTPopup: false,
    showICPEPopup: false,
    showNuclearPopup: false,
    showRiskTrackers: true,
    // Ruler and Buffer Zone state - initialize with props
    showRulerTool: showRulerTool,
    showBufferZone: showBufferZone,
    bufferRadius: bufferRadius,
    bufferCenter: bufferCenter,
    center: center as [number, number],
    zoom: zoom
  });

  // Update map state when props change
  useEffect(() => {
    setMapState(prev => ({
      ...prev,
      showRulerTool: showRulerTool,
      showBufferZone: showBufferZone,
      bufferRadius: bufferRadius,
      bufferCenter: bufferCenter
    }));
  }, [showRulerTool, showBufferZone, bufferRadius, bufferCenter]);

  // Use parcel selection state from new context
  const { selectedParcel } = useParcelSelectionState();
  const { selectParcel, clearParcelSelection } = useAppState();
  const [legendHiddenByPopups, setLegendHiddenByPopups] = useState(false);
  const [selectedNuclearReactor, setSelectedNuclearReactor] = useState<any>(null);
  const gracePeriodTimerRef = useRef<number | null>(null);

  // Memoized state setters to prevent unnecessary re-renders
  const updateMapState = useCallback((updates: Partial<typeof mapState>) => {
    setMapState(prev => {
      const newState = { ...prev, ...updates };
      return newState;
    });
  }, []);

  // Grace period logic for legend visibility
  useEffect(() => {
    const areDetailPopupsVisible = !!selectedParcel;

    if (areDetailPopupsVisible) {
      // Hide legend immediately when popups are shown
      setLegendHiddenByPopups(true);

      // Clear any existing grace period timer
      if (gracePeriodTimerRef.current) {
        window.clearTimeout(gracePeriodTimerRef.current);
        gracePeriodTimerRef.current = null;
      }
    } else {
      // Start grace period timer when popups are hidden
      if (gracePeriodTimerRef.current) {
        window.clearTimeout(gracePeriodTimerRef.current);
      }

      gracePeriodTimerRef.current = window.setTimeout(() => {
        setLegendHiddenByPopups(false);
        gracePeriodTimerRef.current = null;
      }, 2000); // 2 second grace period
    }

    // Cleanup function
    return () => {
      if (gracePeriodTimerRef.current) {
        window.clearTimeout(gracePeriodTimerRef.current);
        gracePeriodTimerRef.current = null;
      }
    };
  }, [selectedParcel]);

  // Hide popups when map moves
  useEffect(() => {
    if (!map.current) return;

    const handleMapMove = () => {
      // Hide all popups when map moves
      setSelectedNuclearReactor(null);
      updateMapState({
        showICPEPopup: false,
        showNuclearPopup: false,
        showMVTPopup: false,
      });
    };

    map.current.on('movestart', handleMapMove);
    map.current.on('zoomstart', handleMapMove);

    return () => {
      if (map.current) {
        map.current.off('movestart', handleMapMove);
        map.current.off('zoomstart', handleMapMove);
      }
    };
  }, [map.current, updateMapState]);

  // Helper function to determine if we're in an active search state - memoized
  const isActiveSearch = useMemo(() => {
    // Require hasSearched flag to be true for any search to be considered active
    if (!hasSearched) {
      return false;
    }

    // Check if pin is dropped
    if (pinLocation) {
      return true;
    }

    // Check if location is different from default and radius is meaningful
    const defaultLocation = [2.2137, 46.2276]; // From DashboardContext
    const isLocationDifferent = Math.abs(location[0] - defaultLocation[0]) > 0.001 ||
      Math.abs(location[1] - defaultLocation[1]) > 0.001;

    const activeSearch = isLocationDifferent && radius > 0;

    return activeSearch;
  }, [hasSearched, pinLocation, location, radius]);

  // Memoized paint properties to prevent object recreation
  const paintProperties = useCallback(() => ({
    fillColor: '#e74c3c',
    fillOpacity: 0.7,
    fillOutlineColor: '#c0392b'
  }), []);

  // Load stored view state asynchronously to prevent blocking
  useEffect(() => {
    const storedView = getStoredMapView();
    if (Object.keys(storedView).length > 0) {
      updateMapState({
        internalSelectedBaseMap: storedView.basemap || 'maptiler-satellite',
        center: storedView.center || center,
        zoom: storedView.zoom || zoom
      });
    }
  }, [updateMapState]);

  // Performance-optimized debounced map movement persistence
  const saveCurrentView = useCallback(
    debounce(() => {
      if (map.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        saveMapView({
          center: [center.lng, center.lat],
          zoom: zoom
        });
      }
    }, 300),
    []
  );

  // Performance-optimized base map change handler using dynamic source updates
  const handleBaseMapChange = useCallback((value: BaseMapType) => {
    try {
      updateMapState({ internalSelectedBaseMap: value });
      saveMapView({ basemap: value });
      if (map.current &&
        map.current.isStyleLoaded &&
        map.current.isStyleLoaded() &&
        typeof map.current.getSource === 'function') {
        // Update basemap source dynamically without changing entire style
        updateBasemapSource(map.current, value);

        // Preload tiles for the new basemap around current viewport
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        preloadBasemapTiles(value, center, zoom).catch(() => { });
      }
    } catch (err) {
    }
  }, [updateMapState]);


  const handleParcelClick = useCallback(async (properties: any) => {

    // Helper function to extract coordinates from geometry if properties are undefined
    const extractCoordinatesFromGeometry = (props: any): { longitude: number | null; latitude: number | null } => {
      // First try to use longitude/latitude format (from GeoJSON and detail endpoints)
      if (props.longitude !== null && props.longitude !== undefined &&
        props.latitude !== null && props.latitude !== undefined &&
        !isNaN(props.longitude) && !isNaN(props.latitude) &&
        isFinite(props.longitude) && isFinite(props.latitude)) {
        return {
          longitude: props.longitude,
          latitude: props.latitude
        };
      }

      // Fallback: try centroid.lng/lat format (from highest-score endpoint)
      if (props.centroid && props.centroid.lng !== null && props.centroid.lng !== undefined &&
        props.centroid.lat !== null && props.centroid.lat !== undefined &&
        !isNaN(props.centroid.lng) && !isNaN(props.centroid.lat) &&
        isFinite(props.centroid.lng) && isFinite(props.centroid.lat)) {
        return {
          longitude: props.centroid.lng,
          latitude: props.centroid.lat
        };
      }

      // Log issue and return null

      return {
        longitude: null,
        latitude: null
      };
    };

    // Extract coordinates with fallback
    const { longitude, latitude } = extractCoordinatesFromGeometry(properties);

    // Convert the clicked parcel to EnhancedParcelProperties first
    const basicParcel: EnhancedParcelProperties & { longitude: number; latitude: number } = {
      ...properties,
      // Use extracted coordinates (will be null if invalid, but we handle this later)
      longitude: longitude || 0,
      latitude: latitude || 0,
      // Ensure required fields
      plu_zone_code: properties.plu_zone_code || '',
      plu_zone_type: properties.plu_zone_type,
      // Georisques data
      georisques_data: properties.georisques_data,
      // Infrastructure distances
      nearest_enedis_distance_m: properties.nearest_enedis_distance_m || 0,
      nearest_hta_souterrain_distance_m: properties.nearest_hta_souterrain_distance_m || null,
      nearest_railway_distance_m: properties.nearest_railway_distance_m || 0,
    };

    // Select the parcel immediately with basic data
    selectParcel(basicParcel);

    // Fetch enhanced parcel data in the background
    try {
      const detailedParcel = await getParcelDetailWithGeorisques(properties.parcel_id);

      // Update to selected parcel with enhanced data
      if (detailedParcel && detailedParcel.parcel_id) {
        const enhancedParcel: EnhancedParcelProperties & { longitude: number; latitude: number } = {
          ...detailedParcel,
          // Use extracted coordinates as fallback if detailed parcel coordinates are invalid
          longitude: (detailedParcel.longitude && detailedParcel.latitude &&
            !isNaN(detailedParcel.longitude) && !isNaN(detailedParcel.latitude) &&
            isFinite(detailedParcel.longitude) && isFinite(detailedParcel.longitude))
            ? detailedParcel.longitude : (longitude || 0),
          latitude: (detailedParcel.latitude && detailedParcel.longitude &&
            !isNaN(detailedParcel.latitude) && !isNaN(detailedParcel.latitude) &&
            isFinite(detailedParcel.latitude) && isFinite(detailedParcel.longitude))
            ? detailedParcel.latitude : (latitude || 0),
          // Ensure all required fields are present
          plu_zone_code: detailedParcel.plu_zone_code || basicParcel.plu_zone_code || '',
          plu_zone_type: detailedParcel.plu_zone_type || basicParcel.plu_zone_type,
          // Georisques data
          georisques_data: detailedParcel.georisques_data || basicParcel.georisques_data,
        };

      // Update the selected parcel with enhanced data
        selectParcel(enhancedParcel);
      }
    } catch (error) {
      // Keep using the basic parcel data if detailed fetch fails
    }

    // Center the map on the clicked parcel
    // Use the extracted coordinates (already validated in extractCoordinatesFromGeometry)
    if (map.current && longitude !== null && latitude !== null) {
      map.current.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(map.current.getZoom(), 15), // Ensure we're zoomed in enough to see the parcel
        speed: 1.5,
        curve: 1.2,
        essential: true
      });
    } else {
    }
  }, [selectParcel]);

  const handlePopupClose = useCallback(() => {
    clearParcelSelection();
  }, [clearParcelSelection]);


  const handleICPEPopupVisibilityChange = useCallback((visible: boolean) => {
    setMapState(prev => ({ ...prev, showICPEPopup: visible }));
  }, []);

  const handleNuclearPopupVisibilityChange = useCallback((visible: boolean) => {
    setMapState(prev => ({ ...prev, showNuclearPopup: visible }));
  }, [setMapState]);


  // Enedis V2 handlers
  const handleEnedisV2NetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showEnedisV2Network: visible });
  }, [updateMapState]);

  const handleEnedisV2LayerToggle = useCallback((layer: string, visible: boolean) => {
    updateMapState({
      enedisV2Layers: {
        ...mapState.enedisV2Layers,
        [layer]: visible
      }
    });
  }, [updateMapState, mapState.enedisV2Layers]);

  // Canalisations handlers
  const handleCanalisationsNetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showCanalisationsNetwork: visible });
  }, [updateMapState]);

  const handleIndustrialInstallationsToggle = useCallback((visible: boolean) => {
    updateMapState({ showIndustrialInstallations: visible });
  }, [updateMapState]);

  // Railway network handler
  const handleRailwayNetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showRailwayNetwork: visible });
  }, [updateMapState]);

  // Dynamic MVT Simple handlers
  const handleDynamicMVTSimpleToggle = useCallback((visible: boolean) => {
    updateMapState({ showDynamicMVTSimple: visible });
  }, [updateMapState]);

  // PLU handlers
  const handlePluNetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showPluNetwork: visible });
  }, [updateMapState]);

  const handlePluLayerToggle = useCallback((layer: string, visible: boolean) => {
    updateMapState({
      pluLayers: {
        ...mapState.pluLayers,
        [layer]: visible
      }
    });
  }, [updateMapState, mapState.pluLayers]);

  // RTE Network handlers
  const handleRTETensionModeToggle = useCallback((visible: boolean) => {
    updateMapState({
      rteTensionMode: visible,
      rteLayers: {
        ...mapState.rteLayers,
        aerien: visible,
        souterrain: visible
      }
    });
  }, [updateMapState, mapState.rteLayers]);

  // IGN Vector Layers handlers
  const handlePCINetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showPCINetwork: visible });
  }, [updateMapState]);

  const handlePCILayerToggle = useCallback((layer: string, visible: boolean) => {
    updateMapState({
      pciLayers: {
        ...mapState.pciLayers,
        [layer]: visible
      }
    });
  }, [updateMapState, mapState.pciLayers]);

  const handleBDTOPONetworkToggle = useCallback((visible: boolean) => {
    updateMapState({ showBDTOPONetwork: visible });
  }, [updateMapState]);

  const handleBDTOPOLayerToggle = useCallback((layer: string, visible: boolean) => {
    updateMapState({
      bdtopoLayers: {
        ...mapState.bdtopoLayers,
        [layer]: visible
      }
    });
  }, [updateMapState, mapState.bdtopoLayers]);

  // Risk Trackers handler
  const handleRiskTrackersToggle = useCallback((visible: boolean) => {
    updateMapState({ showRiskTrackers: visible });
  }, [updateMapState]);



  const handleICPEFilterToggle = useCallback((classification: string, visible: boolean) => {
    setMapState(prevState => ({
      ...prevState,
      icpeFilters: {
        ...prevState.icpeFilters,
        [classification]: visible
      }
    }));
  }, []);

  const handleSeismicZonesToggle = useCallback((visible: boolean) => {
    updateMapState({
      showSeismicZones: visible
    });
  }, [updateMapState]);

  const handleSeismicV1Toggle = useCallback((visible: boolean) => {
    updateMapState({
      showSeismicV1: visible
    });
  }, [updateMapState]);

  // handleSeismicZoneFilterToggle removed - WMS shows all zones by default



  // Vector tile handlers for testing


  const handleSevesoInstallationsVectorToggle = useCallback((visible: boolean) => {
    updateMapState({
      showSevesoInstallationsVector: visible
    });
  }, []);


  const handleInondationV1Toggle = useCallback((visible: boolean) => {
    updateMapState({
      showInondationV1: visible
    });
  }, [updateMapState]);

  const handleAleargToggle = useCallback((visible: boolean) => {
    updateMapState({
      showAlearg: visible
    });
  }, [updateMapState]);

  const handleMvtLocaliseToggle = useCallback((visible: boolean) => {
    updateMapState({
      showMvtLocalise: visible
    });
  }, [updateMapState]);

  const handleCavitesNonMinieresBRGMToggle = useCallback((visible: boolean) => {
    updateMapState({
      showCavitesNonMinieresBRGM: visible
    });
  }, [updateMapState]);


  const handleSspClassificationSisToggle = useCallback((visible: boolean) => {
    updateMapState({
      showSspClassificationSis: visible
    });
  }, [updateMapState]);

  const handleSspInstructionToggle = useCallback((visible: boolean) => {
    updateMapState({
      showSspInstruction: visible
    });
  }, [updateMapState]);

  const handleSspEtablissementToggle = useCallback((visible: boolean) => {
    updateMapState({
      showSspEtablissement: visible
    });
  }, [updateMapState]);

  const handlePprnPerimetreInondToggle = useCallback((visible: boolean) => {
    updateMapState({
      showPprnPerimetreInond: visible
    });
  }, [updateMapState]);

  const handlePprnSeismeToggle = useCallback((visible: boolean) => {
    updateMapState({
      showPprnSeisme: visible
    });
  }, [updateMapState]);


  const handleBufferRadiusChange = useCallback((radius: number) => {
    updateMapState({ bufferRadius: radius });
  }, [updateMapState]);


  // Handle pin mode cursor changes
  useEffect(() => {
    if (map.current) {
      if (isPinMode) {
        map.current.getCanvas().style.cursor = 'crosshair';
      } else {
        map.current.getCanvas().style.cursor = '';
      }
    }
  }, [isPinMode]);

  // Handle pin drop clicks
  useEffect(() => {
    if (!map.current || !onPinDrop || !isPinMode) {
      return;
    }

    const handlePinClick = (e: any) => {
      // Prevent the event from propagating to other handlers
      if (e.originalEvent) {
        e.originalEvent.stopPropagation();
      }
      const { lng, lat } = e.lngLat;
      onPinDrop(lng, lat);
    };

    // Add the pin click handler
    map.current.on('click', handlePinClick);

    return () => {
      if (map.current) {
        map.current.off('click', handlePinClick);
      }
    };
  }, [isPinMode, onPinDrop]);


  // Consolidated initialization effect
  useEffect(() => {
    // Initialize MapTiler fallback handling and proj4
    initializeMaptilerFallback();
    setupProj4().catch(() => { });
  }, []);

  useEffect(() => {
    if (!maplibregl || map.current || !mapContainer.current) return;

    // Defer map creation to prevent blocking
    const createMap = () => {
      // Additional container validation
      if (!mapContainer.current || !(mapContainer.current instanceof HTMLElement)) {
        return;
      }

      try {
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: getBaseMapStyle(),
          center: mapState.center,
          zoom: mapState.zoom,
          maxBounds: [
            [4.8059 - 0.18, 43.9493 - 0.18], // Southwest corner (approx 20km from Avignon center)
            [4.8059 + 0.18, 43.9493 + 0.18]  // Northeast corner (approx 20km from Avignon center)
          ],
        });
      } catch (error) {
        return;
      }

      // NavigationControl removed to allow LayerControl positioning

      // Optimized move event listener using throttled updates
      map.current.on('moveend', throttle(() => {
        saveCurrentView();
      }, 200));

      // Add global map click listener
      map.current.on('click', (_e: any) => {
        // Handle pin mode clicks
      });

      // Add canvas click listener
      if (map.current.getCanvas()) {
        map.current.getCanvas().addEventListener('click', (_e: any) => {
          // Handle canvas clicks
        });
      }

      if (onLoad && map.current) {
        map.current.on('load', () => {
          if (onLoad) onLoad(map.current!);

          // Set initial basemap using dynamic source update
          // Ensure map is fully loaded before updating basemap
          if (map.current && map.current.isStyleLoaded && map.current.isStyleLoaded()) {
            updateBasemapSource(map.current, mapState.internalSelectedBaseMap);
          }

          // WMS preconnection is now initialized in App component for earlier performance

          // Record initial map load performance
          performanceMonitor.recordSnapshot({
            tileLoadTime: performance.now(),
            renderFrameRate: 60
          });

          // Preload initial tiles for default basemap
          preloadBasemapTiles(mapState.internalSelectedBaseMap, { lng: mapState.center[0], lat: mapState.center[1] }, mapState.zoom).catch(() => { });
        });
      }
    };

    // Use requestIdleCallback or setTimeout to defer map creation
    if (window.requestIdleCallback) {
      window.requestIdleCallback(createMap, { timeout: 100 });
    } else {
      setTimeout(createMap, 0);
    }

    return () => {
      // Cleanup map instance
      map.current?.remove();
      map.current = null;
    };
  }, [maplibregl, mapState.center, mapState.zoom, onLoad, mapState.internalSelectedBaseMap]);

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          position: 'absolute',
          top: 0,
          left: 0, // Positioned relative to the constrained dashboard container
          width: '100%', // Now takes full width of the constrained container
          height: '100%',
          minHeight: '100%',
          backgroundColor: '#f0f0f0', // Temporary background to check visibility
          margin: 0,
          padding: 0
        }}
      />

      {/* Radius Circle - shows search area */}
      <RadiusCircle
        map={map.current}
        center={pinLocation ? [pinLocation.lng, pinLocation.lat] : location}
        radius={radius}
        visible={isActiveSearch} // Use proper visibility logic
        hasSearched={hasSearched}
      />

      {/* Pin Marker */}
      <Suspense fallback={
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      }>
        {pinLocation && (
          <PinMarker
            map={map.current}
            lng={pinLocation.lng}
            lat={pinLocation.lat}
            isValid={pinLocation.isValid}
          />
        )}
      </Suspense>

      {/* Critical Priority Layers - Load Immediately */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Seismic Zones Layer - Rendered first (behind all other layers) */}
          <SeismicZones
            map={map.current}
            visible={mapState.showSeismicZones}
            opacity={0.7}
            onSeismicClick={(_properties) => {
            }}
          />
        </div>
      </Suspense>

      {/* Critical Priority - Parcel Layer */}
      <Suspense fallback={
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      }>
        {mapState.showDynamicMVTSimple && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <DemoParcelLayer
              map={map.current}
              visible={true}
              onParcelClick={handleParcelClick}
              paintProperties={paintProperties()}
            />
          </div>
        )}
      </Suspense>

      {/* High Priority WMS Layers - Load with 100ms delay */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SeismicV1
            map={map.current}
            visible={mapState.showSeismicV1}
            opacity={0.7}
            onFeatureClick={(_properties) => {
            }}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <InondationV1
            map={map.current}
            visible={mapState.showInondationV1}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <AleargComponent
            map={map.current}
            visible={mapState.showAlearg}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <MvtLocaliseComponent
            map={map.current}
            visible={mapState.showMvtLocalise}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <CavitesNonMinieresBRGM
            map={map.current}
            visible={mapState.showCavitesNonMinieresBRGM}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SspClassificationSis
            map={map.current}
            visible={mapState.showSspClassificationSis}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SspInstruction
            map={map.current}
            visible={mapState.showSspInstruction}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SspEtablissement
            map={map.current}
            visible={mapState.showSspEtablissement}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <PprnPerimetreInond
            map={map.current}
            visible={mapState.showPprnPerimetreInond}
            opacity={0.7}
          />
        </div>
      </Suspense>

      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <PprnSeisme
            map={map.current}
            visible={mapState.showPprnSeisme}
            opacity={0.7}
          />
        </div>
      </Suspense>

      {/* PLU Urban Planning Layers */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <Plu
            map={map.current}
            visible={mapState.showPluNetwork}
            pluLayers={mapState.pluLayers}
            opacity={0.7}
            onLoadingChange={() => {
            }}
            onLoadError={() => {
            }}
            onFeatureClick={() => {
            }}
          />
        </div>
      </Suspense>

      {/* IGN Vector Layers */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <PCIParcels
            map={map.current}
            visible={mapState.showPCINetwork}
            pciLayers={mapState.pciLayers}
            opacity={0.7}
            minZoom={14}
            maxZoom={20}
            onLoadError={() => {
            }}
            onFeatureClick={() => {
            }}
          />
          <BDTOPO
            map={map.current}
            visible={mapState.showBDTOPONetwork}
            bdtopoLayers={mapState.bdtopoLayers}
            opacity={0.7}
            minZoom={12}
            maxZoom={20}
            onLoadError={() => {
            }}
            onFeatureClick={() => {
            }}
          />
        </div>
      </Suspense>

      {/* Parcel Layer - using Dynamic MVT vector tiles by default */}
      <Suspense fallback={
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      }>
        {mapState.showDynamicMVTSimple && (
          <DemoParcelLayer
            map={map.current}
            visible={true}
            onParcelClick={handleParcelClick}
            paintProperties={paintProperties()}
          />
        )}
      </Suspense>

      {/* Enedis V2 Layer */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <EnedisV2
            map={map.current}
            visible={mapState.showEnedisV2Network}
            layers={mapState.enedisV2Layers}
            opacity={0.7}
            onLoadingChange={() => {
            }}
            onLoadError={() => {
            }}
            onFeatureClick={() => {
              // You can add popup or detail view logic here
            }}
          />
        </div>
      </Suspense>

      {/* Canalisations Layer */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <Canalisations
            map={map.current}
            visible={mapState.showCanalisationsNetwork}
            opacity={0.7}
            onLoadingChange={() => {
            }}
            onLoadError={() => {
            }}
            onFeatureClick={() => {
              // You can add popup or detail view logic here
            }}
          />
        </div>
      </Suspense>

      {/* Industrial Installations Layer */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <IndustrialInstallations
            map={map.current}
            visible={mapState.showIndustrialInstallations}
            opacity={0.7}
            onLoadingChange={(_loading: boolean) => {
            }}
            onLoadError={(_error: string) => {
            }}
            onFeatureClick={(_feature: any) => {
              // You can add popup or detail view logic here
            }}
          />
        </div>
      </Suspense>


      {/* Cavity components removed - cavity functionality no longer needed */}

      {/* Seveso Installations Vector Layer (Testing) */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <SevesoInstallationsVector
            map={map.current}
            visible={mapState.showSevesoInstallationsVector}
            opacity={1.0}
            icpeFilters={mapState.icpeFilters}
            onSevesoClick={(_properties: any) => {
              // You can add popup or detail view logic here
            }}
            onICPEPopupVisibilityChange={handleICPEPopupVisibilityChange}
          />
        </div>
      </Suspense>

      {/* RTE Network Layer */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <RTE
            map={map.current}
            visible={mapState.rteTensionMode}
            layers={mapState.rteLayers}
            tensionMode={true}
            opacity={0.7}
            onLoadingChange={() => {
              // You can add loading state handling here
            }}
            onLoadError={() => {
              // You can add error handling here
            }}
            onFeatureClick={() => {
              // You can add popup or detail view logic here
            }}
          />
        </div>
      </Suspense>

      {/* Railway Network Layer */}
      <Suspense fallback={<div />}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <RailwayNetwork
            map={map.current}
            visible={mapState.showRailwayNetwork}
            opacity={1.0}
            onTileLoad={(_event: any) => {
              // Railway network loaded
            }}
            onRailwayClick={(_event: any) => {
              // Railway clicked - add popup or detail view logic here
            }}
          />
        </div>
      </Suspense>

      {/* Risk Trackers Wrapper - Handles positioning based on popup state */}
      <Suspense fallback={<div />}>
        <RiskTrackersWrapper
          map={map.current}
          isPopupVisible={!!selectedParcel}
          visible={mapState.showRiskTrackers}
        />
      </Suspense>

      {/* Detailed Popup */}
      {
        selectedParcel && (
          <Box
            sx={{
              position: 'absolute',
              top: 5, // Position closer to top
              right: 5, // Adjusted from 140 to account for constrained map width
              zIndex: 1000,
              maxWidth: 400
            }}
          >
            <DetailedPopup
              properties={selectedParcel}
              onClose={handlePopupClose}
            />
          </Box>
        )
      }

      
      {/* DVF Popup */}
      <DVFPopup
        parcelId={selectedParcel?.parcel_id}
        onResetParcel={clearParcelSelection}
      />

      {/* Nuclear Popup */}
      {
        selectedNuclearReactor && (
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 20,
              zIndex: 1000,
              maxWidth: 400
            }}
          >
            <Suspense fallback={<div />}>
              <NuclearPopup
                reactor={selectedNuclearReactor}
                onClose={() => {
                  setSelectedNuclearReactor(null);
                  handleNuclearPopupVisibilityChange(false);
                }}
              />
            </Suspense>
          </Box>
        )
      }

      {/* Dynamic Legend */}
      {
        !legendHiddenByPopups &&
        !mapState.showMVTPopup &&
        !mapState.showICPEPopup &&
        !mapState.showNuclearPopup && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: 20, // Reset to 20px since map is now constrained
              zIndex: 1000
            }}
          >
            <DynamicLegend
              showSevesoInstallations={mapState.showSevesoInstallationsVector}
              showSeismicZones={mapState.showSeismicZones}
              showInondationV1={mapState.showInondationV1}
              showAlearg={mapState.showAlearg}
              showMvtLocalise={mapState.showMvtLocalise}
              showCavitesNonMinieresBRGM={mapState.showCavitesNonMinieresBRGM}
              showCanalisationsNetwork={mapState.showCanalisationsNetwork}
              showIndustrialInstallations={mapState.showIndustrialInstallations}
              showSspEtablissement={mapState.showSspEtablissement}
              showSspClassificationSis={mapState.showSspClassificationSis}
              showSspInstruction={mapState.showSspInstruction}
              showPluInformation={mapState.showPluNetwork && mapState.pluLayers['information']}
              showPluZoning={mapState.showPluNetwork && mapState.pluLayers['zoning-sectors']}
              showPluPrescriptions={mapState.showPluNetwork && mapState.pluLayers['prescriptions']}
              showPprnPerimetreInond={mapState.showPprnPerimetreInond}
              showPprnSeisme={mapState.showPprnSeisme}
              showSeismicV1={mapState.showSeismicV1}
            />
          </Box>
        )
      }

      {/* Page Navigation */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20, // Reset to 20px since map is now constrained
          zIndex: 1000
        }}
      >
        <PageNavigation />
      </Box>

      {/* Ruler Tool */}
      <RulerTool
        map={map.current}
        enabled={mapState.showRulerTool}
        onMeasurementComplete={(_measurements: any) => {
        }}
      />

      {/* Buffer Zone */}
      <BufferZone
        map={map.current}
        center={bufferCenter}
        radius={mapState.bufferRadius}
        visible={mapState.showBufferZone}
        onRadiusChange={handleBufferRadiusChange}
        onCenterChange={onBufferCenterChange}
      />

      <div
        id="commune-tooltip"
        style={{
          position: 'absolute',
          display: 'none',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />

      <div
        id="seismic-tooltip"
        style={{
          position: 'absolute',
          display: 'none',
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 1000
        }}
      />

      {/* Layer Control - Direct Integration */}
      <MobileLayerControl
        internalSelectedBaseMap={mapState.internalSelectedBaseMap}
        currentZoom={mapState.zoom}
        showRailwayNetwork={mapState.showRailwayNetwork}
        // Enedis V2 props
        showEnedisV2Network={mapState.showEnedisV2Network}
        enedisV2Layers={mapState.enedisV2Layers}
        // Canalisations props
        showCanalisationsNetwork={mapState.showCanalisationsNetwork}
        showIndustrialInstallations={mapState.showIndustrialInstallations}
        icpeFilters={mapState.icpeFilters}
        showSeismicZones={mapState.showSeismicZones}
        showSeismicV1={mapState.showSeismicV1}
        // seismicZoneFilters removed - WMS shows all zones by default
        // Vector tile versions for testing
        showSevesoInstallationsVector={mapState.showSevesoInstallationsVector}
        showInondationV1={mapState.showInondationV1}
        showAlearg={mapState.showAlearg}
        showMvtLocalise={mapState.showMvtLocalise}
        showCavitesNonMinieresBRGM={mapState.showCavitesNonMinieresBRGM}
        showPprnPerimetreInond={mapState.showPprnPerimetreInond}
        showPprnSeisme={mapState.showPprnSeisme}
        // SSP props
        showSspClassificationSis={mapState.showSspClassificationSis}
        showSspInstruction={mapState.showSspInstruction}
        showSspEtablissement={mapState.showSspEtablissement}
        // RTE Network props
        rteTensionMode={mapState.rteTensionMode}
        // Dynamic MVT Simple props
        showDynamicMVTSimple={mapState.showDynamicMVTSimple}
        // PLU props
        showPluNetwork={mapState.showPluNetwork}
        pluLayers={mapState.pluLayers}
        // IGN Vector Layers props
        showPCINetwork={mapState.showPCINetwork}
        pciLayers={mapState.pciLayers}
        showBDTOPONetwork={mapState.showBDTOPONetwork}
        bdtopoLayers={mapState.bdtopoLayers}
        // Risk Trackers props
        showRiskTrackers={mapState.showRiskTrackers}
        onBaseMapChange={handleBaseMapChange}
        onRailwayNetworkToggle={handleRailwayNetworkToggle}
        // Enedis V2 handlers
        onEnedisV2NetworkToggle={handleEnedisV2NetworkToggle}
        onEnedisV2LayerToggle={handleEnedisV2LayerToggle}
        // Canalisations handlers
        onCanalisationsNetworkToggle={handleCanalisationsNetworkToggle}
        onIndustrialInstallationsToggle={handleIndustrialInstallationsToggle}
        onSevesoInstallationsVectorToggle={handleSevesoInstallationsVectorToggle}
        onICPEFilterToggle={handleICPEFilterToggle}
        onSeismicZonesToggle={handleSeismicZonesToggle}
        onSeismicV1Toggle={handleSeismicV1Toggle}
        onInondationV1Toggle={handleInondationV1Toggle}
        onAleargToggle={handleAleargToggle}
        onMvtLocaliseToggle={handleMvtLocaliseToggle}
        onCavitesNonMinieresBRGMToggle={handleCavitesNonMinieresBRGMToggle}
        // SSP handlers
        onSspClassificationSisToggle={handleSspClassificationSisToggle}
        onSspInstructionToggle={handleSspInstructionToggle}
        onSspEtablissementToggle={handleSspEtablissementToggle}
        onPprnPerimetreInondToggle={handlePprnPerimetreInondToggle}
        onPprnSeismeToggle={handlePprnSeismeToggle}
        // RTE Network handlers
        onRTETensionModeToggle={handleRTETensionModeToggle}
        // Dynamic MVT Simple handlers
        onDynamicMVTSimpleToggle={handleDynamicMVTSimpleToggle}
        // PLU handlers
        onPluNetworkToggle={handlePluNetworkToggle}
        onPluLayerToggle={handlePluLayerToggle}
        // IGN Vector Layers handlers
        onPCINetworkToggle={handlePCINetworkToggle}
        onPCILayerToggle={handlePCILayerToggle}
        onBDTOPONetworkToggle={handleBDTOPONetworkToggle}
        onBDTOPOLayerToggle={handleBDTOPOLayerToggle}
        // Risk Trackers handlers
        onRiskTrackersToggle={handleRiskTrackersToggle}
      />

      {/* Georisque Rapport Download - positioned by component */}
      <GeorisqueRapportDownload
        longitude={selectedParcel?.longitude}
        latitude={selectedParcel?.latitude}
        visible={!!selectedParcel}
      />

    </>
  );
};

export default memo(MapComponent);