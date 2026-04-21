import React from 'react';
import { Box } from '@mui/material';

export interface ColorIndicatorProps {
  color: string;
  size?: number;
  shape?: 'circle' | 'square' | 'diamond';
  border?: string;
  sx?: object;
}

const ColorIndicator: React.FC<ColorIndicatorProps> = ({
  color,
  size = 8,
  shape = 'circle',
  border = '1px solid #fff',
  sx = {}
}) => {
  const getShapeStyles = () => {
    switch (shape) {
      case 'square':
        return {};
      case 'diamond':
        return { transform: 'rotate(45deg)' };
      default: // circle
        return { borderRadius: '50%' };
    }
  };

  return (
    <Box sx={{
      width: size,
      height: size,
      backgroundColor: color,
      border: border,
      ...getShapeStyles(),
      ...sx
    }} />
  );
};

export default ColorIndicator;
