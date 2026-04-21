interface LayerLoadMetrics {
  layerName: string;
  loadStartTime: number;
  loadEndTime?: number;
  renderTime?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface PerformanceReport {
  totalLoadTime: number;
  layerMetrics: LayerLoadMetrics[];
  wmsLayersLoaded: number;
  trackersLoaded: number;
  averageLoadTime: number;
}

class LayerPerformanceMonitor {
  private metrics: { [key: string]: LayerLoadMetrics } = {};
  private sessionStartTime: number = Date.now();

  // Start tracking a layer load
  startLayerLoad(layerName: string, priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'): void {
    const metric: LayerLoadMetrics = {
      layerName,
      loadStartTime: performance.now(),
      priority
    };
    
    this.metrics[layerName] = metric;
    
    // Log layer load start
    console.log('🚀 Loading ' + priority + ' priority layer: ' + layerName);
  }

  // End tracking a layer load
  endLayerLoad(layerName: string): void {
    const metric = this.metrics[layerName];
    if (!metric) {
      console.warn('⚠️ No start metric found for layer: ' + layerName);
      return;
    }

    metric.loadEndTime = performance.now();
    metric.renderTime = metric.loadEndTime - metric.loadStartTime;
    
    console.log('✅ Loaded ' + metric.priority + ' priority layer: ' + layerName + ' (' + (metric.renderTime ? metric.renderTime.toFixed(2) : '0') + 'ms)');
  }

  // Get current performance report
  getReport(): PerformanceReport {
    const layerMetrics: LayerLoadMetrics[] = [];
    for (const key in this.metrics) {
      if (this.metrics[key].loadEndTime !== undefined) {
        layerMetrics.push(this.metrics[key]);
      }
    }
    
    const wmsLayersLoaded = layerMetrics.filter(function(m) { 
      return m.layerName.indexOf('V1') !== -1 || 
             m.layerName.indexOf('Component') !== -1 || 
             m.layerName.indexOf('BRGM') !== -1;
    }).length;
    
    const trackersLoaded = layerMetrics.filter(function(m) { 
      return m.layerName.indexOf('Tracker') !== -1;
    }).length;

    let totalLoadTime = 0;
    for (let i = 0; i < layerMetrics.length; i++) {
      totalLoadTime += layerMetrics[i].renderTime || 0;
    }
    
    const averageLoadTime = layerMetrics.length > 0 ? totalLoadTime / layerMetrics.length : 0;

    return {
      totalLoadTime,
      layerMetrics,
      wmsLayersLoaded,
      trackersLoaded,
      averageLoadTime
    };
  }

  // Log performance summary
  logSummary(): void {
    const report = this.getReport();
    const sessionTime = Date.now() - this.sessionStartTime;
    
    console.group('📊 Layer Performance Summary');
    console.log('⏱️ Session time: ' + sessionTime.toFixed(2) + 'ms');
    console.log('🗺️ WMS layers loaded: ' + report.wmsLayersLoaded);
    console.log('📊 Trackers loaded: ' + report.trackersLoaded);
    console.log('⚡ Average load time: ' + report.averageLoadTime.toFixed(2) + 'ms');
    console.log('🎯 Total load time: ' + report.totalLoadTime.toFixed(2) + 'ms');
    
    // Performance analysis
    if (report.averageLoadTime < 100) {
      console.log('🟢 Performance: Excellent');
    } else if (report.averageLoadTime < 200) {
      console.log('🟡 Performance: Good');
    } else if (report.averageLoadTime < 500) {
      console.log('🟠 Performance: Fair');
    } else {
      console.log('🔴 Performance: Needs improvement');
    }
    
    console.groupEnd();
  }

  // Clear metrics for new session
  clearMetrics(): void {
    this.metrics = {};
    this.sessionStartTime = Date.now();
    console.log('🧹 Performance metrics cleared');
  }
}

// Singleton instance
export const layerPerformanceMonitor = new LayerPerformanceMonitor();

// Export for use in components
export type { LayerLoadMetrics, PerformanceReport };
