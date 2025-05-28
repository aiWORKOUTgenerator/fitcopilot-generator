/**
 * Profile API Types
 * 
 * Type definitions for API interactions related to user profiles with WordPress integration
 */

import { 
  UserProfile, 
  PartialUserProfile, 
  UserIdentity,
  UserIdentityUpdate,
  WordPressUserData,
  ProfileValidationResult,
  UserDataSource
} from './profile';

/**
 * Get profile response from the API with enhanced WordPress integration
 */
export interface GetProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
  meta?: {
    hasWordPressData: boolean;
    dataSources: Record<string, UserDataSource>;
    avatarGenerated: boolean;
  };
}

/**
 * Update profile request to the API
 */
export interface UpdateProfileRequest {
  profile: PartialUserProfile;
}

/**
 * Update profile response from the API with enhanced metadata
 */
export interface UpdateProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
  meta?: {
    fieldsUpdated: string[];
    validationResult?: ProfileValidationResult;
    wordPressFieldsAffected: boolean;
  };
}

/**
 * User identity update request (focused identity updates)
 */
export interface UpdateUserIdentityRequest {
  identity: UserIdentityUpdate;
}

/**
 * User identity update response
 */
export interface UpdateUserIdentityResponse {
  success: boolean;
  data: UserIdentity;
  message?: string;
  meta?: {
    fieldsUpdated: string[];
    fallbacksUsed: Record<string, UserDataSource>;
  };
}

/**
 * WordPress user data response (for debugging/admin purposes)
 */
export interface GetWordPressUserDataResponse {
  success: boolean;
  data: WordPressUserData;
  message?: string;
  meta?: {
    userExists: boolean;
    avatarUrl: string | null;
    dataComplete: boolean;
  };
}

/**
 * Profile validation response
 */
export interface ValidateProfileResponse {
  success: boolean;
  data: ProfileValidationResult;
  message?: string;
}

/**
 * Enhanced API error response with WordPress integration context
 */
export interface ProfileApiError {
  success: false;
  message: string;
  code?: string;
  validationErrors?: Record<string, string>;
  context?: {
    wordPressUserAvailable: boolean;
    fallbacksAttempted: string[];
    dataSourcesChecked: UserDataSource[];
  };
}

/**
 * API response union type for type-safe error handling
 */
export type ProfileApiResponse<T> = 
  | (T & { success: true })
  | ProfileApiError;

/**
 * Batch profile operations request
 */
export interface BatchProfileRequest {
  operations: Array<{
    type: 'update' | 'validate' | 'identity_update';
    data: PartialUserProfile | UserIdentityUpdate;
  }>;
}

/**
 * Batch profile operations response
 */
export interface BatchProfileResponse {
  success: boolean;
  results: Array<{
    operation: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
  message?: string;
}

/**
 * API endpoint mapping for type-safe requests
 */
export interface ProfileApiEndpoints {
  '/profile': {
    GET: {
      request: void;
      response: GetProfileResponse;
    };
    PUT: {
      request: UpdateProfileRequest;
      response: UpdateProfileResponse;
    };
  };
  '/profile/identity': {
    PUT: {
      request: UpdateUserIdentityRequest;
      response: UpdateUserIdentityResponse;
    };
  };
  '/profile/validate': {
    POST: {
      request: { profile: PartialUserProfile };
      response: ValidateProfileResponse;
    };
  };
  '/profile/wordpress-data': {
    GET: {
      request: void;
      response: GetWordPressUserDataResponse;
    };
  };
}

/**
 * API request options for enhanced profile operations
 */
export interface ProfileApiRequestOptions {
  includeWordPressData?: boolean;
  includeFallbackSources?: boolean;
  validateBeforeUpdate?: boolean;
  generateAvatar?: boolean;
  timeout?: number;
}

/**
 * API cache configuration for profile data
 */
export interface ProfileApiCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  invalidateOnUpdate: boolean;
  cacheWordPressData: boolean;
}

/**
 * Profile API client configuration
 */
export interface ProfileApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  cache: ProfileApiCacheConfig;
  defaultOptions: ProfileApiRequestOptions;
} 