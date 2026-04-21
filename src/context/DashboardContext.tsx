import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  DashboardState,
  HandleTabChange,
  HandleSearchTypeChange,
  HandleSearch,
  HandleRadiusChange,
  HandleMapLoad,
  HandleZoneTypeChange,
  EnhancedFilterProps
} from '../types/dashboard';

interface DashboardContextType extends DashboardState {
  handleTabChange: HandleTabChange;
  handleSearchTypeChange: HandleSearchTypeChange;
  handleSearch: HandleSearch;
  handleRadiusChange: HandleRadiusChange;
  handleMapLoad: HandleMapLoad;
  handleZoneTypeChange: HandleZoneTypeChange;
  setSearchQuery: (query: string) => void;
  setLocation: (location: [number, number]) => void;
  enhancedFilters: EnhancedFilterProps;
  handleEnhancedFilterChange: (filters: EnhancedFilterProps) => void;
  hasSearched: boolean;
  setHasSearched: (searched: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

interface DashboardProviderProps {
  children: ReactNode;
}

// Helper functions for localStorage persistence
const STORAGE_KEY = 'caelus_dashboard_state';

const getStoredState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        location: parsed.location || [2.2137, 46.2276],
        searchQuery: parsed.searchQuery || '',
        radius: parsed.radius || 10,
        tabValue: parsed.tabValue || 0,
        searchType: parsed.searchType || 'commune',
        selectedZoneTypes: parsed.selectedZoneTypes || [],
        enhancedFilters: parsed.enhancedFilters || {}
      };
    }
  } catch (error) {
    console.warn('Failed to load dashboard state from localStorage:', error);
  }
  return null;
};

const saveState = (state: Partial<DashboardState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save dashboard state to localStorage:', error);
  }
};

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  // Initialize state from localStorage or defaults
  const storedState = getStoredState();

  // State
  const [location, setLocation] = useState<[number, number]>(storedState?.location || [2.2137, 46.2276]);
  const [searchQuery, setSearchQuery] = useState(storedState?.searchQuery || '');
  const [radius, setRadius] = useState<number>(storedState?.radius || 10);
  const [tabValue, setTabValue] = useState(storedState?.tabValue || 0);
  const [searchType, setSearchType] = useState<'commune' | 'department'>(storedState?.searchType || 'commune');
  const [selectedZoneTypes, setSelectedZoneTypes] = useState<string[]>(storedState?.selectedZoneTypes || []);
  const [enhancedFilters, setEnhancedFilters] = useState<EnhancedFilterProps>(storedState?.enhancedFilters || {});
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState({
      location,
      searchQuery,
      radius,
      tabValue,
      searchType,
      selectedZoneTypes,
      enhancedFilters
    });
  }, [location, searchQuery, radius, tabValue, searchType, selectedZoneTypes, enhancedFilters]);

  // Handlers
  const handleTabChange: HandleTabChange = useCallback((_, newValue) => {
    setTabValue(newValue);
  }, []);

  const handleSearchTypeChange: HandleSearchTypeChange = useCallback((event) => {
    setSearchType(event.target.value as 'commune' | 'department');
  }, []);

  const handleSearch: HandleSearch = useCallback((e) => {
    e.preventDefault();
    console.log('Searching for:', { searchQuery, searchType });
    setHasSearched(true);
  }, [searchQuery, searchType]);

  const handleRadiusChange: HandleRadiusChange = useCallback((_, newValue) => {
    setRadius(Array.isArray(newValue) ? newValue[0] : newValue);
  }, []);

  const handleMapLoad: HandleMapLoad = useCallback((map) => {
    console.log('Map loaded:', map);
  }, []);

  const handleZoneTypeChange: HandleZoneTypeChange = useCallback((zoneType, checked) => {
    setSelectedZoneTypes(prev => {
      if (checked) {
        return [...prev, zoneType];
      } else {
        return prev.filter(type => type !== zoneType);
      }
    });
  }, []);

  const handleEnhancedFilterChange = useCallback((filters: EnhancedFilterProps) => {
    setEnhancedFilters(filters);
  }, []);

  // Memoize context value
  const contextValue = useMemo(() => ({
    location,
    searchQuery,
    radius,
    tabValue,
    searchType,
    selectedZoneTypes,
    enhancedFilters,
    hasSearched,
    handleTabChange,
    handleSearchTypeChange,
    handleSearch,
    handleRadiusChange,
    handleMapLoad,
    handleZoneTypeChange,
    handleEnhancedFilterChange,
    // Add setters if needed by child components
    setLocation,
    setSearchQuery,
    setHasSearched,
  }), [
    location,
    searchQuery,
    radius,
    tabValue,
    searchType,
    selectedZoneTypes,
    enhancedFilters,
    hasSearched,
    handleTabChange,
    handleSearchTypeChange,
    handleSearch,
    handleRadiusChange,
    handleMapLoad,
    handleZoneTypeChange,
    handleEnhancedFilterChange,
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
