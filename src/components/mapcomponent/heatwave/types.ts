export interface HeatwaveRiskData {
  risk_level: string;
  risk_color: string;
  mean_summer_utci: number;
  max_summer_utci: number;
  heatwave_days_per_year: number;
  extreme_heat_days: number;
  trend_10_years: string | null;
  description: string;
}

export interface HeatwaveRiskResponse {
  coordinates: {
    lng: number;
    lat: number;
  };
  heatwave_risk: HeatwaveRiskData;
  found: boolean;
  data_source: string;
  timestamp?: string;
}

export interface HeatwaveRiskSummary {
  location: {
    lng: number;
    lat: number;
  };
  radius_km: number;
  heatwave_summary: {
    overall_risk_level: string;
    mean_summer_utci: number;
    heatwave_days_per_year: number;
    area_coverage: string;
  } | null;
  data_points: number;
  found: boolean;
  timestamp?: string;
}

export interface HeatwaveDataStatus {
  data_available: boolean;
  daily_files_count: number;
  yearly_file_available: boolean;
  available_years: string[];
  data_directory: string;
  last_updated: string;
  cache_duration_seconds: number;
}

export type HeatwaveRiskLevel = 
  | 'low'
  | 'moderate' 
  | 'high'
  | 'very_high'
  | 'outside_france'
  | 'no_data'
  | 'error'
  | 'unknown';
