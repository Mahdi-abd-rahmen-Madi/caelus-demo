import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createMockTileServer } from './src/utils/mockTileServer';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDemo = mode === 'demo'

  return {
    plugins: [
      react({
        // Optimize JSX runtime
        jsxImportSource: '@emotion/react'
      }),
      // Add mock tile server for demo mode
      ...(isDemo ? [createMockTileServer({ enabled: true, logRequests: true })] : [])
    ],
    // Build optimizations
    build: {
      chunkSizeWarningLimit: 300, // Smaller chunks for better loading
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            maplibre: ['maplibre-gl'],
            mui: ['@mui/material', '@mui/icons-material'],
            router: ['react-router-dom'],
            i18n: ['react-i18next', 'i18next'],
            geo: ['geojson', '@mapbox/vector-tile', 'proj4'],
            utils: ['axios', 'web-vitals', 'zstd-wasm']
          }
        }
      }
    },
    // Development optimizations
    server: {
      port: 3001,
      host: 'localhost',
      hmr: {
        port: 3001
      },
      // Optimize development performance
      watch: {
        usePolling: false,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/dist/**']
      },
      // Proxy configuration - disable in demo mode to use mock server
      ...(isDemo ? {} : {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
            // Don't break if backend is not available
            onError: (err: any) => {
              console.log('Proxy error - backend not available, using frontend proxy:', err.message);
            }
          },
          '/georisques': {
            target: 'https://georisques.gouv.fr',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/georisques/, '')
          }
        }
      })
    },
    // Resolve React version conflicts
    resolve: {
      dedupe: ['react', 'react-dom']
    },
    // Define constants for demo mode
    define: isDemo ? {
      __DEMO_MODE__: 'true',
      __DEMO_CITY__: '"Avignon"',
      __DEMO_DEPARTMENT__: '"84"'
    } : {}
  }
})
