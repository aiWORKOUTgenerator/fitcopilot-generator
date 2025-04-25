/**
 * usePerformanceCache hook
 * 
 * Provides memoization and caching capabilities for expensive operations.
 * Can be used to cache API responses, computation results, or any data that
 * is expensive to compute or fetch.
 */
import { useCallback, useRef } from 'react';

/**
 * Cache entry with expiration
 */
interface CacheEntry<T> {
  /** The cached value */
  value: T;
  /** When the entry was cached */
  timestamp: number;
  /** When the entry expires */
  expiresAt: number;
}

/**
 * Cache configuration options
 */
interface CacheConfig {
  /** How long entries should be cached in milliseconds */
  ttl?: number;
  /** Maximum number of entries to keep */
  maxEntries?: number;
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxEntries: 20,
};

/**
 * Hook for caching expensive computation results or API responses
 * 
 * @param config - Cache configuration
 * @returns Caching utilities
 */
export function usePerformanceCache<T = any>(config: CacheConfig = {}) {
  // Merge provided config with defaults using destructuring with default values
  const { 
    ttl = DEFAULT_CONFIG.ttl ?? 5 * 60 * 1000, 
    maxEntries = DEFAULT_CONFIG.maxEntries ?? 20 
  } = config;
  
  // Cache store
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  
  /**
   * Check if a cache entry exists and is valid
   * 
   * @param key - Cache key to check
   * @returns Whether the entry exists and is valid
   */
  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    return entry.expiresAt > now;
  }, []);
  
  /**
   * Get a cached value
   * 
   * @param key - Cache key
   * @returns The cached value or undefined if not found
   */
  const get = useCallback((key: string): T | undefined => {
    const entry = cacheRef.current.get(key);
    if (!entry) return undefined;
    
    const now = Date.now();
    
    // Check if entry has expired
    if (entry.expiresAt <= now) {
      cacheRef.current.delete(key);
      return undefined;
    }
    
    return entry.value;
  }, []);
  
  /**
   * Set a value in the cache
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param customTtl - Optional custom TTL for this entry
   */
  const set = useCallback((key: string, value: T, customTtl?: number): void => {
    const now = Date.now();
    // Using non-null assertion here since we assigned a default value above
    const entryTtl = customTtl ?? ttl;
    
    // Create new cache entry
    const entry: CacheEntry<T> = {
      value,
      timestamp: now,
      expiresAt: now + entryTtl,
    };
    
    // If we're at capacity, remove the oldest entry
    // Using non-null assertion since we assigned a default value above
    if (cacheRef.current.size >= maxEntries) {
      const oldestKey = [...cacheRef.current.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      cacheRef.current.delete(oldestKey);
    }
    
    // Add the new entry
    cacheRef.current.set(key, entry);
  }, [maxEntries, ttl]);
  
  /**
   * Remove an entry from the cache
   * 
   * @param key - Cache key to remove
   */
  const remove = useCallback((key: string): void => {
    cacheRef.current.delete(key);
  }, []);
  
  /**
   * Clear all entries from the cache
   */
  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);
  
  /**
   * Memoize a function result
   * 
   * @param fn - Function to memoize
   * @param keyFn - Function to generate a cache key
   * @returns Memoized function
   */
  const memoize = useCallback(<Args extends any[], Result>(
    fn: (...args: Args) => Result,
    keyFn: (...args: Args) => string = (...args) => JSON.stringify(args)
  ) => {
    return (...args: Args): Result => {
      const key = keyFn(...args);
      
      if (has(key)) {
        return get(key) as Result;
      }
      
      const result = fn(...args);
      set(key, result as unknown as T);
      return result;
    };
  }, [get, has, set]);
  
  return {
    has,
    get,
    set,
    remove,
    clear,
    memoize,
  };
} 