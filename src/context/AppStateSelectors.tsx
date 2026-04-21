import { useMemo } from 'react';
import { useAppState } from './AppStateContext';

// Dashboard selectors
export const useDashboardState = () => {
  const { state } = useAppState();

  return useMemo(() => ({
    location: state.location,
    searchQuery: state.searchQuery,
    radius: state.radius,
    tabValue: state.tabValue,
    searchType: state.searchType,
    selectedZoneTypes: state.selectedZoneTypes,
    enhancedFilters: state.enhancedFilters,
    hasSearched: state.hasSearched,
  }), [
    state.location,
    state.searchQuery,
    state.radius,
    state.tabValue,
    state.searchType,
    state.selectedZoneTypes,
    state.enhancedFilters,
    state.hasSearched,
  ]);
};

// Layer control selectors
export const useLayerControlState = () => {
  const { state } = useAppState();

  return useMemo(() => ({
    internalSelectedBaseMap: state.internalSelectedBaseMap,
    showCommuneBoundaries: state.showCommuneBoundaries,
    showParcels: state.showParcels,
    parcelColorMode: state.parcelColorMode,
    showRailwayNetwork: state.showRailwayNetwork,
    showSevesoInstallations: state.showSevesoInstallations,
    icpeFilters: state.icpeFilters,
    showSeismicZones: state.showSeismicZones,
    // seismicZoneFilters removed - WMS shows all zones by default
    showInondationV1: state.showInondationV1,
    showAlearg: state.showAlearg,
    showCavitesNonMinieresBRGM: state.showCavitesNonMinieresBRGM,
    showPprnPerimetreInond: state.showPprnPerimetreInond,
    showPprnSeisme: state.showPprnSeisme,
    showSspClassificationSis: state.showSspClassificationSis,
    showSspInstruction: state.showSspInstruction,
    showSspEtablissement: state.showSspEtablissement,
  }), [
    state.internalSelectedBaseMap,
    state.showCommuneBoundaries,
    state.showParcels,
    state.parcelColorMode,
    state.showRailwayNetwork,
    state.showSevesoInstallations,
    state.icpeFilters,
    state.showSeismicZones,
    // state.seismicZoneFilters removed - WMS shows all zones by default
    state.showInondationV1,
    state.showAlearg,
    state.showMvtLocalise,
    state.showCavitesNonMinieresBRGM,
    state.showPprnPerimetreInond,
    state.showPprnSeisme,
    state.showSspClassificationSis,
    state.showSspInstruction,
    state.showSspEtablissement,
  ]);
};

// Parcel selection selectors
export const useParcelSelectionState = () => {
  const { state } = useAppState();

  return useMemo(() => ({
    selectedParcel: state.selectedParcel,
    highlightedParcelId: state.highlightedParcelId,
  }), [
    state.selectedParcel,
    state.highlightedParcelId,
  ]);
};

// Specific selectors for common use cases
export const useLocation = () => {
  const { state } = useAppState();
  return state.location;
};

export const useSearchState = () => {
  const { state } = useAppState();

  return useMemo(() => ({
    searchQuery: state.searchQuery,
    radius: state.radius,
    searchType: state.searchType,
    hasSearched: state.hasSearched,
  }), [
    state.searchQuery,
    state.radius,
    state.searchType,
    state.hasSearched,
  ]);
};

export const useBaseMap = () => {
  const { state } = useAppState();
  return state.internalSelectedBaseMap;
};

export const useParcelVisibility = () => {
  const { state } = useAppState();
  return state.showParcels;
};

export const useParcelColorMode = () => {
  const { state } = useAppState();
  return state.parcelColorMode;
};

// Performance-optimized selector for map layers
export const useVisibleLayers = () => {
  const { state } = useAppState();

  return useMemo(() => ({
    railwayNetwork: state.showRailwayNetwork,
    sevesoInstallations: state.showSevesoInstallations,
    seismicZones: state.showSeismicZones,
  }), [
    state.showRailwayNetwork,
    state.showSevesoInstallations,
    state.showSeismicZones,
  ]);
};
