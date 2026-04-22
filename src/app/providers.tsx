import { Box, CircularProgress } from '@mui/material';
import { Suspense } from 'react';
import { AppStateProvider } from '../context/AppStateContext';
import { AuthProvider } from '../context/AuthContext';

// Loading component for Suspense
export const AppLoading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      bgcolor: 'grey.100'
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <AuthProvider>
    <AppStateProvider>
      <Suspense fallback={<AppLoading />}>
        {children}
      </Suspense>
    </AppStateProvider>
  </AuthProvider>
);
