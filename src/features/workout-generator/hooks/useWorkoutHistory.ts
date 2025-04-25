/**
 * useWorkoutHistory hook
 * 
 * Provides functionality to fetch, paginate, and manage a user's workout history
 */
import { useState, useEffect, useCallback } from 'react';
import { useApiRequest } from './useApiRequest';
import { Workout } from '../api/workoutApi';
import { API_ENDPOINTS } from '../api/endpoints';

export interface WorkoutHistoryState {
  workouts: Workout[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
  error: Error | null;
}

export interface WorkoutHistoryOptions {
  initialPage?: number;
  perPage?: number;
  autoLoad?: boolean;
}

/**
 * Hook to fetch and manage workout history
 * 
 * @param options - Configuration options for the hook
 * @returns Workout history state and control functions
 */
export function useWorkoutHistory(options: WorkoutHistoryOptions = {}) {
  const {
    initialPage = 1,
    perPage = 10,
    autoLoad = true
  } = options;

  // State for workout history
  const [state, setState] = useState<WorkoutHistoryState>({
    workouts: [],
    isLoading: false,
    hasMore: true,
    page: initialPage,
    error: null
  });

  // API request hook
  const {
    request,
    isLoading,
    error,
    abort
  } = useApiRequest<{
    workouts: Workout[];
    total: number;
    totalPages: number;
  }>();

  /**
   * Load a specific page of workout history
   */
  const loadPage = useCallback(async (page: number, append: boolean = false) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    const result = await request({
      url: `${API_ENDPOINTS.WORKOUTS}?page=${page}&per_page=${perPage}`,
      handleUnauthorized: true
    });

    if (result) {
      setState(prev => ({
        workouts: append ? [...prev.workouts, ...result.workouts] : result.workouts,
        isLoading: false,
        hasMore: page < result.totalPages,
        page,
        error: null
      }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error ? new Error(error.message) : null
      }));
      return false;
    }
  }, [request, perPage, error]);

  /**
   * Load the next page of workout history
   */
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return false;
    return loadPage(state.page + 1, true);
  }, [state.hasMore, state.isLoading, state.page, loadPage]);

  /**
   * Reload the current page of workout history
   */
  const refresh = useCallback(async () => {
    return loadPage(1, false);
  }, [loadPage]);

  // Initial load
  useEffect(() => {
    if (autoLoad) {
      loadPage(initialPage, false);
    }
    
    return () => {
      abort();
    };
  }, [autoLoad, initialPage, loadPage, abort]);

  /**
   * Delete a workout from history
   */
  const deleteWorkout = useCallback(async (workoutId: number) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    const deleteResult = await request({
      url: `${API_ENDPOINTS.WORKOUTS}/${workoutId}`,
      options: {
        method: 'DELETE'
      },
      handleUnauthorized: true
    });

    if (deleteResult || !error) {
      // Successfully deleted, update local state
      setState(prev => ({
        ...prev,
        workouts: prev.workouts.filter(workout => workout.id !== workoutId),
        isLoading: false
      }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error ? new Error(error.message) : new Error('Failed to delete workout')
      }));
      return false;
    }
  }, [request, error]);

  /**
   * Mark a workout as completed
   */
  const markWorkoutCompleted = useCallback(async (workoutId: number) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    const completionResult = await request({
      url: `${API_ENDPOINTS.WORKOUTS}/${workoutId}/complete`,
      options: {
        method: 'POST'
      },
      handleUnauthorized: true
    });

    if (completionResult) {
      // Successfully marked as completed, update local state
      setState(prev => ({
        ...prev,
        workouts: prev.workouts.map(workout => 
          workout.id === workoutId 
            ? { ...workout, completed: true, completedAt: new Date().toISOString() }
            : workout
        ),
        isLoading: false
      }));
      return true;
    } else {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error ? new Error(error.message) : new Error('Failed to mark workout as completed')
      }));
      return false;
    }
  }, [request, error]);

  return {
    ...state,
    loadMore,
    refresh,
    deleteWorkout,
    markWorkoutCompleted,
    isLoading
  };
} 