// Memory management utilities for performance optimization

// Object pool for frequently created objects
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      const obj = this.pool.pop()!;
      this.resetFn(obj);
      return obj;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }
}

// WeakRef cache for large objects
class WeakRefCache<K extends object, V> {
  private cache = new WeakMap<K, V>();
  private maxSize: number;
  private keys: K[] = [];

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value) {
      // Move key to end for LRU
      this.keys = this.keys.filter(k => k !== key);
      this.keys.push(key);
      return value;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);

    // Manage keys for LRU
    if (!this.keys.includes(key)) {
      this.keys.push(key);
    }

    // Remove oldest keys if over max size
    if (this.keys.length > this.maxSize) {
      const oldestKey = this.keys.shift();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  clear(): void {
    this.cache = new WeakMap();
    this.keys = [];
  }
}

// Memory monitoring utilities
export const memoryMonitor = {
  // Get current memory usage
  getCurrentUsage(): MemoryInfo {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0
    };
  },

  // Check for memory leaks
  checkForLeaks(): void {
    const usage = this.getCurrentUsage();
    const usageRatio = usage.usedJSHeapSize / usage.totalJSHeapSize;

    if (usageRatio > 0.9) {
      console.warn('High memory usage detected:', {
        usage,
        usageRatio: `${(usageRatio * 100).toFixed(1)}%`
      });
    }
  },

  // Force garbage collection if available
  forceGC(): void {
    if ('gc' in window) {
      (window as any).gc();
    }
  }
};

// Create object pools for common objects
export const geometryPool = new ObjectPool(
  () => ({ type: 'Feature', geometry: null, properties: {} }),
  (obj) => {
    obj.geometry = null;
    obj.properties = {};
  },
  50
);

export const tileCachePool = new ObjectPool(
  () => ({ data: null, timestamp: 0, accessCount: 0 }),
  (obj) => {
    obj.data = null;
    obj.timestamp = 0;
    obj.accessCount = 0;
  },
  100
);

// WeakRef cache for expensive computations
export const computedCache = new WeakRefCache(50);

// Cleanup utilities
export const cleanupManager = {
  // Create a cleanup manager for components
  createManager(): {
    add: (cleanup: () => void) => void;
    execute: () => void;
  } {
    const cleanupFunctions: (() => void)[] = [];

    return {
      add: (cleanup: () => void) => {
        cleanupFunctions.push(cleanup);
      },
      execute: () => {
        cleanupFunctions.forEach(fn => fn());
        cleanupFunctions.length = 0;
      }
    };
  }
};

// Memory-aware event listener management
export const eventManager = {
  listeners: new Map<string, EventListener[]>(),

  add(element: EventTarget, event: string, listener: EventListener, options?: AddEventListenerOptions): void {
    const key = `${element.constructor.name}-${event}`;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }

    element.addEventListener(event, listener, options);
    this.listeners.get(key)!.push(listener);
  },

  remove(element: EventTarget, event: string, listener: EventListener): void {
    const key = `${element.constructor.name}-${event}`;
    const elementListeners = this.listeners.get(key);

    if (elementListeners) {
      const index = elementListeners.indexOf(listener);
      if (index > -1) {
        elementListeners.splice(index, 1);
        element.removeEventListener(event, listener);
      }

      if (elementListeners.length === 0) {
        this.listeners.delete(key);
      }
    }
  },

  removeAll(element: EventTarget): void {
    const keys = Array.from(this.listeners.keys()).filter(key => key.startsWith(element.constructor.name));

    keys.forEach(key => {
      const elementListeners = this.listeners.get(key);
      if (elementListeners) {
        elementListeners.forEach(listener => {
          element.removeEventListener(key.split('-')[1], listener);
        });
        this.listeners.delete(key);
      }
    });
  }
};

// Types
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}
