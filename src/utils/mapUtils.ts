/**
 * Map utilities - isolates heavy map library imports
 * This module is lazy-loaded to avoid including map libraries in the main bundle
 */

// Lazy import maplibre-gl with types
export const getMapLibre = () => import('maplibre-gl');

// Lazy import proj4
export const getProj4 = () => import('proj4');

// Setup proj4 definitions
export const setupProj4 = async () => {
    const proj4 = await getProj4();
    proj4.default.defs(
        'EPSG:3857',
        '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs'
    );
    return proj4.default;
};

// Export types for use in components
export type { Map, StyleSpecification, MapLayerMouseEvent } from 'maplibre-gl';

// Map constants
export const MAP_CONSTANTS = {
    MIN_ZOOM: 12,
    MAX_ZOOM: 21,
    TILE_SOURCE_MAX_ZOOM: 17,
    DEFAULT_CENTER: [2.3522, 48.8566] as [number, number], // Paris
    DEFAULT_ZOOM: 12
} as const;