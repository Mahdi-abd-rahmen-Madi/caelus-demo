// Mock Tile Server for Vite Development
// This handles tile requests that would normally go to a backend server

import { getRTETileData } from '../services/demoApi';

export interface MockTileServerOptions {
  enabled: boolean;
  logRequests: boolean;
}

export const createMockTileServer = (options: MockTileServerOptions = { enabled: true, logRequests: true }) => {
  console.log('Mock Tile Server: Initializing with options:', options);
  
  return {
    name: 'mock-tile-server',
    configureServer(server: any) {
      if (!options.enabled) {
        console.log('Mock Tile Server: Disabled');
        return;
      }
      
      console.log('Mock Tile Server: Setting up middleware for /api/geodata/tiles');

      server.middlewares.use('/api/geodata/tiles', async (req: any, res: any) => {
        if (options.logRequests) {
          console.log(`Mock Tile Server: ${req.method} ${req.url}`);
        }

        // Parse the URL to extract tile coordinates and parameters
        const urlMatch = req.url.match(/\/rte\/(\d+)\/(\d+)\/(\d+)(?:\?(.*))?$/);
        
        if (!urlMatch) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid tile URL format' }));
          return;
        }

        const [, z, x, y, queryString] = urlMatch;
        
        // Parse query parameters
        const params = new URLSearchParams(queryString || '');
        const filters: any = {};
        
        if (params.has('line_type')) {
          filters.line_type = params.get('line_type');
        }
        if (params.has('voltage_min')) {
          filters.voltageRange = [parseInt(params.get('voltage_min')!), parseInt(params.get('voltage_max') || '999')];
        }
        if (params.has('aerien')) {
          filters.aerien = params.get('aerien') === 'true';
        }
        if (params.has('souterrain')) {
          filters.souterrain = params.get('souterrain') === 'true';
        }

        try {
          // Get tile data from our mock API
          const tileData = await getRTETileData(
            parseInt(z), 
            parseInt(x), 
            parseInt(y), 
            filters
          );

          // Convert to MVT format (simplified - in reality this would require proper encoding)
          // For now, return as GeoJSON since the component can handle it
          const isMvtRequest = req.headers.accept?.includes('application/vnd.mapbox-vector-tile');
          
          if (isMvtRequest) {
            // For MVT requests, we'd need to encode to protobuf
            // For demo purposes, return empty MVT
            res.writeHead(200, { 
              'Content-Type': 'application/vnd.mapbox-vector-tile',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(''); // Empty MVT
          } else {
            // Return as GeoJSON
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(tileData));
          }

        } catch (error) {
          console.error('Mock Tile Server Error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }));
        }
      });

      // Handle CORS preflight requests
      server.middlewares.use('/api/geodata/tiles', (req: any, res: any, next: any) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          res.end();
        } else {
          next();
        }
      });
      
      console.log('Mock Tile Server: Middleware setup complete');
    }
  };
};
