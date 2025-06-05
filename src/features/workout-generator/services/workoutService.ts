/**
 * Workout Service
 * 
 * Provides functions for interacting with the workout API.
 * Uses the real WordPress REST API with proper error handling.
 */
import { GeneratedWorkout } from '../types/workout';
import { apiFetch } from '../../../common/api/client';

// API configuration
const API_BASE = '';

/**
 * Utility function to resolve and validate workout ID
 * Handles both id and post_id fields from different sources
 */
function resolveWorkoutId(workout: GeneratedWorkout): { id: string | number | null; isValid: boolean } {
  // Check for both id and post_id fields (backend compatibility)
  const workoutId = workout.id || (workout as any).post_id;
  
  const isValid = !!(workoutId && 
                    workoutId !== 'new' && 
                    workoutId !== '' && 
                    workoutId !== 'undefined' && 
                    workoutId !== null &&
                    (typeof workoutId === 'number' || 
                     (typeof workoutId === 'string' && !isNaN(Number(workoutId)) && Number(workoutId) > 0)));
  
  return { id: workoutId, isValid };
}

/**
 * Get a single workout by ID
 * @param id - The workout ID to fetch
 * @returns Promise with the workout data
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    console.log(`[WorkoutService] Loading workout ${id} for editing...`);
    
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(`/workouts/${id}`);
    
    console.log('[WorkoutService] Raw API response:', data);
    console.log('[WorkoutService] Version data in response:', {
      version: data?.version,
      lastModified: data?.last_modified,
      modifiedBy: data?.modified_by
    });
    
    if (!data) {
      throw new Error('Workout not found');
    }
    
    const transformedWorkout = transformWorkoutResponse(data);
    console.log('[WorkoutService] Transformed workout for editor:', {
      id: transformedWorkout.id,
      title: transformedWorkout.title,
      version: transformedWorkout.version,
      exerciseCount: transformedWorkout.exercises?.length || 0
    });
    
    return transformedWorkout;
  } catch (error) {
    console.error('[WorkoutService] Failed to get workout:', error);
    throw error;
  }
}

/**
 * Get all workouts
 * @param page - Optional page number for pagination
 * @param perPage - Optional number of workouts per page
 * @returns Promise with the workouts data
 */
export async function getWorkouts(page = 1, perPage = 10): Promise<GeneratedWorkout[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<{
      workouts: any[];
      total?: number;
      totalPages?: number;
    }>(`/workouts?${params}`);
    
    if (!data?.workouts) {
      throw new Error('Failed to fetch workouts');
    }
    
    return data.workouts.map(transformWorkoutResponse);
  } catch (error) {
    console.error('Failed to get workouts:', error);
    throw error;
  }
}

/**
 * Generate a new workout
 * @param workoutRequest - The workout generation request data
 * @returns Promise with the generated workout data
 */
export async function generateWorkout(workoutRequest: any): Promise<GeneratedWorkout> {
  try {
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(`/generate`, {
      method: 'POST',
      body: JSON.stringify(workoutRequest)
    });
    
    if (!data) {
      throw new Error('Failed to generate workout');
    }
    
    return transformWorkoutResponse(data);
  } catch (error) {
    console.error('Failed to generate workout:', error);
    throw error;
  }
}

/**
 * Save a workout (create or update)
 * @param workout - The workout data to save
 * @returns Promise with the saved workout data
 */
export async function saveWorkout(workout: GeneratedWorkout): Promise<GeneratedWorkout> {
  try {
    // CRITICAL FIX: Track version throughout the entire save process
    const inputVersion = workout.version;
    const hasInputVersion = inputVersion !== undefined && inputVersion !== null;
    
    console.log('[WorkoutService] SAVE WORKFLOW START - Version Tracking:', {
      'input_version': inputVersion,
      'has_input_version': hasInputVersion,
      'input_version_type': typeof inputVersion,
      'workout_id': workout.id,
      'workout_title': workout.title
    });
    
    // CRITICAL FIX: Enhanced endpoint selection logic with better ID validation
    // Check for both id and post_id fields (backend compatibility)
    const { id: workoutId, isValid: hasValidId } = resolveWorkoutId(workout);
    
    const isUpdate = hasValidId;
    const endpoint = isUpdate 
      ? `/workouts/${workoutId}` 
      : '/workouts';
    
    const method = isUpdate ? 'PUT' : 'POST';
    
    console.log(`[WorkoutService] ENDPOINT SELECTION DECISION:`, {
      'workout.id': workout.id,
      'workout.post_id': (workout as any).post_id,
      'resolved_workoutId': workoutId,
      'typeof workoutId': typeof workoutId,
      'hasValidId': hasValidId,
      'isUpdate': isUpdate,
      'method': method,
      'endpoint': endpoint,
      'exerciseCount': workout.exercises?.length || 0,
      'hasVersion': !!workout.version,
      'version': workout.version
    });

    // If this should be an update but we don't have a valid ID, that's a critical error
    if (!isUpdate && workout.version && workout.version > 1) {
      console.error('[WorkoutService] CRITICAL ERROR: Workout has version > 1 but no valid ID for update!', {
        id: workout.id,
        post_id: (workout as any).post_id,
        resolved_id: workoutId,
        version: workout.version,
        title: workout.title
      });
      throw new Error(`Cannot update workout without valid ID. ID: ${workoutId}, Version: ${workout.version}`);
    }
    
    // CRITICAL VERSION VALIDATION: For updates, ensure we have a version
    if (isUpdate && !hasInputVersion) {
      console.warn('[WorkoutService] WARNING: Update operation without version - potential data loss!', {
        'workout_id': workoutId,
        'has_version': hasInputVersion,
        'version_value': inputVersion
      });
    }
    
    // CRITICAL FIX: Use DIRECT format like the working API test
    // Transform the workout for saving with proper field names
    const workoutData = transformWorkoutForSave(workout);
    
    // CRITICAL VERSION VALIDATION: Ensure version survived transformation
    const transformedHasVersion = 'version' in workoutData;
    const transformedVersion = workoutData.version;
    
    if (hasInputVersion && !transformedHasVersion) {
      console.error('[WorkoutService] CRITICAL ERROR: Version lost during transformation!', {
        'input_version': inputVersion,
        'transformed_has_version': transformedHasVersion,
        'transformed_version': transformedVersion
      });
      throw new Error(`Version lost during transformation: input=${inputVersion}, output=${transformedVersion}`);
    }
    
    console.log(`[WorkoutService] Making ${method} request to ${endpoint}`, {
      'format': 'DIRECT (like working test)',
      'workoutData': {
        title: workoutData.title,
        exerciseCount: workoutData.exercises?.length || 0,
        hasVersion: 'version' in workoutData,
        version: workoutData.version,
        hasDescription: 'description' in workoutData,
        hasNotes: 'notes' in workoutData
      },
      'version_tracking': {
        'input_version': inputVersion,
        'transformed_version': transformedVersion,
        'version_preserved': hasInputVersion ? (transformedVersion === inputVersion) : true
      }
    });
    
    // CRITICAL FIX: Send DIRECT format (not wrapped) like the working API test
    const data = await apiFetch<any>(endpoint, {
      method,
      body: JSON.stringify(workoutData)  // ✅ DIRECT format (not wrapped)
    });
    
    // CRITICAL VERSION VALIDATION: Check API response version
    const responseVersion = data?.version;
    const responseHasVersion = responseVersion !== undefined && responseVersion !== null;
    
    console.log('[WorkoutService] Save response:', {
      success: !!data,
      id: data?.id,
      version: responseVersion,
      exerciseCount: data?.workout_data?.exercises?.length || data?.exercises?.length || 0,
      method: method,
      endpoint: endpoint,
      format: 'DIRECT',
      'version_tracking': {
        'input_version': inputVersion,
        'response_version': responseVersion,
        'response_has_version': responseHasVersion,
        'version_incremented': isUpdate && hasInputVersion && responseHasVersion ? (responseVersion > inputVersion) : 'N/A'
      }
    });
    
    // data is the workout object directly from the API
    if (!data) {
      throw new Error('No data returned from save operation');
    }
    
    const transformedResult = transformWorkoutResponse(data);
    
    const finalVersion = transformedResult.version;
    const finalHasVersion = finalVersion !== undefined && finalVersion !== null;
    
    console.log('[WorkoutService] Final transformed result:', {
      id: transformedResult.id,
      version: finalVersion,
      exerciseCount: transformedResult.exercises?.length || 0,
      title: transformedResult.title,
      'version_tracking_final': {
        'input_version': inputVersion,
        'final_version': finalVersion,
        'final_has_version': finalHasVersion,
        'version_chain_success': isUpdate ? (finalHasVersion && finalVersion !== inputVersion) : finalHasVersion
      }
    });
    
    return transformedResult;
  } catch (error) {
    console.error('Failed to save workout:', error);
    throw error;
  }
}

/**
 * Delete a workout
 * @param id - The workout ID to delete
 * @returns Promise indicating success
 */
export async function deleteWorkout(id: string): Promise<boolean> {
  try {
    // apiFetch returns the data directly, not a wrapped response
    await apiFetch<any>(`/workouts/${id}`, {
      method: 'DELETE'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to delete workout:', error);
    throw error;
  }
}

/**
 * Mark a workout as completed
 * @param id - The workout ID to mark as completed
 * @returns Promise with the updated workout data
 */
export async function completeWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(`/workouts/${id}/complete`, {
      method: 'POST'
    });
    
    if (!data) {
      throw new Error('Failed to complete workout');
    }
    
    return transformWorkoutResponse(data);
  } catch (error) {
    console.error('Failed to complete workout:', error);
    throw error;
  }
}

/**
 * Transform workout response from API format to frontend format
 */
function transformWorkoutResponse(apiData: any): GeneratedWorkout {
  console.log('[WorkoutService] Raw API response structure:', Object.keys(apiData));
  console.log('[WorkoutService] workout_data:', apiData.workout_data);
  
  // CRITICAL FIX: Extract sections from multiple possible locations
  let sections = [];
  
  // Method 1: Direct sections field
  if (apiData.sections && Array.isArray(apiData.sections)) {
    sections = apiData.sections;
    console.log('[WorkoutService] Found sections in direct field:', sections.length);
  }
  // Method 2: From workout_data field
  else if (apiData.workout_data && apiData.workout_data.sections && Array.isArray(apiData.workout_data.sections)) {
    sections = apiData.workout_data.sections;
    console.log('[WorkoutService] Found sections in workout_data field:', sections.length);
  }
  // Method 3: Check if workout structure suggests sections (fallback)
  else {
    sections = [];
    console.log('[WorkoutService] No sections found in API response');
  }
  
  // CRITICAL FIX: Handle exercises from different possible locations
  let exercises = [];
  
  // Method 1: Direct exercises field (old format)
  if (apiData.exercises && Array.isArray(apiData.exercises)) {
    exercises = apiData.exercises;
    console.log('[WorkoutService] Found exercises in direct field:', exercises.length);
  }
  // Method 2: From workout_data field (new backend format)
  else if (apiData.workout_data && apiData.workout_data.exercises && Array.isArray(apiData.workout_data.exercises)) {
    exercises = apiData.workout_data.exercises;
    console.log('[WorkoutService] Found exercises in workout_data field:', exercises.length);
  }
  // Method 3: Extract from sections (fallback)
  else if (sections.length > 0) {
    exercises = [];
    sections.forEach((section: any) => {
      if (section.exercises && Array.isArray(section.exercises)) {
        exercises.push(...section.exercises);
      }
    });
    console.log('[WorkoutService] Extracted exercises from sections:', exercises.length);
  }
  // Method 4: Try workout_data.sections if available
  else if (apiData.workout_data && apiData.workout_data.sections && Array.isArray(apiData.workout_data.sections)) {
    exercises = [];
    apiData.workout_data.sections.forEach((section: any) => {
      if (section.exercises && Array.isArray(section.exercises)) {
        exercises.push(...section.exercises);
      }
    });
    console.log('[WorkoutService] Extracted exercises from workout_data.sections:', exercises.length);
  }
  
  console.log('[WorkoutService] Final exercise count:', exercises.length);
  
  // Transform exercises to ensure proper structure
  const transformedExercises = exercises.map((exercise: any, index: number) => {
    // Handle different exercise formats
    const transformed: any = {
      id: exercise.id || `exercise-${index}`,
      name: exercise.name || 'Unnamed Exercise',
      description: exercise.description || exercise.instructions || ''
    };
    
    // Handle duration-based exercises (warm-up, cool-down)
    if (exercise.duration) {
      transformed.duration = exercise.duration;
      transformed.type = exercise.section?.toLowerCase() || 'timed';
    }
    
    // Handle sets/reps-based exercises
    if (exercise.sets || exercise.reps) {
      transformed.sets = exercise.sets || 1;
      transformed.reps = exercise.reps || 10;
      transformed.type = 'strength';
    }
    
    // If neither duration nor sets/reps, default to sets/reps
    if (!exercise.duration && !exercise.sets && !exercise.reps) {
      transformed.sets = 1;
      transformed.reps = 10;
      transformed.type = 'strength';
    }
    
    // Preserve original section information
    if (exercise.section) {
      transformed.section = exercise.section;
    }
    
    return transformed;
  });
  
  return {
    id: apiData.id || apiData.post_id,
    title: apiData.title || 'Untitled Workout',
    description: apiData.description || apiData.content || apiData.notes || '',
    duration: Number(apiData.duration),
    difficulty: apiData.difficulty || 'intermediate',
    exercises: transformedExercises,
    sections: sections, // Preserve original sections structure
    created_at: apiData.date || apiData.created_at || new Date().toISOString(),
    updated_at: apiData.modified || apiData.updated_at || new Date().toISOString(),
    // CRITICAL FIX: Enhanced version handling
    version: apiData.version || apiData._workout_version || 1,
    lastModified: apiData.last_modified || apiData._workout_last_modified,
    modifiedBy: apiData.modified_by || apiData._workout_modified_by,
    // CRITICAL FIX: Preserve post_id for backend compatibility
    post_id: apiData.post_id || apiData.id
  };
}

/**
 * Transform workout data for saving to API format
 */
function transformWorkoutForSave(workout: GeneratedWorkout): any {
  console.log('[WorkoutService] Transforming workout for save:', {
    id: workout.id,
    title: workout.title,
    exerciseCount: workout.exercises?.length || 0,
    hasVersion: workout.version !== undefined && workout.version !== null,
    version: workout.version,
    'version_type': typeof workout.version
  });
  
  // CRITICAL FIX: Robust version handling with explicit logic
  const hasValidVersion = workout.version !== undefined && workout.version !== null;
  const versionValue = hasValidVersion ? workout.version : undefined;
  
  // CRITICAL FIX: Use DIRECT format with correct field names (like working API test)
  const transformed: any = {
    title: workout.title,
    description: workout.description,  // ✅ Use 'description' (not 'notes') - matches backend
    difficulty: workout.difficulty,
    duration: workout.duration,
    exercises: workout.exercises
  };
  
  // CRITICAL FIX: Preserve sections structure if it exists
  if (workout.sections && Array.isArray(workout.sections) && workout.sections.length > 0) {
    transformed.sections = workout.sections;
    console.log('[WorkoutService] PRESERVING SECTIONS:', {
      'sections_count': workout.sections.length,
      'section_names': workout.sections.map(s => s.name),
      'total_exercises_in_sections': workout.sections.reduce((total, section) => total + (section.exercises?.length || 0), 0)
    });
  } else {
    console.log('[WorkoutService] NO SECTIONS TO PRESERVE:', {
      'has_sections_field': 'sections' in workout,
      'sections_is_array': Array.isArray(workout.sections),
      'sections_length': workout.sections?.length || 0
    });
  }
  
  // CRITICAL FIX: Explicit version handling - never use complex conditional spreading
  if (hasValidVersion) {
    transformed.version = versionValue;
    console.log('[WorkoutService] VERSION PRESERVED:', {
      'original_version': workout.version,
      'transformed_version': transformed.version,
      'version_type': typeof transformed.version,
      'version_in_payload': true
    });
  } else {
    console.log('[WorkoutService] NO VERSION TO PRESERVE:', {
      'original_version': workout.version,
      'version_undefined': workout.version === undefined,
      'version_null': workout.version === null,
      'version_in_payload': false
    });
  }
  
  // CRITICAL VALIDATION: Ensure version wasn't lost during transformation
  if (hasValidVersion && !('version' in transformed)) {
    console.error('[WorkoutService] CRITICAL ERROR: Version was lost during transformation!', {
      'input_version': workout.version,
      'output_has_version': 'version' in transformed,
      'output_version': transformed.version
    });
    throw new Error(`Version preservation failed: input=${workout.version}, output=${transformed.version}`);
  }
  
  console.log('[WorkoutService] Transformed data (DIRECT format):', {
    title: transformed.title,
    hasDescription: !!transformed.description,
    difficulty: transformed.difficulty,
    duration: transformed.duration,
    exerciseCount: transformed.exercises?.length || 0,
    hasVersion: 'version' in transformed,
    version: transformed.version,
    'version_preserved': hasValidVersion ? ('version' in transformed && transformed.version === workout.version) : true,
    'matches_test_format': 'YES - direct fields like working test'
  });
  
  return transformed;
} 