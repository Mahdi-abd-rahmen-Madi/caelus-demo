
// Coordinate-based cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

import { getDemoTrackerData, isAvignonArea } from './demoTrackerData';

class MapDataCoordinator {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE = 'http://localhost:8000/api/geodata';

  // Generate cache key from coordinates
  private getCoordinateKey(lng: number, lat: number): string {
    return `${lng.toFixed(4)},${lat.toFixed(4)}`;
  }

  // Check if cache entry is valid
  private isCacheEntryValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  // Generic method to fetch and cache data
  private async fetchWithCache<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheEntryValid(cached)) {
      return cached.data;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(cacheKey);
    if (pending) {
      return pending;
    }

    // Make new request
    const promise = fetchFn().then(data => {
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl
      });
      this.pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(cacheKey);
      throw error;
    });

    this.pendingRequests.set(cacheKey, promise);
    return promise;
  }

  // Batch fetch all tracker data for given coordinates
  async fetchAllTrackerData(lng: number, lat: number): Promise<{
    inondation: any;
    heatwave: any;
    seismic: any;
    thunder: any;
  }> {
    const coordinateKey = this.getCoordinateKey(lng, lat);

    // Create batched request to avoid race conditions
    const batchKey = `batch_${coordinateKey}`;
    
    return this.fetchWithCache(batchKey, async () => {
      // Use demo data for Avignon area or when backend is not available
      if (isAvignonArea(lng, lat) || import.meta.env.MODE === 'demo') {
        console.log('Using demo tracker data for coordinates:', lng, lat);
        return getDemoTrackerData(lng, lat);
      }

      // Execute all requests in parallel
      const [
        inondationPromise,
        heatwavePromise,
        seismicPromise,
        thunderPromise
      ] = await Promise.allSettled([
        this.fetchInondationData(lng, lat, false), // Skip individual cache
        this.fetchHeatwaveData(lng, lat, false), // Skip individual cache
        this.fetchSeismicData(lng, lat, false), // Skip individual cache
        this.fetchThunderData(lng, lat, false) // Skip individual cache
      ]);

      const result = {
        inondation: inondationPromise.status === 'fulfilled' ? inondationPromise.value : null,
        heatwave: heatwavePromise.status === 'fulfilled' ? heatwavePromise.value : null,
        seismic: seismicPromise.status === 'fulfilled' ? seismicPromise.value : null,
        thunder: thunderPromise.status === 'fulfilled' ? thunderPromise.value : null
      };
      
      // Log any failed requests for debugging
      if (inondationPromise.status === 'rejected') {
        console.error('Inondation API failed:', inondationPromise.reason);
      }
      if (heatwavePromise.status === 'rejected') {
        console.error('Heatwave API failed:', heatwavePromise.reason);
      }
      if (seismicPromise.status === 'rejected') {
        console.error('Seismic API failed:', seismicPromise.reason);
      }
      if (thunderPromise.status === 'rejected') {
        console.error('Thunder API failed:', thunderPromise.reason);
      }
      
      console.log('MapDataCoordinator: Batch result:', result);
      return result;
    }, this.DEFAULT_TTL);
  }

  // Individual tracker methods (for backward compatibility)
  async fetchInondationData(lng: number, lat: number, useIndividualCache = true): Promise<any> {
    const cacheKey = `inondation_${this.getCoordinateKey(lng, lat)}`;
    const apiUrl = `${this.API_BASE}/georisques/tri-zonage/?rayon=5000&latlon=${lng}%2C${lat}`;
    
    if (useIndividualCache) {
      return this.fetchWithCache(cacheKey, async () => {
        // Try API first, fallback to demo data
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          // Transform API response to match expected format
          console.log('Inondation API raw response:', data);
        if (data.results > 0 && data.data && data.data.length > 0) {
          const inondationData = data.data[0];
          console.log('Inondation API parsed data:', inondationData);
          return {
            risk_level: this.getRiskLevelFromScenario(inondationData.scenario?.code || ''),
            risk_color: this.getRiskColorFromScenario(inondationData.scenario?.code || ''),
            description: inondationData.scenario?.libelle || 'Zone inconnue',
            coordinates: { lng, lat },
            found: true,
            data_source: 'tri_inondation_api',
            scenario_code: inondationData.scenario?.code,
            scenario_label: inondationData.scenario?.libelle
          };
        }
        console.log('Inondation API: No data found, returning unknown zone');
        return {
          risk_level: 'unknown',
          risk_color: '#94a3b8',
          description: 'Hors zone d\'inondation définie',
          coordinates: { lng, lat },
          found: false,
          data_source: 'tri_inondation_api'
        };
        } catch (error) {
          console.log('Inondation API failed, using demo data:', error);
          // Import here to avoid circular dependency
          const { demoInondationData } = await import('./demoTrackerData');
          return demoInondationData(lng, lat);
        }
      });
    }

    // Direct fetch for batched requests
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // Transform API response to match expected format
    if (data.results > 0 && data.data && data.data.length > 0) {
      const inondationData = data.data[0];
      return {
        risk_level: this.getRiskLevelFromScenario(inondationData.scenario?.code || ''),
        risk_color: this.getRiskColorFromScenario(inondationData.scenario?.code || ''),
        description: inondationData.scenario?.libelle || 'Zone inconnue',
        coordinates: { lng, lat },
        found: true,
        data_source: 'tri_inondation_api',
        scenario_code: inondationData.scenario?.code,
        scenario_label: inondationData.scenario?.libelle
      };
    }
    return {
      risk_level: 'unknown',
      risk_color: '#94a3b8',
      description: 'Hors zone d\'inondation définie',
      coordinates: { lng, lat },
      found: false,
      data_source: 'tri_inondation_api'
    };
  }

  // Helper methods for inondation risk mapping
  private getRiskLevelFromScenario(scenarioCode: string): string {
    const riskMap: Record<string, string> = {
      '1': 'very_low',
      '2': 'low', 
      '3': 'medium',
      '4': 'high',
      '5': 'very_high',
      // Handle the actual scenario codes returned by the API
      '04Fai': 'low',
      '04Fde': 'medium',
      '04Fmo': 'high',
      '04Ffo': 'very_high'
    };
    console.log(`Inondation: Mapping scenario code ${scenarioCode} to risk level ${riskMap[scenarioCode] || 'unknown'}`);
    return riskMap[scenarioCode] || 'unknown';
  }

  private getRiskColorFromScenario(scenarioCode: string): string {
    const colorMap: Record<string, string> = {
      '1': '#10b981',
      '2': '#84cc16',
      '3': '#eab308', 
      '4': '#f97316',
      '5': '#ef4444',
      // Handle the actual scenario codes returned by the API
      '04Fai': '#84cc16',
      '04Fde': '#eab308',
      '04Fmo': '#f97316',
      '04Ffo': '#ef4444'
    };
    return colorMap[scenarioCode] || '#94a3b8';
  }

  async fetchHeatwaveData(lng: number, lat: number, useIndividualCache = true): Promise<any> {
    const cacheKey = `heatwave_${this.getCoordinateKey(lng, lat)}`;
    
    if (useIndividualCache) {
      return this.fetchWithCache(cacheKey, async () => {
        try {
          const apiUrl = `${this.API_BASE}/heatwave/risk/${lng}/${lat}/`;
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        } catch (error) {
          console.log('Heatwave API failed, using demo data:', error);
          const { demoHeatwaveData } = await import('./demoTrackerData');
          return demoHeatwaveData(lng, lat);
        }
      });
    }

    // Direct fetch for batched requests
    const apiUrl = `${this.API_BASE}/heatwave/risk/${lng}/${lat}/`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async fetchSeismicData(lng: number, lat: number, useIndividualCache = true): Promise<any> {
    const cacheKey = `seismic_${this.getCoordinateKey(lng, lat)}`;
    const apiUrl = `${this.API_BASE}/georisques/seismic-zones/?rayon=5000&latlon=${lng}%2C${lat}&page=1&page_size=10`;
    
    if (useIndividualCache) {
      return this.fetchWithCache(cacheKey, async () => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        const data = await response.json();
        // Transform API response to match expected format
        console.log('Seismic API raw response:', data);
        if (data.data && data.data.length > 0) {
          const seismicData = data.data[0];
          const codeZone = seismicData.code_zone;
          console.log('Seismic API parsed data:', seismicData);
          return {
            seismic_zone: codeZone,
            zone_label: `Zone ${codeZone}`,
            risk_level: this.getRiskLevelFromZone(codeZone),
            risk_color: this.getZoneColor(codeZone),
            description: this.getZoneDescription(codeZone),
            acceleration_coefficient: null,
            coordinates: { lng, lat },
            found: true,
            data_source: 'seismic_zones_api'
          };
        }
        console.log('Seismic API: No data found, returning unknown zone');
        return {
          seismic_zone: null,
          zone_label: "Hors zone",
          risk_level: "unknown",
          risk_color: "#94a3b8",
          description: "Coordonnées hors des zones sismiques définies",
          acceleration_coefficient: null,
          coordinates: { lng, lat },
          found: false,
          data_source: 'seismic_zones_api'
        };
        } catch (error) {
          console.log('Seismic API failed, using demo data:', error);
          const { demoSeismicData } = await import('./demoTrackerData');
          return demoSeismicData(lng, lat);
        }
      });
    }

    // Direct fetch for batched requests
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    // Transform API response to match expected format
    if (data.data && data.data.length > 0) {
      const seismicData = data.data[0];
      const codeZone = seismicData.code_zone;
      return {
        seismic_zone: codeZone,
        zone_label: `Zone ${codeZone}`,
        risk_level: this.getRiskLevelFromZone(codeZone),
        risk_color: this.getZoneColor(codeZone),
        description: this.getZoneDescription(codeZone),
        acceleration_coefficient: null,
        coordinates: { lng, lat },
        found: true,
        data_source: 'seismic_zones_api'
      };
    }
    return {
      seismic_zone: null,
      zone_label: "Hors zone",
      risk_level: "unknown",
      risk_color: "#94a3b8",
      description: "Coordonnées hors des zones sismiques définies",
      acceleration_coefficient: null,
      coordinates: { lng, lat },
      found: false,
      data_source: 'seismic_zones_api'
    };
  }

  // Helper methods for seismic zone mapping
  private getRiskLevelFromZone(zone: string): string {
    const riskMap: Record<string, string> = {
      '1': 'very_low',
      '2': 'low',
      '3': 'medium', 
      '4': 'high',
      '5': 'very_high'
    };
    return riskMap[zone] || 'unknown';
  }

  private getZoneColor(zone: string): string {
    const colorMap: Record<string, string> = {
      '1': '#10b981',
      '2': '#84cc16',
      '3': '#eab308',
      '4': '#f97316', 
      '5': '#ef4444'
    };
    return colorMap[zone] || '#94a3b8';
  }

  private getZoneDescription(zone: string): string {
    const descMap: Record<string, string> = {
      '1': 'Sismicité très faible',
      '2': 'Sismicité faible',
      '3': 'Sismicité modérée',
      '4': 'Sismicité forte',
      '5': 'Sismicité très forte'
    };
    return descMap[zone] || 'Zone inconnue';
  }

  async fetchThunderData(lng: number, lat: number, useIndividualCache = true): Promise<any> {
    const cacheKey = `thunder_${this.getCoordinateKey(lng, lat)}`;
    
    if (useIndividualCache) {
      return this.fetchWithCache(cacheKey, async () => {
        try {
          const apiUrl = `${this.API_BASE}/thunder/risk/${lng}/${lat}/`;
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          return response.json();
        } catch (error) {
          console.log('Thunder API failed, using demo data:', error);
          const { demoThunderData } = await import('./demoTrackerData');
          return demoThunderData(lng, lat);
        }
      });
    }

    // Direct fetch for batched requests
    const apiUrl = `${this.API_BASE}/thunder/risk/${lng}/${lat}/`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Clear cache for testing or refresh scenarios
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Get cache statistics for monitoring
  getCacheStats(): {
    size: number;
    pendingRequests: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cleanup expired entries
  cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
export const mapDataCoordinator = new MapDataCoordinator();

// Export types for use in components
export type { CacheEntry };
