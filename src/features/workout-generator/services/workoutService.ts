/**
 * Workout Service
 * 
 * Provides functions for interacting with the workout API.
 */
import { GeneratedWorkout } from '../types/workout';
import { apiFetch, ApiRequestOptions, ApiResponse } from '../api/client';

/**
 * Base API path for workout endpoints
 */
const API_PATH = '/wp-json/fitcopilot/v1';

/**
 * Build a complete API URL from a path
 * @param path - The API path (e.g., '/workouts' or '/workouts/123')
 * @returns Complete API URL
 */
const buildApiUrl = (path: string): string => `${API_PATH}${path}`;

/**
 * Prepare request options with proper data serialization
 * @param method - HTTP method
 * @param data - Optional data to send (will be JSON stringified for POST/PUT)
 * @returns Prepared request options
 */
const prepareRequestOptions = (method: string, data?: any): ApiRequestOptions => {
  const options: ApiRequestOptions = { method };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  return options;
};

/**
 * Get a single workout by ID
 * @param id - The workout ID
 * @returns Promise with the workout data
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    const response = await apiFetch<ApiResponse<GeneratedWorkout>>(
      buildApiUrl(`/workouts/${id}`),
      prepareRequestOptions('GET')
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workout');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching workout:', error);
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
    // For GET requests with query parameters, we'll add them to the URL
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    
    const response = await apiFetch<ApiResponse<GeneratedWorkout[]>>(
      `${buildApiUrl('/workouts')}?${queryParams.toString()}`,
      prepareRequestOptions('GET')
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch workouts');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
}

/**
 * Save a workout
 * @param workout - The workout data to save
 * @returns Promise with the saved workout data
 */
export async function saveWorkout(workout: GeneratedWorkout): Promise<GeneratedWorkout> {
  try {
    const method = workout.id ? 'PUT' : 'POST';
    const url = workout.id 
      ? buildApiUrl(`/workouts/${workout.id}`)
      : buildApiUrl('/workouts');
    
    const response = await apiFetch<ApiResponse<GeneratedWorkout>>(
      url,
      prepareRequestOptions(method, workout)
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to save workout');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error saving workout:', error);
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
    const response = await apiFetch<ApiResponse<boolean>>(
      buildApiUrl(`/workouts/${id}`),
      prepareRequestOptions('DELETE')
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete workout');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting workout:', error);
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
    const response = await apiFetch<ApiResponse<GeneratedWorkout>>(
      buildApiUrl(`/workouts/${id}/complete`),
      prepareRequestOptions('POST')
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to mark workout as completed');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error completing workout:', error);
    throw error;
  }
} 