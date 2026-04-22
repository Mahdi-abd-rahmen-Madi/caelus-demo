import type { SyntheticEvent } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import type { GeorisquesAPIResponse } from '../services/api';

export interface GeocodedLocation {
  address: string;
  name: string;
  city: string;
  postcode: string;
  context: string;
  type: string;
  importance: number;
  lat: number;
  lng: number;
  score: number;
  bbox?: number[];
}

export interface GeocodeResponse {
  results: GeocodedLocation[];
  query: string;
  count: number;
  api_source: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface DashboardState {
  location: [number, number];
  searchQuery: string;
  radius: number;
  tabValue: number;
  searchType: 'commune' | 'department';
  selectedZoneTypes: string[];
  enhancedFilters: EnhancedFilterProps;
}

export type HandleTabChange = (event: SyntheticEvent, newValue: number) => void;

export type HandleSearchTypeChange = (event: SelectChangeEvent<string>) => void;

export type HandleSearch = (e: React.FormEvent) => void;

export type HandleRadiusChange = (event: Event, value: number | number[]) => void;

export type HandleMapLoad = (map: any) => void;

export type HandleZoneTypeChange = (zoneType: string, checked: boolean) => void;

export type BaseMapType = 'osm' | 'osm-hot' | 'carto-positron' | 'carto-darkmatter' | 'maptiler-satellite';

// Risk level types for enhanced sidebar
export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

// Risk indicator colors configuration
export const RISK_COLORS = {
  seismic: {
    low: '#10b981',     // green
    medium: '#f59e0b',  // yellow  
    high: '#ef4444',    // red
    unknown: '#94a3b8'  // gray
  },
  flood: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    unknown: '#94a3b8'
  },
  stability: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    unknown: '#94a3b8'
  },
  gonfle: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    unknown: '#94a3b8'
  },
  radon: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    unknown: '#94a3b8'
  },
  inondation: {
    low: '#06b6d4',
    medium: '#0891b2',
    high: '#0e7490',
    unknown: '#94a3b8'
  }
} as const;

// Seismic zone configuration
export interface SeismicZoneConfig {
  code: string;
  label: string;
  description: string;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'unknown';
  color: string;
}

export const SEISMIC_ZONES: SeismicZoneConfig[] = [
  { code: '1', label: 'Zone 1', description: 'Very Low Risk', riskLevel: 'very_low', color: '#10b981' },
  { code: '2', label: 'Zone 2', description: 'Low Risk', riskLevel: 'low', color: '#84cc16' },
  { code: '3', label: 'Zone 3', description: 'Medium Risk', riskLevel: 'medium', color: '#f59e0b' },
  { code: '4', label: 'Zone 4', description: 'High Risk', riskLevel: 'high', color: '#f97316' },
  { code: '5', label: 'Zone 5', description: 'Very High Risk', riskLevel: 'very_high', color: '#ef4444' }
];

// Enhanced parcel properties for datacenter feasibility analysis
export interface EnhancedParcelProperties {
  parcel_id: string;
  area: number;
  department_code: string;
  plu_zone_code: string;
  plu_zone_type: string;
  seismic_zone_class: string;
  flood_zone_class: string;
  // Radon risk fields
  radon_class?: number;
  radon_level_display?: string;
  // Infrastructure proximity fields
  nearest_enedis_distance_m?: number;
  nearest_enedis_line_type?: string;
  nearest_hta_souterrain_distance_m?: number;
  nearest_railway_distance_m?: number;
  slope_value?: number;
  gonfle?: number;
  // Georisques data
  georisques_data?: GeorisquesAPIResponse;
  // Coordinates for georisques API
  longitude?: number;
  latitude?: number;
}

// Enhanced filter props for advanced filtering
export interface EnhancedFilterProps {
  minPowerProximity?: number;
  maxPowerProximity?: number;
  minArea?: number;
  maxArea?: number;
  maxRailwayDistance?: number;
  selectedDepartments?: string[];
  minSlope?: number;
  maxSlope?: number;
  slopeCategories?: string[];
}

// Color modes for risk visualization
export type ColorMode =
  | 'connectivity_level'
  | 'industrial_risk'
  | 'power_proximity'
  | 'seismic'
  | 'flood'
  | 'plu'
  | 'default';

// Statistics for dashboard
export interface ParcelStatistics {
  totalParcels: number;
  averageCandidateScore: number;
  averageConnectivityScore: number;
  averagePowerProximityScore: number;
  averageSeismicRisk: number;
  averageFloodRisk: number;
  zoneTypeDistribution: Record<string, number>;
  departmentBreakdown: Record<string, number>;
  riskLevelDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

// Export options
export type ExportFormat = 'geojson' | 'csv' | 'summary';

export interface ExportOptions {
  format: ExportFormat;
  includeGeometry: boolean;
  selectedFields: string[];
  filteredOnly: boolean;
}
