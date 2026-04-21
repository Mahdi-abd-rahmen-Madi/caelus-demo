// Demo API Service - All backend calls replaced with mock implementations
// Re-export everything from demoApi for compatibility
export * from './demoApi';

// Additional exports for compatibility
export const API_BASE_URL = '/api'; // Not used in demo

// Mock cache for compatibility
export const apiCache = {
  set: (_key: string, _value: any, _ttl?: number) => { },
  get: (_key: string) => null,
  deduplicate: async (_key: string, requestFn: () => Promise<any>) => requestFn(),
  clear: () => { },
  generateKey: (url: string) => url,
  evictOldest: () => { }
};

// Mock fetch functions
export const authenticatedFetch = async (_url: string, _options?: RequestInit): Promise<Response> => {
  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
};

export const cachedFetch = authenticatedFetch;

// Mock functions needed by components
export const getGeorisquesData = async (longitude: number, latitude: number) => {
  // Import the function to avoid circular dependencies
  const { getRiskAssessment } = await import('./demoApi');
  return await getRiskAssessment({ lng: longitude, lat: latitude });
};

export const getGeorisquesDataDirect = getGeorisquesData;

export const getParcelDetailWithGeorisques = async (parcelId: string) => {
  // Import the function to avoid circular dependencies
  const { getParcelById } = await import('./demoApi');
  const parcel = await getParcelById(parcelId);
  if (parcel && parcel.longitude && parcel.latitude) {
    parcel.georisques_data = await getGeorisquesData(parcel.longitude, parcel.latitude);
  }
  return parcel;
};

// Export tracker functions for direct use
export const getSeismicTrackerData = async (location: { lng: number; lat: number }) => {
  const { getSeismicTrackerData } = await import('./demoApi');
  return await getSeismicTrackerData(location);
};

export const getInondationTrackerData = async (location: { lng: number; lat: number }) => {
  const { getInondationTrackerData } = await import('./demoApi');
  return await getInondationTrackerData(location);
};

export const getHeatwaveTrackerData = async (location: { lng: number; lat: number }) => {
  const { getHeatwaveTrackerData } = await import('./demoApi');
  return await getHeatwaveTrackerData(location);
};

export const getThunderTrackerData = async (location: { lng: number; lat: number }) => {
  const { getThunderTrackerData } = await import('./demoApi');
  return await getThunderTrackerData(location);
};

// Export RTE functions
export const getRTETileData = async (z: number, x: number, y: number, filters?: any) => {
  const { getRTETileData } = await import('./demoApi');
  return await getRTETileData(z, x, y, filters);
};

export const getRTETileUrl = (z: number, x: number, y: number, filters?: any) => {
  // This is a synchronous function, so we need to handle it differently
  // For now, return the URL pattern directly
  const params = new URLSearchParams();
  
  if (filters?.voltageRange) {
    params.set('voltage_min', `${filters.voltageRange[0]}`);
    params.set('voltage_max', `${filters.voltageRange[1]}`);
  }
  
  if (filters?.aerien !== undefined) {
    params.set('aerien', filters.aerien.toString());
  }
  
  if (filters?.souterrain !== undefined) {
    params.set('souterrain', filters.souterrain.toString());
  }
  
  const paramString = params.toString();
  return `${window.location.origin}/api/geodata/tiles/rte/${z}/${x}/${y}/${paramString ? '?' + paramString : ''}`;
};

export const getRTEMetadata = async () => {
  return {};
};

export const getSuitableParcels = async () => {
  const { getParcelsByLocation } = await import('./demoApi');
  const response = await getParcelsByLocation();
  
  // Map GeoJSON features to SuitableParcel interface
  const parcels = (response.parcels || []).map((feature: any) => ({
    parcel_id: feature.properties?.parcel_id || '',
    area: feature.properties?.area || 0,
    longitude: feature.properties?.longitude || 0,
    latitude: feature.properties?.latitude || 0,
    plu_zone_code: feature.properties?.plu_zone_code || '',
    department_code: feature.properties?.department_code || '',
    seismic_zone_class: feature.properties?.seismic_zone_class || '',
    flood_zone_class: feature.properties?.flood_zone_class || '',
    candidate_score: feature.properties?.candidate_score,
    nearest_enedis_distance_m: feature.properties?.nearest_enedis_distance_m,
    nearest_railway_distance_m: feature.properties?.nearest_railway_distance_m,
    slope_value: feature.properties?.slope_value
  }));
  
  return parcels;
};

export const getHighestScoreParcels = async () => {
  const { getParcelsByLocation } = await import('./demoApi');
  const response = await getParcelsByLocation();
  
  // Map GeoJSON features to SuitableParcel interface and filter by score
  const parcels = (response.parcels || []).map((feature: any) => ({
    parcel_id: feature.properties?.parcel_id || '',
    area: feature.properties?.area || 0,
    longitude: feature.properties?.longitude || 0,
    latitude: feature.properties?.latitude || 0,
    plu_zone_code: feature.properties?.plu_zone_code || '',
    department_code: feature.properties?.department_code || '',
    seismic_zone_class: feature.properties?.seismic_zone_class || '',
    flood_zone_class: feature.properties?.flood_zone_class || '',
    candidate_score: feature.properties?.candidate_score,
    nearest_enedis_distance_m: feature.properties?.nearest_enedis_distance_m,
    nearest_railway_distance_m: feature.properties?.nearest_railway_distance_m,
    slope_value: feature.properties?.slope_value
  }));
  
  return parcels.filter((parcel: any) => parcel.candidate_score && parcel.candidate_score > 70);
};

// Type definitions (re-exported from demoApi)
export interface RiskInfo {
  present: boolean;
  libelle: string;
  libelleStatutCommune: string | null;
  libelleStatutAdresse: string | null;
  specifique: any;
}

export interface GeorisquesAPIResponse {
  adresse: {
    libelle: string;
    longitude: number;
    latitude: number;
  };
  commune: {
    libelle: string;
    codePostal: string;
    codeInsee: string;
  };
  url: string;
  risquesNaturels: Record<string, RiskInfo>;
  risquesTechnologiques: Record<string, RiskInfo>;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  total_count?: number;
  offset?: number;
  limit?: number;
  has_next?: boolean;
  query?: string;
  department?: string;
}
