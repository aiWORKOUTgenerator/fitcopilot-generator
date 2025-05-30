/**
 * Custom hook for managing workout list state
 * 
 * Provides functionality to load, refresh, and manage workout lists
 * with proper error handling and loading states.
 */
import { useState, useEffect, useCallback } from 'react';
import { GeneratedWorkout } from '../types/workout';
import { getWorkouts } from '../services/workoutService';

interface UseWorkoutListOptions {
  /** Automatically load workouts on mount */
  autoLoad?: boolean;
  /** Page number for pagination */
  page?: number;
  /** Number of workouts per page */
  perPage?: number;
}

interface UseWorkoutListReturn {
  /** Array of workouts */
  workouts: GeneratedWorkout[];
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Function to refresh the workout list */
  refreshWorkouts: () => Promise<void>;
  /** Function to manually load workouts */
  loadWorkouts: () => Promise<void>;
  /** Function to add a workout to the list (optimistic update) */
  addWorkout: (workout: GeneratedWorkout) => void;
  /** Function to remove a workout from the list (optimistic update) */
  removeWorkout: (workoutId: string | number) => void;
  /** Function to update a workout in the list (optimistic update) */
  updateWorkout: (workout: GeneratedWorkout) => void;
}

/**
 * Hook for managing workout list state
 */
export const useWorkoutList = (options: UseWorkoutListOptions = {}): UseWorkoutListReturn => {
  const { autoLoad = true, page = 1, perPage = 10 } = options;
  
  const [workouts, setWorkouts] = useState<GeneratedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedWorkouts = await getWorkouts(page, perPage);
      // Ensure we always get an array, even if API returns null/undefined
      const workoutArray = Array.isArray(fetchedWorkouts) ? fetchedWorkouts : [];
      setWorkouts(workoutArray);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load workouts';
      setError(errorMessage);
      console.error('Failed to load workouts:', err);
      // Set empty array on error to prevent undefined issues
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, perPage]);

  const refreshWorkouts = useCallback(async () => {
    await loadWorkouts();
  }, [loadWorkouts]);

  // Optimistic updates for better UX
  const addWorkout = useCallback((workout: GeneratedWorkout) => {
    setWorkouts(prev => [workout, ...prev]);
  }, []);

  const removeWorkout = useCallback((workoutId: string | number) => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  }, []);

  const updateWorkout = useCallback((updatedWorkout: GeneratedWorkout) => {
    setWorkouts(prev => prev.map(w => 
      w.id === updatedWorkout.id ? updatedWorkout : w
    ));
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadWorkouts();
    }
  }, [autoLoad, loadWorkouts]);

  return {
    workouts,
    isLoading,
    error,
    refreshWorkouts,
    loadWorkouts,
    addWorkout,
    removeWorkout,
    updateWorkout
  };
}; 