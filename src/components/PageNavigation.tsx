import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import { MAP_CONFIG } from '../config/mapConfig';

const PageNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (MAP_CONFIG.disablePageNavigation) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >
      <Button
        variant={isActive('/dashboard') ? 'contained' : 'outlined'}
        size="small"
        startIcon={<MapIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: isActive('/dashboard') ? 'primary.main' : 'background.paper',
          color: isActive('/dashboard') ? 'primary.contrastText' : 'text.primary',
          '&:hover': {
            backgroundColor: isActive('/dashboard') ? 'primary.dark' : 'action.hover'
          }
        }}
      >
        Dashboard
      </Button>
    </Box>
  );
};

export default PageNavigation;
