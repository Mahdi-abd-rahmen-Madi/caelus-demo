import React from 'react';
import type { IGNLayerConfig, IGNVectorTileConfig } from '../../../utils/ignVectorTileLayer';
import IGNVectorTileLayer from '../../../utils/ignVectorTileLayer';
import type { PCIParcelsFeature, PCIParcelsLayerType, PCIParcelsProps } from './types';

const PCIParcels: React.FC<PCIParcelsProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 14,
  maxZoom = 20,
  pciLayers,
  onLoadError,
  onFeatureClick
}) => {
  // PCI configuration using the new utility
  const config: IGNVectorTileConfig = {
    serviceType: 'pci',
    sourceId: 'pci-parcels-source',
    minZoom: 0,
    maxZoom: 20,
    attribution: '© IGN'
  };

  // PCI layers with multiple source-layer fallbacks for robustness
  const layers: IGNLayerConfig[] = [
    {
      id: 'parcelle',
      type: 'line',
      sourceLayer: 'parcelle',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'parcels',
      type: 'line',
      sourceLayer: 'parcels',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'pci_parcelle',
      type: 'line',
      sourceLayer: 'pci_parcelle',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'pci_parcelles',
      type: 'line',
      sourceLayer: 'pci_parcelles',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'cadastral_parcels',
      type: 'line',
      sourceLayer: 'cadastral_parcels',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'parcelles',
      type: 'line',
      sourceLayer: 'parcelles',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    },
    {
      id: 'PARCELLE',
      type: 'line',
      sourceLayer: 'PARCELLE',
      paint: {
        'line-color': '#D82626',
        'line-width': 1
      }
    }
  ];

  // Layer visibility - only show main layer when enabled
  const layerVisibility = {
    'parcelle': pciLayers?.main || false,
    'parcels': pciLayers?.main || false,
    'pci_parcelle': pciLayers?.main || false,
    'pci_parcelles': pciLayers?.main || false,
    'cadastral_parcels': pciLayers?.main || false,
    'parcelles': pciLayers?.main || false,
    'PARCELLE': pciLayers?.main || false
  };

  // Handle feature clicks
  const handleFeatureClick = (feature: any) => {
    if (onFeatureClick) {
      const pciFeature = feature as PCIParcelsFeature;
      const layerType: PCIParcelsLayerType = 'main';
      onFeatureClick(pciFeature, layerType);
    }
  };

  // Handle load errors
  const handleLoadError = (_layerId: string, error: string) => {
    if (onLoadError) {
      const layerType: PCIParcelsLayerType = 'main';
      onLoadError(layerType, error);
    }
  };

  return (
    <IGNVectorTileLayer
      map={map}
      visible={visible}
      opacity={opacity}
      minZoom={minZoom}
      maxZoom={maxZoom}
      config={config}
      layers={layers}
      layerVisibility={layerVisibility}
      onFeatureClick={handleFeatureClick}
      onLoadError={handleLoadError}
    />
  );
};

export default PCIParcels;
