/**
 * Workout caching utilities
 * Manages storing and retrieving workout data from localStorage
 */

const CACHE_KEY_PREFIX = 'fitcopilot_workout_';
const RECENT_WORKOUT_ID_KEY = 'fitcopilot_recent_workout_id';

/**
 * Save workout data to localStorage
 * 
 * @param postId - The workout post ID
 * @param workout - The workout data to cache
 */
export function cacheWorkout(postId: number, workout: any): void {
  try {
    localStorage.setItem(`${CACHE_KEY_PREFIX}${postId}`, JSON.stringify(workout));
    localStorage.setItem(RECENT_WORKOUT_ID_KEY, String(postId));
  } catch (e) {
    console.warn('Failed to cache workout:', e);
  }
}

/**
 * Retrieve cached workout data by post ID
 * 
 * @param postId - The workout post ID
 * @returns The cached workout data or null if not found
 */
export function getCachedWorkout(postId: number): any | null {
  try {
    const cachedData = localStorage.getItem(`${CACHE_KEY_PREFIX}${postId}`);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (e) {
    console.warn('Failed to retrieve cached workout:', e);
    return null;
  }
}

/**
 * Get the most recently generated workout ID
 * 
 * @returns The most recent workout post ID or null if none exists
 */
export function getRecentWorkoutId(): number | null {
  try {
    const recentId = localStorage.getItem(RECENT_WORKOUT_ID_KEY);
    return recentId ? parseInt(recentId, 10) : null;
  } catch (e) {
    console.warn('Failed to retrieve recent workout ID:', e);
    return null;
  }
}

/**
 * Clear a specific cached workout
 * 
 * @param postId - The workout post ID to clear
 */
export function clearCachedWorkout(postId: number): void {
  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${postId}`);
    
    // If this was the recent workout, clear that reference too
    const recentId = getRecentWorkoutId();
    if (recentId === postId) {
      localStorage.removeItem(RECENT_WORKOUT_ID_KEY);
    }
  } catch (e) {
    console.warn('Failed to clear cached workout:', e);
  }
}

/**
 * Clear all cached workouts
 */
export function clearAllCachedWorkouts(): void {
  try {
    // Find all workout cache keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all found keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem(RECENT_WORKOUT_ID_KEY);
  } catch (e) {
    console.warn('Failed to clear all cached workouts:', e);
  }
} 