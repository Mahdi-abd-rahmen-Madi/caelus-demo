import React, { useEffect, useCallback, memo, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { Box, Typography, Paper, Slider, Button } from '@mui/material';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import PlaceIcon from '@mui/icons-material/Place';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

export interface BufferStyle {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
}

interface BufferZoneProps {
  map: maplibregl.Map | null;
  center?: [number, number];
  radius?: number;
  visible?: boolean;
  style?: BufferStyle;
  onRadiusChange?: (radius: number) => void;
  onCenterChange?: (center: [number, number]) => void;
}

const BufferZone: React.FC<BufferZoneProps> = ({
  map,
  center = [0, 0],
  radius = 1000,
  visible,
  style = {
    fillColor: '#3b82f6',
    fillOpacity: 0.2,
    strokeColor: '#3b82f6',
    strokeWidth: 2
  },
  onRadiusChange,
  onCenterChange
}) => {
  const { t } = useTranslation();

  const layerId = 'buffer-zone-layer';
  const borderLayerId = 'buffer-zone-border';
  const sourceId = 'buffer-zone-source';
  const isInitializedRef = useRef(false);
  const lastCenterRef = useRef<[number, number] | null>(null);
  const lastRadiusRef = useRef<number | null>(null);
  const lastStyleRef = useRef<BufferStyle | null>(null);

  // GeoJSON cache to prevent unnecessary regeneration
  const geoJsonCache = useRef<Map<string, { data: any, timestamp: number }>>(new Map());
  const MAX_CACHE_SIZE = 100;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes TTL

  // Generate buffer zone GeoJSON with caching
  const generateBufferGeoJSON = useCallback((centerLng: number, centerLat: number, radiusMeters: number) => {
    // Create cache key
    const cacheKey = `${centerLng.toFixed(4)}_${centerLat.toFixed(4)}_${radiusMeters.toFixed(0)}_${JSON.stringify(style)}`;

    // Check cache first with TTL validation
    const cached = geoJsonCache.current.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }

    // Generate circle with appropriate number of points
    const points = radiusMeters > 5000 ? 32 : 64; // Fewer points for large buffers
    const coordinates: number[][] = [];

    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      // Calculate point using Haversine formula for accuracy
      const lat = centerLat + (radiusMeters / 111320) * Math.cos(angle);
      const lng = centerLng + (radiusMeters / (111320 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
      coordinates.push([lng, lat]);
    }

    const result = {
      type: "FeatureCollection" as const,
      features: [{
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [coordinates]
        },
        properties: {
          radius: radiusMeters,
          center: [centerLng, centerLat]
        }
      }]
    };

    // Cache the result with timestamp
    if (geoJsonCache.current.size >= MAX_CACHE_SIZE) {
      // Remove oldest entries (simple LRU)
      const entries = Array.from(geoJsonCache.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => geoJsonCache.current.delete(key));
    }
    geoJsonCache.current.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }, [style]);

  // Memoize visibility calculation
  const actualVisibility = useMemo(() => {
    return visible ? 'visible' : 'none';
  }, [visible]);

  // Initialize buffer zone following Map Data Layer Design Pattern
  useEffect(() => {
    if (!map) return;



    const initializeSource = () => {
      if (!map || !map.isStyleLoaded()) return;

      // Add source with EMPTY data first (pattern requirement)
      if (!map.getSource(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: { type: "FeatureCollection", features: [] },
            generateId: true
          });
        } catch (error) {
          console.error('Failed to add buffer zone source:', error);
          return;
        }
      }

      // Add fill layer using empty source
      if (!map.getLayer(layerId)) {
        try {
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': style.fillColor,
              'fill-opacity': style.fillOpacity
            },
            layout: {
              visibility: actualVisibility
            }
          });

          // Add border layer using same source
          map.addLayer({
            id: borderLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': style.strokeColor,
              'line-width': style.strokeWidth,
              'line-opacity': 0.8
            },
            layout: {
              visibility: actualVisibility
            }
          });

          isInitializedRef.current = true;
        } catch (error) {
          console.error('Failed to add buffer zone layers:', error);
        }
      }
    };

    if (!map.isStyleLoaded()) {
      const handleStyleData = () => {
        initializeSource();
        map.off('styledata', handleStyleData);
      };
      map.on('styledata', handleStyleData);
    } else {
      initializeSource();
    }

    return () => {
    };
  }, [map, style, actualVisibility]);

  // Handle map clicks to place buffer zone
  useEffect(() => {
    if (!map || !visible) return;

    const handleMapClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      const newCenter: [number, number] = [lng, lat];

      // Update center and notify parent
      onCenterChange?.(newCenter);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, visible, onCenterChange]);

  // Update source data and paint properties when parameters change
  useEffect(() => {
    if (!map || !isInitializedRef.current) return;

    // Check if center, radius, or style actually changed
    const centerChanged = !lastCenterRef.current ||
      Math.abs(center[0] - lastCenterRef.current[0]) > 0.0001 ||
      Math.abs(center[1] - lastCenterRef.current[1]) > 0.0001;
    const radiusChanged = !lastRadiusRef.current || Math.abs(radius - lastRadiusRef.current) > 1;
    const styleChanged = !lastStyleRef.current ||
      JSON.stringify(style) !== JSON.stringify(lastStyleRef.current);

    // Update source data if center or radius changed
    if (centerChanged || radiusChanged) {
      const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
      if (source) {
        const newGeoJSON = generateBufferGeoJSON(center[0], center[1], radius);
        source.setData(newGeoJSON);
        lastCenterRef.current = center;
        lastRadiusRef.current = radius;
      }
    }

    // Update paint properties if style changed
    if (styleChanged) {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, 'fill-color', style.fillColor);
        map.setPaintProperty(layerId, 'fill-opacity', style.fillOpacity);
      }
      if (map.getLayer(borderLayerId)) {
        map.setPaintProperty(borderLayerId, 'line-color', style.strokeColor);
        map.setPaintProperty(borderLayerId, 'line-width', style.strokeWidth);
      }
      lastStyleRef.current = style;
    }
  }, [map, center, radius, style, generateBufferGeoJSON]);

  // Update visibility
  useEffect(() => {
    if (!map || !map.isStyleLoaded() || typeof map.getLayer !== 'function') return;

    try {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', actualVisibility);
      }
      if (map.getLayer(borderLayerId)) {
        map.setLayoutProperty(borderLayerId, 'visibility', actualVisibility);
      }
    } catch (error) {
      console.warn('Error setting buffer zone visibility:', error);
    }
  }, [map, actualVisibility]);

  // Handle radius change
  const handleRadiusChange = useCallback((_: any, newValue: number | number[]) => {
    const newRadius = Array.isArray(newValue) ? newValue[0] : newValue;
    onRadiusChange?.(newRadius);
  }, [onRadiusChange]);

  // Format radius for display
  const formatRadius = useCallback((radiusMeters: number): string => {
    if (radiusMeters < 1000) {
      return `${radiusMeters} m`;
    } else {
      return `${(radiusMeters / 1000).toFixed(1)} km`;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear cache on component unmount
      geoJsonCache.current.clear();

      // Only cleanup if map exists and is not being destroyed
      // Check if map container still exists in DOM to avoid cleanup on destroyed maps
      if (map &&
        isInitializedRef.current &&
        typeof map.getLayer === 'function' &&
        typeof map.getSource === 'function' &&
        map.getContainer() &&
        map.getContainer().parentNode) {
        try {
          if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
          }
          if (map.getLayer(borderLayerId)) {
            map.removeLayer(borderLayerId);
          }
          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        } catch (error) {
          // Silently ignore cleanup errors during map destruction
          console.debug('Buffer zone cleanup error (expected during map destruction):', error);
        }
        isInitializedRef.current = false;
      }
    };
  }, [map]);

  if (!visible) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 5, // Changed from bottom: 10 to top: 80
        left: 15, // Changed from left: 20 to right: 20 to avoid ruler tool overlap
        zIndex: 1000,
        p: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        boxShadow: 2,
        minWidth: 200
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CropSquareIcon sx={{ mr: 1, fontSize: 16, color: style.fillColor }} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '11px' }}>
          {t('buffer_zone')}
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        {/* Instructional text - not a button */}
        <Box sx={{
          mb: 2,
          p: 1.5,
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderRadius: 1,
          border: '1px dashed rgba(99, 102, 241, 0.3)',
          textAlign: 'center'
        }}>
          <Typography variant="caption" sx={{
            fontSize: '10px',
            color: '#6366f1',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5
          }}>
            <PlaceIcon fontSize="small" />
            {t('place_buffer_here')}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ClearIcon fontSize="small" />}
          onClick={() => {
            // Reset buffer zone to default center [0, 0]
            onCenterChange?.([0, 0]);
          }}
          sx={{ mb: 1, fontSize: '10px' }}
        >
          {t('clear_buffer_location')}
        </Button>

        <Typography variant="caption" sx={{
          fontWeight: 500,
          mb: 1,
          fontSize: '10px',
          color: '#64748b',
          display: 'block'
        }}>
          {t('buffer_radius')}: {formatRadius(radius)}
        </Typography>
        <Slider
          value={radius}
          onChange={handleRadiusChange}
          valueLabelDisplay="auto"
          min={50}
          max={10000}
          step={50}
          marks={[
            { value: 0, label: '0' }
          ]}
          sx={{
            color: style.fillColor,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
            '& .MuiSlider-track': {
              height: 4,
            },
            '& .MuiSlider-rail': {
              height: 4,
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ fontSize: '9px', color: '#64748b' }}>
          {t('area')}: {((Math.PI * radius * radius) / 1000000).toFixed(2)} km²
        </Typography>
        <Typography variant="caption" sx={{ fontSize: '9px', color: '#64748b' }}>
          {t('circumference')}: {(2 * Math.PI * radius / 1000).toFixed(1)} km
        </Typography>
      </Box>
    </Paper>
  );
};

export default memo(BufferZone);
