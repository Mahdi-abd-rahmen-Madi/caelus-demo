import React, { useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Button
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ICPEPopupProps {
  installation: any;
  onClose: () => void;
}

const ICPEPopup: React.FC<ICPEPopupProps> = ({
  installation,
  onClose
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!installation) return null;

  const getSevesoColor = (classification: string) => {
    switch (classification) {
      case '1':
      case 'Seuil Haut':
        return '#d32f2f';
      case '2':
      case 'Seuil Bas':
        return '#f57c00';
      case '3':
      case 'Non Seveso':
        return '#757575';
      default:
        return '#9e9e9e';
    }
  };

  const getSevesoLabel = (classification: string, label: string) => {
    // Always prefer the explicit label if provided and not "Non Seveso"
    if (label && label !== 'Non Seveso') {
      return label;
    }
    // Fall back to classification-based labels with clear "Seuil" terminology
    switch (classification) {
      case '1':
        return 'Seuil Haut';
      case '2':
        return 'Seuil Bas';
      case '3':
        return 'Non Seveso';
      default:
        return 'Inconnu';
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Clean up the URL by removing line breaks and extra spaces
    const cleanUrl = installation.detail_url
      .replace(/\s+/g, '')  // Remove all whitespace
      .replace(/(\r\n|\n|\r)/gm, '');  // Remove line breaks

    // Validate URL before opening
    if (cleanUrl && cleanUrl.startsWith('http')) {
      window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Add native event listener as fallback
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const nativeClickHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const cleanUrl = installation.detail_url
        .replace(/\s+/g, '')
        .replace(/(\r\n|\n|\r)/gm, '');

      if (cleanUrl && cleanUrl.startsWith('http')) {
        window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      }
    };

    // Add native event listener with capture to ensure it runs before map handlers
    button.addEventListener('click', nativeClickHandler, true);

    return () => {
      button.removeEventListener('click', nativeClickHandler, true);
    };
  }, [installation.detail_url]);

  const sevesoLabel = getSevesoLabel(installation.seveso_classification, installation.seveso_label);
  const sevesoColor = getSevesoColor(installation.seveso_classification);

  return (
    <Card
      sx={{
        position: 'absolute',
        left: 20,
        top: 80,
        width: 320,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: 3,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1000,
        border: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, lineHeight: 1.2 }}>
            {installation.name || 'Installation sans nom'}
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Seveso Classification */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={sevesoLabel}
            size="small"
            sx={{
              backgroundColor: sevesoColor,
              color: 'white',
              fontWeight: 600,
              fontSize: '12px',
              height: '28px',
              px: 1,
              '& .MuiChip-label': {
                fontWeight: 600
              }
            }}
          />
          {/* Show additional context for Seveso installations */}
          {(installation.seveso_classification === '1' || installation.seveso_classification === '2') && (
            <Typography variant="caption" sx={{
              fontSize: '10px',
              color: 'text.secondary',
              mt: 0.5,
              display: 'block',
              fontStyle: 'italic'
            }}>
              Installation classée Seveso
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Location Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Localisation
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {installation.commune_insee && (
              <>Code INSEE: {installation.commune_insee}<br /></>
            )}
            {installation.department && (
              <>Département: {installation.department}<br /></>
            )}
          </Typography>
        </Box>

        {/* Activity Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Activité
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {installation.naf_code && (
              <>Code NAF: {installation.naf_code}<br /></>
            )}
            {installation.naf_description && (
              <>{installation.naf_description}<br /></>
            )}
            {installation.regime_code && (
              <>Régime: {installation.regime_code} - {installation.regime_description}<br /></>
            )}
            {installation.rubriques && (
              <>Rubriques: {installation.rubriques}</>
            )}
          </Typography>
        </Box>

        {/* Regulatory Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Information réglementaire
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {installation.last_modification && (
              <>Dernière modification: {installation.last_modification}<br /></>
            )}
            {installation.last_inspection && (
              <>Dernière inspection: {installation.last_inspection}<br /></>
            )}
          </Typography>
        </Box>

        {/* Detail Link */}
        {installation.detail_url && (
          <Box sx={{ mt: 2 }}>
            <Button
              ref={buttonRef}
              variant="outlined"
              size="small"
              onClick={handleButtonClick}
              sx={{
                fontSize: '10px',
                textTransform: 'none',
                minWidth: 'auto',
                py: 0.5,
                px: 1,
                borderColor: '#1976d2',
                color: '#1976d2',
                pointerEvents: 'auto',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1001,
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  cursor: 'pointer',
                },
                '&:active': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                }
              }}
            >
              Voir la fiche détaillée →
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ICPEPopup;
