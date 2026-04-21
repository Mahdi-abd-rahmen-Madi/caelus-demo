/**
 * Streaming client for Server-Sent Events (SSE)
 * Provides progressive data loading with automatic reconnection and error handling
 */

export interface StreamingMetadata {
    type: 'metadata';
    total: number;
    zoom?: number;
    tile?: string;
    bbox?: number[];
    filters?: Record<string, any>;
    timestamp?: string;
    server_version?: string;
}

export interface StreamingFeature {
    type: 'feature';
    feature: GeoJSON.Feature;
}

export interface StreamingProgress {
    type: 'progress';
    processed: number;
    total: number;
    percentage?: number;
    elapsed?: number;
}

export interface StreamingComplete {
    type: 'complete';
    processed: number;
    total: number;
    duration?: number;
}

export interface StreamingError {
    type: 'error';
    error: string;
    tile?: string;
    bbox?: string;
}

export type StreamingEvent = StreamingMetadata | StreamingFeature | StreamingProgress | StreamingComplete | StreamingError;

export interface StreamingOptions {
    onMetadata?: (metadata: StreamingMetadata) => void;
    onFeature?: (feature: GeoJSON.Feature) => void;
    onProgress?: (progress: StreamingProgress) => void;
    onComplete?: (complete: StreamingComplete) => void;
    onError?: (error: StreamingError) => void;
    onReconnect?: (attempt: number) => void;
    batchSize?: number;
    maxRetries?: number;
    retryDelay?: number;
    timeout?: number;
}

export class StreamingClient {
    private eventSource: EventSource | null = null;
    private abortController: AbortController | null = null;
    private options: StreamingOptions;
    private retryCount = 0;
    private isDestroyed = false;
    private reconnectTimer: number | null = null;
    private lastActivityTime = 0;
    private heartbeatTimer: number | null = null;

    constructor(options: StreamingOptions = {}) {
        this.options = {
            maxRetries: 3,
            retryDelay: 2000,
            timeout: 30000,
            batchSize: 100,
            ...options
        };
    }

    private getAuthToken(): string | null {
        return localStorage.getItem('accessToken') || localStorage.getItem('enedisAuthToken');
    }

    private async connectWithFetch(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const token = this.getAuthToken();

            // If no token, try EventSource (for public endpoints)
            if (!token) {
                this.connectWithEventSource(url, resolve, reject);
                return;
            }

            // Use fetch for authenticated requests
            this.abortController = new AbortController();

            const headers: Record<string, string> = {
                'Accept': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'X-Requested-With': 'XMLHttpRequest'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            fetch(url, {
                headers,
                signal: this.abortController.signal
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    if (!response.body) {
                        throw new Error('Response body is null');
                    }

                    this.lastActivityTime = Date.now();
                    this.startHeartbeat();

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    const processStream = async () => {
                        try {
                            while (true) {
                                const { done, value } = await reader.read();

                                if (done) {
                                    console.log(`[StreamingClient] Stream completed`);
                                    resolve();
                                    return;
                                }

                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                                for (const line of lines) {
                                    if (line.trim()) {
                                        this.handleSSELine(line);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`[StreamingClient] Stream processing error:`, error);
                            reject(error);
                        }
                    };

                    processStream();
                })
                .catch(error => {
                    console.error(`[StreamingClient] Fetch connection error:`, error);
                    reject(error);
                });
        });
    }

    private connectWithEventSource(url: string, resolve: () => void, reject: (reason?: any) => void): void {
        this.eventSource = new EventSource(url);
        this.lastActivityTime = Date.now();

        this.eventSource.onopen = () => {
            console.log(`[StreamingClient] Connected to ${url}`);
            this.retryCount = 0;
            this.startHeartbeat();
            resolve();
        };

        this.eventSource.onmessage = (event) => {
            this.handleMessage(event);
        };

        this.eventSource.onerror = (error) => {
            console.error(`[StreamingClient] Connection error:`, error);
            this.handleError(error);
            reject(new Error('Connection failed'));
        };
    }

    private handleSSELine(line: string): void {
        // Parse SSE line format
        if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            try {
                const eventData = JSON.parse(data) as StreamingEvent;
                this.handleEvent(eventData);
            } catch (error) {
                console.error(`[StreamingClient] Failed to parse SSE data:`, error, data);
            }
        }
    }

    private handleEvent(event: StreamingEvent): void {
        this.lastActivityTime = Date.now();

        switch (event.type) {
            case 'metadata':
                console.log(`[StreamingClient] Metadata received:`, event);
                this.options.onMetadata?.(event);
                break;

            case 'feature':
                this.options.onFeature?.(event.feature);
                break;

            case 'progress':
                this.options.onProgress?.(event);
                break;

            case 'complete':
                console.log(`[StreamingClient] Streaming complete:`, event);
                this.options.onComplete?.(event);
                this.disconnect();
                break;

            case 'error':
                console.error(`[StreamingClient] Server error:`, event);
                this.options.onError?.(event);
                this.disconnect();
                break;

            default:
                console.warn(`[StreamingClient] Unknown event type:`, event);
        }
    }

    connect(url: string, params: Record<string, string> = {}): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.isDestroyed) {
                reject(new Error('Client has been destroyed'));
                return;
            }

            // Build URL with parameters
            const urlObj = new URL(url, window.location.origin);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    urlObj.searchParams.set(key, value);
                }
            });

            const finalUrl = urlObj.toString();

            // Close existing connection
            this.disconnect();

            try {
                // Use fetch-based streaming for authenticated requests
                await this.connectWithFetch(finalUrl);
                resolve();
            } catch (error) {
                console.error(`[StreamingClient] Failed to create connection:`, error);
                reject(error);
            }
        });
    }

    private handleMessage(event: MessageEvent): void {
        try {
            const data = JSON.parse(event.data) as StreamingEvent;
            this.lastActivityTime = Date.now();

            switch (data.type) {
                case 'metadata':
                    console.log(`[StreamingClient] Metadata received:`, data);
                    this.options.onMetadata?.(data);
                    break;

                case 'feature':
                    this.options.onFeature?.(data.feature);
                    break;

                case 'progress':
                    this.options.onProgress?.(data);
                    break;

                case 'complete':
                    console.log(`[StreamingClient] Streaming complete:`, data);
                    this.options.onComplete?.(data);
                    this.disconnect();
                    break;

                case 'error':
                    console.error(`[StreamingClient] Server error:`, data);
                    this.options.onError?.(data);
                    this.disconnect();
                    break;

                default:
                    console.warn(`[StreamingClient] Unknown event type:`, data);
            }
        } catch (error) {
            console.error(`[StreamingClient] Failed to parse message:`, error, event.data);
        }
    }

    private handleError(_error: Event): void {
        if (this.isDestroyed) return;

        this.retryCount++;

        if (this.retryCount <= (this.options.maxRetries || 3)) {
            const delay = (this.options.retryDelay || 2000) * Math.pow(2, this.retryCount - 1);

            console.log(`[StreamingClient] Reconnection attempt ${this.retryCount}/${this.options.maxRetries} in ${delay}ms`);
            this.options.onReconnect?.(this.retryCount);

            this.reconnectTimer = window.setTimeout(() => {
                if (!this.isDestroyed && this.eventSource) {
                    // Reconnect by recreating the connection
                    const url = this.eventSource!.url;
                    this.connect(url);
                }
            }, delay);
        } else {
            console.error(`[StreamingClient] Max reconnection attempts reached`);
            this.options.onError?.({
                type: 'error',
                error: `Connection failed after ${this.retryCount} attempts`
            });
        }
    }

    private startHeartbeat(): void {
        this.stopHeartbeat();

        this.heartbeatTimer = window.setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - this.lastActivityTime;

            // Check for timeout
            if (timeSinceLastActivity > (this.options.timeout || 30000)) {
                console.warn(`[StreamingClient] Connection timeout detected`);
                this.eventSource?.close();
                this.handleError(new Event('timeout'));
            }
        }, 10000); // Check every 10 seconds
    }

    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    disconnect(): void {
        this.stopHeartbeat();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }

        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }

    destroy(): void {
        this.isDestroyed = true;
        this.disconnect();
    }

    isConnected(): boolean {
        // Check EventSource connection
        if (this.eventSource) {
            return this.eventSource.readyState === EventSource.OPEN;
        }

        // Check fetch-based connection (via abort controller)
        if (this.abortController && !this.abortController.signal.aborted) {
            return true;
        }

        return false;
    }

    getStats(): { connected: boolean; retryCount: number; lastActivity: number } {
        return {
            connected: this.isConnected(),
            retryCount: this.retryCount,
            lastActivity: this.lastActivityTime
        };
    }
}

/**
 * Utility class for managing multiple streaming connections
 */
export class StreamingManager {
    private connections: Map<string, StreamingClient> = new Map();
    private defaultOptions: StreamingOptions;

    constructor(defaultOptions: StreamingOptions = {}) {
        this.defaultOptions = defaultOptions;
    }

    createConnection(id: string, options: StreamingOptions = {}): StreamingClient {
        // Destroy existing connection if present
        this.destroyConnection(id);

        const client = new StreamingClient({ ...this.defaultOptions, ...options });
        this.connections.set(id, client);
        return client;
    }

    getConnection(id: string): StreamingClient | undefined {
        return this.connections.get(id);
    }

    destroyConnection(id: string): void {
        const client = this.connections.get(id);
        if (client) {
            client.destroy();
            this.connections.delete(id);
        }
    }

    destroyAllConnections(): void {
        this.connections.forEach((client) => {
            client.destroy();
        });
        this.connections.clear();
    }

    getActiveConnections(): string[] {
        return Array.from(this.connections.keys()).filter(id => {
            const client = this.connections.get(id);
            return client?.isConnected();
        });
    }

    getConnectionStats(): Record<string, { connected: boolean; retryCount: number; lastActivity: number }> {
        const stats: Record<string, { connected: boolean; retryCount: number; lastActivity: number }> = {};

        this.connections.forEach((client, id) => {
            stats[id] = client.getStats();
        });

        return stats;
    }
}

/**
 * Global streaming manager instance
 */
export const streamingManager = new StreamingManager();
