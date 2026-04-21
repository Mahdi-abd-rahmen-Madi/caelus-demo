// Demo tracker data for Avignon area
// Based on realistic risk assessments for the Avignon (84000) region

// Avignon coordinates: 43.9493°N, 4.8059°E

export interface TrackerDataPoint {
  coordinates: { lng: number; lat: number };
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  risk_color: string;
  description: string;
  found: boolean;
  data_source: string;
  data_quality?: string;
  commune_info?: {
    commune_id: string;
    commune_name: string;
    distance_km: number;
  };
  // Heatwave specific fields (UTCI été)
  mean_summer_utci?: number;
  max_summer_utci?: number;
  heatwave_days_per_year?: number;
  extreme_heat_days?: number;
  trend_10_years?: string;
  // Thunderstorm specific fields (CAPE moyen)
  mean_cape?: number;
  max_cape?: number;
  mean_k_index?: number;
  max_k_index?: number;
  thunderstorm_days_per_year?: number;
  severe_thunder_days?: number;
  nsg_value?: number;
  nsg_unit?: string;
  // Legacy additional_data for backward compatibility
  additional_data?: any;
}

// Inondation (Flood) risk data for Avignon with enhanced Caelus structure
// Avignon is located near the Rhône river and has moderate flood risk
export const demoInondationData = (lng: number, lat: number): TrackerDataPoint => {
  // Areas closer to the Rhône river have higher risk
  const distanceToRhône = Math.abs(lng - 4.8059) + Math.abs(lat - 43.9493);
  
  const baseData = {
    coordinates: { lng, lat },
    found: true,
    data_source: 'tri_inondation_demo',
    data_quality: 'high',
    commune_info: {
      commune_id: '84007',
      commune_name: 'Avignon',
      distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
    }
  };
  
  if (distanceToRhône < 0.01) {
    return {
      ...baseData,
      risk_level: 'high',
      risk_color: '#ef4444',
      description: 'Zone inondable à forte récurrence - Proximité immédiate du Rhône',
      trend_10_years: 'En augmentation',
      additional_data: {
        scenario_code: 'FR_084090_01',
        scenario_label: 'Zone inondable à forte récurrence',
        max_water_height: '1.5m',
        return_period: '10 ans',
        flood_type: 'riverine',
        flood_velocity: '0.8 m/s',
        sediment_load: 'Élevée',
        evacuation_routes: 'Limitées',
        warning_time: '2-4 heures'
      }
    };
  } else if (distanceToRhône < 0.02) {
    return {
      ...baseData,
      risk_level: 'medium',
      risk_color: '#f59e0b',
      description: 'Zone inondable à moyenne récurrence - Zone de débordement',
      trend_10_years: 'Stable',
      additional_data: {
        scenario_code: 'FR_084090_02',
        scenario_label: 'Zone inondable à moyenne récurrence',
        max_water_height: '0.8m',
        return_period: '50 ans',
        flood_type: 'riverine',
        flood_velocity: '0.4 m/s',
        sediment_load: 'Moyenne',
        evacuation_routes: 'Adequates',
        warning_time: '6-12 heures'
      }
    };
  } else {
    return {
      ...baseData,
      risk_level: 'low',
      risk_color: '#10b981',
      description: 'Zone peu inondable - Terrains surélevés',
      trend_10_years: 'En légère baisse',
      data_quality: 'medium',
      additional_data: {
        scenario_code: 'FR_084090_03',
        scenario_label: 'Zone peu inondable',
        max_water_height: '0.3m',
        return_period: '100 ans',
        flood_type: 'riverine',
        flood_velocity: '0.1 m/s',
        sediment_load: 'Faible',
        evacuation_routes: 'Multiples',
        warning_time: '24+ heures'
      }
    };
  }
};

// Seismic risk data for Avignon with enhanced Caelus structure
// Avignon is in seismic zone 3 (moderate risk) according to French classification
export const demoSeismicData = (lng: number, lat: number): TrackerDataPoint => {
  // Add slight variation based on location for realism
  const locationFactor = Math.sin(lng * 100) * Math.cos(lat * 100);
  const accelerationVariation = 1.6 + (locationFactor * 0.2); // 1.4-1.8 m/s²
  
  return {
    coordinates: { lng, lat },
    risk_level: 'medium',
    risk_color: '#f59e0b',
    description: 'Zone de sismicité 3 - Sismicité modérée avec risque de répliques',
    found: true,
    data_source: 'seismic_zones_demo',
    data_quality: 'high',
    commune_info: {
      commune_id: '84007',
      commune_name: 'Avignon',
      distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
    },
    trend_10_years: 'Stable',
    additional_data: {
      zone_code: '3',
      zone_label: 'Zone de sismicité 3',
      nb_alea: '0.16',
      expected_acceleration: `${accelerationVariation.toFixed(1)} m/s²`,
      peak_ground_acceleration: parseFloat(accelerationVariation.toFixed(2)),
      soil_type: 'Sols meubles',
      amplification_factor: 1.2,
      return_period: '475 ans',
      building_recommendations: 'Renforcement des structures recommandé',
      historical_earthquakes: 'Dernier séisme significatif: 1909 (Lambesc, magnitude 6.0)',
      fault_proximity: 'Proximité de la faille de la Durance',
      liquefaction_risk: 'Faible',
      seismic_design_category: 'Catégorie II'
    }
  };
};

// Heatwave risk data for Avignon with proper UTCI été values
// Avignon has hot summers and high heatwave risk (Mediterranean climate)
export const demoHeatwaveData = (lng: number, lat: number): TrackerDataPoint => {
  // Urban heat island effect in city center
  const isUrbanCenter = Math.abs(lng - 4.8059) < 0.015 && Math.abs(lat - 43.9493) < 0.015;
  
  // Generate realistic UTCI values for Mediterranean climate
  const baseUTCI = isUrbanCenter ? 36 + Math.random() * 4 : 32 + Math.random() * 6; // 36-40°C urban, 32-38°C rural
  const maxUTCI = baseUTCI + Math.random() * 8; // Max can be 8°C higher
  
  const trends = ['En augmentation', 'Stable', 'En légère baisse'];
  const selectedTrend = trends[Math.floor(Math.random() * trends.length)];
  
  if (isUrbanCenter) {
    const heatwaveDays = 25 + Math.floor(Math.random() * 15); // 25-40 days in urban center
    const extremeDays = 5 + Math.floor(Math.random() * 8); // 5-13 extreme days
    
    return {
      coordinates: { lng, lat },
      risk_level: 'high',
      risk_color: '#ef4444',
      description: 'Risque élevé de canicule - Centre urbain avec effet d\'îlot de chaleur',
      found: true,
      data_source: 'heatwave_demo',
      data_quality: 'high',
      commune_info: {
        commune_id: '84007',
        commune_name: 'Avignon',
        distance_km: 0
      },
      // UTCI été values
      mean_summer_utci: parseFloat(baseUTCI.toFixed(1)),
      max_summer_utci: parseFloat(maxUTCI.toFixed(1)),
      heatwave_days_per_year: heatwaveDays,
      extreme_heat_days: extremeDays,
      trend_10_years: selectedTrend,
      // Legacy data for backward compatibility
      additional_data: {
        risk_index: 0.85,
        max_temp_celsius: 42,
        urban_heat_island_factor: 1.3,
        vulnerability_score: 'high',
        utci_stress_category: 'Stress très fort (38-46°C)'
      }
    };
  } else {
    const heatwaveDays = 15 + Math.floor(Math.random() * 12); // 15-27 days in rural areas
    const extremeDays = 2 + Math.floor(Math.random() * 6); // 2-8 extreme days
    
    return {
      coordinates: { lng, lat },
      risk_level: 'medium',
      risk_color: '#f59e0b',
      description: 'Risque modéré de canicule - Zone périurbaine',
      found: true,
      data_source: 'heatwave_demo',
      data_quality: 'medium',
      commune_info: {
        commune_id: '84007',
        commune_name: 'Avignon',
        distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
      },
      // UTCI été values
      mean_summer_utci: parseFloat(baseUTCI.toFixed(1)),
      max_summer_utci: parseFloat(maxUTCI.toFixed(1)),
      heatwave_days_per_year: heatwaveDays,
      extreme_heat_days: extremeDays,
      trend_10_years: selectedTrend,
      // Legacy data for backward compatibility
      additional_data: {
        risk_index: 0.65,
        max_temp_celsius: 38,
        urban_heat_island_factor: 1.1,
        vulnerability_score: 'medium',
        utci_stress_category: 'Stress fort (32-38°C)'
      }
    };
  }
};

// Thunderstorm risk data for Avignon with proper CAPE moyen values
// Provence region has moderate to high thunderstorm activity
export const demoThunderData = (lng: number, lat: number): TrackerDataPoint => {
  // Random variation based on coordinates for realistic distribution
  const randomFactor = Math.sin(lng * 1000) * Math.cos(lat * 1000);
  const riskScore = (randomFactor + 1) / 2; // Normalize to 0-1
  
  // Generate realistic CAPE values for Mediterranean climate
  const baseCAPE = 800 + riskScore * 1200; // 800-2000 J/kg based on risk
  const maxCAPE = baseCAPE + Math.random() * 800; // Max can be higher
  
  const baseKIndex = 15 + Math.random() * 25; // 15-40 K-index
  const maxKIndex = baseKIndex + Math.random() * 15;
  
  const trends = ['En augmentation', 'Stable', 'En légère baisse'];
  const selectedTrend = trends[Math.floor(Math.random() * trends.length)];
  
  const nsgValue = 0.5 + riskScore * 2.5; // 0.5-3.0 strikes/km²/year based on risk
  
  if (riskScore > 0.7) {
    const thunderDays = 35 + Math.floor(Math.random() * 15); // 35-50 days for high risk
    const severeDays = Math.floor(thunderDays * 0.25); // ~25% are severe
    
    return {
      coordinates: { lng, lat },
      risk_level: 'high',
      risk_color: '#ef4444',
      description: 'Risque élevé d\'orages violents - Instabilité atmosphérique forte',
      found: true,
      data_source: 'thunder_demo',
      data_quality: 'high',
      commune_info: {
        commune_id: '84007',
        commune_name: 'Avignon',
        distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
      },
      // CAPE moyen values
      mean_cape: Math.floor(baseCAPE),
      max_cape: Math.floor(maxCAPE),
      mean_k_index: parseFloat(baseKIndex.toFixed(1)),
      max_k_index: parseFloat(maxKIndex.toFixed(1)),
      thunderstorm_days_per_year: thunderDays,
      severe_thunder_days: severeDays,
      trend_10_years: selectedTrend,
      nsg_value: parseFloat(nsgValue.toFixed(2)),
      nsg_unit: 'strikes/km²/year',
      // Legacy data for backward compatibility
      additional_data: {
        storm_days_per_year: thunderDays,
        lightning_density: `${nsgValue.toFixed(1)} strikes/km²/year`,
        hail_probability: 0.15,
        wind_gust_max: '90 km/h',
        flash_flood_risk: 'moderate',
        cape_category: 'Élevé (2500-3500 J/kg)',
        k_index_stability: 'Instable'
      }
    };
  } else if (riskScore > 0.4) {
    const thunderDays = 20 + Math.floor(Math.random() * 15); // 20-35 days for medium risk
    const severeDays = Math.floor(thunderDays * 0.15); // ~15% are severe
    
    return {
      coordinates: { lng, lat },
      risk_level: 'medium',
      risk_color: '#f59e0b',
      description: 'Risque modéré d\'orages - Instabilité atmosphérique modérée',
      found: true,
      data_source: 'thunder_demo',
      data_quality: 'medium',
      commune_info: {
        commune_id: '84007',
        commune_name: 'Avignon',
        distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
      },
      // CAPE moyen values
      mean_cape: Math.floor(baseCAPE),
      max_cape: Math.floor(maxCAPE),
      mean_k_index: parseFloat(baseKIndex.toFixed(1)),
      max_k_index: parseFloat(maxKIndex.toFixed(1)),
      thunderstorm_days_per_year: thunderDays,
      severe_thunder_days: severeDays,
      trend_10_years: selectedTrend,
      nsg_value: parseFloat(nsgValue.toFixed(2)),
      nsg_unit: 'strikes/km²/year',
      // Legacy data for backward compatibility
      additional_data: {
        storm_days_per_year: thunderDays,
        lightning_density: `${nsgValue.toFixed(1)} strikes/km²/year`,
        hail_probability: 0.08,
        wind_gust_max: '70 km/h',
        flash_flood_risk: 'low',
        cape_category: 'Modéré (1000-2500 J/kg)',
        k_index_stability: 'Moyennement instable'
      }
    };
  } else {
    const thunderDays = 10 + Math.floor(Math.random() * 10); // 10-20 days for low risk
    const severeDays = Math.floor(thunderDays * 0.1); // ~10% are severe
    
    return {
      coordinates: { lng, lat },
      risk_level: 'low',
      risk_color: '#10b981',
      description: 'Risque faible d\'orages - Instabilité atmosphérique faible',
      found: true,
      data_source: 'thunder_demo',
      data_quality: 'medium',
      commune_info: {
        commune_id: '84007',
        commune_name: 'Avignon',
        distance_km: Math.sqrt(Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)) * 111
      },
      // CAPE moyen values
      mean_cape: Math.floor(baseCAPE),
      max_cape: Math.floor(maxCAPE),
      mean_k_index: parseFloat(baseKIndex.toFixed(1)),
      max_k_index: parseFloat(maxKIndex.toFixed(1)),
      thunderstorm_days_per_year: thunderDays,
      severe_thunder_days: severeDays,
      trend_10_years: selectedTrend,
      nsg_value: parseFloat(nsgValue.toFixed(2)),
      nsg_unit: 'strikes/km²/year',
      // Legacy data for backward compatibility
      additional_data: {
        storm_days_per_year: thunderDays,
        lightning_density: `${nsgValue.toFixed(1)} strikes/km²/year`,
        hail_probability: 0.03,
        wind_gust_max: '50 km/h',
        flash_flood_risk: 'very_low',
        cape_category: 'Faible (<1000 J/kg)',
        k_index_stability: 'Stable'
      }
    };
  }
};

// Get all demo tracker data for a given coordinate
export const getDemoTrackerData = (lng: number, lat: number) => {
  return {
    inondation: demoInondationData(lng, lat),
    seismic: demoSeismicData(lng, lat),
    heatwave: demoHeatwaveData(lng, lat),
    thunder: demoThunderData(lng, lat)
  };
};

// Check if coordinates are in Avignon area
export const isAvignonArea = (lng: number, lat: number): boolean => {
  // Avignon center: 4.8059°E, 43.9493°N
  // Check within ~10km radius
  const distance = Math.sqrt(
    Math.pow(lng - 4.8059, 2) + Math.pow(lat - 43.9493, 2)
  );
  return distance < 0.1; // ~10km at this latitude
};

export default {
  demoInondationData,
  demoSeismicData,
  demoHeatwaveData,
  demoThunderData,
  getDemoTrackerData,
  isAvignonArea
};
