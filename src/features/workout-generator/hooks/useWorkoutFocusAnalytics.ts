/**
 * Workout Focus Analytics Hook
 * 
 * React hook for integrating workout focus analytics tracking with the WorkoutFocusCard.
 * Provides last selection retrieval and automatic tracking on selection changes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  workoutFocusAnalytics, 
  WorkoutFocusSelection, 
  WorkoutFocusAnalytics,
  WorkoutFocusContext 
} from '../../analytics/services/workoutFocusAnalytics';

export interface UseWorkoutFocusAnalyticsOptions {
  /**
   * Whether to automatically load the last selection on mount
   */
  autoLoadLastSelection?: boolean;
  
  /**
   * Whether to automatically track selection changes
   */
  autoTrack?: boolean;
  
  /**
   * Context to include with tracking calls
   */
  context?: WorkoutFocusContext;
  
  /**
   * Callback when last selection is loaded
   */
  onLastSelectionLoaded?: (selection: WorkoutFocusSelection | null) => void;
  
  /**
   * Callback when tracking succeeds
   */
  onTrackingSuccess?: (focus: string) => void;
  
  /**
   * Callback when tracking fails
   */
  onTrackingError?: (error: string) => void;
}

export interface UseWorkoutFocusAnalyticsReturn {
  /**
   * The last workout focus selection (cached indefinitely)
   */
  lastSelection: WorkoutFocusSelection | null;
  
  /**
   * Whether the last selection is currently loading
   */
  isLoadingLastSelection: boolean;
  
  /**
   * Whether a tracking operation is in progress
   */
  isTracking: boolean;
  
  /**
   * Analytics data for the user
   */
  analytics: WorkoutFocusAnalytics | null;
  
  /**
   * Whether analytics are currently loading
   */
  isLoadingAnalytics: boolean;
  
  /**
   * Track a workout focus selection
   */
  trackFocus: (focus: string, context?: WorkoutFocusContext) => Promise<boolean>;
  
  /**
   * Refresh the last selection from server
   */
  refreshLastSelection: () => Promise<void>;
  
  /**
   * Load analytics data
   */
  loadAnalytics: (forceRefresh?: boolean) => Promise<void>;
  
  /**
   * Check if user has any previous selections
   */
  hasPreviousSelection: boolean;
  
  /**
   * Get the most popular focus for the user
   */
  mostPopularFocus: string | null;
  
  /**
   * Clear all cached data
   */
  clearCache: () => void;
  
  /**
   * Error state
   */
  error: string | null;
}

export const useWorkoutFocusAnalytics = (
  options: UseWorkoutFocusAnalyticsOptions = {}
): UseWorkoutFocusAnalyticsReturn => {
  const {
    autoLoadLastSelection = true,
    autoTrack = true,
    context = {},
    onLastSelectionLoaded,
    onTrackingSuccess,
    onTrackingError
  } = options;

  // State
  const [lastSelection, setLastSelection] = useState<WorkoutFocusSelection | null>(null);
  const [isLoadingLastSelection, setIsLoadingLastSelection] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [analytics, setAnalytics] = useState<WorkoutFocusAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent infinite loops
  const hasInitialLoadAttempted = useRef(false);
  const lastLoadAttemptTime = useRef(0);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds between retries

  // Derived state
  const hasPreviousSelection = lastSelection !== null;
  const mostPopularFocus = analytics?.most_popular || null;

  /**
   * Load the last workout focus selection with error handling and retry logic
   */
  const refreshLastSelection = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingLastSelection) {
      return;
    }
    
    // Prevent rapid retries
    const now = Date.now();
    if (now - lastLoadAttemptTime.current < retryDelay && retryCount.current >= maxRetries) {
      console.warn('[useWorkoutFocusAnalytics] Max retries reached, skipping load attempt');
      return;
    }
    
    setIsLoadingLastSelection(true);
    setError(null);
    lastLoadAttemptTime.current = now;
    
    try {
      const selection = await workoutFocusAnalytics.getLastWorkoutFocus(true);
      setLastSelection(selection);
      retryCount.current = 0; // Reset retry count on success
      
      if (onLastSelectionLoaded) {
        onLastSelectionLoaded(selection);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWorkoutFocusAnalytics] Last selection loaded:', selection);
      }
    } catch (err) {
      retryCount.current++;
      const errorMessage = err instanceof Error ? err.message : 'Failed to load last selection';
      
      // Only set error state if we've exhausted retries
      if (retryCount.current >= maxRetries) {
        setError(errorMessage);
        console.error('[useWorkoutFocusAnalytics] Max retries reached, giving up:', err);
      } else {
        console.warn(`[useWorkoutFocusAnalytics] Load attempt ${retryCount.current} failed, will retry:`, err);
      }
    } finally {
      setIsLoadingLastSelection(false);
    }
  }, [onLastSelectionLoaded, isLoadingLastSelection]);

  /**
   * Track a workout focus selection
   */
  const trackFocus = useCallback(async (
    focus: string, 
    additionalContext: WorkoutFocusContext = {}
  ): Promise<boolean> => {
    if (!autoTrack) {
      console.warn('[useWorkoutFocusAnalytics] Auto-tracking is disabled');
      return false;
    }

    setIsTracking(true);
    setError(null);
    
    try {
      const mergedContext = {
        ...context,
        ...additionalContext,
        previous_focus: lastSelection?.focus
      };
      
      const result = await workoutFocusAnalytics.trackWorkoutFocus(focus, mergedContext);
      
      if (result.success) {
        // Update local state immediately
        const newSelection: WorkoutFocusSelection = {
          focus,
          timestamp: Date.now(),
          context: mergedContext
        };
        setLastSelection(newSelection);
        
        if (onTrackingSuccess) {
          onTrackingSuccess(focus);
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('[useWorkoutFocusAnalytics] Focus tracked successfully:', focus);
        }
        
        return true;
      } else {
        const errorMessage = result.message || 'Failed to track focus';
        setError(errorMessage);
        
        if (onTrackingError) {
          onTrackingError(errorMessage);
        }
        
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track focus';
      setError(errorMessage);
      
      if (onTrackingError) {
        onTrackingError(errorMessage);
      }
      
      console.error('[useWorkoutFocusAnalytics] Error tracking focus:', err);
      return false;
    } finally {
      setIsTracking(false);
    }
  }, [autoTrack, context, lastSelection?.focus, onTrackingSuccess, onTrackingError]);

  /**
   * Load analytics data
   */
  const loadAnalytics = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingAnalytics(true);
    setError(null);
    
    try {
      const analyticsData = await workoutFocusAnalytics.getWorkoutFocusAnalytics(forceRefresh);
      setAnalytics(analyticsData);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[useWorkoutFocusAnalytics] Analytics loaded:', analyticsData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
      console.error('[useWorkoutFocusAnalytics] Error loading analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  /**
   * Clear all cached data
   */
  const clearCache = useCallback(() => {
    workoutFocusAnalytics.clearCache();
    setLastSelection(null);
    setAnalytics(null);
    setError(null);
    hasInitialLoadAttempted.current = false;
    retryCount.current = 0;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[useWorkoutFocusAnalytics] Cache cleared');
    }
  }, []);

  // Auto-load last selection on mount (only once)
  useEffect(() => {
    if (autoLoadLastSelection && !hasInitialLoadAttempted.current) {
      hasInitialLoadAttempted.current = true;
      refreshLastSelection();
    }
  }, [autoLoadLastSelection]); // Removed refreshLastSelection from dependencies to prevent loop

  return {
    lastSelection,
    isLoadingLastSelection,
    isTracking,
    analytics,
    isLoadingAnalytics,
    trackFocus,
    refreshLastSelection,
    loadAnalytics,
    hasPreviousSelection,
    mostPopularFocus,
    clearCache,
    error
  };
}; 