/**
 * Web Vitals tracking utility
 * Measures real user performance metrics
 */

import logger from './logger';
import { APP_CONFIG } from '../config/appConfig';

// Performance thresholds (based on Google recommendations)
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
    INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms)
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
    TTFB: { good: 800, poor: 1800 }  // Time to First Byte (ms)
} as const;

// Define metric type locally
interface Metric {
    name: string;
    value: number;
    id: string;
    rating?: string;
    entries?: any[];
}

// Get performance rating
function getRating(name: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

// Log metric to console (in development)
function logMetric(metric: Metric) {
    const rating = getRating(metric.name as keyof typeof THRESHOLDS, metric.value);
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';

    logger.info(
        `[Web Vitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${rating})`
    );

    // Emit custom event for dashboard
    window.dispatchEvent(new CustomEvent('web-vital', {
        detail: { name: metric.name, value: metric.value, rating }
    }));

    // Log additional context
    if (metric.entries && metric.entries.length > 0) {
        const entry = metric.entries[0];
        logger.debug(`  URL: ${metric.name === 'TTFB' ? entry.name : window.location.href}`);
        if (metric.name === 'LCP' && entry.element) {
            logger.debug(`  Element: ${entry.element.tagName}${entry.element.id ? `#${entry.element.id}` : ''}${entry.element.className ? `.${entry.element.className.split(' ').join('.')}` : ''}`);
        }
    }
}

// Send to analytics (Google Analytics only)
function sendToAnalytics(metric: Metric) {
    // Google Analytics integration
    if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', metric.name, {
            value: Math.round(metric.value),
            event_category: 'Web Vitals',
            event_label: metric.id,
            non_interaction: true,
            custom_map: { [metric.name]: metric.value }
        });

        logger.debug(`[Web Vitals] 📊 Sent to GA: ${metric.name} = ${metric.value.toFixed(2)}`);
    } else {
        logger.debug(`[Web Vitals] ⚠️ GA not available, metric not sent: ${metric.name}`);
    }

    // Removed custom endpoint to avoid 404 errors
}

// Initialize Web Vitals tracking
export async function initWebVitals() {
    // Check if Web Vitals is enabled in config
    if (!APP_CONFIG.webVitals.enabled) {
        logger.debug('[Web Vitals] Disabled by configuration');
        return;
    }

    // Use configuration for deferred initialization
    if (APP_CONFIG.webVitals.deferred) {
        // Use requestIdleCallback to defer initialization
        const scheduleInit = () => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(() => performInit(), { timeout: APP_CONFIG.webVitals.timeout });
            } else {
                setTimeout(() => performInit(), 100);
            }
        };

        scheduleInit();
    } else {
        // Immediate initialization
        await performInit();
    }

    async function performInit() {
        logger.info('[Web Vitals] 🚀 Starting performance monitoring...');

        try {
            // Dynamic import of web-vitals
            const webVitals = await import('web-vitals');

            // Track all Core Web Vitals with correct API
            webVitals.onCLS((metric: Metric) => {
                logMetric(metric);
                sendToAnalytics(metric);
            });

            webVitals.onINP((metric: Metric) => {
                logMetric(metric);
                sendToAnalytics(metric);
            });

            webVitals.onFCP((metric: Metric) => {
                logMetric(metric);
                sendToAnalytics(metric);
            });

            webVitals.onLCP((metric: Metric) => {
                logMetric(metric);
                sendToAnalytics(metric);
            });

            webVitals.onTTFB((metric: Metric) => {
                logMetric(metric);
                sendToAnalytics(metric);
            });

            // Emit a ready event for the dashboard
            window.dispatchEvent(new CustomEvent('web-vitals-ready', {
                detail: { status: 'initialized' }
            }));
        } catch (error) {
            logger.warn('[Web Vitals] Package not available:', error);
        }
    }
}

// Get current performance summary
export function getPerformanceSummary() {
    return {
        thresholds: THRESHOLDS,
        recommendations: {
            LCP: 'Optimize images, remove render-blocking resources, use CDN',
            INP: 'Reduce JavaScript execution time, break up long tasks, optimize event handlers',
            CLS: 'Specify image dimensions, avoid inserting content above existing content',
            FCP: 'Reduce server response time, optimize CSS delivery',
            TTFB: 'Use CDN, optimize server performance, enable HTTP/2'
        }
    };
}

// Export for testing
export { getRating, THRESHOLDS };