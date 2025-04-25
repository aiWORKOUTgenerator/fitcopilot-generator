import { useState, useEffect } from 'react';
import { generateWorkoutDirect } from '../../api/workoutApi';
import { 
  cacheWorkout, 
  getCachedWorkout, 
  getRecentWorkoutId,
  WorkoutData
} from '../../utils/workoutCache';

type GenerationStatus = 'idle' | 'starting' | 'completed' | 'error';

interface UseWorkoutGeneratorReturn {
  status: GenerationStatus;
  error: string | null;
  postId: number | null;
  workout: WorkoutData | null;
  startGeneration: (request: string, options?: Record<string, unknown>) => Promise<void>;
  resetGenerator: () => void;
}

/**
 * Hook for handling direct workout generation with OpenAI
 */
export function useWorkoutGenerator(): UseWorkoutGeneratorReturn {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [workout, setWorkout] = useState<WorkoutData | null>(null);

  // Check for cached workout on initial load
  useEffect(() => {
    const recentWorkoutId = getRecentWorkoutId();
    if (recentWorkoutId) {
      const cachedWorkout = getCachedWorkout(recentWorkoutId);
      if (cachedWorkout) {
        setPostId(recentWorkoutId);
        setWorkout(cachedWorkout);
        setStatus('completed');
      }
    }
  }, []);

  /**
   * Start the workout generation process
   * 
   * @param request - The specific workout request
   * @param options - Additional options for the generation
   */
  async function startGeneration(request: string, options: Record<string, unknown> = {}): Promise<void> {
    // Reset state
    setError(null);
    setStatus('starting');
    setWorkout(null);
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
      setWorkout(result.data.workout);
      setPostId(result.data.post_id);
      setStatus('completed');

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
    } catch (err: unknown) {
      // Update state with the error
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      
      // Log error if tracking is available
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('workout_generation_error', {
          error_message: err instanceof Error ? err.message : 'Unknown error',
          generation_time_ms: Date.now() - startTime
        });
      }
    }
  }

  /**
   * Reset the generator state
   */
  function resetGenerator() {
    setStatus('idle');
    setError(null);
    setPostId(null);
    setWorkout(null);
  }

  return {
    status,
    error,
    postId,
    workout,
    startGeneration,
    resetGenerator
  };
} 