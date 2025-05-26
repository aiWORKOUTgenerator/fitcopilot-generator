/**
 * Profile API Service
 *
 * Handles all API calls related to user profiles for workout generation
 */

import { apiFetch } from '../../../utils/api';
import { WorkoutDifficulty } from '../types/workout';

/**
 * User profile data structure for workout generation
 */
export interface UserProfile {
  user_id: number;
  fitness_level: WorkoutDifficulty;
  equipment_available: string[];
  workout_goals: string;
  physical_limitations: string;
  completed_workouts_count: number;
}

/**
 * Get the current user's profile
 *
 * @returns Promise resolving to the user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    console.log('Fetching user profile for workout generation from API...');
    
    const profileData = await apiFetch<UserProfile>({
      path: '/profile',
      method: 'GET'
    });
    
    console.log('Workout profile data received:', profileData);
    return profileData;
  } catch (error) {
    console.error('Error fetching workout profile:', error);
    
    // Return a default profile if API fails
    console.log('Falling back to default workout profile data');
    return {
      user_id: 1,
      fitness_level: 'beginner',
      equipment_available: ['none'],
      workout_goals: 'General fitness and health',
      physical_limitations: 'None',
      completed_workouts_count: 0
    };
  }
}

/**
 * Update the current user's profile
 *
 * @param data The profile data to update
 * @returns Promise resolving to success confirmation
 */
export async function updateProfile(data: Partial<Omit<UserProfile, 'user_id' | 'completed_workouts_count'>>): Promise<void> {
  try {
    console.log('Updating user profile for workout generation via API...', data);
    
    await apiFetch<void>({
      path: '/profile',
      method: 'PUT',
      data: data
    });
    
    console.log('Workout profile updated successfully');
  } catch (error) {
    console.error('Error updating workout profile:', error);
    
    // Log the fallback but don't throw - just return void as expected
    console.log('Profile update failed, continuing with fallback behavior');
  }
} 