import { CssBaseline, ThemeProvider } from '@mui/material';
import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { theme } from './app/theme';
import { Dashboard } from './features/dashboard';
import WebVitalsDashboard from './components/WebVitalsDashboard';
import './i18n';
import { initWebVitals } from './utils/webVitals';
import { setupMockApiInterceptor } from './services/mockApiInterceptor';

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
      <AppProviders>
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
      </AppProviders>
    </ThemeProvider>
  );
}

export default App;
