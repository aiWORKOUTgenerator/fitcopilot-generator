/**
 * Performance Cache Hook
 * 
 * Provides caching functionality for expensive operations like API calls
 * Especially valuable for workout generation which has both time and API usage costs
 */
import { useState, useCallback, useEffect } from 'react';
import { WorkoutFormParams, GeneratedWorkout } from '../types/workout';

// Cache structure
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache options
interface CacheOptions {
  // Time to live in milliseconds, default 1 hour
  ttl?: number;
  // Maximum cache size
  maxSize?: number;
}

/**
 * Generate a cache key from workout parameters
 */
function generateCacheKey(params: WorkoutFormParams): string {
  // Sort equipment to ensure consistent keys regardless of order
  const sortedEquipment = params.equipment ? [...params.equipment].sort().join(',') : '';
  
  // Create a deterministic key from the most important parameters
  return `${params.goals}:${params.difficulty}:${params.duration}:${sortedEquipment}:${params.restrictions}`;
}

/**
 * Hook for caching workout generation results
 * 
 * @param options - Cache configuration options
 * @returns Functions for managing the cache
 */
export function usePerformanceCache(options: CacheOptions = {}) {
  // Default options
  const { ttl = 60 * 60 * 1000, maxSize = 10 } = options;
  
  // Internal cache state - not using useState to avoid re-renders
  // Using a ref with a Map would be another option
  const [cache] = useState<Map<string, CacheEntry<GeneratedWorkout>>>(new Map());
  
  /**
   * Get a cached result if available and valid
   */
  const getCached = useCallback((params: WorkoutFormParams): GeneratedWorkout | null => {
    const key = generateCacheKey(params);
    const cached = cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if the cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > ttl) {
      // Cache expired, remove it
      cache.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cache, ttl]);
  
  /**
   * Store a result in the cache
   */
  const setCached = useCallback((params: WorkoutFormParams, data: GeneratedWorkout): void => {
    const key = generateCacheKey(params);
    
    // If the cache is full, remove the oldest entry
    if (cache.size >= maxSize) {
      // Find the oldest entry
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      
      cache.forEach((entry, entryKey) => {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = entryKey;
        }
      });
      
      // Remove the oldest entry if found
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    // Add the new entry
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }, [cache, maxSize]);
  
  /**
   * Clear the entire cache or a specific entry
   */
  const clearCache = useCallback((params?: WorkoutFormParams): void => {
    if (params) {
      // Clear a specific entry
      const key = generateCacheKey(params);
      cache.delete(key);
    } else {
      // Clear the entire cache
      cache.clear();
    }
  }, [cache]);
  
  /**
   * Get cache statistics
   */
  const getCacheStats = useCallback(() => {
    return {
      size: cache.size,
      maxSize,
      ttl
    };
  }, [cache, maxSize, ttl]);
  
  // Clean up expired cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      cache.forEach((entry, key) => {
        if (now - entry.timestamp > ttl) {
          cache.delete(key);
        }
      });
    };
    
    // Run cleanup every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [cache, ttl]);
  
  return {
    getCached,
    setCached,
    clearCache,
    getCacheStats
  };
} 