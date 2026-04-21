import React, { useEffect, memo, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import ICPEPopup from './icpe-popup';

interface SevesoInstallationsVectorProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onSevesoClick?: (properties: any) => void;
  onICPEPopupVisibilityChange?: (visible: boolean) => void;
  icpeFilters?: {
    '1': boolean; // Seuil Haut
    '2': boolean; // Seuil Bas
    '3': boolean; // Non Seveso
  };
}

export const SevesoInstallationsVector: React.FC<SevesoInstallationsVectorProps> = ({
  map,
  visible = true,
  opacity = 1.0,
  onSevesoClick,
  onICPEPopupVisibilityChange,
  icpeFilters = { '1': true, '2': true, '3': false }
}) => {
  const sourceId = 'seveso-installations-vector-source';
  const layerId = 'seveso-installations-vector';
  const highlightLayerId = 'seveso-installations-vector-highlight';
  const initializedRef = useRef(false);
  const [popupState, setPopupState] = useState<{
    visible: boolean;
    installation: any;
  }>({
    visible: false,
    installation: null
  });
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<string | null>(null);
  const [highlightedFeatureCoords, setHighlightedFeatureCoords] = useState<[number, number] | null>(null);

  // Debounced filter update to prevent performance issues
  const filterUpdateTimeoutRef = useRef<number | null>(null);

  // Function to create filter based on ICPE classification filters (optimized with useMemo)
  const getICPEFilter = useMemo(() => {
    const activeFilters = Object.entries(icpeFilters)
      .filter(([_, enabled]) => enabled)
      .map(([classification, _]) => ['==', ['get', 'seveso_classification'], classification]);

    if (activeFilters.length === 0) {
      // If no filters are enabled, show nothing
      return ['==', ['get', 'seveso_classification'], ''] as maplibregl.FilterSpecification;
    } else if (activeFilters.length === 1) {
      // If only one filter is enabled, use it directly
      return activeFilters[0] as maplibregl.FilterSpecification;
    } else {
      // If multiple filters are enabled, use 'any' to show any of them
      return ['any', ...activeFilters] as maplibregl.FilterSpecification;
    }
  }, [icpeFilters]);

  // Initialize source and layers following Pattern B from user rules
  useEffect(() => {
    if (!map) return;

    function initializeSource() {
      if (!map || !map.isStyleLoaded()) return;

      // Add vector tile source (backend handles decompression)
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'vector',
          tiles: ['http://localhost:8000/api/geodata/tiles/simple/seveso/{z}/{x}/{y}/'],
          minzoom: 0,
          maxzoom: 18
        });
      }

      // Add Seveso installations layer using vector source with source-layer
      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: 'circle',
          source: sourceId,
          'source-layer': 'seveso_installations', // Required for vector tiles
          filter: getICPEFilter,
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'seveso_classification'], '1'], 8,  // Seuil Haut - largest
              ['==', ['get', 'seveso_classification'], '2'], 6,  // Seuil Bas - medium
              ['==', ['get', 'seveso_classification'], '3'], 4,  // Non Seveso - smallest
              5  // Default radius
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'seveso_classification'], '1'], '#d32f2f',  // Red for Seuil Haut
              ['==', ['get', 'seveso_classification'], '2'], '#f57c00',  // Orange for Seuil Bas
              ['==', ['get', 'seveso_classification'], '3'], '#757575',  // Gray for Non Seveso
              '#9e9e9e'  // Default gray
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': opacity
          },
          layout: {
            visibility: visible ? 'visible' : 'none'
          }
        });

        // Ensure filter is properly applied after layer creation
        setTimeout(() => {
          if (map && map.getLayer(layerId)) {
            map.setFilter(layerId, getICPEFilter);
          }
        }, 100);

        // Add source data listener to ensure tiles are loaded
        const onSourceData = (e: any) => {
          if (e.sourceId === sourceId && e.isSourceLoaded) {
            // Re-apply filter when source data is loaded
            if (map && map.getLayer(layerId)) {
              map.setFilter(layerId, getICPEFilter);
            }
            map.off('sourcedata', onSourceData);
          }
        };
        map.on('sourcedata', onSourceData);
      }

      // Add highlight layer
      if (!map.getLayer(highlightLayerId)) {
        map.addLayer({
          id: highlightLayerId,
          type: 'circle',
          source: sourceId,
          'source-layer': 'seveso_installations',
          paint: {
            'circle-radius': 12,  // Larger than regular circles
            'circle-color': '#FFD700',  // Gold color for highlight
            'circle-stroke-color': '#FFA500',  // Orange outline
            'circle-stroke-width': 3,
            'circle-opacity': 0.9
          },
          filter: ['==', ['get', 'id'], ''],  // Initially empty filter (no highlight)
          layout: {
            visibility: visible ? 'visible' : 'none'
          }
        });
      }

      // Add click handlers for interaction
      const handleClick = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const props = feature.properties;
          const coords = feature.geometry.coordinates;

          // Set highlight for the clicked feature
          if (props.id && map) {
            setHighlightedFeatureId(props.id.toString());
            setHighlightedFeatureCoords([coords[0], coords[1]]);

            // Update highlight filter with proper validation
            if (map.getLayer(highlightLayerId)) {
              try {
                map.setFilter(highlightLayerId, ['==', ['get', 'id'], props.id]);
              } catch (error) {
                console.error('SevesoInstallationsVector: Error setting highlight filter:', error);
              }
            }
          }

          // Center the map on the clicked feature
          if (coords && map) {
            map.flyTo({
              center: [coords[0], coords[1]],
              zoom: Math.max(map.getZoom(), 12), // Ensure we're zoomed in enough to see details
              essential: true
            });
          }

          // Call the original callback if provided
          if (onSevesoClick) {
            onSevesoClick(props);
          }

          // Show popup (delayed to allow map to center first)
          setTimeout(() => {
            setPopupState({
              visible: true,
              installation: props
            });
          }, 800); // Delay to allow flyTo animation to complete
        }
      };

      map.on('click', layerId, handleClick);

      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });

      initializedRef.current = true;
    }

    // Handle style changes only
    const handleStyleChange = () => {
      setTimeout(() => {
        if (map && map.isStyleLoaded()) {
          // Only reset if source was actually removed (style change)
          if (!map.getSource(sourceId)) {
            initializeSource();
          }
        }
      }, 100);
    };

    window.addEventListener('mapStyleChanged', handleStyleChange);

    // Improved style loading detection with retry mechanism
    const tryInitialize = (attempt = 0) => {
      if (!map || !map.isStyleLoaded()) {
        if (attempt < 5) {
          setTimeout(() => tryInitialize(attempt + 1), 100);
        } else {
          // Fallback: try anyway after timeout
          setTimeout(() => initializeSource(), 500);
        }
        return;
      }
      initializeSource();
    };

    if (!map.isStyleLoaded()) {
      const handleStyleData = () => {
        tryInitialize();
        map.off('styledata', handleStyleData);
      };
      map.on('styledata', handleStyleData);

      // Also try initializing after a delay as fallback
      setTimeout(() => tryInitialize(), 200);
    } else {
      tryInitialize();
    }

    return () => {
      window.removeEventListener('mapStyleChanged', handleStyleChange);
    };
  }, [map, sourceId, layerId, highlightLayerId, opacity, onSevesoClick]);

  // Update visibility
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    // Check if both layers exist before applying visibility changes
    const mainLayerExists = map.getLayer(layerId);
    const highlightLayerExists = map.getLayer(highlightLayerId);

    if (!mainLayerExists) {
      console.warn('SevesoInstallationsVector: Main layer not found, skipping visibility update');
      return;
    }

    const visibility = visible ? 'visible' : 'none';

    try {
      // Update main layer visibility
      map.setLayoutProperty(layerId, 'visibility', visibility);

      // Synchronize highlight layer visibility if it exists
      if (highlightLayerExists) {
        map.setLayoutProperty(highlightLayerId, 'visibility', visibility);
      }

      // If becoming visible, ensure filter is properly applied (without setTimeout to avoid race conditions)
      if (visible) {
        if (map.getLayer(layerId)) {
          map.setFilter(layerId, getICPEFilter);
        }
      }
    } catch (error) {
      console.error('SevesoInstallationsVector: Error updating visibility:', error);
    }
  }, [map, visible, layerId, highlightLayerId, getICPEFilter]);

  // Update opacity
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const mainLayerExists = map.getLayer(layerId);

    if (!mainLayerExists) {
      console.warn('SevesoInstallationsVector: Main layer not found, skipping opacity update');
      return;
    }

    try {
      map.setPaintProperty(layerId, 'circle-opacity', opacity);
    } catch (error) {
      console.error('SevesoInstallationsVector: Error updating opacity:', error);
    }
  }, [map, opacity, layerId]);

  // Update filter when ICPE filters change (with debouncing for performance)
  useEffect(() => {
    // Clear any existing timeout
    if (filterUpdateTimeoutRef.current) {
      clearTimeout(filterUpdateTimeoutRef.current);
    }

    // Debounce filter update to prevent performance issues
    filterUpdateTimeoutRef.current = setTimeout(() => {
      if (!map || !map.isStyleLoaded()) return;

      const mainLayerExists = map.getLayer(layerId);

      if (!mainLayerExists) {
        console.warn('SevesoInstallationsVector: Main layer not found, skipping filter update');
        return;
      }

      try {
        map.setFilter(layerId, getICPEFilter);
      } catch (error) {
        console.error('SevesoInstallationsVector: Error updating filter:', error);
      }
    }, 50); // 50ms debounce

    return () => {
      if (filterUpdateTimeoutRef.current) {
        clearTimeout(filterUpdateTimeoutRef.current);
      }
    };
  }, [map, getICPEFilter, layerId]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleMapClick = () => {
      setPopupState(prev => ({ ...prev, visible: false }));
      // Clear highlight when clicking outside
      if (map && map.getLayer(highlightLayerId)) {
        try {
          map.setFilter(highlightLayerId, ['==', ['get', 'id'], '']);
        } catch (error) {
          console.error('SevesoInstallationsVector: Error clearing highlight on map click:', error);
        }
      }
      setHighlightedFeatureId(null);
      setHighlightedFeatureCoords(null);
    };

    if (map) {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [map, highlightLayerId]);

  // Close popup and remove highlight when map moves away from highlighted feature
  useEffect(() => {
    if (!map || !highlightedFeatureId || !highlightedFeatureCoords) return;

    const handleMapMove = () => {
      if (!popupState.visible) return;

      const center = map.getCenter();
      const bounds = map.getBounds();

      // Check if highlighted feature is still in viewport
      const [featureLng, featureLat] = highlightedFeatureCoords;
      const featureInBounds = bounds.contains([featureLng, featureLat]);

      // Also check if feature is too far from center (user has panned away significantly)
      const distanceFromCenter = Math.sqrt(
        Math.pow(center.lng - featureLng, 2) + Math.pow(center.lat - featureLat, 2)
      );
      const maxDistance = 0.05; // Roughly 5km at current zoom levels

      // Close popup if feature is out of view or too far from center
      if (!featureInBounds || distanceFromCenter > maxDistance) {
        setPopupState(prev => ({ ...prev, visible: false }));
        // Clear highlight with proper validation
        if (map.getLayer(highlightLayerId)) {
          try {
            map.setFilter(highlightLayerId, ['==', ['get', 'id'], '']);
          } catch (error) {
            console.error('SevesoInstallationsVector: Error clearing highlight on map move:', error);
          }
        }
        setHighlightedFeatureId(null);
        setHighlightedFeatureCoords(null);
      }
    };

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
    };
  }, [map, highlightedFeatureId, highlightedFeatureCoords, popupState.visible, highlightLayerId]);

  // Notify parent of popup visibility changes
  useEffect(() => {
    if (onICPEPopupVisibilityChange) {
      onICPEPopupVisibilityChange(popupState.visible);
    }
  }, [popupState.visible, onICPEPopupVisibilityChange]);

  return (
    <>
      {popupState.visible && (
        <ICPEPopup
          installation={popupState.installation}
          onClose={() => {
            setPopupState(prev => ({ ...prev, visible: false }));
            // Clear highlight when popup is closed with proper validation
            if (map && map.getLayer(highlightLayerId)) {
              try {
                map.setFilter(highlightLayerId, ['==', ['get', 'id'], '']);
              } catch (error) {
                console.error('SevesoInstallationsVector: Error clearing highlight on popup close:', error);
              }
            }
            setHighlightedFeatureId(null);
            setHighlightedFeatureCoords(null);
          }}
        />
      )}
    </>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(SevesoInstallationsVector);
