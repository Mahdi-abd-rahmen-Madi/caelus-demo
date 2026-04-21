import React from 'react';
import { Box, Typography } from '@mui/material';

export interface LayerGroupSectionProps {
  title: string;
  color: string;
  backgroundColor: string;
  children: React.ReactNode;
  sx?: object;
}

const LayerGroupSection: React.FC<LayerGroupSectionProps> = ({
  title,
  color,
  backgroundColor,
  children,
  sx = {}
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 0.8, 
        p: 0.5, 
        backgroundColor: backgroundColor, 
        borderRadius: 1,
        ...sx 
      }}>
        <Typography variant="caption" sx={{
          fontSize: '9px',
          fontWeight: 600,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          textAlign: 'center',
          mb: 0.5
        }}>
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
};

export default LayerGroupSection;
