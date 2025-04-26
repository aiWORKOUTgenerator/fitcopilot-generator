/**
 * Hook for generating workout plans
 * 
 * This hook provides a simplified interface to the workout generator context
 * and adds additional functionality specifically for the workout generation process.
 */
import { useCallback } from 'react';
import { WorkoutFormParams, GeneratedWorkout } from '../types/workout';
import { useWorkoutGenerator as useWorkoutGeneratorContext } from '../context/WorkoutGeneratorContext';
import { useErrorHandler } from './useErrorHandler';
import { usePerformanceCache } from './usePerformanceCache';

/**
 * Enhanced hook for workout generation that wraps the context
 * 
 * @returns Methods and state for workout generation
 */
export function useWorkoutGenerator() {
  const { state, generateWorkout, dispatch } = useWorkoutGeneratorContext();
  const { handleError } = useErrorHandler();
  const { getCached, setCached } = usePerformanceCache();
  
  const { status, loading, errorMessage } = state.ui;
  const { formValues, generatedWorkout } = state.domain;
  
  /**
   * Start the workout generation process
   * 
   * @param workoutParams - Parameters for the workout generation
   */
  const startGeneration = useCallback(async (workoutParams: Partial<WorkoutFormParams>) => {
    try {
      // Ensure all required fields have default values if missing
      const completeParams: WorkoutFormParams = {
        duration: workoutParams.duration || 30,
        difficulty: workoutParams.difficulty || 'intermediate',
        goals: workoutParams.goals || 'general-fitness',
        equipment: workoutParams.equipment || [],
        restrictions: workoutParams.restrictions || '',
      };
      
      // First, set the status to submitting
      dispatch({ type: 'SET_STEP', payload: 'submitting' });
      
      // Check if we have a cached result for these parameters
      const cachedWorkout = getCached(completeParams);
      
      if (cachedWorkout) {
        // Log this as a cache hit
        handleError(null, {
          componentName: 'useWorkoutGenerator',
          action: 'startGeneration',
          additionalData: { status: 'cache-hit', params: completeParams }
        });
        
        // Update the state with the cached workout
        dispatch({ type: 'SET_RESULT', payload: cachedWorkout });
        dispatch({ type: 'SET_STEP', payload: 'completed' });
        
        return cachedWorkout;
      }
      
      // No cache hit, proceed with API call
      dispatch({ type: 'SET_STEP', payload: 'generating' });
      
      // This will return the workout data directly if successful, or throw an error if not
      const workoutData = await generateWorkout(completeParams);
      
      // If we get here, generation was successful
      handleError(null, {
        componentName: 'useWorkoutGenerator',
        action: 'startGeneration',
        additionalData: { status: 'success' }
      });
      
      // Cache the result for future use
      setCached(completeParams, workoutData);
      
      // We don't need to do anything else as the context already updated the state
      return workoutData;
    } catch (error) {
      // Use centralized error handling
      handleError(error, {
        componentName: 'useWorkoutGenerator',
        action: 'startGeneration',
        additionalData: { workoutParams }
      });
      
      // Set the state to error
      dispatch({ type: 'SET_STEP', payload: 'error' });
      
      // Re-throw the error for the UI component to handle if needed
      throw error;
    }
  }, [generateWorkout, handleError, getCached, setCached, dispatch]);
  
  /**
   * Reset the generator state
   */
  const resetGenerator = useCallback(() => {
    dispatch({ type: 'RESET_GENERATOR' });
  }, [dispatch]);
  
  return {
    // State
    status,
    loading,
    error: errorMessage,
    workout: generatedWorkout,
    
    // Form values
    formValues,
    
    // Methods
    startGeneration,
    resetGenerator,
    
    // Computed states for UI
    isGenerating: status === 'generating' || status === 'submitting',
    isCompleted: status === 'completed',
    hasError: status === 'error',
  };
} 