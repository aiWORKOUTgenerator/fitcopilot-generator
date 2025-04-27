/**
 * Hook for profile completeness checking
 * 
 * This hook provides functionality for checking the completeness status of user profiles.
 */
import { useMemo } from 'react';
import { UserProfileState } from '../types/state';

/**
 * useProfileStatus Hook
 * 
 * Custom hook for determining if a user's fitness profile is complete
 */

/**
 * Hook to determine if a user profile is complete enough to generate workouts
 * 
 * @param profile - The user profile object
 * @returns boolean indicating if profile is complete
 */
export const useProfileStatus = (profile: UserProfileState | null): boolean => {
  return useMemo(() => {
    // If no profile exists at all, it's not complete
    if (!profile) return false;
    
    // Basic check for required profile fields
    const hasBasicInfo = Boolean(
      profile.fitnessLevel && 
      profile.goals?.length
    );
    
    // Allow equipment to be empty if the user has explicitly set it
    const hasEquipmentInfo = 
      Array.isArray(profile.preferredEquipment) &&
      (profile.preferredEquipment.length > 0 || profile.preferredEquipment.includes('None'));
    
    return profile.isComplete || (hasBasicInfo && hasEquipmentInfo);
  }, [profile]);
};

export default useProfileStatus; 