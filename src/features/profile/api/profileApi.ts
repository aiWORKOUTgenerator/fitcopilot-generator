/**
 * Profile API Service
 * 
 * Handles all API calls related to user profiles with unified field naming
 */

import { apiFetch } from '../../../utils/api';
import { 
  GetProfileResponse, 
  UpdateProfileRequest,
  UpdateProfileResponse, 
  UpdateUserIdentityRequest,
  UpdateUserIdentityResponse,
  ValidateProfileResponse,
  GetWordPressUserDataResponse,
  ProfileApiError, 
  ProfileApiResponse,
  ProfileApiRequestOptions,
  UserProfile, 
  PartialUserProfile,
  UserIdentity,
  UserIdentityUpdate,
  WordPressUserData,
  ProfileValidationResult
} from '../types';

/**
 * Get the current user's profile with enhanced WordPress integration
 * 
 * @param options Optional request options for enhanced functionality
 * @returns Promise resolving to the user profile
 */
export async function getProfile(options?: ProfileApiRequestOptions): Promise<UserProfile> {
  try {
    console.log('🔍 [Profile API] Starting profile fetch...');
    
    // Debug authentication state
    console.log('🔍 [Profile API] Authentication check:', {
      windowExists: typeof window !== 'undefined',
      nonces: {
        fitcopilotData: (window as any)?.fitcopilotData?.nonce ? 'Present' : 'Missing',
        workoutGenerator: (window as any)?.workoutGenerator?.nonce ? 'Present' : 'Missing',
        wpApiSettings: (window as any)?.wpApiSettings?.nonce ? 'Present' : 'Missing',
        _wpnonce: (window as any)?._wpnonce ? 'Present' : 'Missing'
      },
      isLoggedIn: (window as any)?.fitcopilotData?.isLoggedIn,
      currentUserId: (window as any)?.fitcopilotData?.currentUserId
    });
    
    const profileData = await apiFetch<UserProfile>({
      path: '/profile',
      method: 'GET',
      data: options
    });
    
    console.log('✅ [Profile API] Successfully received profile data from backend');
    console.log('📊 [Profile API] Profile data summary:', {
      hasUserData: !!(profileData.firstName || profileData.lastName || profileData.email),
      hasWordPressData: !!(profileData.username || profileData.displayName),
      hasAvatarUrl: !!profileData.avatarUrl,
      profileComplete: profileData.profileComplete,
      fitnessLevel: profileData.fitnessLevel,
      lastUpdated: profileData.lastUpdated
    });
    
    // Return the profile data directly
    return profileData;
  } catch (error) {
    console.error('❌ [Profile API] Error occurred:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('❌ [Profile API] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3) // First 3 lines of stack
      });
    }
    
    // Check if this is an authentication error
    const isAuthError = error instanceof Error && (
      error.message.includes('401') ||
      error.message.includes('403') ||
      error.message.includes('unauthorized') ||
      error.message.includes('permission')
    );
    
    if (isAuthError) {
      console.warn('🔐 [Profile API] Authentication error detected - user may need to refresh page');
      console.warn('🔐 [Profile API] Suggestion: Check if WordPress session is valid');
    }
    
    // For new users or when no profile exists, provide a default profile structure
    // This allows the UI to work properly and show the form for profile creation
    console.log('🔄 [Profile API] Creating default profile for user...');
    
    // Get current user ID from WordPress if available
    const getCurrentUserId = (): number => {
      if (typeof window !== 'undefined') {
        const userId = (window as any).fitcopilotData?.currentUserId || 
                      (window as any).workoutGenerator?.currentUserId ||
                      1; // fallback to 1
        return parseInt(userId, 10) || 1;
      }
      return 1;
    };
    
    // Create a default profile structure that matches the UserProfile interface
    const defaultProfile: UserProfile = {
      id: getCurrentUserId(),
      // WordPress user fields will be populated by backend when available
      username: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      displayName: undefined,
      avatarUrl: undefined,
      
      // Default fitness profile values
      fitnessLevel: 'beginner',
      goals: ['general_fitness'],
      customGoal: '',
      weight: 0,
      weightUnit: 'lbs',
      height: 0,
      heightUnit: 'ft',
      age: 0,
      gender: undefined,
      availableEquipment: ['none'],
      customEquipment: '',
      preferredLocation: 'home',
      limitations: ['none'],
      limitationNotes: '',
      preferredWorkoutDuration: 30,
      workoutFrequency: '3-4',
      customFrequency: '',
      favoriteExercises: [],
      dislikedExercises: [],
      medicalConditions: '',
      
      // Meta fields
      lastUpdated: new Date().toISOString(),
      profileComplete: false,
      completedWorkouts: 0
    };
    
    console.log('🔄 [Profile API] Returning default profile:', {
      userId: defaultProfile.id,
      isDefault: true,
      reason: isAuthError ? 'Authentication Error' : 'API Error'
    });
    
    return defaultProfile;
  }
}

/**
 * Update the current user's profile with enhanced WordPress integration
 * 
 * @param profileData The profile data to update
 * @param options Optional request options for enhanced functionality
 * @returns Promise resolving to the updated profile
 */
export async function updateProfile(
  profileData: PartialUserProfile, 
  options?: ProfileApiRequestOptions
): Promise<UserProfile> {
  try {
    console.log('Updating user profile via API...', profileData, options);
    
    const request: UpdateProfileRequest = {
      profile: profileData
    };
    
    const updatedProfile = await apiFetch<UserProfile>({
      path: '/profile',
      method: 'PUT',
      data: { ...request, ...options }
    });
    
    console.log('Update API response:', updatedProfile);
    
    // Return the updated profile data directly
    console.log('Updated profile:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Don't fall back to merged data - throw the error so UI can handle it properly
    throw error;
  }
}

/**
 * Save draft profile data (for step-by-step auto-save)
 * 
 * @param profileData The profile data to save as draft
 * @returns Promise resolving to the updated profile
 */
export async function saveDraftProfile(profileData: PartialUserProfile): Promise<UserProfile> {
  try {
    console.log('Saving draft profile data...', profileData);
    
    // Mark as draft save (not complete)
    const draftData = {
      ...profileData,
      profileComplete: false
    };
    
    // Use the same update endpoint but with draft flag
    return await updateProfile(draftData);
  } catch (error) {
    console.error('Error saving draft profile:', error);
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
    console.log('Deleting profile fields via API...', fields);
    
    // Create update data with default values for deleted fields
    const updateData: PartialUserProfile = {};
    
    fields.forEach(field => {
      switch (field) {
        case 'fitnessLevel':
          updateData.fitnessLevel = 'beginner';
          break;
        case 'goals':
          updateData.goals = ['general_fitness'];
          break;
        case 'availableEquipment':
          updateData.availableEquipment = ['none'];
          break;
        case 'limitations':
          updateData.limitations = ['none'];
          break;
        case 'workoutFrequency':
          updateData.workoutFrequency = '3-4';
          break;
        case 'preferredWorkoutDuration':
          updateData.preferredWorkoutDuration = 30;
          break;
        case 'preferredLocation':
          updateData.preferredLocation = 'home';
          break;
        default:
          // For string fields, set to empty string
          (updateData as any)[field] = '';
          break;
      }
    });
    
    return await updateProfile(updateData);
  } catch (error) {
    console.error('Error deleting profile fields:', error);
    throw error;
  }
}

/**
 * Debug profile authentication and data loading
 * 
 * @returns Promise resolving to debug information
 */
export async function debugProfileAuth(): Promise<any> {
  try {
    console.log('🔧 [Profile Debug] Calling debug endpoint...');
    
    const debugData = await apiFetch<any>({
      path: '/profile/debug',
      method: 'GET'
    });
    
    console.log('🔧 [Profile Debug] Debug response:', debugData);
    return debugData;
  } catch (error) {
    console.error('🔧 [Profile Debug] Debug endpoint failed:', error);
    throw error;
  }
} 