// WMS Preconnection Utility
// Optimizes WMS layer loading performance through preconnection strategies

export interface WMSServiceConfig {
  name: string;
  baseUrl: string;
  domains: string[];
  requiresCors: boolean;
}

// WMS service configurations for preconnection
export const WMS_SERVICES: WMSServiceConfig[] = [
  {
    name: 'canalisations',
    baseUrl: 'https://mapsref.brgm.fr/wxs/georisques/risques',
    domains: ['mapsref.brgm.fr'],
    requiresCors: true
  },
  {
    name: 'brgm-mapsref',
    baseUrl: 'https://mapsref.brgm.fr/wxs/georisques/risques',
    domains: ['mapsref.brgm.fr'],
    requiresCors: true
  },
  {
    name: 'brgm-geoservices',
    baseUrl: 'http://geoservices.brgm.fr/risques',
    domains: ['geoservices.brgm.fr'],
    requiresCors: true
  },
  {
    name: 'custom-brgm',
    baseUrl: 'https://mapsref.brgm.fr/wxs/georisques/rapport_risques',
    domains: ['mapsref.brgm.fr'],
    requiresCors: true
  },
  {
    name: 'enedis-v2',
    baseUrl: 'https://geobretagne.fr/geoserver/enedis/wms',
    domains: ['geobretagne.fr'],
    requiresCors: true
  },
  {
    name: 'plu',
    baseUrl: '/api/geodata/plu',
    domains: [], // Local service, no external domains
    requiresCors: false
  }
];

// Vector tile service configurations for preconnection
export const VECTOR_TILE_SERVICES: WMSServiceConfig[] = [
  {
    name: 'pci',
    baseUrl: 'https://data.geopf.fr/tms/1.0.0/PCI',
    domains: ['data.geopf.fr'],
    requiresCors: true
  },
  {
    name: 'bdtopo', 
    baseUrl: 'https://data.geopf.fr/tms/1.0.0/BDTOPO',
    domains: ['data.geopf.fr'],
    requiresCors: true
  }
];

class WMSPreconnectionManager {
  private preconnectedServices = new Set<string>();
  private prewarmedSources = new Set<string>();

  /**
   * Add DNS prefetch and preconnect links to document head
   */
  addPreconnectionLinks(): void {
    const head = document.head;
    
    // Process WMS services
    WMS_SERVICES.forEach(service => {
      if (service.domains.length === 0) return;

      service.domains.forEach(domain => {
        // Add DNS prefetch link
        if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
          const dnsPrefetch = document.createElement('link');
          dnsPrefetch.rel = 'dns-prefetch';
          dnsPrefetch.href = `//${domain}`;
          head.appendChild(dnsPrefetch);
        }

        // Add preconnect link
        if (!document.querySelector(`link[rel="preconnect"][href="https://${domain}"]`)) {
          const preconnect = document.createElement('link');
          preconnect.rel = 'preconnect';
          preconnect.href = `https://${domain}`;
          if (service.requiresCors) {
            preconnect.setAttribute('crossorigin', 'anonymous');
          }
          head.appendChild(preconnect);
        }
      });
    });

    // Process Vector tile services
    VECTOR_TILE_SERVICES.forEach(service => {
      if (service.domains.length === 0) return;

      service.domains.forEach(domain => {
        // Add DNS prefetch link
        if (!document.querySelector(`link[rel="dns-prefetch"][href="//${domain}"]`)) {
          const dnsPrefetch = document.createElement('link');
          dnsPrefetch.rel = 'dns-prefetch';
          dnsPrefetch.href = `//${domain}`;
          head.appendChild(dnsPrefetch);
        }

        // Add preconnect link
        if (!document.querySelector(`link[rel="preconnect"][href="https://${domain}"]`)) {
          const preconnect = document.createElement('link');
          preconnect.rel = 'preconnect';
          preconnect.href = `https://${domain}`;
          if (service.requiresCors) {
            preconnect.setAttribute('crossorigin', 'anonymous');
          }
          head.appendChild(preconnect);
        }
      });
    });
  }

  /**
   * Preconnect to a specific WMS service
   */
  async preconnectService(serviceName: string): Promise<void> {
    const service = WMS_SERVICES.find(s => s.name === serviceName);
    if (!service || this.preconnectedServices.has(serviceName)) return;

    try {
      // For external services, make a lightweight HEAD request to establish connection
      if (service.requiresCors && service.baseUrl.startsWith('http')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          await fetch(service.baseUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          });
        } catch (error) {
          // Expected for CORS requests, connection is still established
        } finally {
          clearTimeout(timeoutId);
        }
      }

      this.preconnectedServices.add(serviceName);
      console.log(`WMS Preconnection: Connected to ${serviceName}`);
    } catch (error) {
      console.warn(`WMS Preconnection: Failed to connect to ${serviceName}:`, error);
    }
  }

  /**
   * Preconnect to a specific vector tile service
   */
  async preconnectVectorService(serviceName: string): Promise<void> {
    const service = VECTOR_TILE_SERVICES.find(s => s.name === serviceName);
    if (!service || this.preconnectedServices.has(serviceName)) return;

    try {
      // Vector services are prewarmed via DNS-prefetch/preconnect links.
      // Avoid explicit HEAD probes on collection roots because providers may return 400.

      this.preconnectedServices.add(serviceName);
      console.log(`Vector Tile Preconnection: Connected to ${serviceName}`);
    } catch (error) {
      console.warn(`Vector Tile Preconnection: Failed to connect to ${serviceName}:`, error);
    }
  }

  /**
   * Preconnect to all WMS services
   */
  async preconnectAllServices(): Promise<void> {
    const promises = WMS_SERVICES
      .filter(service => service.requiresCors)
      .map(service => this.preconnectService(service.name));

    await Promise.allSettled(promises);
  }

  /**
   * Preconnect to all vector tile services
   */
  async preconnectAllVectorServices(): Promise<void> {
    const promises = VECTOR_TILE_SERVICES
      .filter(service => service.requiresCors)
      .map(service => this.preconnectVectorService(service.name));

    await Promise.allSettled(promises);
  }

  /**
   * Preconnect to all services (WMS + Vector tiles)
   */
  async preconnectAllServicesCombined(): Promise<void> {
    const wmsPromises = WMS_SERVICES
      .filter(service => service.requiresCors)
      .map(service => this.preconnectService(service.name));
    
    const vectorPromises = VECTOR_TILE_SERVICES
      .filter(service => service.requiresCors)
      .map(service => this.preconnectVectorService(service.name));

    await Promise.allSettled([...wmsPromises, ...vectorPromises]);
  }

  /**
   * Mark a source as prewarmed
   */
  markSourceAsPrewarmed(sourceId: string): void {
    this.prewarmedSources.add(sourceId);
  }

  /**
   * Check if a source is prewarmed
   */
  isSourcePrewarmed(sourceId: string): boolean {
    return this.prewarmedSources.has(sourceId);
  }

  /**
   * Initialize preconnection during app startup
   */
  initialize(): void {
    // Add preconnection links immediately
    this.addPreconnectionLinks();

    // Preconnect to services after a short delay to avoid blocking page load
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preconnectAllServices();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        this.preconnectAllServices();
      }, 1000);
    }
  }

  /**
   * Get preconnection statistics
   */
  getStats(): { preconnectedServices: string[]; prewarmedSources: string[] } {
    return {
      preconnectedServices: Array.from(this.preconnectedServices),
      prewarmedSources: Array.from(this.prewarmedSources)
    };
  }
}

// Singleton instance
export const wmsPreconnectionManager = new WMSPreconnectionManager();

/**
 * Hook for WMS preconnection in React components
 */
export const useWMSPreconnection = () => {
  const initializePreconnection = () => {
    wmsPreconnectionManager.initialize();
  };

  const preconnectService = async (serviceName: string) => {
    return wmsPreconnectionManager.preconnectService(serviceName);
  };

  const preconnectVectorService = async (serviceName: string) => {
    return wmsPreconnectionManager.preconnectVectorService(serviceName);
  };

  const preconnectAllServices = async () => {
    return wmsPreconnectionManager.preconnectAllServices();
  };

  const preconnectAllVectorServices = async () => {
    return wmsPreconnectionManager.preconnectAllVectorServices();
  };

  const preconnectAllServicesCombined = async () => {
    return wmsPreconnectionManager.preconnectAllServicesCombined();
  };

  const markSourceAsPrewarmed = (sourceId: string) => {
    wmsPreconnectionManager.markSourceAsPrewarmed(sourceId);
  };

  const isSourcePrewarmed = (sourceId: string) => {
    return wmsPreconnectionManager.isSourcePrewarmed(sourceId);
  };

  return {
    initializePreconnection,
    preconnectService,
    preconnectVectorService,
    preconnectAllServices,
    preconnectAllVectorServices,
    preconnectAllServicesCombined,
    markSourceAsPrewarmed,
    isSourcePrewarmed,
    stats: wmsPreconnectionManager.getStats()
  };
};

export default wmsPreconnectionManager;
