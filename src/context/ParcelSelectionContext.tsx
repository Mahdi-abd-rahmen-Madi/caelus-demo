import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { EnhancedParcelProperties } from '../types/dashboard';

// Combined interface that includes coordinates for fly-to functionality
export interface ParcelSelectionProperties extends EnhancedParcelProperties {
  longitude: number;
  latitude: number;
}

interface ParcelSelectionContextType {
  selectedParcel: ParcelSelectionProperties | null;
  highlightedParcelId: string | null;
  selectParcel: (parcel: ParcelSelectionProperties, shouldFlyTo?: boolean) => void;
  selectParcelWithoutFlying: (parcel: ParcelSelectionProperties) => void;
  clearSelection: () => void;
  isParcelSelected: (parcelId: string) => boolean;
}

const ParcelSelectionContext = createContext<ParcelSelectionContextType | undefined>(undefined);

interface ParcelSelectionProviderProps {
  children: ReactNode;
}

export const ParcelSelectionProvider: React.FC<ParcelSelectionProviderProps> = ({ children }) => {
  const [selectedParcel, setSelectedParcel] = useState<ParcelSelectionProperties | null>(null);
  const [highlightedParcelId, setHighlightedParcelId] = useState<string | null>(null);

  const selectParcel = useCallback((parcel: ParcelSelectionProperties, _shouldFlyTo = true) => {
    // Clear selection briefly to ensure skeleton shows when switching parcels
    setSelectedParcel(null);
    setHighlightedParcelId(parcel.parcel_id);

    // Set the new parcel in the next tick to allow skeleton to show
    setTimeout(() => {
      setSelectedParcel(parcel);
    }, 0);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedParcel(null);
    setHighlightedParcelId(null);
  }, []);

  const isParcelSelected = useCallback((parcelId: string) => {
    return highlightedParcelId === parcelId;
  }, [highlightedParcelId]);

  const selectParcelWithoutFlying = useCallback((parcel: ParcelSelectionProperties) => {
    // Clear selection briefly to ensure skeleton shows when switching parcels
    setSelectedParcel(null);
    setHighlightedParcelId(parcel.parcel_id);

    // Set the new parcel in the next tick to allow skeleton to show
    setTimeout(() => {
      setSelectedParcel(parcel);
    }, 0);
  }, []);

  const value: ParcelSelectionContextType = {
    selectedParcel,
    highlightedParcelId,
    selectParcel,
    selectParcelWithoutFlying,
    clearSelection,
    isParcelSelected
  };

  return (
    <ParcelSelectionContext.Provider value={value}>
      {children}
    </ParcelSelectionContext.Provider>
  );
};

export const useParcelSelection = (): ParcelSelectionContextType => {
  const context = useContext(ParcelSelectionContext);
  if (context === undefined) {
    throw new Error('useParcelSelection must be used within a ParcelSelectionProvider');
  }
  return context;
};

export default ParcelSelectionContext;
