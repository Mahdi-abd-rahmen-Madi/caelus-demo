import maplibregl from 'maplibre-gl';
import React from 'react';
import CarmenCartoWMSLayer, { type CarmenCartoWMSLayerConfig } from '../../../utils/carmencartoWMSLayer';

interface SeismicZonesProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  onTileLoad?: (features: number) => void;
  minZoom?: number;
  maxZoom?: number;
  onSeismicClick?: (properties: any) => void;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  // Note: Individual zone filtering removed - WMS service shows all zones by default
}

// Seismic zoning layer configuration using both zones and communes for complete coverage
const SEISMIC_ZONES_CONFIG: CarmenCartoWMSLayerConfig = {
  layerName: 'Zonage_sismique_Zones,Zonage_sismique_Communes',
  sourceId: 'seismic-zones-carmencarto-source',
  layerId: 'seismic-zones-carmencarto-layer',
  displayName: 'Seismic Zoning',
  minZoom: 0,
  maxZoom: 20
} as const;

const SeismicZones: React.FC<SeismicZonesProps> = ({
  map,
  visible = false,
  opacity = 0.7,
  minZoom = 0,
  maxZoom = 20,
  onLoadingChange,
  onLoadError,
  onSeismicClick
}) => {
  // Handle feature click to maintain compatibility with existing interface
  const handleFeatureClick = React.useCallback((feature: any) => {
    if (onSeismicClick) {
      // Extract relevant properties from the CarmenCarto feature
      const seismicProperties = {
        ...feature.properties,
        source: 'carmencarto',
        layer_type: 'seismic_zoning'
      };
      onSeismicClick(seismicProperties);
    }
  }, [onSeismicClick]);

  return (
    <CarmenCartoWMSLayer
      map={map}
      visible={visible}
      opacity={opacity}
      minZoom={minZoom}
      maxZoom={maxZoom}
      onLoadingChange={onLoadingChange}
      onLoadError={onLoadError}
      onFeatureClick={handleFeatureClick}
      layerConfig={SEISMIC_ZONES_CONFIG}
    />
  );
};

export default SeismicZones;
