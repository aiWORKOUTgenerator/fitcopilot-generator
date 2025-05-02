/**
 * Profile API Types
 * 
 * Type definitions for API interactions related to user profiles
 */

import { UserProfile, PartialUserProfile } from './profile';

/**
 * Get profile response from the API
 */
export interface GetProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

/**
 * Update profile request to the API
 */
export interface UpdateProfileRequest {
  profile: PartialUserProfile;
}

/**
 * Update profile response from the API
 */
export interface UpdateProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

/**
 * API error response
 */
export interface ProfileApiError {
  success: false;
  message: string;
  code?: string;
  validationErrors?: Record<string, string>;
} 