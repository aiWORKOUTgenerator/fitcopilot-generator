/**
 * Workout API module
 */
import { apiFetch } from '../../../common/api/client';
import { WorkoutFormParams, GeneratedWorkout } from '../types/workout';
import { WorkoutData } from '../utils/workoutCache';

// API endpoints
const ENDPOINTS = {
  GENERATE: '/wp-json/my-wg/v1/generate',
  GENERATE_DIRECT: '/wp-json/fitcopilot/v1/generate-workout',
  WORKOUTS: '/wp-json/my-wg/v1/workouts',
  WORKOUT: (id: number) => `/wp-json/my-wg/v1/workouts/${id}`
};

/**
 * Generate a workout using the provided parameters
 * 
 * @param params - Workout generation parameters
 * @returns Promise resolving to the generated workout
 */
export async function generateWorkout(params: WorkoutFormParams): Promise<GeneratedWorkout> {
  return apiFetch<GeneratedWorkout>(
    ENDPOINTS.GENERATE,
    {
      method: 'POST',
      body: JSON.stringify(params)
    }
  );
}

/**
 * Response type for workout generation
 */
export type WorkoutResponse = {
  success: boolean;
  data: {
    workout: WorkoutData;
    post_id: number;
    job_id?: string;
  };
  message?: string;
};

// Type for the window with fitcopilot data
interface FitcopilotWindow extends Window {
  fitcopilotData?: {
    nonce: string;
    [key: string]: unknown;
  };
}

/**
 * Generate a workout directly using OpenAI (synchronous)
 * 
 * @param specificRequest - Specific workout request text
 * @param options - Additional options for workout generation
 * @returns Promise resolving to the workout response
 */
export async function generateWorkoutDirect(
  specificRequest: string,
  options: Record<string, unknown> = {}
): Promise<WorkoutResponse> {
  const body = {
    specific_request: specificRequest,
    ...options
  };

  const response = await fetch(ENDPOINTS.GENERATE_DIRECT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': ((window as FitcopilotWindow).fitcopilotData?.nonce) || ''
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Error ${response.status}`);
  }
  
  return data as WorkoutResponse;
} 