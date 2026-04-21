import proj4 from 'proj4';
import type { Geometry, Position } from 'geojson';

const EPSG_3857_DEF =
    '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';

const ensureProjectionDefinitions = () => {
    try {
        const existing = proj4.defs('EPSG:3857');
        if (!existing) {
            proj4.defs('EPSG:3857', EPSG_3857_DEF);
        }
    } catch (error) {
        proj4.defs('EPSG:3857', EPSG_3857_DEF);
    }
};

const toFiniteNumber = (value: unknown): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const isValidLatLng = (lat: number | null, lng: number | null): boolean => {
    if (lat === null || lng === null) return false;
    return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
};

const parseGeoJSON = (geometry: unknown): Geometry | null => {
    if (!geometry) return null;
    if (typeof geometry === 'string') {
        try {
            return JSON.parse(geometry) as Geometry;
        } catch (error) {
            return null;
        }
    }
    if (typeof geometry === 'object') {
        return geometry as Geometry;
    }
    return null;
};

const flattenPositions = (coordinates: unknown): Position[] => {
    if (!Array.isArray(coordinates)) return [];
    if (
        coordinates.length >= 2 &&
        typeof coordinates[0] === 'number' &&
        typeof coordinates[1] === 'number'
    ) {
        return [[coordinates[0] as number, coordinates[1] as number]];
    }

    return (coordinates as unknown[]).flatMap((item) => flattenPositions(item));
};

const centroidFromGeometry = (geometry: Geometry | null): [number, number] | null => {
    if (!geometry) return null;

    switch (geometry.type) {
        case 'Point':
            if (Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
                const [x, y] = geometry.coordinates as Position;
                if (typeof x === 'number' && typeof y === 'number') {
                    return [x, y];
                }
            }
            return null;
        case 'MultiPoint':
        case 'LineString':
        case 'MultiLineString':
        case 'Polygon':
        case 'MultiPolygon':
            break;
        default:
            return null;
    }

    const positions = flattenPositions(geometry.coordinates)
        .filter((pos): pos is Position => Array.isArray(pos) && pos.length >= 2);

    if (!positions.length) return null;

    const { sumX, sumY, count } = positions.reduce(
        (acc, [x, y]) => {
            if (typeof x === 'number' && typeof y === 'number') {
                acc.sumX += x;
                acc.sumY += y;
                acc.count += 1;
            }
            return acc;
        },
        { sumX: 0, sumY: 0, count: 0 }
    );

    if (count === 0) {
        const [x, y] = positions[0];
        if (typeof x === 'number' && typeof y === 'number') {
            return [x, y];
        }
        return null;
    }

    return [sumX / count, sumY / count];
};

export interface BuildingLikeGeometry {
    latitude?: unknown;
    longitude?: unknown;
    centroid?: { lat?: unknown; lng?: unknown } | null;
    geometry?: unknown;
}

export const getBuildingLatLng = (
    building: BuildingLikeGeometry | null | undefined
): { lat: number; lng: number } | null => {
    if (!building) return null;

    const lat = toFiniteNumber(building.latitude);
    const lng = toFiniteNumber(building.longitude);
    if (isValidLatLng(lat, lng)) {
        return { lat: lat as number, lng: lng as number };
    }

    const centroidLat = toFiniteNumber(building.centroid?.lat);
    const centroidLng = toFiniteNumber(building.centroid?.lng);
    if (isValidLatLng(centroidLat, centroidLng)) {
        return { lat: centroidLat as number, lng: centroidLng as number };
    }

    const geometry = parseGeoJSON(building.geometry);
    const centroid = centroidFromGeometry(geometry);
    if (!centroid) {
        return null;
    }

    ensureProjectionDefinitions();

    let [x, y] = centroid;
    if (Math.abs(x) > 180 || Math.abs(y) > 90) {
        try {
            const [lon, latValue] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
            x = lon;
            y = latValue;
        } catch (error) {
            return null;
        }
    }

    if (!isValidLatLng(y, x)) {
        return null;
    }

    return { lat: y, lng: x };
};
