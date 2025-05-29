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
 * Get a single workout by ID
 * @param id - The workout ID to fetch
 * @returns Promise with the workout data
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(`/workouts/${id}`);
    
    if (!data) {
      throw new Error('Workout not found');
    }
    
    return transformWorkoutResponse(data);
  } catch (error) {
    console.error('Failed to get workout:', error);
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
    const isUpdate = workout.id && workout.id !== 'new';
    const endpoint = isUpdate 
      ? `/workouts/${workout.id}` 
      : '/workouts';
    
    const method = isUpdate ? 'PUT' : 'POST';
    
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(endpoint, {
      method,
      body: JSON.stringify({
        workout: transformWorkoutForSave(workout)
      })
    });
    
    // data is the workout object directly from the API
    if (!data) {
      throw new Error('No data returned from save operation');
    }
    
    return transformWorkoutResponse(data);
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
  return {
    id: apiData.id || apiData.post_id,
    title: apiData.title,
    description: apiData.description || apiData.content || '',
    duration: apiData.duration || 30,
    difficulty: apiData.difficulty || 'intermediate',
    exercises: apiData.exercises || apiData.workout_data?.exercises || [],
    created_at: apiData.date || apiData.created_at || new Date().toISOString(),
    updated_at: apiData.modified || apiData.updated_at || new Date().toISOString(),
    // Additional fields from API
    version: apiData.version,
    lastModified: apiData.last_modified,
    modifiedBy: apiData.modified_by
  };
}

/**
 * Transform workout data for saving to API format
 */
function transformWorkoutForSave(workout: GeneratedWorkout): any {
  return {
    title: workout.title,
    notes: workout.description,
    difficulty: workout.difficulty,
    duration: workout.duration,
    exercises: workout.exercises,
    // Include version if updating
    ...(workout.version && { version: workout.version })
  };
} 