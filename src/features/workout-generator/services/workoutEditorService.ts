/**
 * Workout Editor Service
 * 
 * Service for workout editor API interactions with robust error handling
 * and support for optimistic updates.
 */
import { 
  WorkoutEditorData, 
  SaveWorkoutRequest, 
  SaveWorkoutResponse,
  EditorApiErrorResponse
} from '../types/editor';
import { GeneratedWorkout, WorkoutSection } from '../types/workout';

/**
 * API response interface following design guidelines
 */
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code?: string;
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  validationErrors: Record<string, string>;
  
  constructor(message: string, validationErrors: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  code: string;
  status: number;
  
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Get WordPress nonce from global wpApiSettings
 * @returns {string} The WordPress API nonce
 */
const getNonce = (): string => {
  if (typeof window !== 'undefined' && window.wpApiSettings?.nonce) {
    return window.wpApiSettings.nonce;
  }
  return '';
};

/**
 * Constructs API endpoint paths following guidelines
 * @param {string} path - The path segment after the base
 * @returns {string} The full API endpoint URL
 */
const getApiEndpoint = (path: string): string => {
  return `/wp-json/fitcopilot/v1/${path.replace(/^\//, '')}`;
};

/**
 * Make an API request with standardized error handling
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<T>} The API response data
 * @throws {ValidationError} If validation fails
 * @throws {ApiError} If API returns an error
 * @throws {Error} For network or unexpected errors
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Add default headers
    const headers = new Headers(options.headers || {});
    headers.append('X-WP-Nonce', getNonce());
    
    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      headers.append('Content-Type', 'application/json');
    }
    
    // Make the request
    const response = await fetch(getApiEndpoint(endpoint), {
      ...options,
      headers
    });
    
    // Parse the response
    const result: ApiResponse<T> = await response.json();
    
    // Handle error responses
    if (!result.success) {
      // Handle validation errors
      if (result.code === 'validation_error' && result.data) {
        const errorData = result.data as unknown as EditorApiErrorResponse;
        throw new ValidationError(
          result.message,
          errorData.validation_errors || {}
        );
      }
      
      // Handle other API errors
      throw new ApiError(
        result.message,
        result.code || 'api_error',
        response.status
      );
    }
    
    return result.data as T;
  } catch (error) {
    // Rethrow custom errors
    if (error instanceof ValidationError || error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors
    if (error instanceof Error) {
      throw new Error(`API request failed: ${error.message}`);
    }
    
    // Handle unexpected errors
    throw new Error('API request failed with an unexpected error');
  }
}

/**
 * Fetch workout data from API
 * @param {number} workoutId - The ID of the workout to fetch
 * @returns {Promise<WorkoutEditorData>} The workout data
 * @throws {ApiError|ValidationError|Error} If the request fails
 */
export const fetchWorkoutDetails = async (workoutId: number): Promise<WorkoutEditorData> => {
  return apiRequest<WorkoutEditorData>(`workouts/${workoutId}`);
};

/**
 * Save workout to API
 * @param {WorkoutEditorData} workout - The workout data to save
 * @param {boolean} isNew - Whether this is a new workout or an update
 * @returns {Promise<WorkoutEditorData>} The saved workout data
 * @throws {ApiError|ValidationError|Error} If the request fails
 */
export const saveWorkout = async (
  workout: WorkoutEditorData,
  isNew: boolean = true
): Promise<WorkoutEditorData> => {
  // Follow API design guidelines with wrapped request object
  const requestData: SaveWorkoutRequest = {
    workout: {
      ...workout,
      lastModified: new Date().toISOString()
    }
  };
  
  // Set URL and method based on whether this is a new workout or update
  const endpoint = isNew 
    ? 'workouts'
    : `workouts/${workout.postId}`;
    
  const method = isNew ? 'POST' : 'PUT';
  
  // Make API request
  const result = await apiRequest<SaveWorkoutResponse>(endpoint, {
    method,
    body: JSON.stringify(requestData)
  });
  
  return result.workout;
};

/**
 * Delete a workout
 * @param {number} workoutId - The ID of the workout to delete
 * @returns {Promise<void>}
 * @throws {ApiError|ValidationError|Error} If the request fails
 */
export const deleteWorkout = async (workoutId: number): Promise<void> => {
  await apiRequest<void>(`workouts/${workoutId}`, {
    method: 'DELETE'
  });
};

/**
 * Convert editor format workout to generated workout format
 * @param {WorkoutEditorData} editorData - The editor format workout
 * @returns {GeneratedWorkout} The workout in generated format
 */
export const convertToGeneratedWorkout = (editorData: WorkoutEditorData): GeneratedWorkout => {
  // Convert exercises to the format expected by GeneratedWorkout
  const exercises = editorData.exercises.map(exercise => ({
    name: exercise.name,
    sets: exercise.sets,
    reps: typeof exercise.reps === 'string' ? exercise.reps : String(exercise.reps),
    description: exercise.notes || ''
  }));
  
  // Create a main workout section
  const mainSection: WorkoutSection = {
    name: 'Main Workout',
    duration: editorData.duration,
    exercises: exercises
  };
  
  // Create the full workout
  return {
    title: editorData.title,
    difficulty: editorData.difficulty,
    sections: [mainSection],
    equipment: editorData.equipment || [],
    goals: editorData.goals || [],
    notes: editorData.notes
  };
}; 