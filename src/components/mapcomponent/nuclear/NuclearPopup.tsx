import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface NuclearPopupProps {
  reactor: any;
  onClose: () => void;
}

const NuclearPopup: React.FC<NuclearPopupProps> = ({
  reactor,
  onClose
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!reactor) return null;

  const getPalierColor = (palier: string) => {
    switch (palier) {
      case 'N4':
        return '#ff6b6b';        // red - newest generation
      case 'P\'4':
        return '#4ecdc4';        // teal - advanced P4
      case 'P4':
        return '#45b7d1';        // blue - standard P4
      case 'CP2':
        return '#96ceb4';        // green - CP2
      case 'CP1':
        return '#feca57';        // yellow - CP1
      case 'CP0':
        return '#ff9ff3';        // pink - oldest generation
      default:
        return '#95afc0';        // gray - unknown
    }
  };

  const getPalierDisplay = (palier: string) => {
    switch (palier) {
      case 'N4':
        return 'N4 (1995+)';
      case 'P\'4':
        return 'P\'4 (Amélioré)';
      case 'P4':
        return 'P4 (Standard)';
      case 'CP2':
        return 'CP2 (900 MW)';
      case 'CP1':
        return 'CP1 (900 MW)';
      case 'CP0':
        return 'CP0 (Ancienne)';
      default:
        return palier || 'Inconnu';
    }
  };

  const formatPower = (power: string) => {
    if (!power) return 'N/A';
    return power.replace(/\s/g, '') + ' MWe';
  };

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
            {reactor['Nom du réacteur']}
          </Typography>
          <IconButton
            ref={buttonRef}
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            sx={{ p: 0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Reactor Type */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={getPalierDisplay(reactor.Palier)}
            size="small"
            sx={{
              backgroundColor: getPalierColor(reactor.Palier),
              color: 'white',
              fontWeight: 500,
              fontSize: '11px'
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Location Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Localisation
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {reactor.Commune && (
              <>Commune: {reactor.Commune}<br /></>
            )}
            {reactor.Département && (
              <>Département: {reactor.Département}<br /></>
            )}
            {reactor['Centrale nucléaire'] && (
              <>Centrale: {reactor['Centrale nucléaire']}<br /></>
            )}
            {reactor['Commune Lat'] && reactor['Commune long'] && (
              <>Coordonnées: {reactor['Commune Lat']}, {reactor['Commune long']}</>
            )}
          </Typography>
        </Box>

        {/* Technical Specs */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Caractéristiques techniques
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {reactor['Puissance nette (MWe)'] && (
              <>Puissance nette: {formatPower(reactor['Puissance nette (MWe)'])}<br /></>
            )}
            {reactor['Puissance brute (MWe)'] && (
              <>Puissance brute: {formatPower(reactor['Puissance brute (MWe)'])}<br /></>
            )}
            {reactor['Puissance thermique (MWt)'] && (
              <>Puissance thermique: {reactor['Puissance thermique (MWt)']} MWt</>
            )}
          </Typography>
        </Box>

        {/* Timeline */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Chronologie
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {reactor['Début construction '] && (
              <>Début construction: {reactor['Début construction ']}<br /></>
            )}
            {reactor['Raccordement au réseau'] && (
              <>Raccordement réseau: {reactor['Raccordement au réseau']}<br /></>
            )}
            {reactor['Mise en service'] && (
              <>Mise en service: {reactor['Mise en service']}</>
            )}
          </Typography>
        </Box>

        {/* Additional Info */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, mb: 1 }}>
            Informations supplémentaires
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
            {reactor.__id && (
              <>ID Réacteur: {reactor.__id}<br /></>
            )}
            {reactor.Rg && (
              <>Groupe: {reactor.Rg}</>
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NuclearPopup;
