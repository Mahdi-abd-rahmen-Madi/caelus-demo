// Canalisations WMS TypeScript Definitions

export interface CanalisationsFeature {
  geometry: GeoJSON.Geometry;
  properties?: Record<string, any>;
  id?: string;
}

export interface CanalisationsWMSConfig {
  baseUrl: string;
  version: string;
  format: string;
  transparent: boolean;
  crs: string;
  styles: string;
}

export interface CanalisationsLayerConfig {
  layerName: string;
  sourceId: string;
  layerId: string;
  displayName: string;
  color: string;
  minZoom?: number;
  maxZoom?: number;
  crs?: string; // Override default CRS for specific layers
}

export interface CanalisationsProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: CanalisationsFeature) => void;
}

export const CANALISATIONS_WMS_CONFIG: CanalisationsWMSConfig = {
  baseUrl: 'https://mapsref.brgm.fr/wxs/georisques/risques',
  version: '1.3.0',
  format: 'image/png',
  transparent: true,
  crs: 'EPSG:3857',
  styles: ''
} as const;

export const CANALISATIONS_CONFIG: CanalisationsLayerConfig = {
  layerName: 'CANALISATIONS',
  sourceId: 'canalisations-main-source',
  layerId: 'canalisations-main-layer',
  displayName: 'Canalisations Network',
  color: '#ef4444',
  minZoom: 6,
  maxZoom: 20
} as const;
