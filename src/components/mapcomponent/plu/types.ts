// PLU (Plan Local d'Urbanisme) WMS TypeScript Definitions

export interface PluFeature {
  geometry: GeoJSON.Geometry;
  properties?: Record<string, any>;
  id?: string;
}

export interface PluWMSConfig {
  baseUrl: string;
  version: string;
  format: string;
  transparent: boolean;
  crs: string;
  styles: string;
}

export interface PluLayerConfig {
  layerName: string;
  endpoint: string;
  sourceId: string;
  layerId: string;
  displayName: string;
  color: string;
  description?: string;
  minZoom?: number;
  maxZoom?: number;
  crs?: string; // Override default CRS for specific layers
}

export interface PluComponentProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  onLoadingChange?: (loading: boolean) => void;
  onLoadError?: (error: string) => void;
  onFeatureClick?: (feature: PluFeature) => void;
}

export interface PluProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  pluLayers?: {
    'zoning-sectors': boolean;
    'prescriptions': boolean;
    'information': boolean;
  };
  onLoadingChange?: (layer: string, loading: boolean) => void;
  onLoadError?: (layer: string, error: string) => void;
  onFeatureClick?: (feature: PluFeature, layerType: string) => void;
}

export interface PluState {
  loading: boolean;
  error: string | null;
  layersInitialized: boolean;
}

export type PluLayerType = 'zoning-sectors' | 'prescriptions' | 'information';

// PCI Parcels Types
export interface PCIParcelsFeature {
  geometry: GeoJSON.Geometry;
  properties?: Record<string, any>;
  id?: string;
}

export interface PCIParcelsLayerConfig {
  sourceId: string;
  layerId: string;
  displayName: string;
  color: string;
  description?: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface PCIParcelsProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  pciLayers?: {
    main: boolean;
  };
  onLoadingChange?: (layer: PCIParcelsLayerType, loading: boolean) => void;
  onLoadError?: (layer: PCIParcelsLayerType, error: string) => void;
  onFeatureClick?: (feature: PCIParcelsFeature, layerType: PCIParcelsLayerType) => void;
}

export type PCIParcelsLayerType = 'main';

// BDTOPO Types
export interface BDTOPOFeature {
  geometry: GeoJSON.Geometry;
  properties?: Record<string, any>;
  id?: string;
}

export interface BDTOPOLayerConfig {
  sourceId: string;
  layerId: string;
  displayName: string;
  color: string;
  layerType: 'fill' | 'line' | 'circle';
  description?: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface BDTOPOProps {
  map: maplibregl.Map | null;
  visible?: boolean;
  opacity?: number;
  minZoom?: number;
  maxZoom?: number;
  bdtopoLayers?: {
    buildings: boolean;
  };
  onLoadingChange?: (layer: BDTOPOLayerType, loading: boolean) => void;
  onLoadError?: (layer: BDTOPOLayerType, error: string) => void;
  onFeatureClick?: (feature: BDTOPOFeature, layerType: BDTOPOLayerType) => void;
}

export type BDTOPOLayerType = 'buildings';

// PCI Parcels Configuration
export const PCI_PARCELS_CONFIG = {
  sourceId: 'pci-parcels-source',
  tiles: ['https://data.geopf.fr/tms/1.0.0/PCI/{z}/{x}/{y}.pbf'],
  minZoom: 14,
  maxZoom: 20,
  attribution: '© IGN'
} as const;

export const PCI_PARCELS_LAYERS = [
  'parcelle', 'parcels', 'pci_parcelle', 'pci_parcelles',
  'cadastral_parcels', 'parcelles', 'PARCELLE'
] as const;

// BDTOPO Configuration
export const BDTOPO_CONFIG = {
  sourceId: 'bdtopo-source',
  tiles: ['https://data.geopf.fr/tms/1.0.0/BDTOPO/{z}/{x}/{y}.pbf'],
  minZoom: 12,
  maxZoom: 20,
  attribution: '© IGN'
} as const;

export const BDTOPO_LAYERS = {
  buildings: ['batiment', 'building', 'buildings', 'bati', 'BATIMENT']
} as const;

export const PLU_WMS_CONFIG: PluWMSConfig = {
  baseUrl: 'https://data.geopf.fr/wms-v/ows',
  version: '1.3.0',
  format: 'image/png',
  transparent: true,
  crs: 'EPSG:3857',
  styles: ''
} as const;

export const PLU_LAYERS: Record<PluLayerType, PluLayerConfig> = {
  'zoning-sectors': {
    layerName: 'zone_secteur',
    endpoint: 'zoning-sectors',
    sourceId: 'plu-zoning-sectors-source',
    layerId: 'plu-zoning-sectors-layer',
    displayName: 'Zoning Sectors',
    color: '#10b981',
    description: 'Urban planning zoning sectors and land use designation',
    minZoom: 8,
    maxZoom: 20
  },
  'prescriptions': {
    layerName: 'prescription',
    endpoint: 'prescriptions',
    sourceId: 'plu-prescriptions-source',
    layerId: 'plu-prescriptions-layer',
    displayName: 'Planning Prescriptions',
    color: '#059669',
    description: 'Urban planning prescriptions and regulatory requirements',
    minZoom: 10,
    maxZoom: 20
  },
  'information': {
    layerName: 'information',
    endpoint: 'information',
    sourceId: 'plu-information-source',
    layerId: 'plu-information-layer',
    displayName: 'Planning Information',
    color: '#047857',
    description: 'General urban planning information and documentation',
    minZoom: 8,
    maxZoom: 20
  }
} as const;
