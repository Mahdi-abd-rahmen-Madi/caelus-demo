import React from 'react';
import { Box, Typography } from '@mui/material';

export interface ZoomIndicatorProps {
  currentZoom: number;
  active?: boolean;
  sx?: object;
}

const ZoomIndicator: React.FC<ZoomIndicatorProps> = ({
  currentZoom,
  active = true,
  sx = {}
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ...sx }}>
      <Box sx={{
        px: 0.5,
        py: 0.25,
        borderRadius: 0.25,
        fontSize: '6px',
        fontWeight: 600,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        Z{Math.floor(currentZoom)}
      </Box>

      <Typography variant="caption" sx={{
        fontSize: '6px',
        color: '#10b981',
        fontWeight: 500
      }}>
        {active ? 'Active' : 'Inactive'}
      </Typography>
    </Box>
  );
};

export default ZoomIndicator;
