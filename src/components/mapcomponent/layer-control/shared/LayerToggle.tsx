import React from 'react';
import { Box, FormControlLabel, Switch, Typography } from '@mui/material';

export interface LayerToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string | React.ReactNode;
  color?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  indicator?: React.ReactNode;
  sx?: object;
  debugMode?: boolean;
  layerId?: string;
}

const LayerToggle: React.FC<LayerToggleProps> = ({
  checked,
  onChange,
  label,
  color = '#6366f1',
  size = 'small',
  disabled = false,
  indicator,
  sx = {},
  debugMode = false,
  layerId
}) => {
  const handleChange = () => {
    if (debugMode && layerId) {
      console.log(`[LayerToggle] Toggle ${layerId} changed from ${checked} to ${!checked}`);
    }
    onChange();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', px: 0.5, ...sx }}>
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            size={size}
            disabled={disabled}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: color,
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: `${color}33`, // Add transparency
              },
            }}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {indicator}
            <Typography variant="caption" sx={{
              fontSize: '9px',
              color: 'rgba(0, 0, 0, 0.8)'
            }}>
              {label}
            </Typography>
          </Box>
        }
        sx={{ flexDirection: 'row', gap: 0.5 }}
      />
    </Box>
  );
};

export default LayerToggle;
