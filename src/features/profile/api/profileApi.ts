/**
 * Profile API Service
 * 
 * Handles all API calls related to user profiles
 */

import { apiFetch } from '@common/api/client';
import { 
  GetProfileResponse, 
  UpdateProfileResponse, 
  ProfileApiError, 
  UserProfile, 
  PartialUserProfile 
} from '../types';

// API endpoints
const PROFILE_ENDPOINT = '/wp-json/fitcopilot/v1/profile';

/**
 * Get the current user's profile
 * 
 * @returns Promise resolving to the user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiFetch<GetProfileResponse>(PROFILE_ENDPOINT);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch profile');
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile fetch error:', error);
    throw error;
  }
}

/**
 * Update the current user's profile
 * 
 * @param profileData The profile data to update
 * @returns Promise resolving to the updated profile
 */
export async function updateProfile(profileData: PartialUserProfile): Promise<UserProfile> {
  try {
    const response = await apiFetch<UpdateProfileResponse>(PROFILE_ENDPOINT, {
      method: 'PUT',
      body: JSON.stringify({ profile: profileData }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update profile');
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
}

/**
 * Delete specific fields from the user's profile
 * 
 * @param fields Array of field names to delete
 * @returns Promise resolving to the updated profile
 */
export async function deleteProfileFields(fields: string[]): Promise<UserProfile> {
  try {
    const response = await apiFetch<UpdateProfileResponse>(`${PROFILE_ENDPOINT}/fields`, {
      method: 'DELETE',
      body: JSON.stringify({ fields }),
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete profile fields');
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile field deletion error:', error);
    throw error;
  }
} 