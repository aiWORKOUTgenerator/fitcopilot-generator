/**
 * Profile API Service
 * 
 * Handles all API calls related to user profiles with unified field naming
 */

import { apiFetch } from '../../../utils/api';
import { 
  GetProfileResponse, 
  UpdateProfileResponse, 
  ProfileApiError, 
  UserProfile, 
  PartialUserProfile 
} from '../types';

/**
 * Get the current user's profile
 * 
 * @returns Promise resolving to the user profile
 */
export async function getProfile(): Promise<UserProfile> {
  try {
    console.log('Fetching user profile from API...');
    
    const apiResponse = await apiFetch<any>({
      path: '/profile',
      method: 'GET'
    });
    
    console.log('Raw API response:', apiResponse);
    
    // Since we use unified field names, no mapping needed
    const profile: UserProfile = {
      id: apiResponse.id || 1,
      firstName: apiResponse.firstName || '',
      lastName: apiResponse.lastName || '',
      email: apiResponse.email || '',
      fitnessLevel: apiResponse.fitnessLevel || 'beginner',
      goals: apiResponse.goals || ['general_fitness'],
      customGoal: apiResponse.customGoal || '',
      weight: apiResponse.weight || 0,
      weightUnit: apiResponse.weightUnit || 'lbs',
      height: apiResponse.height || 0,
      heightUnit: apiResponse.heightUnit || 'ft',
      age: apiResponse.age || 0,
      gender: apiResponse.gender || undefined,
      availableEquipment: apiResponse.availableEquipment || ['none'],
      customEquipment: apiResponse.customEquipment || '',
      preferredLocation: apiResponse.preferredLocation || 'home',
      limitations: apiResponse.limitations || ['none'],
      limitationNotes: apiResponse.limitationNotes || '',
      medicalConditions: apiResponse.medicalConditions || '',
      preferredWorkoutDuration: apiResponse.preferredWorkoutDuration || 30,
      workoutFrequency: apiResponse.workoutFrequency || '3-4',
      customFrequency: apiResponse.customFrequency || '',
      favoriteExercises: apiResponse.favoriteExercises || [],
      dislikedExercises: apiResponse.dislikedExercises || [],
      lastUpdated: apiResponse.lastUpdated || new Date().toISOString(),
      profileComplete: apiResponse.profileComplete || false,
      completedWorkouts: apiResponse.completedWorkouts || 0
    };
    
    console.log('Profile data:', profile);
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    // Return a default profile if API fails
    console.log('Falling back to default profile data');
    return {
      id: 1,
      firstName: '',
      lastName: '',
      email: '',
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
      medicalConditions: '',
      preferredWorkoutDuration: 30,
      workoutFrequency: '3-4',
      customFrequency: '',
      favoriteExercises: [],
      dislikedExercises: [],
      lastUpdated: new Date().toISOString(),
      profileComplete: false,
      completedWorkouts: 0
    };
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
    console.log('Updating user profile via API...', profileData);
    
    // No field mapping needed - send data directly
    const apiResponse = await apiFetch<any>({
      path: '/profile',
      method: 'PUT',
      data: profileData
    });
    
    console.log('Update API response:', apiResponse);
    
    // Return the updated profile directly
    const updatedProfile: UserProfile = {
      id: apiResponse.id || 1,
      firstName: apiResponse.firstName || '',
      lastName: apiResponse.lastName || '',
      email: apiResponse.email || '',
      fitnessLevel: apiResponse.fitnessLevel || 'beginner',
      goals: apiResponse.goals || ['general_fitness'],
      customGoal: apiResponse.customGoal || '',
      weight: apiResponse.weight || 0,
      weightUnit: apiResponse.weightUnit || 'lbs',
      height: apiResponse.height || 0,
      heightUnit: apiResponse.heightUnit || 'ft',
      age: apiResponse.age || 0,
      gender: apiResponse.gender || undefined,
      availableEquipment: apiResponse.availableEquipment || ['none'],
      customEquipment: apiResponse.customEquipment || '',
      preferredLocation: apiResponse.preferredLocation || 'home',
      limitations: apiResponse.limitations || ['none'],
      limitationNotes: apiResponse.limitationNotes || '',
      medicalConditions: apiResponse.medicalConditions || '',
      preferredWorkoutDuration: apiResponse.preferredWorkoutDuration || 30,
      workoutFrequency: apiResponse.workoutFrequency || '3-4',
      customFrequency: apiResponse.customFrequency || '',
      favoriteExercises: apiResponse.favoriteExercises || [],
      dislikedExercises: apiResponse.dislikedExercises || [],
      lastUpdated: apiResponse.lastUpdated || new Date().toISOString(),
      profileComplete: apiResponse.profileComplete || false,
      completedWorkouts: apiResponse.completedWorkouts || 0
    };
    
    console.log('Updated profile:', updatedProfile);
    return updatedProfile;
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Return a merged profile if API fails
    console.log('Falling back to merged profile data');
    return {
      id: 1,
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      email: profileData.email || '',
      fitnessLevel: profileData.fitnessLevel || 'beginner',
      goals: profileData.goals || ['general_fitness'],
      customGoal: profileData.customGoal || '',
      weight: profileData.weight || 0,
      weightUnit: profileData.weightUnit || 'lbs',
      height: profileData.height || 0,
      heightUnit: profileData.heightUnit || 'ft',
      age: profileData.age || 0,
      gender: profileData.gender || undefined,
      availableEquipment: profileData.availableEquipment || ['none'],
      customEquipment: profileData.customEquipment || '',
      preferredLocation: profileData.preferredLocation || 'home',
      limitations: profileData.limitations || ['none'],
      limitationNotes: profileData.limitationNotes || '',
      medicalConditions: profileData.medicalConditions || '',
      preferredWorkoutDuration: profileData.preferredWorkoutDuration || 30,
      workoutFrequency: profileData.workoutFrequency || '3-4',
      customFrequency: profileData.customFrequency || '',
      favoriteExercises: profileData.favoriteExercises || [],
      dislikedExercises: profileData.dislikedExercises || [],
      lastUpdated: new Date().toISOString(),
      profileComplete: profileData.profileComplete || false,
      completedWorkouts: 0
    };
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