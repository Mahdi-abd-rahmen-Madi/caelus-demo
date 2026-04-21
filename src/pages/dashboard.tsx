import { Box, CircularProgress } from '@mui/material';
import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { Search } from '../components/mapcomponent/Search';
import { SidePanel } from '../components/mapcomponent/sidepanel';
import { useAppState } from '../context/AppStateContext';
import { useDashboardState } from '../context/AppStateSelectors';
import { getParcelDetailWithGeorisques } from '../services/api';
import type { EnhancedFilterProps, EnhancedParcelProperties } from '../types/dashboard';

// Lazy load heavy components with dynamic imports
const MapComponent = lazy(() => import('../components/mapcomponent/map'));

const DashboardContent = () => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [isCriteriasOpen, setIsCriteriasOpen] = useState(false);

  // Pin drop state - managed here and passed to SidePanel and Map
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinLocation, setPinLocation] = useState<{ lng: number; lat: number; isValid?: boolean } | null>(null);

  // Ruler and Buffer Zone state
  const [showRulerTool, setShowRulerTool] = useState(false);
  const [showBufferZone, setShowBufferZone] = useState(false);
  const [bufferRadius] = useState(1000); // 1km default
  const [bufferCenter, setBufferCenter] = useState<[number, number]>([0, 0]); // Independent buffer location


  // Pin drop handlers
  const handleTogglePinMode = () => {
    setIsPinMode(prev => !prev);
  };

  const handlePlacePin = async (lng: number, lat: number) => {
    // For now, just place the pin without validation
    // TODO: Add validation against departments
    const newPinLocation = { lng, lat, isValid: true };
    setPinLocation(newPinLocation);
    setIsPinMode(false); // Exit pin mode after placing

    // Update the main location to use pin location
    setLocation([lng, lat]);

    // Pin placement counts as a search action
    setHasSearched(true);

    // Fly to pin location with a reasonable zoom level (not too close)
    if (mapInstance) {
      mapInstance.flyTo({
        center: [lng, lat],
        zoom: 10, // Moderate zoom level instead of 15
        speed: 1, // Slightly faster animation
      });
    }
  };

  const handleRemovePin = () => {
    setPinLocation(null);
    setIsPinMode(false);
  };

  // Ruler and Buffer Zone handlers
  const handleRulerToolToggle = (visible: boolean) => {
    setShowRulerTool(visible);
    // Deactivate buffer zone when ruler is activated
    if (visible) {
      setShowBufferZone(false);
    }
  };

  const handleBufferZoneToggle = (visible: boolean) => {
    setShowBufferZone(visible);
    // Deactivate ruler when buffer zone is activated
    if (visible) {
      setShowRulerTool(false);
    }
  };

  const handleBufferCenterChange = (center: [number, number]) => {
    setBufferCenter(center);
  };

  // Use dashboard state from new context
  const dashboardState = useDashboardState();
  const {
    location,
    searchQuery,
    radius,
    tabValue,
    selectedZoneTypes,
    enhancedFilters,
    hasSearched
  } = dashboardState;

  // Use app state actions
  const {
    setSearchQuery,
    setLocation,
    setEnhancedFilters,
    setHasSearched,
    selectParcel,
    setRadius,
    setSelectedZoneTypes
  } = useAppState();

  // Handle map load and setup center tracking with debouncing
  const handleMapLoadWithCenterTracking = useCallback((map: any) => {
    setMapInstance(map);

    // Debounced center update to reduce frequent state changes
    let timeoutId: number;
    map.on('moveend', () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const newCenter = map.getCenter();
        setMapCenter([newCenter.lng, newCenter.lat]);
      }, 100); // 100ms debounce
    });
  }, []);

  // Helper function to get PLU zone type from code
  const getPluZoneTypeFromCode = (code: string): string | null => {
    if (!code) return null;

    // Common PLU zone codes and their types
    const zoneTypes: Record<string, string> = {
      'U': 'Zone urbaine',
      'AU': 'Zone à urbaniser',
      'A': 'Zone agricole',
      'N': 'Zone naturelle',
      'NC': 'Zone non classée',
      'AH': 'Zone agricole à habitat',
      'AUS': 'Zone à urbaniser de façon différée',
      'AUC': 'Zone à urbaniser en continuité',
      'NH': 'Zone naturelle et forestière',
      'NB': 'Zone naturelle à protéger',
      'E': 'Espaces naturels',
      'L': 'Loisirs',
      'T': 'Tourisme',
      'I': 'Activités économiques',
      'IC': 'Activités économiques de type commerce',
      'IG': 'Activités économiques de type artisanat',
      'IB': 'Activités économiques de type bureau',
      'IL': 'Activités économiques de type industrie',
      'IE': 'Activités économiques de type entrepôt',
      'IU': 'Activités économiques de type usine'
    };

    return zoneTypes[code] || null;
  };

  // Handle flying to a specific parcel with throttling and context selection
  const handleFlyToParcel = useCallback(async (parcel: any) => {
    try {
      // Helper function to extract coordinates from geometry if properties are undefined
      const extractCoordinatesFromParcel = (props: any): { longitude: number | null; latitude: number | null } => {
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
        console.warn('Unable to extract valid coordinates from parcel properties:', {
          parcel_id: props.parcel_id,
          longitude: props.longitude,
          latitude: props.latitude,
          centroid: props.centroid
        });

        return {
          longitude: null,
          latitude: null
        };
      };

      // Extract coordinates with fallback
      const { longitude, latitude } = extractCoordinatesFromParcel(parcel);

      // Check if coordinates are valid
      if (longitude === null || latitude === null) {
        console.warn('Invalid parcel coordinates - unable to fly to parcel:', { longitude, latitude, parcel_id: parcel.parcel_id });
        return;
      }

      // First, select the parcel with basic data to fly there immediately
      const basicParcel: EnhancedParcelProperties & { longitude: number; latitude: number } = {
        ...parcel,
        // Use extracted coordinates
        longitude: longitude,
        latitude: latitude,
        // Use actual PLU data if available, otherwise null
        plu_zone_code: parcel.plu_zone_code || null,
        plu_zone_type: parcel.plu_zone_type || getPluZoneTypeFromCode(parcel.plu_zone_code) || null,
        // Infrastructure proximity fields will be null until detailed data is loaded
        nearest_enedis_distance_m: null,
        nearest_enedis_line_type: null,
        nearest_hta_souterrain_distance_m: null,
        nearest_railway_distance_m: null,
        // Map existing fields
        area: parcel.area,
        department_code: parcel.department_code,
        seismic_risk_score: parcel.seismic_risk_score,
        seismic_zone_class: parcel.seismic_zone_class,
        flood_zone_class: parcel.flood_zone_class,
        parcel_id: parcel.parcel_id,
        slope_value: parcel.slope_value
      };

      // Select the parcel immediately to start the fly animation
      selectParcel(basicParcel);

      if (mapInstance) {
        // Use requestAnimationFrame to smooth out the animation
        requestAnimationFrame(() => {
          mapInstance.flyTo({
            center: [longitude, latitude],
            zoom: 16, // Zoom in close to see the parcel
            speed: 2.0,
            curve: 1.4,
            essential: true
          });
        });
      }

      // Fetch detailed parcel data in the background
      try {
        const detailedParcel = await getParcelDetailWithGeorisques(parcel.parcel_id);

        // Only proceed if we got valid detailed parcel data
        if (detailedParcel && detailedParcel.parcel_id) {
          // Validate detailed parcel coordinates
          const detailedLongitude = detailedParcel.longitude;
          const detailedLatitude = detailedParcel.latitude;

        const isValidCoordinate = (coord: any): boolean => {
          return coord !== null &&
            coord !== undefined &&
            !isNaN(coord) &&
            isFinite(coord) &&
            typeof coord === 'number';
        };

        // Update the selected parcel with detailed data
        const enhancedDetailedParcel: EnhancedParcelProperties & { longitude: number; latitude: number } = {
          ...detailedParcel,
          longitude: isValidCoordinate(detailedLongitude) ? detailedLongitude : longitude,
          latitude: isValidCoordinate(detailedLatitude) ? detailedLatitude : latitude,
          // Ensure all required fields are present
          plu_zone_code: detailedParcel.plu_zone_code ?? basicParcel.plu_zone_code,
          plu_zone_type: detailedParcel.plu_zone_type ?? basicParcel.plu_zone_type,
          // Georisques data
          georisques_data: detailedParcel.georisques_data ?? basicParcel.georisques_data,
        };

        // Update the selected parcel with detailed data
          selectParcel(enhancedDetailedParcel);
        }
      } catch (error) {
        console.warn('Failed to fetch detailed parcel data, using basic data:', error);
        // Keep using the basic parcel data if detailed fetch fails
      }
    } catch (error) {
      console.error('Error in handleFlyToParcel:', error);
    }
  }, [mapInstance, selectParcel]);

  // Handle location selection from sidepanel with throttling
  const handleLocationSelect = useCallback((newLocation: [number, number]) => {
    setLocation(newLocation);

    // Fly to location if map is available with throttling
    if (mapInstance) {
      requestAnimationFrame(() => {
        mapInstance.flyTo({
          center: newLocation,
          zoom: 13, // Zoom to level 15 to immediately show parcel tiles
        });
      });
    }
  }, [mapInstance, setLocation]);

  // Removed commune and department handlers

  // Handle search trigger from criteria (for proper parcel loading)
  const handleSearchTrigger = useCallback((location: [number, number], searchRadius: number) => {
    setLocation(location);
    setHasSearched(true);

    // Update radius if different
    if (searchRadius !== radius) {
      // Note: We might need to add a setRadius function to context
      console.log('Search radius:', searchRadius, 'Current radius:', radius);
    }
  }, [setLocation, setHasSearched, radius]);

  // Handle pin location changes with throttling
  const handlePinLocationChange = useCallback((pinCoords: [number, number] | null) => {
    if (pinCoords && pinCoords[0] !== 0 && pinCoords[1] !== 0) {
      // Update the main location to use pin location
      setLocation(pinCoords);

      // Fly to pin location if map is available with throttling
      if (mapInstance) {
        requestAnimationFrame(() => {
          mapInstance.flyTo({
            center: pinCoords,
            zoom: 15,
          });
        });
      }
    }
  }, [mapInstance, setLocation]);

  // Handler functions for components
  const handleEnhancedFilterChange = useCallback((filters: EnhancedFilterProps) => {
    setEnhancedFilters(filters);
  }, [setEnhancedFilters]);

  const handleZoneTypeChange = useCallback((zoneType: string, checked: boolean) => {
    if (checked) {
      setSelectedZoneTypes([...selectedZoneTypes, zoneType]);
    } else {
      setSelectedZoneTypes(selectedZoneTypes.filter((type: string) => type !== zoneType));
    }
  }, [selectedZoneTypes, setSelectedZoneTypes]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  }, [setHasSearched]);

  const handleRadiusChange = useCallback((_: any, newValue: number | number[]) => {
    const radiusValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setRadius(radiusValue);
  }, [setRadius]);

  // Memoize expensive calculations with stable dependencies
  const memoizedHandlers = useMemo(() => ({
    handleMapLoadWithCenterTracking,
    handleFlyToParcel,
    handleLocationSelect,
    handlePinLocationChange,
    handleSearchTrigger
  }), [
    handleMapLoadWithCenterTracking,
    handleFlyToParcel,
    handleLocationSelect,
    handlePinLocationChange,
    handleSearchTrigger
  ]);

  // Memoize MapComponent props to prevent unnecessary re-renders
  const mapComponentProps = useMemo(() => ({
    center: location,
    zoom: mapCenter[0] === 0 && mapCenter[1] === 0 ? 8 : undefined,
    onLoad: memoizedHandlers.handleMapLoadWithCenterTracking,
    selectedZoneTypes,
    enhancedFilters,
    minCandidateScore: 0,
    radius,
    location,
    isPinMode,
    onPinDrop: handlePlacePin,
    pinLocation,
    hasSearched,
    showRulerTool,
    showBufferZone,
    bufferRadius,
    bufferCenter,
    onBufferCenterChange: handleBufferCenterChange
  }), [
    location,
    mapCenter,
    memoizedHandlers.handleMapLoadWithCenterTracking,
    selectedZoneTypes,
    enhancedFilters,
    radius,
    isPinMode,
    handlePlacePin,
    pinLocation,
    hasSearched,
    showRulerTool,
    showBufferZone,
    bufferRadius,
    bufferCenter,
    handleBufferCenterChange
  ]);

  return (
    <Box sx={{
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* Navbar */}
      <Navbar
        showRulerTool={showRulerTool}
        showBufferZone={showBufferZone}
        onRulerToolToggle={handleRulerToolToggle}
        onBufferZoneToggle={handleBufferZoneToggle}
      />

      {/* Map Section - Full screen with navbar offset */}
      <Box sx={{
        position: 'absolute',
        top: 64, // AppBar height
        left: 240, // Account for reduced sidepanel sidebar (240px)
        right: 180, // Account for wider layer control sidebar (180px)
        bottom: 0,
        width: 'calc(100% - 420px)', // Account for both sidebars (240 + 180)
        height: 'calc(100% - 64px)',
        zIndex: 1
      }}>
        <Suspense fallback={
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            bgcolor: 'grey.100'
          }}>
            <CircularProgress />
          </Box>
        }>
          <MapComponent {...mapComponentProps} />
        </Suspense>
      </Box>

      {/* SidePanel */}
      <SidePanel
        tabValue={tabValue}
        searchQuery={searchQuery}
        radius={radius}
        location={location}
        onSearchClick={() => setIsCriteriasOpen(true)}
        onFlyToParcel={memoizedHandlers.handleFlyToParcel}
        enhancedFilters={enhancedFilters}
        onEnhancedFilterChange={handleEnhancedFilterChange}
        selectedZoneTypes={selectedZoneTypes}
        onZoneTypeChange={handleZoneTypeChange}
        onPinLocationChange={memoizedHandlers.handlePinLocationChange}
        isPinMode={isPinMode}
        pinLocation={pinLocation}
        onTogglePinMode={handleTogglePinMode}
        onRemovePin={handleRemovePin}
        hasSearched={hasSearched}
      />

      {/* Search Overlay */}
      <Search
        isOpen={isCriteriasOpen}
        onClose={() => setIsCriteriasOpen(false)}
        radius={radius}
        handleSearch={handleSearch}
        handleRadiusChange={handleRadiusChange}
        setSearchQuery={setSearchQuery}
        onLocationSelect={memoizedHandlers.handleLocationSelect}
        onSearchTrigger={memoizedHandlers.handleSearchTrigger}
      />

    </Box>
  );
};

const Dashboard = () => (
  <DashboardContent />
);

export default Dashboard;