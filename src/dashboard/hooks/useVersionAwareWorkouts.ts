/**
 * Version-Aware Workouts Hook
 * 
 * Enhanced hook that integrates with the version history API to provide
 * up-to-date workout data with version tracking for accurate card display.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkoutContext } from '../../features/workout-generator/context/WorkoutContext';
import { VersionAwareWorkoutService } from '../components/SavedWorkoutsTab/services/VersionAwareWorkoutService';

interface EnhancedWorkoutData {
  // Standard workout fields
  id: string | number;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: any[];
  equipment: string[];
  
  // Version metadata
  version: number;
  lastModified: string;
  modifiedBy: number;
  changeType: string;
  changeSummary: string;
  
  // Status indicators
  isLatestVersion: boolean;
  hasRecentChanges: boolean;
  staleness: 'fresh' | 'stale' | 'expired';
}

interface UseVersionAwareWorkoutsResult {
  // Enhanced workouts with version info
  workouts: EnhancedWorkoutData[];
  
  // Loading states
  isLoading: boolean;
  isLoadingVersions: boolean;
  
  // Error states
  error: string | null;
  versionErrors: Map<string, string>;
  
  // Actions
  refreshWorkouts: () => Promise<void>;
  refreshWorkoutVersions: (workoutIds?: (string | number)[], forceRefresh?: boolean) => Promise<void>;
  markWorkoutAsStale: (workoutId: string | number) => void;
  
  // Stats
  stats: {
    totalWorkouts: number;
    freshWorkouts: number;
    staleWorkouts: number;
    expiredWorkouts: number;
    recentlyUpdated: number;
  };
}

/**
 * Hook for managing version-aware workout data
 */
export const useVersionAwareWorkouts = (): UseVersionAwareWorkoutsResult => {
  // Base workout context
  const { 
    workouts: baseWorkouts, 
    isLoading: baseIsLoading, 
    error: baseError,
    refreshWorkouts: baseRefreshWorkouts
  } = useWorkoutContext();
  
  // Version-aware state
  const [enhancedWorkouts, setEnhancedWorkouts] = useState<EnhancedWorkoutData[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [versionErrors, setVersionErrors] = useState<Map<string, string>>(new Map());
  const [lastVersionFetch, setLastVersionFetch] = useState<number>(0);
  
  // Refresh base workouts
  const refreshWorkouts = useCallback(async () => {
    console.log('[useVersionAwareWorkouts] Refreshing base workouts...');
    await baseRefreshWorkouts();
  }, [baseRefreshWorkouts]);
  
  // Mark workout as stale (will trigger refresh on next access)
  const markWorkoutAsStale = useCallback((workoutId: string | number) => {
    setEnhancedWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, staleness: 'stale' as const }
          : workout
      )
    );
  }, []);
  
  // Fetch version information for workouts
  const refreshWorkoutVersions = useCallback(async (workoutIds?: (string | number)[], forceRefresh: boolean = false) => {
    if (!baseWorkouts || baseWorkouts.length === 0) {
      console.log('[useVersionAwareWorkouts] No base workouts to enhance');
      return;
    }
    
    const targetIds = workoutIds || baseWorkouts.map(w => w.id).filter(Boolean);
    
    if (targetIds.length === 0) {
      console.log('[useVersionAwareWorkouts] No valid workout IDs to fetch versions for');
      return;
    }
    
    // Check if we should skip due to recent fetch (unless forced)
    if (!forceRefresh) {
      const timeSinceLastFetch = Date.now() - lastVersionFetch;
      if (timeSinceLastFetch < 5000) { // 5 second minimum between auto-refreshes
        console.log(`[useVersionAwareWorkouts] Skipping refresh, last fetch was ${Math.round(timeSinceLastFetch/1000)}s ago`);
        return;
      }
    }
    
    console.log(`[useVersionAwareWorkouts] Fetching version info for ${targetIds.length} workouts (forceRefresh: ${forceRefresh})`);
    setIsLoadingVersions(true);
    
    try {
      // Fetch enhanced workout data with version info
      const enhancedWorkoutPromises = targetIds.map(async (id) => {
        try {
          return await VersionAwareWorkoutService.fetchWorkoutWithVersion(id);
        } catch (error) {
          console.error(`[useVersionAwareWorkouts] Error fetching version for workout ${id}:`, error);
          
          // Fallback: create enhanced workout from base data
          const baseWorkout = baseWorkouts.find(w => w.id === id);
          if (baseWorkout) {
            console.log(`[useVersionAwareWorkouts] Creating fallback for workout ${id}:`, baseWorkout);
            
            // Enhanced fallback data extraction
            let exercises = baseWorkout.exercises || [];
            let equipment = baseWorkout.equipment || [];
            
            // Check for nested exercise data
            if (exercises.length === 0 && baseWorkout.sections) {
              exercises = baseWorkout.sections.flatMap((s: any) => s.exercises || []);
            }
            
            // Check for different equipment field names
            if (equipment.length === 0) {
              equipment = baseWorkout.required_equipment || 
                         baseWorkout.workout_equipment || 
                         [];
            }
            
            return {
              id: baseWorkout.id,
              title: baseWorkout.title || baseWorkout.post_title || 'Untitled Workout',
              description: baseWorkout.description || baseWorkout.post_content || baseWorkout.content || '',
              duration: baseWorkout.duration || baseWorkout.workout_duration || 30,
              difficulty: (baseWorkout.difficulty || baseWorkout.workout_difficulty || 'intermediate') as any,
              exercises,
              equipment,
              
              // Default version info
              version: 1,
              lastModified: baseWorkout.lastModified || baseWorkout.updated_at || new Date().toISOString(),
              modifiedBy: 0,
              changeType: 'unknown',
              changeSummary: 'Version info unavailable',
              
              // Conservative status
              isLatestVersion: false,
              hasRecentChanges: false,
              staleness: 'expired' as const
            } as EnhancedWorkoutData;
          }
          
          throw error;
        }
      });
      
      const enhancedResults = await Promise.allSettled(enhancedWorkoutPromises);
      
      // Process results and track errors
      const newEnhancedWorkouts: EnhancedWorkoutData[] = [];
      const newErrors = new Map<string, string>();
      
      enhancedResults.forEach((result, index) => {
        const workoutId = targetIds[index];
        
        if (result.status === 'fulfilled') {
          newEnhancedWorkouts.push(result.value);
        } else {
          newErrors.set(workoutId.toString(), result.reason?.message || 'Unknown error');
          console.error(`[useVersionAwareWorkouts] Failed to enhance workout ${workoutId}:`, result.reason);
        }
      });
      
      setEnhancedWorkouts(newEnhancedWorkouts);
      setVersionErrors(newErrors);
      setLastVersionFetch(Date.now());
      
      console.log(`[useVersionAwareWorkouts] Successfully enhanced ${newEnhancedWorkouts.length} workouts`);
      
    } catch (error) {
      console.error('[useVersionAwareWorkouts] Error fetching workout versions:', error);
      setVersionErrors(prev => new Map(prev.set('global', 'Failed to fetch workout versions')));
    } finally {
      setIsLoadingVersions(false);
    }
  }, [baseWorkouts]);
  
  // Auto-refresh version info when base workouts change
  useEffect(() => {
    if (baseWorkouts && baseWorkouts.length > 0) {
      // Only refresh if we haven't fetched recently (debounce), but be more aggressive on first load
      const timeSinceLastFetch = Date.now() - lastVersionFetch;
      const shouldRefresh = lastVersionFetch === 0 || timeSinceLastFetch > 30000; // 30 seconds debounce
      
      if (shouldRefresh) {
        console.log('[useVersionAwareWorkouts] Auto-refreshing version info due to base workouts change');
        refreshWorkoutVersions(undefined, false); // Auto-refresh, respect debounce
      } else {
        console.log(`[useVersionAwareWorkouts] Skipping auto-refresh, last fetch was ${Math.round(timeSinceLastFetch/1000)}s ago`);
      }
    }
  }, [baseWorkouts, refreshWorkoutVersions, lastVersionFetch]);

  // Listen for individual workout refresh events
  useEffect(() => {
    const handleWorkoutRefresh = (event: CustomEvent) => {
      const { workoutId } = event.detail;
      console.log(`🔄 Individual workout refresh triggered for ${workoutId}`);
      refreshWorkoutVersions([workoutId], true); // Force refresh for individual workouts
    };

    window.addEventListener('refreshWorkout', handleWorkoutRefresh as EventListener);
    
    return () => {
      window.removeEventListener('refreshWorkout', handleWorkoutRefresh as EventListener);
    };
  }, [refreshWorkoutVersions]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const total = enhancedWorkouts.length;
    const fresh = enhancedWorkouts.filter(w => w.staleness === 'fresh').length;
    const stale = enhancedWorkouts.filter(w => w.staleness === 'stale').length;
    const expired = enhancedWorkouts.filter(w => w.staleness === 'expired').length;
    const recentlyUpdated = enhancedWorkouts.filter(w => w.hasRecentChanges).length;
    
    return {
      totalWorkouts: total,
      freshWorkouts: fresh,
      staleWorkouts: stale,
      expiredWorkouts: expired,
      recentlyUpdated
    };
  }, [enhancedWorkouts]);
  
  return {
    workouts: enhancedWorkouts,
    isLoading: baseIsLoading,
    isLoadingVersions,
    error: baseError,
    versionErrors,
    refreshWorkouts,
    refreshWorkoutVersions,
    markWorkoutAsStale,
    stats
  };
};

/**
 * Hook for getting version freshness summary for UI display
 */
export const useWorkoutDataQuality = (stats: UseVersionAwareWorkoutsResult['stats']): {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
  color: string;
} => {
  return useMemo(() => {
    const { totalWorkouts, freshWorkouts, expiredWorkouts } = stats;
    
    if (totalWorkouts === 0) {
      return {
        quality: 'excellent',
        message: 'No workouts to assess',
        color: '#6b7280'
      };
    }
    
    const freshPercentage = (freshWorkouts / totalWorkouts) * 100;
    const expiredPercentage = (expiredWorkouts / totalWorkouts) * 100;
    
    if (freshPercentage >= 80) {
      return {
        quality: 'excellent',
        message: 'All workout data is up-to-date',
        color: '#10b981'
      };
    } else if (freshPercentage >= 60) {
      return {
        quality: 'good',
        message: 'Most workout data is current',
        color: '#f59e0b'
      };
    } else if (expiredPercentage < 30) {
      return {
        quality: 'fair',
        message: 'Some workout data may be outdated',
        color: '#f59e0b'
      };
    } else {
      return {
        quality: 'poor',
        message: 'Many workouts need data refresh',
        color: '#ef4444'
      };
    }
  }, [stats]);
}; 