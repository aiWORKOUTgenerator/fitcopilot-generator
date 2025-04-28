/**
 * Hook for generating workout plans
 * 
 * This hook provides a comprehensive interface for workout generation,
 * combining context-based state management with direct API access.
 * It handles all phases of the workout generation process including caching and error handling.
 */
import { useCallback, useState, useEffect, useRef } from 'react';
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
  WorkoutData
} from '../utils/workoutCache';
import { WorkoutActionType } from '../context/actions';
import { createAbortableRequest } from '../api/client';

// Status types unified between direct and context-based generation
export type GenerationStatus = 'idle' | 'starting' | 'submitting' | 'generating' | 'completed' | 'error';

// Type adapter function to convert WorkoutData to GeneratedWorkout
function adaptWorkoutData(workout: WorkoutData): GeneratedWorkout {
  return {
    title: workout.title,
    sections: workout.sections.map(section => ({
      name: section.name,
      duration: section.duration,
      exercises: section.exercises.map(ex => ({
        name: ex.name,
        duration: ex.duration || "",
        description: ex.description,
        sets: ex.sets || 0,
        reps: ex.reps || 0
      }))
    }))
  };
}

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

  // AbortController references
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract values from context state
  const { status: contextStatus, loading, errorMessage } = state.ui;
  const { formValues: contextFormValues, generatedWorkout: contextWorkout } = state.domain;
  
  // Cleanup function to handle abort controllers and timeouts
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort('User cancelled request');
      } catch (e) {
        // Ignore errors during abort
      }
      abortControllerRef.current = null;
    }
    
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
      requestTimeoutRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  // Check for cached workout on initial load for direct mode
  useEffect(() => {
    const recentWorkoutId = getRecentWorkoutId();
    if (recentWorkoutId) {
      const cachedWorkout = getCachedWorkout(recentWorkoutId);
      if (cachedWorkout) {
        setPostId(recentWorkoutId);
        setDirectWorkout(adaptWorkoutData(cachedWorkout));
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
    // Clean up any existing requests
    cleanup();
    
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
      
      // First, set the status to submitting (start generation)
      dispatch({ type: WorkoutActionType.GENERATION_START });
      
      // Check if we have a cached result for these parameters
      const cachedWorkout = getCached(completeParams);
      
      if (cachedWorkout) {
        // Log this as a cache hit
        handleError(null, {
          componentName: 'useWorkoutGenerator',
          action: 'startGeneration',
          additionalData: { status: 'cache-hit', params: completeParams }
        });
        
        // For cached workouts, simulate a proper generation sequence
        // First set processing state to ensure proper step transition
        dispatch({ type: WorkoutActionType.GENERATION_PROCESSING });
        
        // Add a small delay to simulate processing and ensure proper step transitions
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Then update the state with the cached workout
        dispatch({ type: WorkoutActionType.GENERATION_SUCCESS, payload: cachedWorkout });
        
        return cachedWorkout;
      }
      
      // No cache hit, proceed with API call
      dispatch({ type: WorkoutActionType.GENERATION_PROCESSING });
      
      // Create an AbortController for this request
      const abortableRequest = createAbortableRequest<{data: GeneratedWorkout}>();
      abortControllerRef.current = new AbortController();
      
      // Set a timeout for the request (60 seconds)
      requestTimeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Request timed out');
          dispatch({ 
            type: WorkoutActionType.GENERATION_ERROR, 
            payload: 'The workout generation request timed out. Please try again.' 
          });
        }
      }, 60000);
      
      // This will return the workout data directly if successful, or throw an error if not
      const workoutData = await generateWorkout(completeParams);
      
      // Clear the timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      
      // Check if this request was cancelled before updating state
      // We're using the debug mode as a cancellation flag
      if (state.ui.debugMode) {
        // Request was cancelled, don't update with results
        console.log('Ignoring completed request because it was cancelled');
        // Reset the cancellation flag
        dispatch({ type: WorkoutActionType.TOGGLE_DEBUG_MODE, payload: false });
        return null;
      }
      
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
      // Clean up timeout if it exists
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      
      // Special handling for AbortError
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      
      // Only update error state if this wasn't a user-initiated abort
      if (!isAbortError || (isAbortError && error.message !== 'User cancelled request')) {
        // Use centralized error handling
        handleError(error, {
          componentName: 'useWorkoutGenerator',
          action: 'startGeneration',
          additionalData: { workoutParams }
        });
        
        // Set the state to error
        dispatch({ 
          type: WorkoutActionType.GENERATION_ERROR,
          payload: isAbortError ? 'Generation was cancelled.' : 'Failed to generate workout. Please try again.'
        });
      }
      
      // Re-throw the error for the UI component to handle if needed
      throw error;
    } finally {
      // Ensure AbortController is cleaned up
      abortControllerRef.current = null;
    }
  }, [generateWorkout, handleError, getCached, setCached, dispatch, validateForm, isValid, cleanup]);

  /**
   * Start direct workout generation with the API
   * 
   * @param request - The specific workout request
   * @param options - Additional options for the generation
   */
  const startDirectGeneration = useCallback(async (request: string, options: Record<string, unknown> = {}) => {
    // Clean up any existing requests
    cleanup();
    
    // Reset state
    setDirectError(null);
    setDirectStatus('starting');
    setDirectWorkout(null);
    setPostId(null);
    
    const startTime = Date.now();
    
    // Create an abortable request
    const abortableRequest = createAbortableRequest<any>();
    abortControllerRef.current = new AbortController();

    try {
      // Set a timeout for the request (60 seconds)
      requestTimeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort('Request timed out');
          setDirectError('The workout generation request timed out. Please try again.');
          setDirectStatus('error');
        }
      }, 60000);
      
      // Call the API to generate the workout - ensure specific_request is included
      const result = await generateWorkoutDirect(request, {
        specific_request: request, // Explicitly set this in case it's not already in the function
        ...options,
        mode: 'sync',
        signal: abortControllerRef.current.signal
      });
      
      // Clear the timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      
      // Update state with the generated workout
      setDirectWorkout(adaptWorkoutData(result.data.workout));
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
      
      return adaptWorkoutData(result.data.workout);
    } catch (err: unknown) {
      // Clear the timeout if it exists
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
        requestTimeoutRef.current = null;
      }
      
      // Special handling for AbortError
      const isAbortError = err instanceof Error && err.name === 'AbortError';
      
      // Only update error state if this wasn't a user-initiated abort
      if (!isAbortError || (isAbortError && err.message !== 'User cancelled request')) {
        // Update state with the error
        setDirectStatus('error');
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setDirectError(isAbortError ? 'Generation was cancelled.' : errorMsg);
        
        // Log error if tracking is available
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('workout_generation_error', {
            error_message: err instanceof Error ? err.message : 'Unknown error',
            generation_time_ms: Date.now() - startTime
          });
        }
        
        throw new Error(isAbortError ? 'Generation was cancelled.' : errorMsg);
      }
    } finally {
      // Ensure AbortController is cleaned up
      abortControllerRef.current = null;
    }
  }, [cleanup]);
  
  /**
   * Cancel the current workout generation
   */
  const cancelGeneration = useCallback(() => {
    // Add a flag to track that the generation was explicitly cancelled
    const wasCancelled = true;
    cleanup();
    
    // Reset the error states fully to prevent them from persisting
    dispatch({ type: WorkoutActionType.SET_STEP, payload: 'idle' });
    
    // If using direct generation, update local state
    if (['starting', 'submitting', 'generating'].includes(directStatus)) {
      setDirectStatus('idle');
      setDirectError(null);
    }
    
    // If using context-based generation, update context state without error message
    if (['submitting', 'generating'].includes(contextStatus)) {
      dispatch({ type: WorkoutActionType.RESET_GENERATOR });
      // Store the cancellation state in the context
      dispatch({ 
        type: WorkoutActionType.TOGGLE_DEBUG_MODE, 
        payload: true  // Repurpose debug mode to store cancellation state
      });
    }
  }, [cleanup, directStatus, contextStatus, dispatch]);
  
  /**
   * Listen for abort events from FormFlowContext
   * This ensures proper cancellation when the form flow transitions between steps
   */
  useEffect(() => {
    // Handler for abort events
    const handleAbortEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.reason === 'step_transition') {
        console.log('Aborting workout generation due to step transition', customEvent.detail);
        cancelGeneration();
      }
    };
    
    // Add event listener
    window.addEventListener('workout_generation_abort', handleAbortEvent);
    
    return () => {
      // Clean up event listener
      window.removeEventListener('workout_generation_abort', handleAbortEvent);
    };
  }, [cancelGeneration]);
  
  /**
   * Reset the generator state
   */
  const resetGenerator = useCallback(() => {
    // Cancel any ongoing generation
    cancelGeneration();
    
    // Reset context state
    dispatch({ type: WorkoutActionType.RESET_GENERATOR });
    
    // Ensure cancellation flag is cleared
    dispatch({ type: WorkoutActionType.TOGGLE_DEBUG_MODE, payload: false });
    
    // Reset direct generation state
    setDirectStatus('idle');
    setDirectError(null);
    setPostId(null);
    setDirectWorkout(null);
  }, [dispatch, cancelGeneration]);
  
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
    cancelGeneration,
    generateWorkout: startGeneration, // Alias for backward compatibility
    startDirectGeneration,
    
    // Computed states for UI
    isGenerating: ['generating', 'submitting', 'starting'].includes(effectiveStatus),
    isCompleted: effectiveStatus === 'completed',
    hasError: effectiveStatus === 'error',
    isIdle: effectiveStatus === 'idle',
  };
} 