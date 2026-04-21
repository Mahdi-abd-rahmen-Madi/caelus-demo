import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { BaseMapType, ColorMode } from '../types/dashboard';
import { DEFAULT_SEISMIC_FILTERS } from '../constants/seismicZones';

interface LayerControlState {
  internalSelectedBaseMap: BaseMapType;
  showCommuneBoundaries: boolean;
  showParcels: boolean;
  parcelColorMode: ColorMode;
  showPluNetwork: boolean;
  pluLayers: {
    'zoning-sectors': boolean;
    'prescriptions': boolean;
    'information': boolean;
  };
  showSevesoInstallations: boolean;
  icpeFilters: {
    '1': boolean; // Seuil Haut
    '2': boolean; // Seuil Bas
    '3': boolean; // Non Seveso
  };
  showSeismicZones: boolean;
  seismicZoneFilters: {
    '1': boolean;
    '2': boolean;
    '3': boolean;
    '4': boolean;
    '5': boolean;
  };
}

interface LayerControlContextType {
  state: LayerControlState;
  updateState: (updates: Partial<LayerControlState>) => void;
  // Base map
  handleBaseMapChange: (value: BaseMapType) => void;
  // Commune boundaries
  handleCommuneBoundariesToggle: (visible: boolean) => void;
  // Parcels
  handleParcelsToggle: (visible: boolean) => void;
  handleParcelColorModeChange: (mode: ColorMode) => void;
  // PLU
  handlePluNetworkToggle: (visible: boolean) => void;
  handlePluLayerToggle: (layer: string, visible: boolean) => void;
  // Seveso
  handleSevesoInstallationsToggle: (visible: boolean) => void;
  handleICPEFilterToggle: (classification: string, visible: boolean) => void;
  // Seismic
  handleSeismicZonesToggle: (visible: boolean) => void;
  handleSeismicZoneFilterToggle: (zone: string, visible: boolean) => void;
}

const LayerControlContext = createContext<LayerControlContextType | undefined>(undefined);

interface LayerControlProviderProps {
  children: ReactNode;
  initialState?: Partial<LayerControlState>;
  onStateChange?: (state: LayerControlState) => void;
  onBaseMapChange?: (value: BaseMapType) => void;
  onCommuneBoundariesToggle?: (visible: boolean) => void;
  onParcelsToggle?: (visible: boolean) => void;
  onParcelColorModeChange?: (mode: ColorMode) => void;
  onPluNetworkToggle?: (visible: boolean) => void;
  onPluLayerToggle?: (layer: string, visible: boolean) => void;
  onSevesoInstallationsToggle?: (visible: boolean) => void;
  onICPEFilterToggle?: (classification: string, visible: boolean) => void;
  onSeismicZonesToggle?: (visible: boolean) => void;
  onSeismicZoneFilterToggle?: (zone: string, visible: boolean) => void;
}

export const LayerControlProvider: React.FC<LayerControlProviderProps> = ({
  children,
  initialState = {},
  onStateChange,
  onBaseMapChange,
  onCommuneBoundariesToggle,
  onParcelsToggle,
  onParcelColorModeChange,
  onPluNetworkToggle,
  onPluLayerToggle,
  onSevesoInstallationsToggle,
  onICPEFilterToggle,
  onSeismicZonesToggle,
  onSeismicZoneFilterToggle
}) => {
  const [state, setState] = useState<LayerControlState>({
    internalSelectedBaseMap: 'osm',
    showCommuneBoundaries: false,
    showParcels: true,
    parcelColorMode: 'default',
    showPluNetwork: false,
    pluLayers: {
      'zoning-sectors': false,
      'prescriptions': false,
      'information': false
    },
    showSevesoInstallations: false,
    icpeFilters: {
      '1': true, // Seuil Haut
      '2': true, // Seuil Bas
      '3': false // Non Seveso - hidden by default
    },
    showSeismicZones: false,
    seismicZoneFilters: DEFAULT_SEISMIC_FILTERS,
    ...initialState
  });

  const updateState = useCallback((updates: Partial<LayerControlState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      return newState;
    });
  }, []);

  // Defer onStateChange callback to prevent setState during render
  useEffect(() => {
    onStateChange?.(state);
  }, [state]); // Remove onStateChange dependency since it's only used as callback

  const handleBaseMapChange = useCallback((value: BaseMapType) => {
    updateState({ internalSelectedBaseMap: value });
    onBaseMapChange?.(value);
  }, [updateState, onBaseMapChange]);

  const handleCommuneBoundariesToggle = useCallback((visible: boolean) => {
    updateState({ showCommuneBoundaries: visible });
    onCommuneBoundariesToggle?.(visible);
  }, [updateState, onCommuneBoundariesToggle]);

  const handleParcelsToggle = useCallback((visible: boolean) => {
    updateState({ showParcels: visible });
    onParcelsToggle?.(visible);
  }, [updateState, onParcelsToggle]);

  const handleParcelColorModeChange = useCallback((mode: ColorMode) => {
    updateState({ parcelColorMode: mode });
    onParcelColorModeChange?.(mode);
  }, [updateState, onParcelColorModeChange]);

  const handlePluNetworkToggle = useCallback((visible: boolean) => {
    updateState({ showPluNetwork: visible });
    onPluNetworkToggle?.(visible);
  }, [updateState, onPluNetworkToggle]);

  const handlePluLayerToggle = useCallback((layer: string, visible: boolean) => {
    setState(prevState => ({
      ...prevState,
      pluLayers: {
        ...prevState.pluLayers,
        [layer]: visible
      }
    }));
    onPluLayerToggle?.(layer, visible);
  }, [onPluLayerToggle]);

  const handleSevesoInstallationsToggle = useCallback((visible: boolean) => {
    updateState({ showSevesoInstallations: visible });
    onSevesoInstallationsToggle?.(visible);
  }, [updateState, onSevesoInstallationsToggle]);

  const handleICPEFilterToggle = useCallback((classification: string, visible: boolean) => {
    setState(prevState => ({
      ...prevState,
      icpeFilters: {
        ...prevState.icpeFilters,
        [classification]: visible
      }
    }));
    onICPEFilterToggle?.(classification, visible);
  }, [onICPEFilterToggle]);

  const handleSeismicZonesToggle = useCallback((visible: boolean) => {
    updateState({ showSeismicZones: visible });
    onSeismicZonesToggle?.(visible);
  }, [updateState, onSeismicZonesToggle]);

  const handleSeismicZoneFilterToggle = useCallback((zone: string, visible: boolean) => {
    setState(prevState => ({
      ...prevState,
      seismicZoneFilters: {
        ...prevState.seismicZoneFilters,
        [zone]: visible
      }
    }));
    onSeismicZoneFilterToggle?.(zone, visible);
  }, [onSeismicZoneFilterToggle]) as (zone: string, visible: boolean) => void;

  const value: LayerControlContextType = {
    state,
    updateState,
    handleBaseMapChange,
    handleCommuneBoundariesToggle,
    handleParcelsToggle,
    handleParcelColorModeChange,
    handlePluNetworkToggle,
    handlePluLayerToggle,
    handleSevesoInstallationsToggle,
    handleICPEFilterToggle,
    handleSeismicZonesToggle,
    handleSeismicZoneFilterToggle
  };

  return (
    <LayerControlContext.Provider value={value}>
      {children}
    </LayerControlContext.Provider>
  );
};

export const useLayerControl = (): LayerControlContextType => {
  const context = useContext(LayerControlContext);
  if (context === undefined) {
    throw new Error('useLayerControl must be used within a LayerControlProvider');
  }
  return context;
};
