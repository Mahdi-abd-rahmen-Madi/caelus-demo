// Static seismic zone configuration
export interface SeismicZoneConfig {
  id: string;
  label: string;
  color: string;
  riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  description: string;
}

export const SEISMIC_ZONES: Record<string, SeismicZoneConfig> = {
  '1': {
    id: '1',
    label: 'Zone 1',
    color: '#10b981',
    riskLevel: 'very_low',
    description: 'Très faible sismicité'
  },
  '2': {
    id: '2',
    label: 'Zone 2',
    color: '#84cc16',
    riskLevel: 'low',
    description: 'Faible sismicité'
  },
  '3': {
    id: '3',
    label: 'Zone 3',
    color: '#f59e0b',
    riskLevel: 'medium',
    description: 'Sismicité modérée'
  },
  '4': {
    id: '4',
    label: 'Zone 4',
    color: '#f97316',
    riskLevel: 'high',
    description: 'Forte sismicité'
  },
  '5': {
    id: '5',
    label: 'Zone 5',
    color: '#ef4444',
    riskLevel: 'very_high',
    description: 'Très forte sismicité'
  }
};

export const DEFAULT_SEISMIC_FILTERS = {
  '1': true,
  '2': true,
  '3': true,
  '4': true,
  '5': true
} as const;

export const getSeismicZoneColor = (zone: string): string => {
  return SEISMIC_ZONES[zone]?.color || '#94a3b8';
};

export const getSeismicZoneDescription = (zone: string): string => {
  return SEISMIC_ZONES[zone]?.description || 'Zone inconnue';
};
