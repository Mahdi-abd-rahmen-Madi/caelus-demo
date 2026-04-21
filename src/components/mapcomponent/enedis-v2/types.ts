// Enedis V2 WMS TypeScript Definitions

export interface EnedisV2Feature {
  geometry: GeoJSON.Geometry;
  properties?: Record<string, any>;
  id?: string;
}

export interface EnedisV2WMSConfig {
  baseUrl: string;
  version: string;
  format: string;
  transparent: boolean;
  crs: string;
  styles: string;
}

export interface EnedisV2LayerConfig {
  layerName: string;
  sourceId: string;
  layerId: string;
  displayName: string;
  color: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface EnedisV2ComponentProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: EnedisV2Feature) => void;
}

export interface EnedisV2Props {
  map: maplibregl.Map | null;
  visible?: boolean;
  layers: {
    posteElectrique: boolean;
    posteSource: boolean;
    poteauElectrique: boolean;
    htaLines: boolean;
    btLines: boolean;
    htaLinesUnderground: boolean;
    btLinesUnderground: boolean;
  };
  opacity?: number;
  onLoadingChange?: (layer: string, loading: boolean) => void;
  onLoadError?: (layer: string, error: string) => void;
  onFeatureClick?: (feature: EnedisV2Feature, layerType: string) => void;
}

export interface EnedisV2State {
  loading: boolean;
  error: string | null;
  layersInitialized: boolean;
}

export type EnedisV2LayerType = 'posteElectrique' | 'posteSource' | 'poteauElectrique' | 'htaLines' | 'btLines' | 'htaLinesUnderground' | 'btLinesUnderground';

export const ENEDIS_V2_WMS_CONFIG: EnedisV2WMSConfig = {
  baseUrl: 'https://geobretagne.fr/geoserver/enedis/wms',
  version: '1.3.0',
  format: 'image/png',
  transparent: true,
  crs: 'EPSG:3857',
  styles: ''
} as const;

export const ENEDIS_V2_LAYERS: Record<EnedisV2LayerType, EnedisV2LayerConfig> = {
  posteElectrique: {
    layerName: 'poste_electrique',
    sourceId: 'enedis-v2-poste-electrique-source',
    layerId: 'enedis-v2-poste-electrique-layer',
    displayName: 'Electrical Substations',
    color: '#8b5cf6',
    minZoom: 8,
    maxZoom: 20
  },
  posteSource: {
    layerName: 'poste_source',
    sourceId: 'enedis-v2-poste-source-source',
    layerId: 'enedis-v2-poste-source-layer',
    displayName: 'Source Substations',
    color: '#a855f7',
    minZoom: 8,
    maxZoom: 20
  },
  poteauElectrique: {
    layerName: 'poteau_electrique',
    sourceId: 'enedis-v2-poteau-electrique-source',
    layerId: 'enedis-v2-poteau-electrique-layer',
    displayName: 'Electrical Poles',
    color: '#c084fc',
    minZoom: 10,
    maxZoom: 20
  },
  htaLines: {
    layerName: 'reseau_hta',
    sourceId: 'enedis-v2-hta-lines-source',
    layerId: 'enedis-v2-hta-lines-layer',
    displayName: 'HTA Lines',
    color: '#9333ea',
    minZoom: 8,
    maxZoom: 20
  },
  btLines: {
    layerName: 'reseau_bt',
    sourceId: 'enedis-v2-bt-lines-source',
    layerId: 'enedis-v2-bt-lines-layer',
    displayName: 'BT Lines',
    color: '#7c3aed',
    minZoom: 10,
    maxZoom: 20
  },
  htaLinesUnderground: {
    layerName: 'reseau_souterrain_hta',
    sourceId: 'enedis-v2-hta-lines-underground-source',
    layerId: 'enedis-v2-hta-lines-underground-layer',
    displayName: 'HTA Lines (Underground)',
    color: '#6b21a8',
    minZoom: 8,
    maxZoom: 20
  },
  btLinesUnderground: {
    layerName: 'reseau_souterrain_bt',
    sourceId: 'enedis-v2-bt-lines-underground-source',
    layerId: 'enedis-v2-bt-lines-underground-layer',
    displayName: 'BT Lines (Underground)',
    color: '#4c1d95',
    minZoom: 10,
    maxZoom: 20
  }
} as const;
