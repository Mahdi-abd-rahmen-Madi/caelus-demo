// Performance monitoring utility for map components
// Tracks key performance metrics and provides insights for optimization

import { useRef, useEffect } from 'react';

interface PerformanceMetrics {
  tileLoadTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  renderFrameRate: number;
  networkRequestCount: number;
}

interface PerformanceSnapshot {
  timestamp: number;
  metrics: PerformanceMetrics;
  deviceInfo: {
    isMobile: boolean;
    deviceMemory: number;
    connectionType: string;
  };
}

class MapPerformanceMonitor {
  private snapshots: PerformanceSnapshot[] = [];
  private frameCount = 0;
  private lastFrameTime = performance.now();
  private networkRequestCount = 0;
  private readonly maxSnapshots = 100; // Keep last 100 snapshots

  // Start monitoring performance metrics
  startMonitoring(): void {
    this.startFrameRateMonitoring();
    this.startNetworkMonitoring();
    this.startMemoryMonitoring();
  }

  // Record a performance snapshot
  recordSnapshot(metrics: Partial<PerformanceMetrics>): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      metrics: {
        tileLoadTime: metrics.tileLoadTime || 0,
        cacheHitRate: metrics.cacheHitRate || 0,
        memoryUsage: metrics.memoryUsage || 0,
        renderFrameRate: this.calculateFrameRate(),
        networkRequestCount: this.networkRequestCount
      },
      deviceInfo: this.getDeviceInfo()
    };

    this.snapshots.push(snapshot);

    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }
  }

  // Get current performance statistics
  getCurrentStats(): PerformanceMetrics & { trend: 'improving' | 'declining' | 'stable' } {
    if (this.snapshots.length < 2) {
      return {
        tileLoadTime: 0,
        cacheHitRate: 0,
        memoryUsage: 0,
        renderFrameRate: 60,
        networkRequestCount: 0,
        trend: 'stable'
      };
    }

    const recent = this.snapshots.slice(-10); // Last 10 snapshots
    const older = this.snapshots.slice(-20, -10); // Previous 10 snapshots

    const currentAvg = this.calculateAverage(recent);
    const previousAvg = older.length > 0 ? this.calculateAverage(older) : currentAvg;

    const trend = this.calculateTrend(currentAvg, previousAvg);

    return {
      ...currentAvg,
      trend
    };
  }

  // Get performance recommendations
  getRecommendations(): string[] {
    const stats = this.getCurrentStats();
    const recommendations: string[] = [];

    if (stats.renderFrameRate < 30) {
      recommendations.push('Consider reducing tile cache size or enabling viewport culling');
    }

    if (stats.cacheHitRate < 0.7) {
      recommendations.push('Cache hit rate is low. Consider increasing cache size or preloading tiles');
    }

    if (stats.memoryUsage > 200 * 1024 * 1024) { // 200MB
      recommendations.push('High memory usage detected. Consider reducing cache size');
    }

    if (stats.tileLoadTime > 2000) { // 2 seconds
      recommendations.push('Slow tile loading. Check network connection or consider lower resolution tiles');
    }

    if (stats.networkRequestCount > 50) {
      recommendations.push('High network request count. Consider request batching');
    }

    return recommendations;
  }

  // Export performance data for analysis
  exportData(): string {
    return JSON.stringify({
      snapshots: this.snapshots,
      summary: this.getCurrentStats(),
      recommendations: this.getRecommendations()
    }, null, 2);
  }

  // Private helper methods
  private startFrameRateMonitoring(): void {
    const measureFrameRate = () => {
      this.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.lastFrameTime >= 1000) {
        this.lastFrameTime = currentTime;
        this.frameCount = 0;
      }

      requestAnimationFrame(measureFrameRate);
    };

    requestAnimationFrame(measureFrameRate);
  }

  private startNetworkMonitoring(): void {
    // Monitor fetch requests for map tiles
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      this.networkRequestCount++;
      return originalFetch.apply(window, args);
    };
  }

  private startMemoryMonitoring(): void {
    // Monitor memory usage periodically
    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordSnapshot({
          memoryUsage: memory.usedJSHeapSize
        });
      }
    }, 5000); // Every 5 seconds
  }

  private calculateFrameRate(): number {
    return this.frameCount;
  }

  private calculateAverage(snapshots: PerformanceSnapshot[]): PerformanceMetrics {
    const sum = snapshots.reduce((acc, snapshot) => ({
      tileLoadTime: acc.tileLoadTime + snapshot.metrics.tileLoadTime,
      cacheHitRate: acc.cacheHitRate + snapshot.metrics.cacheHitRate,
      memoryUsage: acc.memoryUsage + snapshot.metrics.memoryUsage,
      renderFrameRate: acc.renderFrameRate + snapshot.metrics.renderFrameRate,
      networkRequestCount: acc.networkRequestCount + snapshot.metrics.networkRequestCount
    }), { tileLoadTime: 0, cacheHitRate: 0, memoryUsage: 0, renderFrameRate: 0, networkRequestCount: 0 });

    const count = snapshots.length;
    return {
      tileLoadTime: sum.tileLoadTime / count,
      cacheHitRate: sum.cacheHitRate / count,
      memoryUsage: sum.memoryUsage / count,
      renderFrameRate: sum.renderFrameRate / count,
      networkRequestCount: sum.networkRequestCount / count
    };
  }

  private calculateTrend(current: PerformanceMetrics, previous: PerformanceMetrics): 'improving' | 'declining' | 'stable' {
    const improvements = [
      current.tileLoadTime < previous.tileLoadTime * 0.9, // 10% improvement
      current.cacheHitRate > previous.cacheHitRate * 1.1,
      current.memoryUsage < previous.memoryUsage * 0.9,
      current.renderFrameRate > previous.renderFrameRate * 1.1
    ];

    const declines = [
      current.tileLoadTime > previous.tileLoadTime * 1.1,
      current.cacheHitRate < previous.cacheHitRate * 0.9,
      current.memoryUsage > previous.memoryUsage * 1.1,
      current.renderFrameRate < previous.renderFrameRate * 0.9
    ];

    const improvementCount = improvements.filter(Boolean).length;
    const declineCount = declines.filter(Boolean).length;

    if (improvementCount > declineCount) return 'improving';
    if (declineCount > improvementCount) return 'declining';
    return 'stable';
  }

  private getDeviceInfo() {
    const connection = (navigator as any).connection;
    return {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      deviceMemory: (navigator as any).deviceMemory || 4,
      connectionType: connection?.effectiveType || 'unknown'
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new MapPerformanceMonitor();

// Performance monitoring hooks for React components
export const usePerformanceMonitoring = () => {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;

      // Record render time for component
      performanceMonitor.recordSnapshot({
        tileLoadTime: renderTime
      });
    };
  });
};

export default performanceMonitor;
