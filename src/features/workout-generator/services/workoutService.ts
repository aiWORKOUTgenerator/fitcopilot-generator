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
    console.log(`[WorkoutService] Loading workout ${id}...`);
    
    // apiFetch returns the data directly, not a wrapped response
    const data = await apiFetch<any>(`/workouts/${id}`);
    
    console.log('[WorkoutService] Raw API response:', data);
    
    if (!data) {
      throw new Error('Workout not found');
    }
    
    const transformedWorkout = transformWorkoutResponse(data);
    console.log('[WorkoutService] Transformed workout:', transformedWorkout);
    console.log('[WorkoutService] Exercise count:', transformedWorkout.exercises?.length || 0);
    
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
  // Extract sections if they exist for legacy workouts
  const sections = apiData.sections || [];
  
  // Handle exercises - they might be at root level or need extraction from sections
  let exercises = apiData.exercises || [];
  
  // If no exercises at root but we have sections, extract them
  if (exercises.length === 0 && sections.length > 0) {
    exercises = [];
    sections.forEach((section: any) => {
      if (section.exercises && Array.isArray(section.exercises)) {
        exercises.push(...section.exercises);
      }
    });
  }
  
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
    duration: Number(apiData.duration) || 30,
    difficulty: apiData.difficulty || 'intermediate',
    exercises: transformedExercises,
    sections: sections, // Preserve original sections structure
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