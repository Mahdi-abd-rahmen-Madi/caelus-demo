import React, { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { BaseMapType, ColorMode, EnhancedFilterProps, EnhancedParcelProperties } from '../types/dashboard';

// Combined state interface
export interface AppState {
  // Dashboard state
  location: [number, number];
  searchQuery: string;
  radius: number;
  tabValue: number;
  searchType: 'commune' | 'department';
  selectedZoneTypes: string[];
  enhancedFilters: EnhancedFilterProps;
  hasSearched: boolean;

  // Layer control state
  internalSelectedBaseMap: BaseMapType;
  showCommuneBoundaries: boolean;
  showParcels: boolean;
  parcelColorMode: ColorMode;
  showRailwayNetwork: boolean;
  showSevesoInstallations: boolean;
  icpeFilters: {
    '1': boolean; // Seuil Haut
    '2': boolean; // Seuil Bas
    '3': boolean; // Non Seveso
  };
  showSeismicZones: boolean;
  // seismicZoneFilters removed - WMS shows all zones by default
  showInondationV1: boolean;
  showAlearg: boolean;
  showMvtLocalise: boolean;
  showSevesoInstallationsVector: boolean;
  showCavitesNonMinieresBRGM: boolean;
  showPprnPerimetreInond: boolean;
  showPprnSeisme: boolean;
  showSspClassificationSis: boolean;
  showSspInstruction: boolean;
  showSspEtablissement: boolean;

  // Parcel selection state
  selectedParcel: (EnhancedParcelProperties & { longitude: number; latitude: number }) | null;
  highlightedParcelId: string | null;

  // DVF popup state
  dvfPopupOpen: boolean;
  dvfTransactionListShown: boolean;
}

// Action types
type AppStateAction =
  // Dashboard actions
  | { type: 'SET_LOCATION'; payload: [number, number] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_RADIUS'; payload: number }
  | { type: 'SET_TAB_VALUE'; payload: number }
  | { type: 'SET_SEARCH_TYPE'; payload: 'commune' | 'department' }
  | { type: 'SET_SELECTED_ZONE_TYPES'; payload: string[] }
  | { type: 'SET_ENHANCED_FILTERS'; payload: EnhancedFilterProps }
  | { type: 'SET_HAS_SEARCHED'; payload: boolean }

  // Layer control actions
  | { type: 'SET_BASE_MAP'; payload: BaseMapType }
  | { type: 'SET_COMMUNE_BOUNDARIES'; payload: boolean }
  | { type: 'SET_PARCELS'; payload: boolean }
  | { type: 'SET_PARCEL_COLOR_MODE'; payload: ColorMode }
  | { type: 'SET_RAILWAY_NETWORK'; payload: boolean }
  | { type: 'SET_SEVESO_INSTALLATIONS'; payload: boolean }
  | { type: 'SET_ICPE_FILTER'; payload: { classification: string; visible: boolean } }
  | { type: 'SET_SEISMIC_ZONES'; payload: boolean }
  | { type: 'SET_SEISMIC_ZONE_FILTER'; payload: { zone: string; visible: boolean } }
  | { type: 'SET_INONDATION_V1'; payload: boolean }
  | { type: 'SET_ALEARG'; payload: boolean }
  | { type: 'SET_MVT_LOCALISE'; payload: boolean }

  // Parcel selection actions
  | { type: 'SELECT_PARCEL'; payload: (EnhancedParcelProperties & { longitude: number; latitude: number }) | null }
  | { type: 'SET_HIGHLIGHTED_PARCEL_ID'; payload: string | null }
  | { type: 'CLEAR_PARCEL_SELECTION' }

  // DVF popup actions
  | { type: 'SET_DVF_POPUP_OPEN'; payload: boolean }
  | { type: 'SET_DVF_TRANSACTION_LIST_SHOWN'; payload: boolean }

  // Bulk actions
  | { type: 'RESET_STATE'; payload: Partial<AppState> }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<AppState> };

// Initial state
const getInitialState = (): AppState => {
  // Try to load from localStorage
  try {
    const stored = localStorage.getItem('caelus_app_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        // Dashboard defaults
        location: parsed.location || [2.2137, 46.2276],
        searchQuery: parsed.searchQuery || '',
        radius: parsed.radius || 10,
        tabValue: parsed.tabValue || 0,
        searchType: parsed.searchType || 'commune',
        selectedZoneTypes: parsed.selectedZoneTypes || [],
        enhancedFilters: parsed.enhancedFilters || {},
        hasSearched: parsed.hasSearched || false,

        // Layer control defaults
        internalSelectedBaseMap: parsed.internalSelectedBaseMap || 'osm',
        showCommuneBoundaries: parsed.showCommuneBoundaries || false,
        showParcels: parsed.showParcels !== undefined ? parsed.showParcels : true,
        parcelColorMode: parsed.parcelColorMode || 'default',
        showRailwayNetwork: parsed.showRailwayNetwork || false,
        showSevesoInstallations: parsed.showSevesoInstallations || false,
        icpeFilters: parsed.icpeFilters || {
          '1': true, // Seuil Haut
          '2': true, // Seuil Bas
          '3': false // Non Seveso
        },
        showSeismicZones: parsed.showSeismicZones || false,
        // seismicZoneFilters removed - WMS shows all zones by default
        showInondationV1: parsed.showInondationV1 || false,
        showAlearg: parsed.showAlearg || false,
        showMvtLocalise: parsed.showMvtLocalise || false,
        showSevesoInstallationsVector: parsed.showSevesoInstallationsVector || false,
        showCavitesNonMinieresBRGM: parsed.showCavitesNonMinieresBRGM || false,
        showPprnPerimetreInond: parsed.showPprnPerimetreInond !== undefined ? parsed.showPprnPerimetreInond : true,
        showPprnSeisme: parsed.showPprnSeisme !== undefined ? parsed.showPprnSeisme : true,
        showSspClassificationSis: parsed.showSspClassificationSis || false,
        showSspInstruction: parsed.showSspInstruction || false,
        showSspEtablissement: parsed.showSspEtablissement || false,

        // Parcel selection defaults
        selectedParcel: parsed.selectedParcel || null,
        highlightedParcelId: parsed.highlightedParcelId || null,

        // DVF popup defaults
        dvfPopupOpen: parsed.dvfPopupOpen || false,
        dvfTransactionListShown: parsed.dvfTransactionListShown || false,
      };
    }
  } catch (error) {
    console.warn('Failed to load app state from localStorage:', error);
  }

  // Return default state
  return {
    // Dashboard defaults
    location: [2.2137, 46.2276],
    searchQuery: '',
    radius: 10,
    tabValue: 0,
    searchType: 'commune',
    selectedZoneTypes: [],
    enhancedFilters: {},
    hasSearched: false,

    // Layer control defaults
    internalSelectedBaseMap: 'osm',
    showCommuneBoundaries: false,
    showParcels: true,
    parcelColorMode: 'default',
    showRailwayNetwork: false,
    showSevesoInstallations: false,
    icpeFilters: {
      '1': true,
      '2': true,
      '3': false
    },
    showSeismicZones: false,
    // seismicZoneFilters removed - WMS shows all zones by default
    showInondationV1: false,
    showAlearg: false,
    showMvtLocalise: false,
    showSevesoInstallationsVector: false,
    showCavitesNonMinieresBRGM: false,
    showPprnPerimetreInond: true,
    showPprnSeisme: true,
    showSspClassificationSis: false,
    showSspInstruction: false,
    showSspEtablissement: false,

    // Parcel selection defaults
    selectedParcel: null,
    highlightedParcelId: null,

    // DVF popup defaults
    dvfPopupOpen: false,
    dvfTransactionListShown: false,
  };
};

// Reducer
const appStateReducer = (state: AppState, action: AppStateAction): AppState => {
  switch (action.type) {
    // Dashboard actions
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_RADIUS':
      return { ...state, radius: action.payload };
    case 'SET_TAB_VALUE':
      return { ...state, tabValue: action.payload };
    case 'SET_SEARCH_TYPE':
      return { ...state, searchType: action.payload };
    case 'SET_SELECTED_ZONE_TYPES':
      return { ...state, selectedZoneTypes: action.payload };
    case 'SET_ENHANCED_FILTERS':
      return { ...state, enhancedFilters: action.payload };
    case 'SET_HAS_SEARCHED':
      return { ...state, hasSearched: action.payload };

    // Layer control actions
    case 'SET_BASE_MAP':
      return { ...state, internalSelectedBaseMap: action.payload };
    case 'SET_COMMUNE_BOUNDARIES':
      return { ...state, showCommuneBoundaries: action.payload };
    case 'SET_PARCELS':
      return { ...state, showParcels: action.payload };
    case 'SET_PARCEL_COLOR_MODE':
      return { ...state, parcelColorMode: action.payload };
    case 'SET_RAILWAY_NETWORK':
      return { ...state, showRailwayNetwork: action.payload };
    case 'SET_SEVESO_INSTALLATIONS':
      return { ...state, showSevesoInstallations: action.payload };
    case 'SET_ICPE_FILTER':
      return {
        ...state,
        icpeFilters: {
          ...state.icpeFilters,
          [action.payload.classification]: action.payload.visible,
        },
      };
    case 'SET_SEISMIC_ZONES':
      return { ...state, showSeismicZones: action.payload };
    // SET_SEISMIC_ZONE_FILTER removed - WMS shows all zones by default
    case 'SET_INONDATION_V1':
      return { ...state, showInondationV1: action.payload };
    case 'SET_ALEARG':
      return { ...state, showAlearg: action.payload };
    case 'SET_MVT_LOCALISE':
      return { ...state, showMvtLocalise: action.payload };

    // Parcel selection actions
    case 'SELECT_PARCEL':
      return {
        ...state,
        selectedParcel: action.payload,
        highlightedParcelId: action.payload?.parcel_id || null,
      };
    case 'SET_HIGHLIGHTED_PARCEL_ID':
      return { ...state, highlightedParcelId: action.payload };
    case 'CLEAR_PARCEL_SELECTION':
      return { ...state, selectedParcel: null, highlightedParcelId: null };

    // DVF popup actions
    case 'SET_DVF_POPUP_OPEN':
      return { ...state, dvfPopupOpen: action.payload };
    case 'SET_DVF_TRANSACTION_LIST_SHOWN':
      return { ...state, dvfTransactionListShown: action.payload };

    // Bulk actions
    case 'RESET_STATE':
      return { ...getInitialState(), ...action.payload };
    case 'LOAD_SAVED_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Context
interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppStateAction>;

  // Dashboard actions
  setLocation: (location: [number, number]) => void;
  setSearchQuery: (query: string) => void;
  setRadius: (radius: number) => void;
  setTabValue: (value: number) => void;
  setSearchType: (type: 'commune' | 'department') => void;
  setSelectedZoneTypes: (types: string[]) => void;
  setEnhancedFilters: (filters: EnhancedFilterProps) => void;
  setHasSearched: (searched: boolean) => void;

  // Layer control actions
  setBaseMap: (baseMap: BaseMapType) => void;
  setCommuneBoundaries: (visible: boolean) => void;
  setParcels: (visible: boolean) => void;
  setParcelColorMode: (mode: ColorMode) => void;
  setRailwayNetwork: (visible: boolean) => void;
  setSevesoInstallations: (visible: boolean) => void;
  setICPEFilter: (classification: string, visible: boolean) => void;
  setSeismicZones: (visible: boolean) => void;
  // setSeismicZoneFilter removed - WMS shows all zones by default
  setInondationV1: (visible: boolean) => void;
  setAlearg: (visible: boolean) => void;
  setMvtLocalise: (visible: boolean) => void;

  // Parcel selection actions
  selectParcel: (parcel: (EnhancedParcelProperties & { longitude: number; latitude: number }) | null) => void;
  setHighlightedParcelId: (parcelId: string | null) => void;
  clearParcelSelection: () => void;

  // DVF popup actions
  setDvfPopupOpen: (open: boolean) => void;
  setDvfTransactionListShown: (shown: boolean) => void;

  // Utility actions
  resetState: (newState?: Partial<AppState>) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Provider
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, getInitialState());

  // Save state to localStorage
  useEffect(() => {
    try {
      const stateToSave = {
        location: state.location,
        searchQuery: state.searchQuery,
        radius: state.radius,
        tabValue: state.tabValue,
        searchType: state.searchType,
        selectedZoneTypes: state.selectedZoneTypes,
        enhancedFilters: state.enhancedFilters,
        hasSearched: state.hasSearched,
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
        showMvtLocalise: state.showMvtLocalise,
      };
      localStorage.setItem('caelus_app_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save app state to localStorage:', error);
    }
  }, [state]);

  // Action creators
  const actions = useMemo(() => ({
    // Dashboard actions
    setLocation: (location: [number, number]) => dispatch({ type: 'SET_LOCATION', payload: location }),
    setSearchQuery: (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    setRadius: (radius: number) => dispatch({ type: 'SET_RADIUS', payload: radius }),
    setTabValue: (value: number) => dispatch({ type: 'SET_TAB_VALUE', payload: value }),
    setSearchType: (type: 'commune' | 'department') => dispatch({ type: 'SET_SEARCH_TYPE', payload: type }),
    setSelectedZoneTypes: (types: string[]) => dispatch({ type: 'SET_SELECTED_ZONE_TYPES', payload: types }),
    setEnhancedFilters: (filters: EnhancedFilterProps) => dispatch({ type: 'SET_ENHANCED_FILTERS', payload: filters }),
    setHasSearched: (searched: boolean) => dispatch({ type: 'SET_HAS_SEARCHED', payload: searched }),

    // Layer control actions
    setBaseMap: (baseMap: BaseMapType) => dispatch({ type: 'SET_BASE_MAP', payload: baseMap }),
    setCommuneBoundaries: (visible: boolean) => dispatch({ type: 'SET_COMMUNE_BOUNDARIES', payload: visible }),
    setParcels: (visible: boolean) => dispatch({ type: 'SET_PARCELS', payload: visible }),
    setParcelColorMode: (mode: ColorMode) => dispatch({ type: 'SET_PARCEL_COLOR_MODE', payload: mode }),
    setRailwayNetwork: (visible: boolean) => dispatch({ type: 'SET_RAILWAY_NETWORK', payload: visible }),
    setSevesoInstallations: (visible: boolean) => dispatch({ type: 'SET_SEVESO_INSTALLATIONS', payload: visible }),
    setICPEFilter: (classification: string, visible: boolean) =>
      dispatch({ type: 'SET_ICPE_FILTER', payload: { classification, visible } }),
    setSeismicZones: (visible: boolean) => dispatch({ type: 'SET_SEISMIC_ZONES', payload: visible }),
    // setSeismicZoneFilter removed - WMS shows all zones by default
    setInondationV1: (visible: boolean) => dispatch({ type: 'SET_INONDATION_V1', payload: visible }),
    setAlearg: (visible: boolean) => dispatch({ type: 'SET_ALEARG', payload: visible }),
    setMvtLocalise: (visible: boolean) => dispatch({ type: 'SET_MVT_LOCALISE', payload: visible }),

    // Parcel selection actions
    selectParcel: (parcel: (EnhancedParcelProperties & { longitude: number; latitude: number }) | null) =>
      dispatch({ type: 'SELECT_PARCEL', payload: parcel }),
    setHighlightedParcelId: (parcelId: string | null) => dispatch({ type: 'SET_HIGHLIGHTED_PARCEL_ID', payload: parcelId }),
    clearParcelSelection: () => dispatch({ type: 'CLEAR_PARCEL_SELECTION' }),

    // DVF popup actions
    setDvfPopupOpen: (open: boolean) => dispatch({ type: 'SET_DVF_POPUP_OPEN', payload: open }),
    setDvfTransactionListShown: (shown: boolean) => dispatch({ type: 'SET_DVF_TRANSACTION_LIST_SHOWN', payload: shown }),

    // Utility actions
    resetState: (newState?: Partial<AppState>) => dispatch({ type: 'RESET_STATE', payload: newState || {} }),
  }), []);

  const contextValue: AppStateContextType = useMemo(() => ({
    state,
    dispatch,
    ...actions,
  }), [state, actions]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook
export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

export default AppStateContext;
