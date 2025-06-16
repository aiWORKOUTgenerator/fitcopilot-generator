/**
 * Workout Service
 * 
 * Core API communication service for workout operations.
 * Uses modular architecture with specialized services for data transformation,
 * version management, and business logic.
 */
import { GeneratedWorkout } from '../types/workout';
import { apiFetch } from '../../../common/api/client';

// Import specialized modules
import { 
  transformWorkoutResponse, 
  transformWorkoutForSave 
} from './transformers/workoutTransformer';
import { 
  transformForGeneration,
  transformApiResponse 
} from './transformers/apiTransformer';
import {
  extractVersionInfo,
  checkVersionConflict, 
  prepareVersionForSave
} from './versioning/versionManager';
import { isValidVersion, validateVersionInfo } from './versioning/versionValidator';
import { 
  resolveWorkoutId, 
  normalizeWorkoutId,
  idsEqual,
  isValidWorkoutId 
} from './utils/idResolver';
import { logger } from './utils/logger';

// Configure logger for this service
const serviceLogger = logger.scope('WorkoutService');

/**
 * Get a single workout by ID
 * @param id - The workout ID to fetch
 * @returns Promise with the workout data
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    const normalizedId = normalizeWorkoutId(id);
    if (!normalizedId) {
      throw new Error(`Invalid workout ID: ${id}`);
    }

    serviceLogger.info(`Loading workout ${normalizedId} for editing`);
    
    const data = await apiFetch<any>(`/workouts/${normalizedId}`);
    
    if (!data) {
      throw new Error('Workout not found');
    }

    serviceLogger.debug('Raw API response received', {
      hasData: !!data,
      hasVersion: !!data.version,
      hasExercises: !!(data.exercises || data.workout_data?.exercises)
    });
    
    const transformedWorkout = transformWorkoutResponse(data);
    
    serviceLogger.info('Workout loaded successfully', {
      id: transformedWorkout.id,
      title: transformedWorkout.title,
      version: transformedWorkout.version,
      exerciseCount: transformedWorkout.exercises?.length || 0
    });
    
    return transformedWorkout;
  } catch (error) {
    serviceLogger.error('Failed to get workout', error);
    throw error;
  }
}

/**
 * Get all workouts with pagination
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
    
    serviceLogger.debug('Fetching workouts', { page, perPage });
    
    const data = await apiFetch<{
      workouts: any[];
      total?: number;
      totalPages?: number;
    }>(`/workouts?${params}`);
    
    if (!data?.workouts) {
      throw new Error('Failed to fetch workouts');
    }
    
    const transformedWorkouts = data.workouts.map(transformWorkoutResponse);
    
    serviceLogger.info('Workouts fetched successfully', {
      count: transformedWorkouts.length,
      page,
      total: data.total
    });
    
    return transformedWorkouts;
  } catch (error) {
    serviceLogger.error('Failed to get workouts', error);
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
    serviceLogger.info('Starting workout generation', {
      hasDuration: !!workoutRequest.duration,
      hasDifficulty: !!workoutRequest.difficulty,
      hasMuscleTargeting: !!workoutRequest.muscleTargeting
    });
    
    // Transform request using dedicated transformer
    const enhancedRequest = transformForGeneration(workoutRequest);
    
    serviceLogger.debug('Request transformed for generation', {
      hasMuscleTargeting: !!enhancedRequest.muscleTargeting,
      hasSessionInputs: !!enhancedRequest.sessionInputs,
      targetMuscleGroups: enhancedRequest.muscleTargeting?.targetMuscleGroups?.length || 0
    });
    
    const data = await apiFetch<any>(`/generate`, {
      method: 'POST',
      body: JSON.stringify(enhancedRequest)
    });
    
    if (!data) {
      throw new Error('Failed to generate workout');
    }
    
    const transformedWorkout = transformApiResponse(data);
    
    serviceLogger.info('Workout generated successfully', {
      id: transformedWorkout.id,
      title: transformedWorkout.title,
      exerciseCount: transformedWorkout.exercises?.length || 0,
      duration: transformedWorkout.duration
    });
    
    return transformedWorkout;
  } catch (error) {
    serviceLogger.error('Failed to generate workout', error);
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
    const versionInfo = extractVersionInfo(workout);
    const idResolution = resolveWorkoutId(workout);
    const workoutId = idResolution.id;
    const hasValidId = isValidWorkoutId(workoutId);
    const isUpdate = hasValidId;
    
    serviceLogger.info('Starting workout save operation', {
      workoutId,
      isUpdate,
      version: versionInfo.version,
      title: workout.title
    });

    // Validate for update operations
    if (isUpdate && !isValidVersion(workout.version)) {
      throw new Error('Workout data is not valid for update operation - invalid version');
    }

    // Check for version conflicts on updates
    if (isUpdate && workout.version) {
      // Note: In a real implementation, you'd fetch current version first
      // const currentWorkout = await getWorkout(workoutId.toString());
      // const conflict = checkVersionConflict(currentWorkout, workout);
      // if (conflict.hasConflict) {
      //   throw new Error(conflict.message);
      // }
    }

    const endpoint = isUpdate ? `/workouts/${workoutId}` : '/workouts';
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Transform workout for save with version handling
    let saveData = transformWorkoutForSave(workout);
    
    if (isUpdate) {
      const versionData = prepareVersionForSave(workout);
      saveData = { ...saveData, ...versionData };
    }
    
    serviceLogger.debug('Making save request', {
      method,
      endpoint,
      hasVersion: !!saveData.version,
      exerciseCount: saveData.exercises?.length || 0
    });
    
    const data = await apiFetch<any>(endpoint, {
      method,
      body: JSON.stringify(saveData)
    });
    
    if (!data) {
      throw new Error('No data returned from save operation');
    }
    
    const transformedResult = transformWorkoutResponse(data);
    
    serviceLogger.info('Workout saved successfully', {
      id: transformedResult.id,
      version: transformedResult.version,
      method,
      title: transformedResult.title
    });
    
    return transformedResult;
  } catch (error) {
    serviceLogger.error('Failed to save workout', error);
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
    const normalizedId = normalizeWorkoutId(id);
    if (!normalizedId) {
      throw new Error(`Invalid workout ID for deletion: ${id}`);
    }

    serviceLogger.info(`Deleting workout ${normalizedId}`);
    
    await apiFetch<any>(`/workouts/${normalizedId}`, {
      method: 'DELETE'
    });
    
    serviceLogger.info(`Workout ${normalizedId} deleted successfully`);
    return true;
  } catch (error) {
    serviceLogger.error('Failed to delete workout', error);
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
    const normalizedId = normalizeWorkoutId(id);
    if (!normalizedId) {
      throw new Error(`Invalid workout ID for completion: ${id}`);
    }

    serviceLogger.info(`Marking workout ${normalizedId} as completed`);
    
    const data = await apiFetch<any>(`/workouts/${normalizedId}/complete`, {
      method: 'POST'
    });
    
    if (!data) {
      throw new Error('Failed to complete workout');
    }
    
    const transformedResult = transformWorkoutResponse(data);
    
    serviceLogger.info(`Workout ${normalizedId} marked as completed`);
    
    return transformedResult;
  } catch (error) {
    serviceLogger.error('Failed to complete workout', error);
    throw error;
  }
} 