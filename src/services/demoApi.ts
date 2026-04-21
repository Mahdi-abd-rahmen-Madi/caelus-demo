// Demo API Service - Mock implementation using local Avignon data

// Type definitions
export interface RiskInfo {
  present: boolean;
  libelle: string;
  libelleStatutCommune: string | null;
  libelleStatutAdresse: string | null;
  specifique: any;
}

export interface VacantParcelProperties {
  parcel_id: string;
  seismic_zone_class: string;
  flood_zone_class: string;
  area: number;
  plu_zone_code: string;
  department_code: string;
  slope_value?: number;
  centroid?: {
    lng: number;
    lat: number;
  };
  longitude?: number;
  latitude?: number;
  geometry?: any;
  nearest_enedis_distance_m?: number;
  nearest_enedis_line_type?: string;
  nearest_hta_souterrain_distance_m?: number;
  nearest_railway_distance_m?: number;
}

export interface EnhancedParcelProperties extends VacantParcelProperties {
  longitude: number;
  latitude: number;
  plu_zone_type?: string;
  radon_class?: number;
  gonfle?: any;
  georisques_data?: any;
}

export interface ParcelsResponse {
  type: string;
  location: { lng: number; lat: number };
  radius_km: number;
  timestamp: string;
  total_highest_score_parcels: number;
  parcels: SuitableParcel[];
  features: any[];
}

// Suitable parcels API function
export interface SuitableParcel {
  parcel_id: string;
  area: number;
  longitude: number;
  latitude: number;
  plu_zone_code: string;
  department_code: string;
  seismic_zone_class: string;
  flood_zone_class: string;
  candidate_score?: number;
  nearest_enedis_distance_m?: number;
  nearest_railway_distance_m?: number;
  slope_value?: number;
}

// DVF (Real Estate) API functions
export interface DVFTransaction {
  id_mutation: string;
  date_mutation: string;
  nature_mutation: string;
  valeur_fonciere: number | null;
  type_local: string | null;
  surface_reelle_bati: number | null;
  surface_terrain: number | null;
  adresse_numero: string | null;
  adresse_nom_voie: string | null;
  code_postal: string | null;
  nom_commune: string | null;
}

export interface DVFResponse {
  transactions: DVFTransaction[];
  total_count: number;
  error?: string;
}

// Mock DVF data generator for demo
const generateMockDVFData = (parcelId: string): DVFResponse => {
  // Generate realistic mock transactions based on parcel ID
  const transactionCount = Math.floor(Math.random() * 5) + 1; // 1-5 transactions
  const baseYear = 2020;
  
  const transactions: DVFTransaction[] = [];
  
  for (let i = 0; i < transactionCount; i++) {
    const year = baseYear + Math.floor(Math.random() * 4); // 2020-2023
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    
    transactions.push({
      id_mutation: `${parcelId}_${year}_${month}_${day}`,
      date_mutation: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      nature_mutation: Math.random() > 0.7 ? 'Vente' : 'Vente terrain à bâtir',
      valeur_fonciere: Math.floor(Math.random() * 300000) + 50000, // 50k-350k
      type_local: Math.random() > 0.3 ? 'Maison' : 'Appartement',
      surface_reelle_bati: Math.floor(Math.random() * 150) + 50, // 50-200m²
      surface_terrain: Math.floor(Math.random() * 500) + 100, // 100-600m²
      adresse_numero: String(Math.floor(Math.random() * 99) + 1),
      adresse_nom_voie: `Rue de la Demo ${Math.floor(Math.random() * 10) + 1}`,
      code_postal: '84000',
      nom_commune: 'Avignon'
    });
  }
  
  return {
    transactions,
    total_count: transactionCount
  };
};

  
  
// Import real parcel data
import avignonParcels from '../demo-data/geojson/avignon-real.json';

// Real API functions using extracted database data
export const getParcelsByLocation = async (): Promise<ParcelsResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Fix geometry strings by parsing them into proper objects
  const fixedFeatures = avignonParcels.features.map(feature => {
    try {
      // Check if geometry is a string and parse it
      if (typeof feature.geometry === 'string') {
        return {
          ...feature,
          geometry: JSON.parse(feature.geometry)
        };
      }
      return feature;
    } catch (error) {
      console.warn('Failed to parse geometry for parcel:', feature.properties?.parcel_id, error);
      // Return feature with null geometry if parsing fails
      return {
        ...feature,
        geometry: null
      };
    }
  });
  
  // Return real parcel data from database extraction with fixed geometry
  return {
    type: 'FeatureCollection' as const,
    features: fixedFeatures,
    parcels: fixedFeatures as any,
    location: { lng: 4.8059, lat: 43.9493 },
    radius_km: 5,
    timestamp: new Date().toISOString(),
    total_highest_score_parcels: 0
  };
};

export const getParcelById = async (parcelId: string): Promise<EnhancedParcelProperties | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find parcel in real data
  const realParcel = avignonParcels.features.find(p => p.properties.parcel_id === parcelId);
  
  if (realParcel) {
    return {
      ...realParcel.properties,
      plu_zone_type: realParcel.properties.plu_zone_code === 'U' ? 'Zone urbaine' : 
                   realParcel.properties.plu_zone_code === 'AU' ? 'Zone à urbaniser' :
                   realParcel.properties.plu_zone_code === 'NC' ? 'Zone naturelle' : 'Zone agricole',
      radon_class: Math.floor(Math.random() * 3) + 1, // Mock since not in real data
      georisques_data: {
        seismic: {
          zone: realParcel.properties.seismic_zone_class || '2',
          risk_level: 'low'
        },
        flood: {
          zone: realParcel.properties.flood_zone_class || 'Faible',
          risk_level: 'low'
        }
      },
      gonfle: null
    };
  }
  
  // Fallback to mock data if not found
  return {
    parcel_id: parcelId,
    longitude: 4.8059 + (Math.random() - 0.5) * 0.1,
    latitude: 43.9493 + (Math.random() - 0.5) * 0.1,
    area: Math.floor(Math.random() * 1000) + 200,
    plu_zone_code: ['AU', 'NC', 'U', 'UL'][Math.floor(Math.random() * 4)],
    department_code: '84',
    seismic_zone_class: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)],
    flood_zone_class: ['Faible', 'Moyen', 'Élevé'][Math.floor(Math.random() * 3)],
    nearest_enedis_distance_m: Math.floor(Math.random() * 500),
    nearest_railway_distance_m: Math.floor(Math.random() * 1000),
    slope_value: Math.random() * 15,
    radon_class: Math.floor(Math.random() * 3) + 1,
    plu_zone_type: 'Zone urbaine',
    georisques_data: {
      seismic: { zone: '2', risk_level: 'low' },
      flood: { zone: 'Faible', risk_level: 'low' }
    },
    gonfle: null
  };
};

export const getDVFTransactions = async (parcelId: string): Promise<DVFResponse> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return generateMockDVFData(parcelId);
};

export const getRiskAssessment = async (_location: { lng: number; lat: number }): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    risquesNaturels: {
      inondation: {
        present: Math.random() > 0.5,
        libelle: 'Risque d\'inondation',
        libelleStatutCommune: 'Connu',
        libelleStatutAdresse: 'Connu',
        specifique: {}
      },
      seisme: {
        present: Math.random() > 0.3,
        libelle: 'Risque sismique',
        libelleStatutCommune: 'Connu',
        libelleStatutAdresse: 'Connu',
        specifique: {}
      },
      retraitGonflementArgile: {
        present: Math.random() > 0.6,
        libelle: 'Risque de retrait-gonflement des argiles',
        libelleStatutCommune: 'Connu',
        libelleStatutAdresse: 'Connu',
        specifique: {}
      }
    },
    risquesTechnologiques: {
      installationIndustrielle: {
        present: Math.random() > 0.8,
        libelle: 'Installation industrielle à proximité',
        libelleStatutCommune: 'Connu',
        libelleStatutAdresse: 'Connu',
        specifique: {}
      }
    }
  };
};

// Mock industrial installations
export const getIndustrialInstallations = async (_bounds: any): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const installations = [];
  for (let i = 0; i < 5; i++) {
    installations.push({
      id: `inst_${i}`,
      name: `Installation industrielle ${i + 1}`,
      type: 'ICPE',
      longitude: 4.8059 + (Math.random() - 0.5) * 0.2,
      latitude: 43.9493 + (Math.random() - 0.5) * 0.2,
      risk_level: ['Faible', 'Moyen', 'Élevé'][Math.floor(Math.random() * 3)]
    });
  }
  
  return { results: installations, count: installations.length };
};

// Mock communes
export const getCommunes = async (_department?: string): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    results: [
      {
        code_insee: '84007',
        nom: 'Avignon',
        code_postal: '84000',
        longitude: 4.8059,
        latitude: 43.9493,
        department: '84'
      }
    ],
    count: 1
  };
};

// Mock PLU data
export const getPLULayers = async (): Promise<any> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    zones: [
      { code: 'AU', libelle: 'Zone à urbaniser', color: '#FFD700' },
      { code: 'U', libelle: 'Zone urbaine', color: '#90EE90' },
      { code: 'NC', libelle: 'Zone naturelle', color: '#87CEEB' },
      { code: 'UL', libelle: 'Zone urbaine loose', color: '#98FB98' }
    ]
  };
};

// Tracker-specific data APIs

// Seismic Zone Tracker Data
export interface SeismicZoneInfo {
  seismic_zone: string | null;
  zone_label: string;
  risk_level: string;
  risk_color: string;
  description: string;
  acceleration_coefficient: number | null;
  coordinates: { lng: number; lat: number };
  found: boolean;
}

export const getSeismicTrackerData = async (location: { lng: number; lat: number }): Promise<SeismicZoneInfo> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Generate realistic seismic data for Avignon area
  const seismicZones = ['1', '2', '3', '4'];
  const zone = seismicZones[Math.floor(Math.random() * seismicZones.length)];
  
  const zoneLabels: Record<string, string> = {
    '1': 'Sismicité très faible',
    '2': 'Sismicité faible',
    '3': 'Sismicité modérée',
    '4': 'Sismicité moyenne'
  };
  
  const riskLevels: Record<string, string> = {
    '1': 'very_low',
    '2': 'low', 
    '3': 'medium',
    '4': 'high'
  };
  
  const riskColors: Record<string, string> = {
    '1': '#22c55e',
    '2': '#84cc16',
    '3': '#eab308', 
    '4': '#f97316'
  };
  
  const accelerations: Record<string, number> = {
    '1': 0.4,
    '2': 0.7,
    '3': 1.1,
    '4': 1.6
  };
  
  return {
    seismic_zone: zone,
    zone_label: zoneLabels[zone] || 'Zone inconnue',
    risk_level: riskLevels[zone] || 'unknown',
    risk_color: riskColors[zone] || '#94a3b8',
    description: `Zone sismique de classe ${zone} avec accélération maximale de ${accelerations[zone]} m/s²`,
    acceleration_coefficient: accelerations[zone],
    coordinates: location,
    found: true
  };
};

// Inondation Tracker Data
export interface InondationInfo {
  code_national_tri: string | null;
  identifiant_tri: string | null;
  libelle_tri: string;
  cours_deau: string | null;
  type_inondation_code: string | null;
  type_inondation_libelle: string;
  scenario_code: string | null;
  scenario_libelle: string;
  date_arrete_carte: string | null;
  code_insee: string | null;
  libelle_commune: string;
  risk_level: string;
  risk_color: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
}

export const getInondationTrackerData = async (location: { lng: number; lat: number }): Promise<InondationInfo> => {
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // Generate realistic flood data for Avignon area (near Rhône river)
  const floodTypes = [
    { code: 'RI', libelle: 'Inondation par débordement de cours d\'eau' },
    { code: 'RU', libelle: 'Inondation par ruissellement' },
    { code: 'RI+RU', libelle: 'Inondation mixte' }
  ];
  
  const scenarios = [
    { code: 'PPI', libelle: 'Plan de Prévention des Risques' },
    { code: 'PCS', libelle: 'Plan Communal de Sauvegarde' },
    { code: 'DICRIM', libelle: 'Document d\'Information Communal' }
  ];
  
  const selectedType = floodTypes[Math.floor(Math.random() * floodTypes.length)];
  const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  const riskLevels = ['very_low', 'low', 'medium', 'high'];
  const riskColors = ['#22c55e', '#84cc16', '#eab308', '#f97316'];
  const riskIndex = Math.floor(Math.random() * riskLevels.length);
  
  return {
    code_national_tri: `TRI${Math.floor(Math.random() * 999) + 1}`,
    identifiant_tri: `ID${Math.floor(Math.random() * 9999) + 1}`,
    libelle_tri: `Territoire à risque important d\'inondation - Avignon`,
    cours_deau: 'Le Rhône',
    type_inondation_code: selectedType.code,
    type_inondation_libelle: selectedType.libelle,
    scenario_code: selectedScenario.code,
    scenario_libelle: selectedScenario.libelle,
    date_arrete_carte: '2021-06-15',
    code_insee: '84007',
    libelle_commune: 'Avignon',
    risk_level: riskLevels[riskIndex],
    risk_color: riskColors[riskIndex],
    coordinates: location,
    found: true
  };
};

// Heatwave Tracker Data
export interface HeatwaveRiskInfo {
  risk_level: string | null;
  risk_color: string;
  mean_summer_utci: number;
  max_summer_utci: number;
  heatwave_days_per_year: number;
  extreme_heat_days: number;
  trend_10_years: string | null;
  description: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
  data_source?: string;
  data_quality?: string;
  commune_info?: {
    commune_id: string;
    commune_name: string;
    distance_km: number;
  };
}

export const getHeatwaveTrackerData = async (location: { lng: number; lat: number }): Promise<HeatwaveRiskInfo> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate realistic heatwave data for Avignon area (Mediterranean climate)
  const riskLevels = ['low', 'medium', 'high', 'very_high'];
  const riskColors = ['#84cc16', '#eab308', '#f97316', '#ef4444'];
  const riskIndex = Math.min(3, Math.floor(Math.random() * 4)); // Avignon tends to be hot
  
  const baseUTCI = 32 + Math.random() * 8; // 32-40°C base summer UTCI
  const maxUTCI = baseUTCI + Math.random() * 10; // Max can be 10°C higher
  
  const heatwaveDays = 15 + Math.floor(Math.random() * 20); // 15-35 days per year
  const extremeDays = 2 + Math.floor(Math.random() * 8); // 2-10 extreme days
  
  const trends = ['En augmentation', 'Stable', 'En légère baisse'];
  const selectedTrend = trends[Math.floor(Math.random() * trends.length)];
  
  return {
    risk_level: riskLevels[riskIndex],
    risk_color: riskColors[riskIndex],
    mean_summer_utci: parseFloat(baseUTCI.toFixed(1)),
    max_summer_utci: parseFloat(maxUTCI.toFixed(1)),
    heatwave_days_per_year: heatwaveDays,
    extreme_heat_days: extremeDays,
    trend_10_years: selectedTrend,
    description: `Risque de canicule ${riskLevels[riskIndex]} avec ${heatwaveDays} jours de canicule par an en moyenne`,
    coordinates: location,
    found: true,
    data_source: 'Météo-France',
    data_quality: 'Haute',
    commune_info: {
      commune_id: '84007',
      commune_name: 'Avignon',
      distance_km: (Math.random() * 5).toFixed(1) as unknown as number
    }
  };
};

// Thunder Tracker Data
export interface ThunderRiskInfo {
  risk_level: string | null;
  risk_color: string;
  mean_cape: number;
  max_cape: number;
  mean_k_index: number;
  max_k_index: number;
  thunderstorm_days_per_year: number;
  severe_thunder_days: number;
  trend_10_years: string | null;
  description: string;
  coordinates: { lng: number; lat: number };
  found: boolean;
  nsg_value?: number;
  nsg_unit?: string;
  nsg_confidence?: string;
  nsg_method?: string;
  base_nsg?: number;
  nsg_adjustments?: any;
  data_quality?: string;
  data_source?: string;
}

export const getThunderTrackerData = async (location: { lng: number; lat: number }): Promise<ThunderRiskInfo> => {
  await new Promise(resolve => setTimeout(resolve, 280));
  
  // Generate realistic thunderstorm data for Avignon area
  const riskLevels = ['low', 'medium', 'high', 'very_high'];
  const riskColors = ['#84cc16', '#eab308', '#f97316', '#ef4444'];
  const riskIndex = Math.floor(Math.random() * riskLevels.length);
  
  const baseCAPE = 800 + Math.random() * 1200; // 800-2000 J/kg
  const maxCAPE = baseCAPE + Math.random() * 800; // Max can be higher
  
  const baseKIndex = 15 + Math.random() * 25; // 15-40 K-index
  const maxKIndex = baseKIndex + Math.random() * 15;
  
  const thunderDays = 20 + Math.floor(Math.random() * 30); // 20-50 days per year
  const severeDays = Math.floor(thunderDays * 0.2); // ~20% are severe
  
  const trends = ['En augmentation', 'Stable', 'En légère baisse'];
  const selectedTrend = trends[Math.floor(Math.random() * trends.length)];
  
  const nsgValue = 0.5 + Math.random() * 2.5; // 0.5-3.0 strikes/km²/year
  
  return {
    risk_level: riskLevels[riskIndex],
    risk_color: riskColors[riskIndex],
    mean_cape: Math.floor(baseCAPE),
    max_cape: Math.floor(maxCAPE),
    mean_k_index: parseFloat(baseKIndex.toFixed(1)),
    max_k_index: parseFloat(maxKIndex.toFixed(1)),
    thunderstorm_days_per_year: thunderDays,
    severe_thunder_days: severeDays,
    trend_10_years: selectedTrend,
    description: `Risque orageux ${riskLevels[riskIndex]} avec ${thunderDays} jours d'orage par an en moyenne`,
    coordinates: location,
    found: true,
    nsg_value: parseFloat(nsgValue.toFixed(2)),
    nsg_unit: 'foudroiements/km²/an',
    nsg_confidence: 'Moyenne',
    nsg_method: 'Réseau de détection',
    base_nsg: parseFloat(nsgValue.toFixed(2)),
    data_quality: 'Moyenne',
    data_source: 'Météo-France'
  };
};

// RTE Electrical Network Data

export interface RTEFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][];
  };
  properties: {
    line_type: string;
    tension: string;
    etat: string;
    code_ligne: string;
  };
}

export interface RTETileData {
  type: 'FeatureCollection';
  features: RTEFeature[];
}

// Cache for the loaded GeoJSON data
let rteGeoJsonData: any = null;
let rteDataLoaded = false;

// Load RTE GeoJSON data from public folder
const loadRTEGeoJsonData = async (): Promise<any> => {
  if (rteDataLoaded && rteGeoJsonData) {
    return rteGeoJsonData;
  }
  
  try {
    const response = await fetch('/rte-test-data.geojson');
    if (!response.ok) {
      throw new Error(`Failed to load RTE data: ${response.status}`);
    }
    rteGeoJsonData = await response.json();
    rteDataLoaded = true;
    return rteGeoJsonData;
  } catch (error) {
    console.error('Error loading RTE GeoJSON data:', error);
    // Return empty data as fallback
    rteGeoJsonData = { type: 'FeatureCollection', features: [] };
    rteDataLoaded = true;
    return rteGeoJsonData;
  }
};

// Generate RTE vector tile data from actual GeoJSON
export const getRTETileData = async (_z: number, _x: number, _y: number, filters?: any): Promise<RTETileData> => {
  await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay for real data
  
  const geoJsonData = await loadRTEGeoJsonData();
  const features: RTEFeature[] = [];
  
  // Transform GeoJSON features to RTEFeature format
  geoJsonData.features.forEach((feature: any) => {
    // Map GeoJSON properties to RTE component expectations
    const lineType = feature.properties.type_ouvrage?.toLowerCase() || 'aerien';
    const tension = feature.properties.tension || '225kV';
    const etat = feature.properties.etat || 'EN EXPLOITATION';
    const codeLigne = feature.properties.code_ligne || 'UNKNOWN';
    
    // Apply line type filter if provided
    if (filters?.line_type) {
      if (filters.line_type === 'aerien' && lineType !== 'aerien') return;
      if (filters.line_type === 'souterrain' && lineType !== 'souterrain') return;
    }
    
    // Apply individual line type filters
    if (filters?.aerien !== undefined && lineType === 'aerien' && !filters.aerien) return;
    if (filters?.souterrain !== undefined && lineType === 'souterrain' && !filters.souterrain) return;
    
    // Apply voltage filter if provided
    if (filters?.voltageRange) {
      const voltageNum = parseInt(tension.replace('kV', ''));
      if (voltageNum < filters.voltageRange[0] || voltageNum > filters.voltageRange[1]) {
        return;
      }
    }
    
    features.push({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {
        line_type: lineType,
        tension: tension,
        etat: etat,
        code_ligne: codeLigne
      }
    });
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// Mock RTE tile URL generator (for compatibility with existing component)
export const getRTETileUrl = (z: number, x: number, y: number, filters?: any): string => {
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

// Generate RTE metadata
export const getRTEMetadata = async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    name: 'Réseau RTE - Avignon',
    description: 'Réseau de transport d\'électricité RTE autour d\'Avignon',
    version: '1.0',
    format: 'pbf',
    bounds: [4.5, 43.7, 5.1, 44.2], // Extended Avignon area
    minzoom: 8,
    maxzoom: 16,
    layers: [
      {
        name: 'lignes_aeriennes',
        description: 'Lignes électriques aériennes',
        fields: {
          tension: 'Tension en volts',
          etat: 'État de la ligne',
          code_ligne: 'Code d\'identification'
        }
      },
      {
        name: 'lignes_souterraines',
        description: 'Lignes électriques souterraines',
        fields: {
          tension: 'Tension en volts',
          etat: 'État de la ligne',
          code_ligne: 'Code d\'identification'
        }
      }
    ]
  };
};
