// Frontend WMS Proxy
// Handles WMS requests directly in the frontend without requiring a backend
// Mimics the behavior of the CAELUS backend PLU proxy

// External WMS service configuration (same as backend)
export const PLU_WMS_CONFIG = {
  baseUrl: 'https://data.geopf.fr/wms-v/ows',
  version: '1.3.0',
  format: 'image/png',
  transparent: 'TRUE',
  crs: 'EPSG:3857',
  styles: '',
  tileSize: 256
} as const;

// Layer mappings (same as backend)
export const PLU_LAYER_MAPPINGS = {
  'zone_secteur': 'zone_secteur',
  'prescription': 'prescription', 
  'information': 'info'
} as const;

// Simple cache for WMS tiles (mimics backend caching)
const WMSCache = new Map<string, { data: string; timestamp: number; ttl: number }>();

// Get cache key for WMS request
const getWMSCacheKey = (params: Record<string, string>): string => {
  const keyParams = { ...params };
  delete keyParams.t; // Exclude timestamp
  const paramString = Object.entries(keyParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `wms:${btoa(paramString).slice(0, 16)}`;
};

// Check cache
const getCachedWMS = (key: string): string | null => {
  const cached = WMSCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    WMSCache.delete(key);
  }
  return null;
};

// Set cache
const setCachedWMS = (key: string, data: string, ttl: number = 30 * 60 * 1000): void => {
  WMSCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
};

// Build PLU WMS URL (same as backend)
export const buildPLUWMSUrl = (
  layerName: string,
  bbox: string,
  width: number = 256,
  height: number = 256
): string => {
  const mappedLayer = PLU_LAYER_MAPPINGS[layerName as keyof typeof PLU_LAYER_MAPPINGS] || layerName;
  
  let url = `${PLU_WMS_CONFIG.baseUrl}?`;
  url += `SERVICE=WMS&`;
  url += `VERSION=${PLU_WMS_CONFIG.version}&`;
  url += `REQUEST=GetMap&`;
  url += `LAYERS=${mappedLayer}&`;
  url += `FORMAT=${PLU_WMS_CONFIG.format}&`;
  url += `TRANSPARENT=${PLU_WMS_CONFIG.transparent}&`;
  url += `CRS=${PLU_WMS_CONFIG.crs}&`;
  url += `STYLES=${PLU_WMS_CONFIG.styles}&`;
  url += `WIDTH=${width}&`;
  url += `HEIGHT=${height}&`;
  url += `BBOX=${bbox}`;
  
  return url;
};

// Intercept and modify WMS URLs to use frontend proxy
export const interceptWMSUrl = (originalUrl: string): string => {
  // Check if this is a PLU WMS request that needs proxying
  if (originalUrl.includes('/api/geodata/plu/')) {
    // Extract layer information from the original URL
    const urlParams = new URLSearchParams(originalUrl.split('?')[1]);
    const layers = urlParams.get('LAYERS');
    const bbox = urlParams.get('BBOX');
    const width = urlParams.get('WIDTH') || '256';
    const height = urlParams.get('HEIGHT') || '256';
    
    if (layers && bbox) {
      // Build direct URL to external WMS service (same as backend)
      return buildPLUWMSUrl(layers, bbox, parseInt(width), parseInt(height));
    }
  }
  
  // Return original URL if no proxying needed
  return originalUrl;
};

// Fetch WMS tile with caching (frontend implementation of backend proxy)
export const fetchWMSTile = async (url: string): Promise<string> => {
  const cacheKey = getWMSCacheKey(Object.fromEntries(new URLSearchParams(url.split('?')[1])));
  
  // Check cache first
  const cached = getCachedWMS(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'image/png',
      }
    });
    
    if (!response.ok) {
      throw new Error(`WMS request failed: ${response.status}`);
    }
    
    const blob = await response.blob();
    const dataUrl = URL.createObjectURL(blob);
    
    // Cache the result
    setCachedWMS(cacheKey, dataUrl);
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to fetch WMS tile:', error);
    throw error;
  }
};

// Create a canvas-based mock tile for fallback
export const createMockTileCanvas = (
  layerName: string,
  x: number,
  y: number,
  z: number,
  width: number = 256,
  height: number = 256
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  
  // Fill background
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  const gridSize = 40;
  
  for (let i = 0; i <= width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  
  for (let i = 0; i <= height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
  
  // Draw text
  ctx.fillStyle = '#6b7280';
  ctx.font = '12px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(layerName, width / 2, height / 2);
  
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Arial, sans-serif';
  ctx.fillText(`${z}/${x}/${y}`, width / 2, height / 2 + 15);
  
  return canvas;
};

// Convert canvas to data URL
export const canvasToDataUrl = (canvas: HTMLCanvasElement): string => {
  return canvas.toDataURL('image/png');
};

export default {
  PLU_WMS_CONFIG,
  PLU_LAYER_MAPPINGS,
  buildPLUWMSUrl,
  interceptWMSUrl,
  fetchWMSTile,
  createMockTileCanvas,
  canvasToDataUrl
};
