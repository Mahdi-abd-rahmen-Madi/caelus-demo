/**
 * Preconnection monitoring utility for tracking performance metrics
 */

export interface PreconnectionMetrics {
  firstApiCallLatency: number | null;
  connectionEstablishmentTime: number | null;
  totalRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errors: number;
  totalDownloads: number;
  successfulDownloads: number;
  downloadSuccessRate: number;
  // Advanced metrics
  connectionReuseCount: number;
  predictivePreconnectionHits: number;
  networkQualityScore: 'fast' | 'medium' | 'slow';
  userIntentTriggers: number;
  adaptiveTimeouts: number;
}

export interface PredictiveMetrics {
  predictedResponseTime: number;
  confidence: number;
  networkCondition: 'excellent' | 'good' | 'fair' | 'poor';
  recommendedStrategy: 'aggressive' | 'balanced' | 'conservative';
}

export interface AdvancedPerformanceMetrics {
  connectionQuality: {
    bandwidth: number;
    latency: number;
    jitter: number;
    packetLoss: number;
    connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  };
  usagePattern: {
    averageInterval: number;
    callFrequency: number;
    peakHours: number[];
    predictability: number;
  };
  optimization: {
    preconnectionEfficiency: number;
    connectionReuseRate: number;
    adaptiveImprovement: number;
    userIntentAccuracy: number;
  };
}

export interface PerformanceImprovement {
  latencyReduction: number | null;
  connectionSpeedup: string;
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  gradeReasoning: string;
}

class PreconnectionMonitor {
  private static instance: PreconnectionMonitor;
  private metrics: PreconnectionMetrics = {
    firstApiCallLatency: null,
    connectionEstablishmentTime: null,
    totalRequests: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    errors: 0,
    totalDownloads: 0,
    successfulDownloads: 0,
    downloadSuccessRate: 0,
    // Advanced metrics
    connectionReuseCount: 0,
    predictivePreconnectionHits: 0,
    networkQualityScore: 'medium',
    userIntentTriggers: 0,
    adaptiveTimeouts: 0
  };
  
  private cacheHits = 0;
  private startTime: number | null = null;
  private responseTimeHistory: number[] = [];
  private usagePatternData: { timestamp: number; interval: number }[] = [];

  static getInstance(): PreconnectionMonitor {
    if (!this.instance) {
      this.instance = new PreconnectionMonitor();
    }
    return this.instance;
  }

  private constructor() {
    this.startTime = performance.now();
  }

  /**
   * Record the start of a Georisques API call
   */
  public startApiCall(): void {
    if (this.metrics.totalRequests === 0) {
      // First API call - record start time for latency measurement
      this.startTime = performance.now();
    }
    this.metrics.totalRequests++;
  }

  /**
   * Record the completion of a Georisques API call
   */
  public endApiCall(success: boolean, fromCache: boolean = false, externalLatency?: number): void {
    if (!success) {
      this.metrics.errors++;
      return;
    }

    if (fromCache) {
      this.cacheHits++;
    } else if (this.startTime && this.metrics.firstApiCallLatency === null) {
      // Use provided external latency or calculate from start time
      const latency = externalLatency || (performance.now() - this.startTime);
      this.metrics.firstApiCallLatency = latency;
      console.log(`First Georisques API call latency: ${latency.toFixed(2)}ms${externalLatency ? ' (measured externally)' : ' (measured internally)'}`);
    }

    // Calculate cache hit rate
    this.metrics.cacheHitRate = this.cacheHits / this.metrics.totalRequests;
  }

  /**
   * Record a PDF download attempt
   */
  public recordDownloadAttempt(): void {
    this.metrics.totalDownloads++;
  }

  /**
   * Record a PDF download completion
   */
  public recordDownloadSuccess(): void {
    this.metrics.successfulDownloads++;
    this.updateDownloadSuccessRate();
  }

  /**
   * Record a PDF download failure
   */
  public recordDownloadFailure(): void {
    this.updateDownloadSuccessRate();
  }

  /**
   * Update download success rate
   */
  private updateDownloadSuccessRate(): void {
    if (this.metrics.totalDownloads > 0) {
      this.metrics.downloadSuccessRate = this.metrics.successfulDownloads / this.metrics.totalDownloads;
    }
  }

  /**
   * Record connection establishment time
   */
  public recordConnectionEstablishment(time: number): void {
    if (this.metrics.connectionEstablishmentTime === null) {
      this.metrics.connectionEstablishmentTime = time;
      console.log(`Georisques connection established in: ${time.toFixed(2)}ms`);
    }
    
    // Track response time history for predictive analytics
    this.responseTimeHistory.push(time);
    if (this.responseTimeHistory.length > 20) {
      this.responseTimeHistory.shift();
    }
  }

  /**
   * Record connection reuse for pooling metrics
   */
  public recordConnectionReuse(): void {
    this.metrics.connectionReuseCount++;
  }

  /**
   * Record predictive preconnection success
   */
  public recordPredictivePreconnection(): void {
    this.metrics.predictivePreconnectionHits++;
  }

  /**
   * Record user intent trigger
   */
  public recordUserIntentTrigger(): void {
    this.metrics.userIntentTriggers++;
  }

  /**
   * Record adaptive timeout usage
   */
  public recordAdaptiveTimeout(): void {
    this.metrics.adaptiveTimeouts++;
  }

  /**
   * Update network quality score
   */
  public updateNetworkQualityScore(quality: 'fast' | 'medium' | 'slow'): void {
    this.metrics.networkQualityScore = quality;
  }

  /**
   * Record usage pattern data
   */
  public recordUsagePattern(interval: number): void {
    this.usagePatternData.push({
      timestamp: Date.now(),
      interval
    });
    
    // Keep only last 50 entries
    if (this.usagePatternData.length > 50) {
      this.usagePatternData.shift();
    }
  }

  /**
   * Get predictive metrics
   */
  public getPredictiveMetrics(): PredictiveMetrics {
    const avgResponseTime = this.responseTimeHistory.length > 0
      ? this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length
      : 500;
    
    const confidence = Math.min(0.95, this.responseTimeHistory.length / 20);
    
    let networkCondition: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgResponseTime < 200) networkCondition = 'excellent';
    else if (avgResponseTime < 500) networkCondition = 'good';
    else if (avgResponseTime < 1000) networkCondition = 'fair';
    else networkCondition = 'poor';
    
    let recommendedStrategy: 'aggressive' | 'balanced' | 'conservative';
    if (networkCondition === 'excellent' && confidence > 0.8) recommendedStrategy = 'aggressive';
    else if (networkCondition === 'poor' || confidence < 0.5) recommendedStrategy = 'conservative';
    else recommendedStrategy = 'balanced';
    
    return {
      predictedResponseTime: avgResponseTime,
      confidence,
      networkCondition,
      recommendedStrategy
    };
  }

  /**
   * Get advanced performance metrics
   */
  public getAdvancedMetrics(): AdvancedPerformanceMetrics {
    const avgInterval = this.usagePatternData.length > 1
      ? this.usagePatternData.slice(-10).reduce((sum, data, i, arr) => {
          if (i === 0) return sum;
          return sum + (data.timestamp - arr[i-1].timestamp);
        }, 0) / Math.min(10, this.usagePatternData.length - 1)
      : 30000;
    
    const callFrequency = this.usagePatternData.length > 0
      ? 60000 / avgInterval // calls per minute
      : 0;
    
    return {
      connectionQuality: {
        bandwidth: 0, // Would be populated by Network Information API
        latency: this.responseTimeHistory.length > 0 ? this.responseTimeHistory[this.responseTimeHistory.length - 1] : 0,
        jitter: this.calculateJitter(),
        packetLoss: 0, // Would require more complex measurement
        connectionType: 'unknown'
      },
      usagePattern: {
        averageInterval: avgInterval,
        callFrequency,
        peakHours: [], // Would require time-based analysis
        predictability: this.calculatePredictability()
      },
      optimization: {
        preconnectionEfficiency: this.calculatePreconnectionEfficiency(),
        connectionReuseRate: this.calculateConnectionReuseRate(),
        adaptiveImprovement: this.calculateAdaptiveImprovement(),
        userIntentAccuracy: this.calculateUserIntentAccuracy()
      }
    };
  }

  private calculateJitter(): number {
    if (this.responseTimeHistory.length < 2) return 0;
    
    const avg = this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length;
    const variance = this.responseTimeHistory.reduce((sum, time) => {
      return sum + Math.pow(time - avg, 2);
    }, 0) / this.responseTimeHistory.length;
    
    return Math.sqrt(variance);
  }

  private calculatePredictability(): number {
    if (this.usagePatternData.length < 3) return 0;
    
    const intervals = this.usagePatternData.slice(-10).map((data, i, arr) => {
      if (i === 0) return 0;
      return data.timestamp - arr[i-1].timestamp;
    }).filter(interval => interval > 0);
    
    if (intervals.length < 2) return 0;
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Lower variance = higher predictability
    const maxVariance = Math.pow(avgInterval, 2);
    return Math.max(0, 1 - (variance / maxVariance));
  }

  private calculatePreconnectionEfficiency(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.predictivePreconnectionHits / this.metrics.totalRequests;
  }

  private calculateConnectionReuseRate(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.connectionReuseCount / this.metrics.totalRequests;
  }

  private calculateAdaptiveImprovement(): number {
    if (this.metrics.totalRequests === 0) return 0;
    return this.metrics.adaptiveTimeouts / this.metrics.totalRequests;
  }

  private calculateUserIntentAccuracy(): number {
    if (this.metrics.userIntentTriggers === 0) return 0;
    return this.metrics.predictivePreconnectionHits / this.metrics.userIntentTriggers;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): PreconnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Calculate advanced performance improvement with intelligent metrics
   */
  public getPerformanceImprovement(): PerformanceImprovement {
    const { 
      firstApiCallLatency, 
      connectionEstablishmentTime, 
      cacheHitRate, 
      totalRequests,
      connectionReuseCount,
      predictivePreconnectionHits,
      networkQualityScore
    } = this.metrics;

    // Estimate typical cold connection time (DNS + TCP + SSL)
    const typicalColdConnectionTime = 500; // 500ms typical for cold connection
    
    let latencyReduction: number | null = null;
    if (firstApiCallLatency && connectionEstablishmentTime) {
      latencyReduction = Math.max(0, typicalColdConnectionTime - firstApiCallLatency);
    }

    // Calculate speedup factor with connection reuse bonus
    let speedupFactor = 1;
    if (connectionEstablishmentTime && connectionEstablishmentTime > 0) {
      speedupFactor = typicalColdConnectionTime / connectionEstablishmentTime;
      // Add bonus for connection reuse
      if (totalRequests > 0) {
        const reuseBonus = connectionReuseCount / totalRequests * 0.5;
        speedupFactor += reuseBonus;
      }
    }
    const connectionSpeedup = `${speedupFactor.toFixed(1)}x`;

    // Calculate overall grade with advanced algorithm
    let overallGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    let gradeReasoning = '';

    // Advanced scoring system with multiple factors
    let score = 0;
    
    // Latency reduction scoring (0-30 points)
    if (latencyReduction && latencyReduction > 300) score += 30;
    else if (latencyReduction && latencyReduction > 200) score += 25;
    else if (latencyReduction && latencyReduction > 100) score += 20;
    else if (latencyReduction && latencyReduction > 50) score += 10;
    
    // Speedup factor scoring (0-25 points)
    if (speedupFactor >= 3.0) score += 25;
    else if (speedupFactor >= 2.0) score += 20;
    else if (speedupFactor >= 1.5) score += 15;
    else if (speedupFactor >= 1.2) score += 10;
    
    // Connection reuse scoring (0-20 points)
    if (totalRequests > 0) {
      const reuseRate = connectionReuseCount / totalRequests;
      if (reuseRate > 0.8) score += 20;
      else if (reuseRate > 0.6) score += 15;
      else if (reuseRate > 0.4) score += 10;
      else if (reuseRate > 0.2) score += 5;
    }
    
    // Predictive preconnection scoring (0-15 points)
    if (totalRequests > 0) {
      const predictiveRate = predictivePreconnectionHits / totalRequests;
      if (predictiveRate > 0.8) score += 15;
      else if (predictiveRate > 0.6) score += 12;
      else if (predictiveRate > 0.4) score += 8;
      else if (predictiveRate > 0.2) score += 4;
    }
    
    // Network quality scoring (0-10 points)
    switch (networkQualityScore) {
      case 'fast': score += 10; break;
      case 'medium': score += 7; break;
      case 'slow': score += 3; break;
    }

    // Determine grade based on total score (max 100)
    if (score >= 85) {
      overallGrade = 'A';
      gradeReasoning = 'Exceptional performance with advanced optimization';
    } else if (score >= 70) {
      overallGrade = 'B';
      gradeReasoning = 'Excellent performance with intelligent features';
    } else if (score >= 55) {
      overallGrade = 'C';
      gradeReasoning = 'Good performance with moderate optimization';
    } else if (score >= 40) {
      overallGrade = 'D';
      gradeReasoning = 'Basic performance with limited optimization';
    } else {
      overallGrade = 'F';
      gradeReasoning = 'Poor performance, optimization needed';
    }

    // Apply cache hit rate bonus for sufficient request volumes
    if (totalRequests >= 5 && cacheHitRate > 0.8) {
      // Upgrade grade for excellent cache performance
      if (overallGrade === 'B') overallGrade = 'A';
      else if (overallGrade === 'C') overallGrade = 'B';
      else if (overallGrade === 'D') overallGrade = 'C';
      gradeReasoning += ' + Excellent cache performance';
    } else if (totalRequests >= 3 && cacheHitRate > 0.6) {
      // Upgrade grade for good cache performance
      if (overallGrade === 'C') overallGrade = 'B';
      else if (overallGrade === 'D') overallGrade = 'C';
      gradeReasoning += ' + Good cache performance';
    }

    return {
      latencyReduction,
      connectionSpeedup,
      overallGrade,
      gradeReasoning
    };
  }

  /**
   * Log performance summary
   */
  public logPerformanceSummary(): void {
    const metrics = this.getMetrics();
    const improvement = this.getPerformanceImprovement();

    console.group('🚀 Georisques Preconnection Performance Summary');
    console.log('📊 Metrics:', metrics);
    console.log('⚡ Performance Improvement:', improvement);
    
    if (improvement.latencyReduction) {
      console.log(`✅ Latency reduced by ${improvement.latencyReduction.toFixed(2)}ms`);
    }
    
    console.log(`🎯 Overall Performance Grade: ${improvement.overallGrade}`);
    console.groupEnd();
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics = {
      firstApiCallLatency: null,
      connectionEstablishmentTime: null,
      totalRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      errors: 0,
      totalDownloads: 0,
      successfulDownloads: 0,
      downloadSuccessRate: 0,
      // Advanced metrics
      connectionReuseCount: 0,
      predictivePreconnectionHits: 0,
      networkQualityScore: 'medium',
      userIntentTriggers: 0,
      adaptiveTimeouts: 0
    };
    this.cacheHits = 0;
    this.startTime = performance.now();
    this.responseTimeHistory = [];
    this.usagePatternData = [];
  }

  /**
   * Get comprehensive performance summary
   */
  public getComprehensiveSummary() {
    const basicMetrics = this.getMetrics();
    const performanceImprovement = this.getPerformanceImprovement();
    const predictiveMetrics = this.getPredictiveMetrics();
    const advancedMetrics = this.getAdvancedMetrics();
    
    return {
      basic: basicMetrics,
      improvement: performanceImprovement,
      predictive: predictiveMetrics,
      advanced: advancedMetrics,
      timestamp: Date.now()
    };
  }
}

// Export singleton instance
export const preconnectionMonitor = PreconnectionMonitor.getInstance();
