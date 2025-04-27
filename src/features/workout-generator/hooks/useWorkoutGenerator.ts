/**
 * Hook for generating workout plans
 * 
 * This hook provides a comprehensive interface for workout generation,
 * combining context-based state management with direct API access.
 * It handles all phases of the workout generation process including caching and error handling.
 */
import { useCallback, useState, useEffect } from 'react';
import { WorkoutFormParams, GeneratedWorkout } from '../types/workout';
import { useWorkoutGenerator as useWorkoutGeneratorContext } from '../context/WorkoutGeneratorContext';
import { useErrorHandler } from './useErrorHandler';
import { usePerformanceCache } from './usePerformanceCache';
import { generateWorkoutDirect } from '../api/workoutApi';
import { useWorkoutForm } from './useWorkoutForm';
import { 
  cacheWorkout, 
  getCachedWorkout, 
  getRecentWorkoutId,
} from '../utils/workoutCache';

// Status types unified between direct and context-based generation
export type GenerationStatus = 'idle' | 'starting' | 'submitting' | 'generating' | 'completed' | 'error';

/**
 * Enhanced hook for workout generation
 * 
 * @returns Methods and state for workout generation
 */
export function useWorkoutGenerator() {
  // Context-based state and methods
  const { state, generateWorkout, dispatch } = useWorkoutGeneratorContext();
  const { handleError } = useErrorHandler();
  const { getCached, setCached } = usePerformanceCache();
  const { formValues, validateForm, isValid } = useWorkoutForm();
  
  // Local state for direct generation mode
  const [directStatus, setDirectStatus] = useState<GenerationStatus>('idle');
  const [directError, setDirectError] = useState<string | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [directWorkout, setDirectWorkout] = useState<GeneratedWorkout | null>(null);

  // Extract values from context state
  const { status: contextStatus, loading, errorMessage } = state.ui;
  const { formValues: contextFormValues, generatedWorkout: contextWorkout } = state.domain;
  
  // Check for cached workout on initial load for direct mode
  useEffect(() => {
    const recentWorkoutId = getRecentWorkoutId();
    if (recentWorkoutId) {
      const cachedWorkout = getCachedWorkout(recentWorkoutId);
      if (cachedWorkout) {
        setPostId(recentWorkoutId);
        setDirectWorkout(cachedWorkout);
        setDirectStatus('completed');
      }
    }
  }, []);

  /**
   * Start the workout generation process using the context
   * 
   * @param workoutParams - Parameters for the workout generation
   */
  const startGeneration = useCallback(async (workoutParams: Partial<WorkoutFormParams>) => {
    try {
      // Validate the form before submitting
      if (!validateForm()) {
        throw new Error('Please fix the form errors before submitting.');
      }
      
      // Ensure all required fields are present
      if (!isValid) {
        throw new Error('Please fill in all required fields.');
      }

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
  }, [generateWorkout, handleError, getCached, setCached, dispatch, validateForm, isValid]);

  /**
   * Start direct workout generation with the API
   * 
   * @param request - The specific workout request
   * @param options - Additional options for the generation
   */
  const startDirectGeneration = useCallback(async (request: string, options: Record<string, unknown> = {}) => {
    // Reset state
    setDirectError(null);
    setDirectStatus('starting');
    setDirectWorkout(null);
    setPostId(null);
    
    const startTime = Date.now();

    try {
      // Call the API to generate the workout - ensure specific_request is included
      const result = await generateWorkoutDirect(request, {
        specific_request: request, // Explicitly set this in case it's not already in the function
        ...options,
        mode: 'sync'
      });
      
      // Update state with the generated workout
      setDirectWorkout(result.data.workout);
      setPostId(result.data.post_id);
      setDirectStatus('completed');

      // Cache the workout
      cacheWorkout(result.data.post_id, result.data.workout);

      // Log analytics if a tracking function is available
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('workout_created', {
          processing_mode: 'sync',
          generation_time_ms: Date.now() - startTime,
          post_id: result.data.post_id
        });
      }
      
      return result.data.workout;
    } catch (err: unknown) {
      // Update state with the error
      setDirectStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setDirectError(errorMsg);
      
      // Log error if tracking is available
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('workout_generation_error', {
          error_message: err instanceof Error ? err.message : 'Unknown error',
          generation_time_ms: Date.now() - startTime
        });
      }
      
      throw new Error(errorMsg);
    }
  }, []);
  
  /**
   * Reset the generator state
   */
  const resetGenerator = useCallback(() => {
    // Reset context state
    dispatch({ type: 'RESET_GENERATOR' });
    
    // Reset direct generation state
    setDirectStatus('idle');
    setDirectError(null);
    setPostId(null);
    setDirectWorkout(null);
  }, [dispatch]);
  
  // Determine effective status (both generators)
  const effectiveStatus = directStatus !== 'idle' ? directStatus : contextStatus;
  const effectiveError = directError || errorMessage;
  const effectiveWorkout = directWorkout || contextWorkout;
  
  return {
    // State
    status: effectiveStatus,
    loading: loading || ['starting', 'submitting', 'generating'].includes(directStatus),
    error: effectiveError,
    workout: effectiveWorkout,
    postId,
    
    // Form values
    formValues: contextFormValues,
    
    // Methods
    startGeneration,
    resetGenerator,
    generateWorkout: startGeneration, // Alias for backward compatibility
    startDirectGeneration,
    
    // Computed states for UI
    isGenerating: ['generating', 'submitting', 'starting'].includes(effectiveStatus),
    isCompleted: effectiveStatus === 'completed',
    hasError: effectiveStatus === 'error',
    isIdle: effectiveStatus === 'idle',
  };
} 