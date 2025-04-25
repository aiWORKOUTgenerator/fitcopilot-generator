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

/**
 * Enhanced hook for workout generation that wraps the context
 * 
 * @returns Methods and state for workout generation
 */
export function useWorkoutGenerator() {
  const { state, generateWorkout, dispatch } = useWorkoutGeneratorContext();
  const { handleError } = useErrorHandler();
  
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
      
      // This will return the workout data directly if successful, or throw an error if not
      const workoutData = await generateWorkout(completeParams);
      
      // If we get here, generation was successful
      console.log('Generation successful in startGeneration');
      
      // We don't need to do anything else as the context already updated the state
      return workoutData;
    } catch (error) {
      // Use centralized error handling
      handleError(error, {
        componentName: 'useWorkoutGenerator',
        action: 'startGeneration',
        additionalData: { workoutParams }
      });
      
      // Re-throw the error for the UI component to handle if needed
      throw error;
    }
  }, [generateWorkout, handleError]);
  
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