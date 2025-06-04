/**
 * Workout Editor Service
 * 
 * Service for workout editor API interactions with robust error handling
 * and support for optimistic updates.
 */
import { 
  WorkoutEditorData, 
  EditorApiErrorResponse
} from '../types/editor';
import { GeneratedWorkout, WorkoutSection, Exercise, SetsExercise } from '../types/workout';

/**
 * WordPress window extensions for nonce authentication
 */
declare global {
  interface Window {
    fitcopilotData?: {
      nonce: string;
      apiBase: string;
      restUrl: string;
      isLoggedIn: boolean;
      currentUserId: number;
      debug: boolean;
    };
    wpApiSettings?: {
      nonce: string;
      root: string;
    };
  }
}

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
 * Gets the WordPress API nonce for authentication
 * @returns {string} The WordPress API nonce
 */
const getNonce = (): string => {
  console.log('[workoutEditorService] Checking for WordPress nonce:', {
    'window_exists': typeof window !== 'undefined',
    'fitcopilotData_exists': typeof window !== 'undefined' && !!window.fitcopilotData,
    'fitcopilotData_nonce_exists': typeof window !== 'undefined' && !!window.fitcopilotData?.nonce,
    'wpApiSettings_exists': typeof window !== 'undefined' && !!window.wpApiSettings,
    'wpApiSettings_nonce_exists': typeof window !== 'undefined' && !!window.wpApiSettings?.nonce,
  });

  if (typeof window !== 'undefined') {
    // PRIMARY: Use fitcopilotData.nonce (set up by PHP bootstrap)
    if (window.fitcopilotData?.nonce) {
      console.log('[workoutEditorService] Using fitcopilotData.nonce');
      return window.fitcopilotData.nonce;
    }
    
    // FALLBACK 1: fitcopilotApiHeaders (also set up by PHP bootstrap)
    const fitcopilotHeaders = (window as any).fitcopilotApiHeaders;
    if (fitcopilotHeaders?.['X-WP-Nonce']) {
      console.log('[workoutEditorService] Using fitcopilotApiHeaders nonce');
      return fitcopilotHeaders['X-WP-Nonce'];
    }
    
    // FALLBACK 2: wpApiSettings (WordPress default)
    if (window.wpApiSettings?.nonce) {
      console.log('[workoutEditorService] Using wpApiSettings.nonce');
      return window.wpApiSettings.nonce;
    }
    
    // FALLBACK 3: Check for REST API nonce in meta tag
    const metaNonce = document.querySelector('meta[name="wp-rest-nonce"]')?.getAttribute('content');
    if (metaNonce) {
      console.log('[workoutEditorService] Using meta tag nonce');
      return metaNonce;
    }
  }
  
  console.warn('[workoutEditorService] No WordPress nonce found! This will cause authentication failures.');
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
    
    const nonce = getNonce();
    if (!nonce) {
      throw new Error('WordPress authentication nonce not available. Please refresh the page.');
    }
    
    headers.append('X-WP-Nonce', nonce);
    
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
  // FIXED: Use DIRECT format like working test tool (no wrapper)
  const workoutData = {
    ...workout,
    lastModified: new Date().toISOString()
  };
  
  // Set URL and method based on whether this is a new workout or update
  const endpoint = isNew 
    ? 'workouts'
    : `workouts/${workout.postId}`;
    
  const method = isNew ? 'POST' : 'PUT';
  
  console.log(`[workoutEditorService] Making ${method} request to ${endpoint}`, {
    format: 'DIRECT (like working test tool)',
    workoutData: {
      title: workoutData.title,
      exerciseCount: workoutData.exercises?.length || 0,
      hasVersion: 'version' in workoutData,
      version: workoutData.version,
      postId: workoutData.postId
    }
  });
  
  // FIXED: Make API request with DIRECT format (no wrapper)
  const result = await apiRequest<any>(endpoint, {
    method,
    body: JSON.stringify(workoutData)  // ✅ Direct format, no { workout: {...} } wrapper
  });
  
  console.log('[workoutEditorService] Save response:', {
    success: !!result,
    id: result?.id || result?.postId,
    version: result?.version,
    format: 'WordPress native response'
  });
  
  // FIXED: Return result directly (WordPress returns the workout data directly in response.data)
  return result;
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
  console.log('[convertToGeneratedWorkout] Starting conversion with input data:', {
    title: editorData.title,
    postId: editorData.postId,
    postIdType: typeof editorData.postId,
    version: editorData.version,
    exerciseCount: editorData.exercises?.length || 0
  });

  // CRITICAL FIX: Explicit postId → id mapping with robust validation
  let workoutId: string | undefined;
  let hasValidPostId = false;
  
  if (editorData.postId !== undefined && editorData.postId !== null) {
    // Validate postId is a valid number
    if (typeof editorData.postId === 'number' && !isNaN(editorData.postId) && editorData.postId > 0) {
      workoutId = editorData.postId.toString();
      hasValidPostId = true;
      console.log('[convertToGeneratedWorkout] POSTID MAPPING SUCCESS:', {
        'input_postId': editorData.postId,
        'output_id': workoutId,
        'mapping_successful': true
      });
    } else {
      console.warn('[convertToGeneratedWorkout] INVALID POSTID detected:', {
        'postId': editorData.postId,
        'type': typeof editorData.postId,
        'isNaN': isNaN(Number(editorData.postId)),
        'converted_to_undefined': true
      });
    }
  } else {
    console.log('[convertToGeneratedWorkout] NO POSTID to map:', {
      'postId': editorData.postId,
      'new_workout': true
    });
  }

  // CRITICAL FIX: Explicit version handling with validation
  let workoutVersion: number | undefined;
  let hasValidVersion = false;

  if (editorData.version !== undefined && editorData.version !== null) {
    if (typeof editorData.version === 'number' && !isNaN(editorData.version) && editorData.version >= 0) {
      workoutVersion = editorData.version;
      hasValidVersion = true;
      console.log('[convertToGeneratedWorkout] VERSION MAPPING SUCCESS:', {
        'input_version': editorData.version,
        'output_version': workoutVersion,
        'mapping_successful': true
      });
    } else {
      console.warn('[convertToGeneratedWorkout] INVALID VERSION detected:', {
        'version': editorData.version,
        'type': typeof editorData.version,
        'converted_to_undefined': true
      });
    }
  }

  // Convert exercises to the format expected by GeneratedWorkout
  console.log('[convertToGeneratedWorkout] EXERCISE CONVERSION START:', {
    'input_exercises_length': editorData.exercises?.length || 0,
    'input_exercises_sample': editorData.exercises?.slice(0, 2).map(e => ({ name: e.name, sets: e.sets, reps: e.reps })) || []
  });
  
  const exercises = editorData.exercises.map((exercise, index) => {
    // Create SetsExercise (matches the Exercise type)
    const convertedExercise: SetsExercise = {
      id: exercise.id || `exercise-${index}`,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      description: exercise.notes || '',
      type: 'strength'
    };
    return convertedExercise;
  });
  
  console.log('[convertToGeneratedWorkout] EXERCISE CONVERSION RESULT:', {
    'output_exercises_length': exercises.length,
    'output_exercises_sample': exercises.slice(0, 2)
  });
  
  // Create a main workout section
  const mainSection: WorkoutSection = {
    name: 'Main Workout',
    duration: editorData.duration,
    exercises: exercises
  };
  
  console.log('[convertToGeneratedWorkout] SECTION CREATION:', {
    'section_name': mainSection.name,
    'section_duration': mainSection.duration,
    'section_exercises_length': mainSection.exercises.length
  });
  
  // CRITICAL FIX: Explicit object construction with proper field mapping
  const generatedWorkout: GeneratedWorkout = {
    title: editorData.title,
    difficulty: editorData.difficulty,
    duration: editorData.duration,
    exercises: exercises,
    sections: [mainSection],
    description: editorData.notes
  };

  // CRITICAL FIX: Explicit ID assignment (never use conditional spreading)
  if (hasValidPostId && workoutId) {
    generatedWorkout.id = workoutId;
  }

  // CRITICAL FIX: Explicit version assignment
  if (hasValidVersion && workoutVersion !== undefined) {
    generatedWorkout.version = workoutVersion;
  }

  // Handle lastModified timestamp
  if (editorData.lastModified) {
    generatedWorkout.lastModified = editorData.lastModified;
  } else {
    generatedWorkout.lastModified = new Date().toISOString();
  }

  // CRITICAL VALIDATION: Ensure mapping was successful for existing workouts
  if (editorData.postId && !generatedWorkout.id) {
    const error = `Critical ID mapping failure: postId ${editorData.postId} was not mapped to id`;
    console.error('[convertToGeneratedWorkout] CRITICAL ERROR:', error);
    throw new Error(error);
  }

  if (editorData.version !== undefined && generatedWorkout.version === undefined) {
    const error = `Critical version mapping failure: version ${editorData.version} was not preserved`;
    console.error('[convertToGeneratedWorkout] CRITICAL ERROR:', error);
    throw new Error(error);
  }
  
  console.log('[convertToGeneratedWorkout] Conversion COMPLETE:', {
    'input_data': {
      postId: editorData.postId,
      version: editorData.version,
      title: editorData.title
    },
    'output_data': {
      id: generatedWorkout.id,
      version: generatedWorkout.version,
      title: generatedWorkout.title
    },
    'mapping_results': {
      'postId_to_id': hasValidPostId ? `${editorData.postId} → ${generatedWorkout.id}` : 'N/A (new workout)',
      'version_preserved': hasValidVersion ? `${editorData.version} → ${generatedWorkout.version}` : 'N/A (no version)',
      'has_id': !!generatedWorkout.id,
      'will_update': !!(generatedWorkout.id && generatedWorkout.id !== 'new')
    }
  });
  
  console.log('[convertToGeneratedWorkout] GENERATED WORKOUT STRUCTURE:', {
    'title': generatedWorkout.title,
    'sections_length': generatedWorkout.sections.length,
    'first_section_exercises_length': generatedWorkout.sections[0]?.exercises.length || 0,
    'has_exercises_field': 'exercises' in generatedWorkout,
    'direct_exercises_length': (generatedWorkout as any).exercises?.length || 'no direct exercises field'
  });
  
  return generatedWorkout;
}; 