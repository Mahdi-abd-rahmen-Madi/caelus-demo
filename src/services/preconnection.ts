/**
 * Advanced Preconnection service for optimizing external API connections
 * Features intelligent connection management, predictive preconnection, and adaptive health checks
 * Focuses specifically on Georisques API which is the only external service used by trackers
 */

// Import monitoring for performance tracking
import { preconnectionMonitor } from './preconnection-monitor';

const HEALTHCHECK_LATLON = '2.3522,48.8566';

export enum PreconnectionStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  FAILED = 'failed',
  PRECONNECTING = 'preconnecting',
  POOLING = 'pooling'
}

export interface PreconnectionConfig {
  url: string;
  crossOrigin?: boolean;
}

export interface ConnectionInfo {
  connection: Connection;
  created: number;
  lastUsed: number;
  isHealthy: boolean;
  responseTime: number;
}

export interface ConnectionQualityMetrics {
  bandwidth: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveBandwidth: number;
}

export interface UsagePattern {
  lastActivity: number;
  callCount: number;
  averageInterval: number;
  predictedNextCall: number;
}

// Connection class for managing persistent connections
class Connection {
  private url: string;
  private controller: AbortController | null = null;
  private isActive = false;
  private responseTime = 0;

  constructor(url: string) {
    this.url = url;
  }

  async establish(): Promise<boolean> {
    if (this.isActive) return true;

    this.controller = new AbortController();
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.url}/api/v1/resultats_rapport_risque?latlon=${HEALTHCHECK_LATLON}`, {
        method: 'HEAD',
        signal: this.controller.signal,
        mode: 'cors',
        keepalive: true
      });

      if (!response.ok) {
        this.responseTime = performance.now() - startTime;
        this.isActive = false;
        return false;
      }

      this.responseTime = performance.now() - startTime;
      this.isActive = true;
      return true;
    } catch (error) {
      this.responseTime = performance.now() - startTime;
      this.isActive = false;
      return false;
    }
  }

  isHealthy(): boolean {
    return this.isActive && this.responseTime < 10000; // 10s max response time
  }

  getResponseTime(): number {
    return this.responseTime;
  }

  close(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    this.isActive = false;
  }
}

// Connection Pool for reusing connections
class ConnectionPool {
  private connections: Map<string, ConnectionInfo> = new Map();
  private connectionTimeout = 300000; // 5 minutes

  async getConnection(url: string): Promise<Connection> {
    const existing = this.connections.get(url);
    
    if (existing && existing.isHealthy) {
      existing.lastUsed = Date.now();
      return existing.connection;
    }

    // Clean up old connections
    this.cleanup();

    // Create new connection
    const connection = new Connection(url);
    const isHealthy = await connection.establish();
    
    this.connections.set(url, {
      connection,
      created: Date.now(),
      lastUsed: Date.now(),
      isHealthy,
      responseTime: connection.getResponseTime()
    });

    return connection;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [url, info] of this.connections.entries()) {
      if (now - info.lastUsed > this.connectionTimeout || !info.isHealthy) {
        info.connection.close();
        this.connections.delete(url);
      }
    }
  }

  getMetrics(): { active: number; total: number; averageResponseTime: number } {
    const active = Array.from(this.connections.values()).filter(info => info.isHealthy).length;
    const total = this.connections.size;
    const responseTimes = Array.from(this.connections.values()).map(info => info.responseTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

    return { active, total, averageResponseTime };
  }
}

// Adaptive Health Checker
class AdaptiveHealthChecker {
  private networkQuality: 'fast' | 'medium' | 'slow' = 'medium';
  private consecutiveFailures = 0;
  private averageResponseTime = 500;
  private responseHistory: number[] = [];

  getAdaptiveTimeout(): number {
    switch (this.networkQuality) {
      case 'fast': return 2000;
      case 'medium': return 5000;
      case 'slow': return 10000;
      default: return 5000;
    }
  }

  updateNetworkQuality(responseTime: number, success: boolean): void {
    this.responseHistory.push(responseTime);
    if (this.responseHistory.length > 10) {
      this.responseHistory.shift();
    }

    if (success) {
      this.consecutiveFailures = 0;
      this.averageResponseTime = this.averageResponseTime * 0.7 + responseTime * 0.3;
    } else {
      this.consecutiveFailures++;
    }

    // Update network quality based on recent performance
    if (this.averageResponseTime < 300 && this.consecutiveFailures === 0) {
      this.networkQuality = 'fast';
    } else if (this.averageResponseTime < 1000 && this.consecutiveFailures < 2) {
      this.networkQuality = 'medium';
    } else {
      this.networkQuality = 'slow';
    }
  }

  getNetworkQuality(): 'fast' | 'medium' | 'slow' {
    return this.networkQuality;
  }
}

// Intelligent Preconnection Manager
class IntelligentPreconnectionManager {
  private usagePattern: UsagePattern = {
    lastActivity: Date.now(),
    callCount: 0,
    averageInterval: 30000, // 30 seconds default
    predictedNextCall: 0
  };
  
  private preconnectionTimer: number | null = null;

  recordApiCall(): void {
    const now = Date.now();
    const interval = now - this.usagePattern.lastActivity;
    
    this.usagePattern.callCount++;
    this.usagePattern.lastActivity = now;
    
    // Update average interval (exponential moving average)
    if (this.usagePattern.callCount > 1) {
      this.usagePattern.averageInterval = 
        this.usagePattern.averageInterval * 0.8 + interval * 0.2;
    }
    
    this.scheduleNextPreconnection();
  }

  private scheduleNextPreconnection(): void {
    if (this.preconnectionTimer) {
      clearTimeout(this.preconnectionTimer);
    }

    const nextCallPrediction = this.usagePattern.lastActivity + 
      this.usagePattern.averageInterval * 0.8; // 80% of average interval
    const delay = Math.max(0, nextCallPrediction - Date.now() - 1000); // 1s buffer

    this.preconnectionTimer = setTimeout(() => {
      // This will trigger the actual preconnection
      this.onPreconnectionScheduled();
    }, delay);
  }

  private onPreconnectionScheduled(): void {
    // Callback to main manager to perform preconnection
    this.usagePattern.predictedNextCall = Date.now();
  }

  shouldPreconnect(): boolean {
    const now = Date.now();
    const timeSinceLastCall = now - this.usagePattern.lastActivity;
    const timeUntilPrediction = this.usagePattern.predictedNextCall - now;
    
    return timeSinceLastCall < this.usagePattern.averageInterval * 2 && 
           Math.abs(timeUntilPrediction) < 5000; // Within 5s of prediction
  }

  getUsagePattern(): UsagePattern {
    return { ...this.usagePattern };
  }
}

// Connection Quality Monitor
class ConnectionQualityMonitor {
  private metrics: ConnectionQualityMetrics = {
    bandwidth: 0,
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    connectionType: 'unknown',
    effectiveBandwidth: 0
  };

  async measureConnectionQuality(): Promise<ConnectionQualityMetrics> {
    // Use Network Information API when available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.effectiveBandwidth = connection.downlink || 0;
      this.metrics.connectionType = this.mapConnectionType(connection.effectiveType);
    }

    // Measure actual performance with small test requests
    await this.measureLatencyAndJitter();
    
    return { ...this.metrics };
  }

  private mapConnectionType(type: string): 'wifi' | 'cellular' | 'ethernet' | 'unknown' {
    switch (type) {
      case '4g': case '3g': case '2g': return 'cellular';
      case 'wifi': return 'wifi';
      case 'ethernet': return 'ethernet';
      default: return 'unknown';
    }
  }

  private async measureLatencyAndJitter(): Promise<void> {
    const measurements: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch('https://httpbin.org/json', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        measurements.push(performance.now() - start);
      } catch (error) {
        // Ignore measurement errors
      }
    }

    if (measurements.length > 0) {
      this.metrics.latency = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      
      // Calculate jitter (standard deviation)
      const variance = measurements.reduce((sum, val) => {
        return sum + Math.pow(val - this.metrics.latency, 2);
      }, 0) / measurements.length;
      this.metrics.jitter = Math.sqrt(variance);
    }
  }

  getMetrics(): ConnectionQualityMetrics {
    return { ...this.metrics };
  }
}

class GeorisquesPreconnectionManager {
  private static instance: GeorisquesPreconnectionManager;
  private status: PreconnectionStatus = PreconnectionStatus.IDLE;
  private preconnectPromise: Promise<boolean> | null = null;
  
  private readonly GEORISQUES_CONFIG: PreconnectionConfig = {
    url: 'https://georisques.gouv.fr',
    crossOrigin: true
  };

  // Advanced components
  private connectionPool: ConnectionPool;
  private healthChecker: AdaptiveHealthChecker;
  private intelligentManager: IntelligentPreconnectionManager;
  private qualityMonitor: ConnectionQualityMonitor;

  static getInstance(): GeorisquesPreconnectionManager {
    if (!this.instance) {
      this.instance = new GeorisquesPreconnectionManager();
    }
    return this.instance;
  }

  private constructor() {
    // Initialize advanced components
    this.connectionPool = new ConnectionPool();
    this.healthChecker = new AdaptiveHealthChecker();
    this.intelligentManager = new IntelligentPreconnectionManager();
    this.qualityMonitor = new ConnectionQualityMonitor();
    
    // Initialize preconnection on service creation
    this.initializePreconnection();
    
    // Start background monitoring
    this.startBackgroundMonitoring();
  }

  /**
   * Initialize preconnection by injecting link tags into document head
   */
  private initializePreconnection(): void {
    if (typeof document === 'undefined') {
      return; // Skip during SSR
    }

    try {
      // Add preconnect link for optimal performance
      this.injectPreconnectLink();
      
      // Add dns-prefetch as fallback for older browsers
      this.injectDnsPrefetchLink();
      
      this.status = PreconnectionStatus.CONNECTED;
    } catch (error) {
      console.warn('Preconnection initialization failed:', error);
      this.status = PreconnectionStatus.FAILED;
    }
  }

  /**
   * Inject preconnect link tag for DNS, TCP, and TLS optimization
   */
  private injectPreconnectLink(): void {
    const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${this.GEORISQUES_CONFIG.url}"]`);
    if (existingPreconnect) {
      return; // Already exists
    }

    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = this.GEORISQUES_CONFIG.url;
    if (this.GEORISQUES_CONFIG.crossOrigin) {
      preconnectLink.setAttribute('crossorigin', 'anonymous');
    }
    
    document.head.appendChild(preconnectLink);
  }

  /**
   * Inject dns-prefetch link as fallback for older browsers
   */
  private injectDnsPrefetchLink(): void {
    const existingDnsPrefetch = document.querySelector(`link[rel="dns-prefetch"][href="${this.GEORISQUES_CONFIG.url}"]`);
    if (existingDnsPrefetch) {
      return; // Already exists
    }

    const dnsPrefetchLink = document.createElement('link');
    dnsPrefetchLink.rel = 'dns-prefetch';
    dnsPrefetchLink.href = this.GEORISQUES_CONFIG.url;
    
    document.head.appendChild(dnsPrefetchLink);
  }

  /**
   * Get current preconnection status
   */
  public getStatus(): PreconnectionStatus {
    return this.status;
  }

  /**
   * Check if preconnection is ready
   */
  public isReady(): boolean {
    return this.status === PreconnectionStatus.CONNECTED;
  }

  /**
   * Perform intelligent health check with adaptive timeout and connection pooling
   */
  public async performHealthCheck(): Promise<boolean> {
    if (this.preconnectPromise) {
      return this.preconnectPromise;
    }

    this.status = PreconnectionStatus.CONNECTING;
    this.preconnectPromise = this.doIntelligentHealthCheck();

    try {
      const isHealthy = await this.preconnectPromise;
      this.status = isHealthy ? PreconnectionStatus.CONNECTED : PreconnectionStatus.FAILED;
      return isHealthy;
    } catch (error) {
      this.status = PreconnectionStatus.FAILED;
      return false;
    } finally {
      this.preconnectPromise = null;
    }
  }

  /**
   * Perform intelligent health check with adaptive timeout and connection pooling
   */
  private async doIntelligentHealthCheck(): Promise<boolean> {
    const startTime = performance.now();
    const adaptiveTimeout = this.healthChecker.getAdaptiveTimeout();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), adaptiveTimeout);

    try {
      // Use connection pool for better performance
      await this.connectionPool.getConnection(this.GEORISQUES_CONFIG.url);
      
      // Use real API endpoint that will actually be called
      const response = await fetch(`${this.GEORISQUES_CONFIG.url}/api/v1/resultats_rapport_risque?latlon=${HEALTHCHECK_LATLON}`, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
        keepalive: true
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const connectionTime = performance.now() - startTime;
        this.healthChecker.updateNetworkQuality(connectionTime, false);
        console.warn(`Georisques intelligent health check failed with status ${response.status}`);
        return false;
      }

      clearTimeout(timeoutId);
      
      // Record connection establishment time
      const connectionTime = performance.now() - startTime;
      preconnectionMonitor.recordConnectionEstablishment(connectionTime);
      
      // Update health checker with success
      this.healthChecker.updateNetworkQuality(connectionTime, true);
      
      console.log(`Georisques intelligent preconnection established in ${connectionTime.toFixed(2)}ms (${this.healthChecker.getNetworkQuality()} network)`);
      
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      const connectionTime = performance.now() - startTime;
      
      // Update health checker with failure
      this.healthChecker.updateNetworkQuality(connectionTime, false);
      
      // Don't treat CORS errors as failures for health check - connection was established
      if (error instanceof TypeError && (error.message.includes('CORS') || error.message.includes('Failed to fetch'))) {
        preconnectionMonitor.recordConnectionEstablishment(connectionTime);
        this.healthChecker.updateNetworkQuality(connectionTime, true);
        console.log(`Georisques intelligent preconnection established (CORS expected) in ${connectionTime.toFixed(2)}ms`);
        return true;
      }
      
      console.warn('Georisques intelligent health check failed:', error);
      return false;
    }
  }


  /**
   * Start background monitoring for network conditions and user activity
   */
  private startBackgroundMonitoring(): void {
    // Monitor network quality every 30 seconds
    setInterval(async () => {
      await this.qualityMonitor.measureConnectionQuality();
    }, 30000);

    // Record API call patterns
    setInterval(() => {
      if (this.status === PreconnectionStatus.CONNECTED) {
        this.intelligentManager.recordApiCall();
      }
    }, 1000);
  }

  /**
   * Get advanced metrics and status
   */
  public getAdvancedMetrics() {
    return {
      status: this.status,
      networkQuality: this.healthChecker.getNetworkQuality(),
      connectionPool: this.connectionPool.getMetrics(),
      usagePattern: this.intelligentManager.getUsagePattern(),
      connectionQuality: this.qualityMonitor.getMetrics()
    };
  }

  /**
   * Reset preconnection status (useful for retry scenarios)
   */
  public reset(): void {
    this.status = PreconnectionStatus.IDLE;
    this.preconnectPromise = null;
  }

  /**
   * Record API call for usage pattern analysis
   */
  public recordApiCall(): void {
    this.intelligentManager.recordApiCall();
  }

  /**
   * Get connection from pool for immediate use
   */
  public async getConnection(): Promise<Connection> {
    return await this.connectionPool.getConnection(this.GEORISQUES_CONFIG.url);
  }

  /**
   * Check if intelligent preconnection should be triggered
   */
  public shouldPreconnectIntelligently(): boolean {
    return this.intelligentManager.shouldPreconnect();
  }
}


// Export singleton instance
export const georisquesPreconnection = GeorisquesPreconnectionManager.getInstance();

