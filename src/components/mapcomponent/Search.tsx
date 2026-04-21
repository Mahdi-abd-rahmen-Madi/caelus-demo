import { useState, useCallback, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Chip,
  Button,
  IconButton,
  Autocomplete,
  TextField,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useTranslation } from 'react-i18next';
import type { GeocodedLocation, GeocodeResponse } from '../../types/dashboard';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  radius: number;
  handleSearch: (event: React.FormEvent) => void;
  handleRadiusChange: (event: Event, newValue: number | number[]) => void;
  setSearchQuery: (query: string) => void;
  onLocationSelect?: (location: [number, number]) => void;
  onSearchTrigger?: (location: [number, number], radius: number) => void;
}

export const Search = memo(({
  isOpen,
  onClose,
  radius,
  handleSearch,
  handleRadiusChange,
  setSearchQuery,
  onLocationSelect,
  onSearchTrigger
}: SearchProps) => {
  const { t } = useTranslation();
  // Geocoding state
  const [selectedLocation, setSelectedLocation] = useState<GeocodedLocation | null>(null);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<GeocodedLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Geocoding API function
  const geocodeSearch = async (
    searchQuery: string,
    limit: number = 5,
    autocomplete: boolean = true
  ): Promise<GeocodeResponse> => {
    const api_url = 'https://data.geopf.fr/geocodage/search';
    const params = new URLSearchParams({
      'q': searchQuery,
      'limit': limit.toString(),
      'autocomplete': autocomplete.toString()
    });

    const response = await fetch(`${api_url}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Transform results to consistent format
    const transformedResults: GeocodedLocation[] = [];
    for (const feature of data.features || []) {
      const geometry = feature.geometry || {};
      const properties = feature.properties || {};
      const coordinates = geometry.coordinates || [];

      if (coordinates.length >= 2) {
        transformedResults.push({
          address: properties.label || '',
          name: properties.name || '',
          city: properties.city || '',
          postcode: properties.postcode || '',
          context: properties.context || '',
          type: properties.type || '',
          importance: properties.importance || 0,
          lat: coordinates[1],
          lng: coordinates[0],
          score: properties.score || 1.0,
          bbox: geometry.bbox || []
        });
      }
    }

    return {
      results: transformedResults,
      query: searchQuery,
      count: transformedResults.length,
      api_source: 'geoplateforme'
    };
  };

  // Debounced search handler
  const handleGeocodeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await geocodeSearch(searchQuery, 5, true);
      setResults(response.results);
    } catch (error) {
      console.error('Geocoding error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = useCallback((newInputValue: string) => {
    setQuery(newInputValue);

    if (newInputValue.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleGeocodeSearch(newInputValue);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else if (newInputValue.length === 0) {
      setResults([]);
    }
  }, [handleGeocodeSearch]);

  // Handle location selection
  const handleLocationSelect = useCallback((location: GeocodedLocation) => {
    setSelectedLocation(location);
    setQuery('');
    setResults([]);

    // Trigger location selection callback
    if (onLocationSelect) {
      const coordinates: [number, number] = [location.lng, location.lat];
      onLocationSelect(coordinates);
    }
  }, [onLocationSelect]);

  // Updated search handler for geocoding
  const handleSearchWithCriteria = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    // Use geocoded location if selected
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      const newLocation: [number, number] = [selectedLocation.lng, selectedLocation.lat];
      onLocationSelect?.(newLocation);
      onSearchTrigger?.(newLocation, radius);
      handleSearch?.(event as React.FormEvent);
      onClose();
      return;
    }

    console.warn('No location selected for search');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <Paper
        elevation={24}
        sx={{
          width: '90%',
          maxWidth: '500px',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          borderRadius: 2
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
            {t('search_location')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Location Search */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
              {t('search_location_address')}
            </Typography>
            <Autocomplete
              freeSolo
              options={results}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                return option.address || option.name;
              }}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box key={key} component="li" {...otherProps} sx={{ cursor: 'pointer' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: '#64748b', mt: 0.5 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                          {option.address}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                          {option.city} • {option.postcode} • {option.type}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b' }}>
                            Score: {(option.score * 100).toFixed(0)}%
                          </Typography>
                          {option.importance > 0 && (
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              • Importance: {option.importance.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={selectedLocation ? selectedLocation.address : t('enter_location')}
                  size="medium"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        {loading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                      }
                    }
                  }}
                />
              )}
              onInputChange={(_, newInputValue) => handleInputChange(newInputValue)}
              onChange={(_, value) => {
                if (typeof value === 'object' && value !== null) {
                  handleLocationSelect(value);
                }
              }}
              loading={loading}
              noOptionsText={query ? t('no_locations_found') : t('type_to_search_locations')}
              filterOptions={(options) => options}
              value={selectedLocation}
            />
          </Box>

          {/* Selected Location Display */}
          {selectedLocation && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                {t('selected_location')}
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: 'rgba(99, 102, 241, 0.2)',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                  {selectedLocation.address}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label={selectedLocation.city} size="small" />
                  <Chip label={selectedLocation.postcode} size="small" />
                  <Chip label={selectedLocation.type} size="small" variant="outlined" />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* Search Radius */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', flexGrow: 1 }}>
                {t('search_radius')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${radius} km`}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={`${(Math.PI * radius * radius).toFixed(0)} km²`}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    fontWeight: 500
                  }}
                />
              </Box>
            </Box>
            <Slider
              value={radius}
              onChange={handleRadiusChange}
              min={1}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              sx={{
                width: '100%',
                '& .MuiSlider-thumb': {
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.5)'
                  }
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  height: 6,
                  borderRadius: 3
                },
                '& .MuiSlider-rail': {
                  backgroundColor: '#e2e8f0',
                  height: 6,
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="button"
              variant="contained"
              disabled={!selectedLocation}
              onClick={handleSearchWithCriteria}
              sx={{
                px: 4,
                py: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5558e3 0%, #7c4ce0 100%)',
                },
                '&:disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8'
                }
              }}
            >
              {t('search')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation(null);
              }}
              disabled={!selectedLocation}
              sx={{
                px: 4,
                py: 1,
                borderColor: '#6366f1',
                color: '#6366f1',
                '&:hover': {
                  borderColor: '#5558e3',
                  backgroundColor: 'rgba(99, 102, 241, 0.05)'
                }
              }}
            >
              {t('clear')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
});
