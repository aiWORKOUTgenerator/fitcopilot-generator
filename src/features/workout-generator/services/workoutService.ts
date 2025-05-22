/**
 * Workout Service
 * 
 * Provides functions for interacting with the workout API.
 */
import { GeneratedWorkout } from '../types/workout';
import { apiFetch } from '../api/client';

/**
 * Base API path for workout endpoints
 */
const API_PATH = '/wp-json/my-wg/v1';

/**
 * Get a single workout by ID
 * @param id - The workout ID
 * @returns Promise with the workout data
 */
export async function getWorkout(id: string): Promise<GeneratedWorkout> {
  try {
    const response = await apiFetch({
      path: `${API_PATH}/workouts/${id}`,
      method: 'GET',
    });
    
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
    const response = await apiFetch({
      path: `${API_PATH}/workouts`,
      method: 'GET',
      data: { page, per_page: perPage },
    });
    
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
    const path = workout.id 
      ? `${API_PATH}/workouts/${workout.id}` 
      : `${API_PATH}/workouts`;
    
    const response = await apiFetch({
      path,
      method,
      data: workout,
    });
    
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
    const response = await apiFetch({
      path: `${API_PATH}/workouts/${id}`,
      method: 'DELETE',
    });
    
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
    const response = await apiFetch({
      path: `${API_PATH}/workouts/${id}/complete`,
      method: 'POST',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to mark workout as completed');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error completing workout:', error);
    throw error;
  }
} 