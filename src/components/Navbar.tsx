import React from 'react';
import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface NavbarProps {
  // Ruler and Buffer Zone props
  showRulerTool?: boolean;
  showBufferZone?: boolean;
  onRulerToolToggle?: (visible: boolean) => void;
  onBufferZoneToggle?: (visible: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  showRulerTool = false,
  showBufferZone = false,
  onRulerToolToggle,
  onBufferZoneToggle
}) => {
  const { t } = useTranslation();
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(12px)',
        borderRadius: 0,
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Left side - Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 600,
            color: '#1e293b',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          {t('dashboard')}
        </Typography>

        {/* Right side - Tools, Location and Language */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Measurement Toolbox */}
          <Paper
            elevation={1}
            sx={{
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: 1
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#666',
                px: 1,
                borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {t('toolbox')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={t('ruler_tool')} arrow>
                <IconButton
                  size="small"
                  onClick={() => onRulerToolToggle?.(!showRulerTool)}
                  disabled={showBufferZone}
                  sx={{
                    backgroundColor: showRulerTool ? 'primary.main' : 'transparent',
                    color: showRulerTool ? 'white' : showBufferZone ? 'text.disabled' : 'inherit',
                    opacity: showBufferZone ? 0.5 : 1,
                    '&:hover': {
                      backgroundColor: showRulerTool ? 'primary.dark' : showBufferZone ? 'transparent' : 'action.hover'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'transparent',
                      color: 'text.disabled',
                      opacity: 0.5
                    }
                  }}
                >
                  <StraightenIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('buffer_zone')} arrow>
                <IconButton
                  size="small"
                  onClick={() => onBufferZoneToggle?.(!showBufferZone)}
                  disabled={showRulerTool}
                  sx={{
                    backgroundColor: showBufferZone ? 'primary.main' : 'transparent',
                    color: showBufferZone ? 'white' : showRulerTool ? 'text.disabled' : 'inherit',
                    opacity: showRulerTool ? 0.5 : 1,
                    '&:hover': {
                      backgroundColor: showBufferZone ? 'primary.dark' : showRulerTool ? 'transparent' : 'action.hover'
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'transparent',
                      color: 'text.disabled',
                      opacity: 0.5
                    }
                  }}
                >
                  <CropSquareIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          <LanguageSwitcher />
        </Box>
      </Box>
    </Paper>
  );
};

export default Navbar;
