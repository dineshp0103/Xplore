import { useState, useRef, useCallback } from 'react';

// LRU Cache Implementation
// Stores up to limit items. Discards least recently used.
export const useResponseCache = <T>(limit: number = 10) => {
    // specific type for cache using Map which preserves insertion order
    const cacheRef = useRef<Map<string, T>>(new Map());
    // Force re-render to show cache updates if needed (mostly for debugging or UI indicators)
    const [, setTick] = useState(0);

    const getFromCache = useCallback((key: string): T | null => {
        const cache = cacheRef.current;
        if (!cache.has(key)) return null;

        // Refresh item (Delete and Re-insert to make it most recently used)
        const value = cache.get(key)!;
        cache.delete(key);
        cache.set(key, value);
        return value;
    }, []);

    const addToCache = useCallback((key: string, value: T) => {
        const cache = cacheRef.current;

        // If exists, delete first to re-insert at end
        if (cache.has(key)) {
            cache.delete(key);
        } else if (cache.size >= limit) {
            // Remove oldest (first item in Map)
            const oldestKey = cache.keys().next().value;
            if (oldestKey) cache.delete(oldestKey);
        }

        cache.set(key, value);
        setTick(t => t + 1); // Optional: Trigger update if you want to visualize cache state
    }, [limit]);

    return {
        getFromCache,
        addToCache,
        cacheSize: cacheRef.current.size
    };
};
