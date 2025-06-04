/**
 * WorkoutCache Service
 * 
 * Manages caching of workout data to improve performance and reduce API calls.
 * Created during Week 1 Foundation Sprint.
 */

import { PERFORMANCE_CONSTANTS } from '../../constants/workoutConstants';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface WorkoutListCacheEntry {
  workouts: any[];
  totalCount: number;
  lastFetch: number;
}

export class WorkoutCache {
  private static instance: WorkoutCache;
  private cache: Map<string, CacheEntry<any>> = new Map();
  private static readonly CACHE_PREFIX = 'fitcopilot_workout_';

  /**
   * Get singleton instance
   */
  static getInstance(): WorkoutCache {
    if (!WorkoutCache.instance) {
      WorkoutCache.instance = new WorkoutCache();
    }
    return WorkoutCache.instance;
  }

  /**
   * Cache workout list data
   * 
   * @param workouts - Array of workouts to cache
   * @param totalCount - Total count of workouts
   * @param ttl - Time to live in milliseconds
   */
  cacheWorkoutList(workouts: any[], totalCount?: number, ttl = PERFORMANCE_CONSTANTS.WORKOUT_CACHE_TTL_MS): void {
    const cacheKey = this.generateCacheKey('workout_list');
    
    const cacheEntry: CacheEntry<WorkoutListCacheEntry> = {
      data: {
        workouts,
        totalCount: totalCount || workouts.length,
        lastFetch: Date.now()
      },
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(cacheKey, cacheEntry);

    // Also cache individual workouts
    workouts.forEach(workout => {
      if (workout && workout.id) {
        this.cacheWorkout(workout.id, workout, ttl);
      }
    });

    // Clean up expired entries
    this.cleanupExpiredEntries();
  }

  /**
   * Get cached workout list
   * 
   * @returns Cached workout list or null if not found/expired
   */
  getCachedWorkoutList(): WorkoutListCacheEntry | null {
    const cacheKey = this.generateCacheKey('workout_list');
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache individual workout
   * 
   * @param workoutId - Workout ID
   * @param workout - Workout data
   * @param ttl - Time to live in milliseconds
   */
  cacheWorkout(workoutId: string | number, workout: any, ttl = PERFORMANCE_CONSTANTS.WORKOUT_CACHE_TTL_MS): void {
    const cacheKey = this.generateCacheKey(`workout_${workoutId}`);
    
    const cacheEntry: CacheEntry<any> = {
      data: workout,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Get cached workout
   * 
   * @param workoutId - Workout ID
   * @returns Cached workout or null if not found/expired
   */
  getCachedWorkout(workoutId: string | number): any | null {
    const cacheKey = this.generateCacheKey(`workout_${workoutId}`);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache transformation results
   * 
   * @param key - Cache key for the transformation
   * @param result - Transformation result
   * @param ttl - Time to live in milliseconds
   */
  cacheTransformation(key: string, result: any, ttl = PERFORMANCE_CONSTANTS.WORKOUT_CACHE_TTL_MS): void {
    const cacheKey = this.generateCacheKey(`transform_${key}`);
    
    const cacheEntry: CacheEntry<any> = {
      data: result,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Get cached transformation result
   * 
   * @param key - Cache key for the transformation
   * @returns Cached result or null if not found/expired
   */
  getCachedTransformation(key: string): any | null {
    const cacheKey = this.generateCacheKey(`transform_${key}`);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Cache filter results
   * 
   * @param filterHash - Hash of filter criteria
   * @param results - Filtered results
   * @param ttl - Time to live in milliseconds
   */
  cacheFilterResults(filterHash: string, results: any[], ttl = PERFORMANCE_CONSTANTS.FILTER_CACHE_TTL_MS): void {
    const cacheKey = this.generateCacheKey(`filter_${filterHash}`);
    
    const cacheEntry: CacheEntry<any[]> = {
      data: results,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(cacheKey, cacheEntry);
  }

  /**
   * Get cached filter results
   * 
   * @param filterHash - Hash of filter criteria
   * @returns Cached filter results or null if not found/expired
   */
  getCachedFilterResults(filterHash: string): any[] | null {
    const cacheKey = this.generateCacheKey(`filter_${filterHash}`);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Invalidate workout cache
   * 
   * @param workoutId - Optional workout ID to invalidate specific workout
   */
  invalidateWorkoutCache(workoutId?: string | number): void {
    if (workoutId) {
      // Invalidate specific workout
      const workoutKey = this.generateCacheKey(`workout_${workoutId}`);
      this.cache.delete(workoutKey);
    }

    // Always invalidate workout list when any workout changes
    const listKey = this.generateCacheKey('workout_list');
    this.cache.delete(listKey);

    // Clear all filter cache since workout data changed
    this.clearFilterCache();
  }

  /**
   * Clear all filter cache
   */
  clearFilterCache(): void {
    for (const [key] of this.cache) {
      if (key.includes('filter_')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all transformation cache
   */
  clearTransformationCache(): void {
    for (const [key] of this.cache) {
      if (key.includes('transform_')) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns Cache statistics object
   */
  getCacheStats(): {
    totalEntries: number;
    workoutEntries: number;
    filterEntries: number;
    transformationEntries: number;
    expiredEntries: number;
    cacheSize: number;
  } {
    let workoutEntries = 0;
    let filterEntries = 0;
    let transformationEntries = 0;
    let expiredEntries = 0;

    for (const [key, entry] of this.cache) {
      if (key.includes('workout_')) workoutEntries++;
      else if (key.includes('filter_')) filterEntries++;
      else if (key.includes('transform_')) transformationEntries++;

      if (this.isExpired(entry)) expiredEntries++;
    }

    return {
      totalEntries: this.cache.size,
      workoutEntries,
      filterEntries,
      transformationEntries,
      expiredEntries,
      cacheSize: this.calculateCacheSize()
    };
  }

  /**
   * Generate cache key with prefix
   * 
   * @param key - Base cache key
   * @returns Prefixed cache key
   */
  private generateCacheKey(key: string): string {
    return `${WorkoutCache.CACHE_PREFIX}${key}`;
  }

  /**
   * Check if cache entry is expired
   * 
   * @param entry - Cache entry to check
   * @returns True if expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Calculate approximate cache size in bytes
   * 
   * @returns Approximate cache size
   */
  private calculateCacheSize(): number {
    let size = 0;
    
    for (const [key, entry] of this.cache) {
      try {
        const keySize = new Blob([key]).size;
        const dataSize = new Blob([JSON.stringify(entry.data)]).size;
        size += keySize + dataSize + 24; // Add overhead for timestamp and ttl
      } catch (error) {
        // Fallback calculation if Blob is not available
        size += key.length * 2; // Rough estimate for string size
        size += JSON.stringify(entry.data).length * 2;
        size += 24;
      }
    }
    
    return size;
  }

  /**
   * Create hash for filter criteria (for cache key)
   * 
   * @param filters - Filter criteria object
   * @returns Hash string
   */
  static createFilterHash(filters: any): string {
    try {
      const filterString = JSON.stringify(filters, Object.keys(filters).sort());
      return btoa(filterString).replace(/[^a-zA-Z0-9]/g, '');
    } catch (error) {
      // Fallback hash creation
      return Object.keys(filters)
        .sort()
        .map(key => `${key}:${filters[key]}`)
        .join('|')
        .replace(/[^a-zA-Z0-9|:]/g, '');
    }
  }
} 