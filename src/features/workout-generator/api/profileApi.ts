/**
 * Profile API Service
 *
 * Handles all API calls related to user profiles
 */

import { apiFetch } from '@common/api/client';
import * as routes from '@common/api/routes';
import { WorkoutDifficulty } from '../types/workout';

/**
 * User profile data structure
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
  return apiFetch<UserProfile>(routes.GET_PROFILE);
}

/**
 * Update the current user's profile
 *
 * @param data The profile data to update
 * @returns Promise resolving to success confirmation
 */
export async function updateProfile(data: Partial<Omit<UserProfile, 'user_id' | 'completed_workouts_count'>>): Promise<void> {
  return apiFetch<void>(routes.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
} 