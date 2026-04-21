import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { georisquesPreconnection } from './services/preconnection'

// Initialize preconnection for Georisques API early
georisquesPreconnection.performHealthCheck().catch(() => {
  // Health check failed, but preconnection links are still injected
  console.warn('Georisques preconnection health check failed, but links are still active');
});


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
