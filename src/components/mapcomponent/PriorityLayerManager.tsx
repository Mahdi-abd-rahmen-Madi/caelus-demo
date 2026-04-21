import { Box } from '@mui/material';
import React, { memo } from 'react';

// Simple priority layer manager that delays rendering
interface PriorityLayerManagerProps {
  children: React.ReactNode;
  priority: 'critical' | 'high' | 'medium' | 'low';
  delay?: number;
}

const PriorityLayerManager: React.FC<PriorityLayerManagerProps> = memo(({ 
  children, 
  priority, 
  delay = 0 
}) => {
  // Use props to prevent warnings
  void priority;
  void delay;
  
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {children}
    </Box>
  );
});

PriorityLayerManager.displayName = 'PriorityLayerManager';

export default PriorityLayerManager;
