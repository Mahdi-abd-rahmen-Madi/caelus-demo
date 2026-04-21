/**
 * Web Vitals Dashboard Component
 * Shows real-time performance metrics in development
 */

import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip, Alert, Button } from '@mui/material';
import { Speed, Timer, Visibility, TouchApp } from '@mui/icons-material';
import { APP_CONFIG } from '../config/appConfig';

interface MetricData {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    unit: string;
    icon: React.ReactNode;
    description: string;
}

const WebVitalsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MetricData[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Only show if Web Vitals is enabled in config
    if (!APP_CONFIG.webVitals.enabled) return null;

    useEffect(() => {
        // Listen for web vitals ready event
        const handleReady = () => {
            setIsReady(true);
            console.log('[Web Vitals Dashboard] 📊 Ready to collect metrics');
        };

        // Listen for custom events from webVitals utility
        const handleMetric = (event: CustomEvent) => {
            const { name, value, rating } = event.detail;

            const metricConfig: Record<string, { icon: React.ReactNode; unit: string; description: string }> = {
                LCP: { icon: <Visibility />, unit: 'ms', description: 'Largest Contentful Paint - When main content appears' },
                INP: { icon: <TouchApp />, unit: 'ms', description: 'Interaction to Next Paint - Responsiveness to user interaction' },
                CLS: { icon: <Speed />, unit: '', description: 'Cumulative Layout Shift - Visual stability' },
                FCP: { icon: <Timer />, unit: 'ms', description: 'First Contentful Paint - When any content appears' },
                TTFB: { icon: <Timer />, unit: 'ms', description: 'Time to First Byte - Server response time' }
            };

            const config = metricConfig[name];
            if (config) {
                setMetrics(prev => {
                    const existing = prev.findIndex(m => m.name === name);
                    const newMetric: MetricData = {
                        name,
                        value,
                        rating,
                        ...config
                    };

                    if (existing >= 0) {
                        const updated = [...prev];
                        updated[existing] = newMetric;
                        return updated;
                    }
                    return [...prev, newMetric];
                });
            }
        };

        window.addEventListener('web-vitals-ready', handleReady as EventListener);
        window.addEventListener('web-vital', handleMetric as EventListener);

        return () => {
            window.removeEventListener('web-vitals-ready', handleReady as EventListener);
            window.removeEventListener('web-vital', handleMetric as EventListener);
        };
    }, []);

    // Manual trigger for testing
    const triggerMetrics = () => {
        // Simulate some metrics for testing
        const testMetrics = [
            { name: 'FCP', value: 1200, rating: 'good' as const },
            { name: 'LCP', value: 1800, rating: 'good' as const },
            { name: 'CLS', value: 0.05, rating: 'good' as const },
            { name: 'TTFB', value: 450, rating: 'good' as const }
        ];

        testMetrics.forEach(metric => {
            window.dispatchEvent(new CustomEvent('web-vital', {
                detail: metric
            }));
        });
    };

    const getRatingColor = (rating: string) => {
        switch (rating) {
            case 'good': return 'success';
            case 'needs-improvement': return 'warning';
            case 'poor': return 'error';
            default: return 'default';
        }
    };

    const getRatingEmoji = (rating: string) => {
        switch (rating) {
            case 'good': return '✅';
            case 'needs-improvement': return '⚠️';
            case 'poor': return '❌';
            default: return '❓';
        }
    };

    if (!isVisible) {
        return (
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 9999
                }}
            >
                <Chip
                    label="🚀 Web Vitals"
                    onClick={() => setIsVisible(true)}
                    sx={{ cursor: 'pointer' }}
                />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 16,
                right: 16,
                width: 380,
                maxHeight: '80vh',
                overflow: 'auto',
                zIndex: 9999,
                fontFamily: 'monospace'
            }}
        >
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">🚀 Web Vitals Dashboard</Typography>
                        <Chip
                            label="✕"
                            size="small"
                            onClick={() => setIsVisible(false)}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        Real-time performance metrics (development only)
                        {!isReady && " - Initializing..."}
                    </Alert>

                    {!isReady && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Web Vitals is still initializing. Some metrics require user interaction or page load time to appear.
                        </Alert>
                    )}

                    {metrics.length === 0 ? (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {isReady
                                    ? "No metrics collected yet. Try interacting with the page or navigate to different routes."
                                    : "Waiting for Web Vitals to initialize..."
                                }
                            </Typography>

                            <Button
                                variant="outlined"
                                size="small"
                                onClick={triggerMetrics}
                                sx={{ mb: 2 }}
                            >
                                🧪 Simulate Metrics (for testing)
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {metrics.map((metric) => (
                                <Card key={metric.name} variant="outlined">
                                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            {metric.icon}
                                            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                                                {metric.name}
                                            </Typography>
                                            <Chip
                                                label={getRatingEmoji(metric.rating)}
                                                color={getRatingColor(metric.rating) as any}
                                                size="small"
                                            />
                                        </Box>

                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}{metric.unit}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            {metric.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="caption" component="div">
                            💡 Tips for seeing metrics:
                            <br />• Navigate to different pages (triggers FCP, LCP)
                            <br />• Click buttons and interact (triggers FID)
                            <br />• Wait for images to load (affects CLS)
                            <br />• Check browser DevTools Performance tab for detailed breakdown
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        </Box>
    );
};

export default WebVitalsDashboard;