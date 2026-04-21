// Performance monitoring utilities for map tile loading
interface TilePerformanceMetrics {
    totalTiles: number;
    successfulTiles: number;
    failedTiles: number;
    averageLoadTime: number;
    cacheHitRate: number;
    concurrentRequests: number;
}

class TilePerformanceMonitor {
    private metrics: TilePerformanceMetrics = {
        totalTiles: 0,
        successfulTiles: 0,
        failedTiles: 0,
        averageLoadTime: 0,
        cacheHitRate: 0,
        concurrentRequests: 0
    };

    private loadTimes: number[] = [];
    private cacheHits = 0;
    private startTime = Date.now();

    recordTileLoad(loadTime: number, success: boolean, fromCache: boolean = false): void {
        this.metrics.totalTiles++;

        if (success) {
            this.metrics.successfulTiles++;
        } else {
            this.metrics.failedTiles++;
        }

        if (fromCache) {
            this.cacheHits++;
        }

        this.loadTimes.push(loadTime);

        // Keep only last 100 load times for average calculation
        if (this.loadTimes.length > 100) {
            this.loadTimes.shift();
        }

        this.updateMetrics();
    }

    private updateMetrics(): void {
        if (this.loadTimes.length > 0) {
            this.metrics.averageLoadTime =
                this.loadTimes.reduce((sum, time) => sum + time, 0) / this.loadTimes.length;
        }

        this.metrics.cacheHitRate = this.metrics.totalTiles > 0
            ? (this.cacheHits / this.metrics.totalTiles) * 100
            : 0;
    }

    getMetrics(): TilePerformanceMetrics {
        return { ...this.metrics };
    }

    reset(): void {
        this.metrics = {
            totalTiles: 0,
            successfulTiles: 0,
            failedTiles: 0,
            averageLoadTime: 0,
            cacheHitRate: 0,
            concurrentRequests: 0
        };
        this.loadTimes = [];
        this.cacheHits = 0;
        this.startTime = Date.now();
    }

    getPerformanceReport(): string {
        const uptime = Date.now() - this.startTime;
        const uptimeMinutes = Math.floor(uptime / 60000);

        return `
Tile Performance Report (Last ${uptimeMinutes} minutes):
- Total Tiles: ${this.metrics.totalTiles}
- Success Rate: ${this.metrics.totalTiles > 0 ? ((this.metrics.successfulTiles / this.metrics.totalTiles) * 100).toFixed(1) : 0}%
- Cache Hit Rate: ${this.metrics.cacheHitRate.toFixed(1)}%
- Average Load Time: ${this.metrics.averageLoadTime.toFixed(0)}ms
- Failed Tiles: ${this.metrics.failedTiles}
        `.trim();
    }
}

// Global performance monitor instance
export const tilePerformanceMonitor = new TilePerformanceMonitor();

// Performance measurement wrapper
export function measureTileLoad<T>(
    _tileUrl: string,
    loadFunction: () => Promise<T>,
    fromCache = false
): Promise<T> {
    const startTime = performance.now();

    return loadFunction()
        .then(result => {
            const loadTime = performance.now() - startTime;
            tilePerformanceMonitor.recordTileLoad(loadTime, true, fromCache);
            return result;
        })
        .catch(error => {
            const loadTime = performance.now() - startTime;
            tilePerformanceMonitor.recordTileLoad(loadTime, false, fromCache);
            throw error;
        });
}

