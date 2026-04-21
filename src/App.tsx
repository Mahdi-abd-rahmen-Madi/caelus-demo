import { Box, CircularProgress, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { AuthProvider } from './context/AuthContext';
import './i18n';
import { initWebVitals } from './utils/webVitals';
import { setupMockApiInterceptor } from './services/mockApiInterceptor';

// Lazy load pages to reduce initial bundle size
const Dashboard = lazy(() => import('./pages/dashboard'));
const WebVitalsDashboard = lazy(() => import('./components/WebVitalsDashboard'));

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Loading component for Suspense
const AppLoading = () => (
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

function App() {
  useEffect(() => {
    // Setup mock API interceptor for demo
    setupMockApiInterceptor();

    // Defer Web Vitals initialization to avoid blocking initial render
    const timer = setTimeout(() => {
      initWebVitals();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppStateProvider>
          <Suspense fallback={<AppLoading />}>
            <Router>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Router>
            <Suspense fallback={<div />}>
              <WebVitalsDashboard />
            </Suspense>
          </Suspense>
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
