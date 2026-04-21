import { useState, useCallback, useRef } from 'react';

export interface PinLocation {
  lng: number;
  lat: number;
  isValid?: boolean;
}

export interface UsePinDropReturn {
  isPinMode: boolean;
  pinLocation: PinLocation | null;
  isValidating: boolean;
  validationError: string | null;
  togglePinMode: () => void;
  placePin: (lng: number, lat: number) => Promise<void>;
  removePin: () => void;
  setPinLocation: (location: PinLocation | null) => void;
}

export const usePinDrop = (): UsePinDropReturn => {
  const [isPinMode, setIsPinMode] = useState(false);
  const [pinLocation, setPinLocationState] = useState<PinLocation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const validationPromiseRef = useRef<Map<string, Promise<void>>>(new Map());

  // Clear validation error when changing modes
  const togglePinMode = useCallback(() => {
    console.log('usePinDrop: togglePinMode called, current isPinMode:', isPinMode);
    setIsPinMode(prev => {
      const newMode = !prev;
      console.log('usePinDrop: Setting isPinMode to:', newMode);
      if (!newMode) {
        setValidationError(null);
      }
      return newMode;
    });
  }, []);

  // Validate coordinates (simplified - always valid now)
  const validateCoordinates = useCallback(async (lng: number, lat: number): Promise<{
    isValid: boolean;
    error?: string;
  }> => {
    try {
      setIsValidating(true);
      setValidationError(null);

      // Simple coordinate validation - check if coordinates are reasonable
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return {
          isValid: false,
          error: 'Invalid coordinates'
        };
      }

      return {
        isValid: true
      };
    } catch (error) {
      console.error('Error validating coordinates:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to validate location'
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Place a pin at the specified coordinates
  const placePin = useCallback(async (lng: number, lat: number) => {
    const coordKey = `${lng.toFixed(4)},${lat.toFixed(4)}`;

    // Check if we're already validating these coordinates
    if (validationPromiseRef.current.has(coordKey)) {
      await validationPromiseRef.current.get(coordKey);
      return;
    }

    const validationPromise = (async () => {
      try {
        const validation = await validateCoordinates(lng, lat);

        const newPinLocation: PinLocation = {
          lng,
          lat,
          isValid: validation.isValid
        };

        setPinLocationState(newPinLocation);
        setValidationError(validation.error || null);

        // Exit pin mode after successful placement
        if (validation.isValid) {
          setIsPinMode(false);
        }
      } catch (error) {
        console.error('Error placing pin:', error);
        setValidationError(error instanceof Error ? error.message : 'Failed to place pin');
      } finally {
        validationPromiseRef.current.delete(coordKey);
      }
    })();

    validationPromiseRef.current.set(coordKey, validationPromise);
    await validationPromise;
  }, [validateCoordinates]);

  // Remove the current pin
  const removePin = useCallback(() => {
    setPinLocationState(null);
    setValidationError(null);
    setIsPinMode(false);
  }, []);

  // Set pin location directly (for external updates)
  const setPinLocation = useCallback((location: PinLocation | null) => {
    setPinLocationState(location);
    setValidationError(null);
    if (!location) {
      setIsPinMode(false);
    }
  }, []);

  return {
    isPinMode,
    pinLocation,
    isValidating,
    validationError,
    togglePinMode,
    placePin,
    removePin,
    setPinLocation
  };
};
