/**
 * Hook for handling workout generation
 */

import { useCallback } from 'react';
import { useWorkoutGenerator } from '../context/WorkoutGeneratorContext';
import { useWorkoutForm } from './useWorkoutForm';
import { generateWorkout } from '../api/workoutApi';
import { ApiError, ApiErrorType } from '@common/api/client';
import { GenerationStatus } from '../context/WorkoutGeneratorContext';

/**
 * Hook for workout generation process
 */
export function useWorkoutGeneration() {
  const { state, dispatch } = useWorkoutGenerator();
  const { formValues, validateForm, isValid } = useWorkoutForm();
  const { status, errorMessage } = state.ui;
  
  /**
   * Start the workout generation process
   */
  const startGeneration = useCallback(async () => {
    // Validate the form before submitting
    if (!validateForm()) {
      return Promise.reject(new Error('Please fix the form errors before submitting.'));
    }
    
    // Ensure all required fields are present
    if (!isValid) {
      return Promise.reject(new Error('Please fill in all required fields.'));
    }
    
    try {
      // Update UI state to indicate generation is starting
      dispatch({ type: 'GENERATION_START' });
      
      // After a short delay, update UI to show we're processing
      setTimeout(() => {
        dispatch({ type: 'GENERATION_PROCESSING' });
      }, 500);
      
      // Call the API to generate the workout
      const workout = await generateWorkout({
        duration: formValues.duration!,
        difficulty: formValues.difficulty!,
        goals: formValues.goals!,
        equipment: formValues.equipment || [],
        restrictions: formValues.restrictions,
      });
      
      // Update state with the generated workout
      dispatch({ type: 'GENERATION_SUCCESS', payload: workout });
      
      return workout;
    } catch (error) {
      // Handle API errors
      let errorMessage = 'An unexpected error occurred.';
      
      if (error instanceof ApiError) {
        switch (error.type) {
          case ApiErrorType.VALIDATION:
            errorMessage = 'Please check your workout parameters and try again.';
            break;
          case ApiErrorType.NETWORK:
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case ApiErrorType.TIMEOUT:
            errorMessage = 'The request timed out. Please try again.';
            break;
          case ApiErrorType.UNAUTHORIZED:
            errorMessage = 'You must be logged in to generate workouts.';
            break;
          case ApiErrorType.SERVER:
            errorMessage = 'The server encountered an error. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Update state with the error
      dispatch({ type: 'GENERATION_ERROR', payload: errorMessage });
      
      // Re-throw the error with a user-friendly message
      return Promise.reject(new Error(errorMessage));
    }
  }, [dispatch, formValues, isValid, validateForm]);
  
  /**
   * Reset the generator to its initial state
   */
  const resetGenerator = useCallback(() => {
    dispatch({ type: 'RESET_GENERATOR' });
  }, [dispatch]);
  
  return {
    generateWorkout: startGeneration,
    startGeneration,
    resetGenerator,
    status,
    generationStatus: status,
    errorMessage,
    isLoading: status === 'submitting' || status === 'generating',
    isError: status === 'error',
    isSuccess: status === 'completed',
    isIdle: status === 'idle',
  };
} 