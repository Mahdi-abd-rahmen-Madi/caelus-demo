import React from 'react';
import { Box, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import { useTranslation } from 'react-i18next';
import type { BaseMapType } from '../../../types/dashboard';

export interface BaseMapControlsProps {
  internalSelectedBaseMap: BaseMapType;
  onBaseMapChange: (value: BaseMapType) => void;
}

const BaseMapControls: React.FC<BaseMapControlsProps> = ({
  internalSelectedBaseMap,
  onBaseMapChange
}) => {
  const { t } = useTranslation();

  const baseMaps = [
    { value: 'osm', icon: MapIcon, label: 'OSM' },
    { value: 'osm-hot', icon: LocalFireDepartmentIcon, label: 'HOT' },
    { value: 'carto-positron', icon: LightModeIcon, label: 'Light' },
    { value: 'carto-darkmatter', icon: DarkModeIcon, label: 'Dark' },
    { value: 'maptiler-satellite', icon: SatelliteAltIcon, label: 'Satellite' }
  ] as const;

  return (
    <Box sx={{ p: 0.5 }}>
      <Typography variant="caption" sx={{
        fontSize: '10px',
        fontWeight: 600,
        color: '#6366f1',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        mb: 0.5,
        display: 'block',
        textAlign: 'center'
      }}>
        {t('base_map')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.4, px: 0.5 }}>
        {baseMaps.map((map) => (
          <Box
            key={map.value}
            onClick={() => {
              onBaseMapChange(map.value as BaseMapType);
            }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
              p: 0.5,
              borderRadius: 0.75,
              backgroundColor: internalSelectedBaseMap === map.value
                ? 'rgba(99, 102, 241, 0.15)'
                : 'rgba(0, 0, 0, 0.05)',
              border: internalSelectedBaseMap === map.value
                ? '1px solid rgba(99, 102, 241, 0.4)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: internalSelectedBaseMap === map.value
                ? 'rgba(99, 102, 241, 0.2)'
                : 'rgba(0, 0, 0, 0.1)',
              color: internalSelectedBaseMap === map.value
                ? '#6366f1'
                : 'rgba(0, 0, 0, 0.6)',
              transition: 'all 0.15s ease'
            }}>
              <map.icon sx={{ fontSize: 14 }} />
            </Box>
            <Typography variant="caption" sx={{
              fontSize: '9px',
              fontWeight: 500,
              color: internalSelectedBaseMap === map.value
                ? '#6366f1'
                : 'rgba(0, 0, 0, 0.8)',
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              {map.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BaseMapControls;
