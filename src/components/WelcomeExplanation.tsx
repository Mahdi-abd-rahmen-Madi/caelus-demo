import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography, Checkbox, FormControlLabel, useTheme } from '@mui/material';
import { Close, Search, Map, Assessment, Info } from '@mui/icons-material';
import { useState } from 'react';

interface WelcomeExplanationProps {
  open: boolean;
  onClose: (permanent?: boolean) => void;
}

const WelcomeExplanation = ({ open, onClose }: WelcomeExplanationProps) => {
  const theme = useTheme();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const features = [
    {
      icon: <Map sx={{ color: theme.palette.primary.main, fontSize: 32 }} />,
      title: "Interactive Mapping",
      description: "Explore detailed parcel data and geographic information for Avignon"
    },
    {
      icon: <Assessment sx={{ color: theme.palette.secondary.main, fontSize: 32 }} />,
      title: "Risk Assessment",
      description: "View seismic, flood, and radon risk data for informed decision making"
    },
    {
      icon: <Search sx={{ color: theme.palette.success.main, fontSize: 32 }} />,
      title: "Smart Search",
      description: "Find and analyze parcels using advanced filtering and criteria"
    },
    {
      icon: <Info sx={{ color: theme.palette.info.main, fontSize: 32 }} />,
      title: "Rich Data",
      description: "Access comprehensive infrastructure and urban planning information"
    }
  ];

  const quickStartSteps = [
    "Use the search panel to find locations or drop a pin on the map",
    "Explore different layers using the layer controls on the right",
    "Click on parcels to view detailed information and risk assessments",
    "Use the filter tools to narrow down suitable parcels based on your criteria"
  ];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        position: 'relative'
      }}>
        <Typography variant="h4" component="span" fontWeight="bold" sx={{ fontSize: '1.5rem' }}>
          Welcome to CAELUS Demo
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Introduction */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            <strong>CAELUS Demo</strong> is a standalone demonstration of our land analysis and risk assessment platform,
            featuring comprehensive data for the <strong>Avignon area</strong>. This demo showcases advanced parcel analysis,
            risk mapping, and infrastructure data visualization capabilities.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No backend required - all data is embedded for demonstration purposes.
          </Typography>
        </Box>

        {/* Key Features */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
            Key Features
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flexShrink: 0 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Quick Start Guide */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
            Quick Start Guide
          </Typography>
          <Box sx={{ pl: 2 }}>
            {quickStartSteps.map((step, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'flex-start' }}>
                <Box component="span" sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 'bold', 
                  mr: 2,
                  minWidth: 20
                }}>
                  {index + 1}.
                </Box>
                <Box component="span">{step}</Box>
              </Typography>
            ))}
          </Box>
        </Box>

        {/* Data Coverage Info */}
        <Box sx={{ 
          mb: 3,
          p: 2,
          backgroundColor: theme.palette.info.light,
          borderRadius: 2,
          border: `1px solid ${theme.palette.info.main}`
        }}>
          <Typography variant="subtitle2" fontWeight="bold" color="info.dark" gutterBottom>
            Data Coverage
          </Typography>
          <Typography variant="body2" color="info.dark">
            This demo includes comprehensive data for Avignon including parcels, risk assessments,
            infrastructure networks, and urban planning information. For production use with other areas,
            contact the CAELUS team.
          </Typography>
        </Box>

        {/* Don't Show Again Checkbox */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                color="primary"
              />
            }
            label="Don't show this again"
          />
          <Button 
            variant="contained" 
            onClick={handleClose}
            size="large"
            sx={{ minWidth: 120 }}
          >
            Get Started
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeExplanation;
