import React, { useEffect, useCallback, memo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { Box, Typography, IconButton, Paper, List, ListItem, ListItemText } from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';

interface MeasurementPoint {
  lng: number;
  lat: number;
}

interface Measurement {
  id: string;
  points: MeasurementPoint[];
  totalDistance: number;
  segmentDistances: number[];
}

interface RulerToolProps {
  map: maplibregl.Map | null;
  enabled: boolean;
  onMeasurementComplete?: (measurements: Measurement[]) => void;
}

const RulerTool: React.FC<RulerToolProps> = ({
  map,
  enabled,
  onMeasurementComplete
}) => {
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<MeasurementPoint[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const sourceId = 'ruler-measurements-source';
  const lineLayerId = 'ruler-measurements-line';
  const pointLayerId = 'ruler-measurements-point';
  const labelLayerId = 'ruler-measurements-label';

  const initializedRef = useRef(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = useCallback((point1: MeasurementPoint, point2: MeasurementPoint): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Format distance for display
  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(1)} km`;
    }
  }, []);

  // Generate GeoJSON for measurements
  const generateMeasurementsGeoJSON = useCallback((allMeasurements: Measurement[], currentPoints: MeasurementPoint[]) => {
    const features: any[] = [];

    // Add completed measurements
    allMeasurements.forEach(measurement => {
      // Add line feature
      if (measurement.points.length >= 2) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: measurement.points.map(p => [p.lng, p.lat])
          },
          properties: {
            id: measurement.id,
            type: 'measurement'
          }
        });
      }

      // Add point features
      measurement.points.forEach((point, index) => {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          },
          properties: {
            id: `${measurement.id}-point-${index}`,
            type: 'point',
            measurementId: measurement.id
          }
        });
      });

      // Add label features for segment distances
      measurement.segmentDistances.forEach((distance, index) => {
        if (index < measurement.points.length - 1) {
          const midPoint = [
            (measurement.points[index].lng + measurement.points[index + 1].lng) / 2,
            (measurement.points[index].lat + measurement.points[index + 1].lat) / 2
          ];
          features.push({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: midPoint
            },
            properties: {
              id: `${measurement.id}-label-${index}`,
              type: 'label',
              text: formatDistance(distance),
              measurementId: measurement.id
            }
          });
        }
      });
    });

    // Add current measurement being drawn
    if (currentPoints.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: currentPoints.map(p => [p.lng, p.lat])
        },
        properties: {
          type: 'current'
        }
      });
    }

    // Add current points
    currentPoints.forEach((point, index) => {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.lng, point.lat]
        },
        properties: {
          id: `current-point-${index}`,
          type: 'current-point'
        }
      });
    });

    return {
      type: "FeatureCollection" as const,
      features
    };
  }, [formatDistance]);

  // Initialize map layers
  useEffect(() => {
    if (!map || !enabled) return;



    const initializeSource = () => {
      if (!map || !map.isStyleLoaded()) return;

      // Add source with empty data
      if (!map.getSource(sourceId)) {
        try {
          map.addSource(sourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
            generateId: true
          });
        } catch (error) {
          console.error('Failed to add ruler source:', error);
          return;
        }
      }

      // Add line layer
      if (!map.getLayer(lineLayerId)) {
        try {
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#3b82f6',
              'line-width': 3,
              'line-opacity': 0.8
            },
            layout: {
              visibility: enabled ? 'visible' : 'none'
            },
            filter: ['==', ['get', 'type'], 'measurement']
          });
        } catch (error) {
          console.error('Failed to add ruler line layer:', error);
        }
      }

      // Add current line layer
      if (!map.getLayer(`${lineLayerId}-current`)) {
        try {
          map.addLayer({
            id: `${lineLayerId}-current`,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#ef4444',
              'line-width': 3,
              'line-opacity': 0.8,
              'line-dasharray': [2, 2]
            },
            layout: {
              visibility: enabled ? 'visible' : 'none'
            },
            filter: ['==', ['get', 'type'], 'current']
          });
        } catch (error) {
          console.error('Failed to add ruler current line layer:', error);
        }
      }

      // Add point layer
      if (!map.getLayer(pointLayerId)) {
        try {
          map.addLayer({
            id: pointLayerId,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 6,
              'circle-color': '#3b82f6',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            },
            layout: {
              visibility: enabled ? 'visible' : 'none'
            },
            filter: ['==', ['get', 'type'], 'point']
          });
        } catch (error) {
          console.error('Failed to add ruler point layer:', error);
        }
      }

      // Add current point layer
      if (!map.getLayer(`${pointLayerId}-current`)) {
        try {
          map.addLayer({
            id: `${pointLayerId}-current`,
            type: 'circle',
            source: sourceId,
            paint: {
              'circle-radius': 6,
              'circle-color': '#ef4444',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff'
            },
            layout: {
              visibility: enabled ? 'visible' : 'none'
            },
            filter: ['==', ['get', 'type'], 'current-point']
          });
        } catch (error) {
          console.error('Failed to add ruler current point layer:', error);
        }
      }

      // Add label layer
      if (!map.getLayer(labelLayerId)) {
        try {
          map.addLayer({
            id: labelLayerId,
            type: 'symbol',
            source: sourceId,
            paint: {
              'text-color': '#1e293b',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2
            },
            layout: {
              'text-field': ['get', 'text'],
              'text-font': ['Roboto Regular'],
              'text-size': 12,
              'text-anchor': 'center',
              'text-offset': [0, -1.5],
              visibility: enabled ? 'visible' : 'none'
            },
            filter: ['==', ['get', 'type'], 'label']
          });
        } catch (error) {
          console.error('Failed to add ruler label layer:', error);
        }
      }

      initializedRef.current = true;
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
  }, [map, enabled]);

  // Handle map clicks for measurement
  useEffect(() => {
    if (!map || !enabled || !isMeasuring) return;

    const handleClick = (e: any) => {
      const { lng, lat } = e.lngLat;
      const newPoint = { lng, lat };

      setCurrentMeasurement(prev => {
        let updated = [...prev, newPoint];

        // Handle 2-point mode: replace previous measurement
        if (updated.length === 2) {
          // Calculate distances
          const segmentDistances: number[] = [];
          for (let i = 0; i < updated.length - 1; i++) {
            segmentDistances.push(calculateDistance(updated[i], updated[i + 1]));
          }
          const totalDistance = segmentDistances.reduce((sum, dist) => sum + dist, 0);

          // Create new measurement and replace all existing measurements
          const newMeasurement: Measurement = {
            id: `measurement-${Date.now()}`,
            points: updated,
            totalDistance,
            segmentDistances
          };

          setMeasurements([newMeasurement]); // Replace all measurements with just this one
          setCurrentMeasurement([]);

          if (popupRef.current) {
            popupRef.current.remove();
            popupRef.current = null;
          }

          return [];
        }

        // Show temporary popup with current distance for first point
        if (updated.length === 1) {
          if (popupRef.current) {
            popupRef.current.remove();
          }

          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -20]
          })
            .setLngLat([lng, lat])
            .setHTML(`<div style="padding: 4px 8px; font-size: 12px; font-weight: 500;">${t('first_point_placed')}</div>`)
            .addTo(map);
        }

        return updated;
      });
    };

    const handleRightClick = () => {
      // Finish current measurement on right click
      if (currentMeasurement.length >= 2) {
        finishMeasurement();
      } else {
        // Cancel if less than 2 points
        setCurrentMeasurement([]);
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      }
    };

    map.on('click', handleClick);
    map.on('contextmenu', handleRightClick);

    return () => {
      map.off('click', handleClick);
      map.off('contextmenu', handleRightClick);
    };
  }, [map, enabled, isMeasuring, currentMeasurement, calculateDistance, formatDistance]);

  // Update source data when measurements change
  useEffect(() => {
    if (!map || !initializedRef.current) return;

    const source = map.getSource(sourceId) as maplibregl.GeoJSONSource;
    if (source) {
      const geoJSON = generateMeasurementsGeoJSON(measurements, currentMeasurement);
      source.setData(geoJSON);
    }
  }, [map, measurements, currentMeasurement, generateMeasurementsGeoJSON]);

  // Update visibility
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const layers = [
      lineLayerId,
      `${lineLayerId}-current`,
      pointLayerId,
      `${pointLayerId}-current`,
      labelLayerId
    ];

    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', enabled ? 'visible' : 'none');
      }
    });
  }, [map, enabled]);

  // Finish current measurement
  const finishMeasurement = useCallback(() => {
    if (currentMeasurement.length < 2) return;

    const segmentDistances: number[] = [];
    for (let i = 0; i < currentMeasurement.length - 1; i++) {
      segmentDistances.push(calculateDistance(currentMeasurement[i], currentMeasurement[i + 1]));
    }
    const totalDistance = segmentDistances.reduce((sum, dist) => sum + dist, 0);

    const newMeasurement: Measurement = {
      id: `measurement-${Date.now()}`,
      points: currentMeasurement,
      totalDistance,
      segmentDistances
    };

    setMeasurements(prev => [...prev, newMeasurement]);
    setCurrentMeasurement([]);
    setIsMeasuring(false);

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    onMeasurementComplete?.([...measurements, newMeasurement]);
  }, [currentMeasurement, measurements, calculateDistance, onMeasurementComplete]);

  // Clear all measurements
  const clearAllMeasurements = useCallback(() => {
    setMeasurements([]);
    setCurrentMeasurement([]);
    setIsMeasuring(false);

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    onMeasurementComplete?.([]);
  }, [onMeasurementComplete]);

  // Auto-start measuring when tool is enabled
  useEffect(() => {
    if (enabled && !isMeasuring) {
      setCurrentMeasurement([]);
      setIsMeasuring(true);
    } else if (!enabled && isMeasuring) {
      setCurrentMeasurement([]);
      setIsMeasuring(false);
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  }, [enabled]);

  // Toggle measuring mode for manual control
  const toggleMeasuring = useCallback(() => {
    if (!isMeasuring) {
      setCurrentMeasurement([]);
      setIsMeasuring(true);
    } else {
      if (currentMeasurement.length >= 2) {
        finishMeasurement();
      } else {
        setCurrentMeasurement([]);
        setIsMeasuring(false);
        if (popupRef.current) {
          popupRef.current.remove();
          popupRef.current = null;
        }
      }
    }
  }, [isMeasuring, currentMeasurement, finishMeasurement]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }

      if (map && initializedRef.current) {
        try {
          const layers = [
            lineLayerId,
            `${lineLayerId}-current`,
            pointLayerId,
            `${pointLayerId}-current`,
            labelLayerId
          ];

          layers.forEach(layerId => {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
          });

          if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
          }
        } catch (error) {
          console.error('Error cleaning up ruler tool:', error);
        }
      }
    };
  }, [map]);

  if (!enabled) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 5, // Moved from top: 10 to avoid navbar overlap
        left: 15, // Changed froms right: 10 to left: 10
        zIndex: 1000,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        boxShadow: 2,
        minWidth: 120
      }}
    >
      {/* Control Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={toggleMeasuring}
          color={isMeasuring ? 'primary' : 'default'}
          sx={{
            backgroundColor: isMeasuring ? 'primary.main' : 'transparent',
            color: isMeasuring ? 'white' : 'inherit',
            '&:hover': {
              backgroundColor: isMeasuring ? 'primary.dark' : 'action.hover'
            }
          }}
        >
          <StraightenIcon fontSize="small" />
        </IconButton>

        {/* Clear Current Measurement */}
        {currentMeasurement.length > 0 && (
          <IconButton
            size="small"
            onClick={() => {
              setCurrentMeasurement([]);
              if (popupRef.current) {
                popupRef.current.remove();
                popupRef.current = null;
              }
            }}
            color="warning"
            sx={{ fontSize: '10px' }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}

        {/* Clear All Measurements */}
        {measurements.length > 0 && (
          <IconButton
            size="small"
            onClick={clearAllMeasurements}
            color="error"
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Status Text */}
      {isMeasuring && (
        <Typography variant="caption" sx={{ fontSize: '10px', textAlign: 'center' }}>
          {t('click_two_points')}
        </Typography>
      )}

      {/* Measurement Display */}
      {measurements.length > 0 && (
        <Box>
          <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
            {measurements.map((measurement) => (
              <ListItem key={measurement.id} sx={{ py: 0, px: 1 }}>
                <ListItemText
                  primary={
                    <Typography variant="caption" sx={{ fontSize: '9px' }}>
                      {formatDistance(measurement.totalDistance)} • {measurement.points.length} {t('points')}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default memo(RulerTool);
