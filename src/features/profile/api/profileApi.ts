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

// API endpoints - correctly defined without the base path (apiFetch will add it)
const PROFILE_ENDPOINT = '/profile';

/**
 * Get the current user's profile
 * 
 * @returns Promise resolving to the user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    // apiFetch already returns the data portion of the response
    const profile = await apiFetch<UserProfile>(PROFILE_ENDPOINT);
    return profile;
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
    // apiFetch already returns the data portion of the response
    const profile = await apiFetch<UserProfile>(PROFILE_ENDPOINT, {
      method: 'PUT',
      body: JSON.stringify({ profile: profileData }),
    });
    
    return profile;
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
    // apiFetch already returns the data portion of the response
    const profile = await apiFetch<UserProfile>(`${PROFILE_ENDPOINT}/fields`, {
      method: 'DELETE',
      body: JSON.stringify({ fields }),
    });
    
    return profile;
  } catch (error) {
    console.error('Profile field deletion error:', error);
    throw error;
  }
} 