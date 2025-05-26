/**
 * useProfileValidation Hook
 * 
 * Custom hook for validating profile data
 */
import { useCallback } from 'react';
import { PartialUserProfile } from '../types';

export type ValidationErrors = Record<string, string>;

/**
 * Hook to validate user profile data
 */
export const useProfileValidation = () => {
  /**
   * Validate profile data
   */
  const validateProfile = useCallback((profile: PartialUserProfile): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Validate personal information
    if (!profile.firstName || profile.firstName.trim().length === 0) {
      errors.firstName = 'First name is required';
    } else if (profile.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    if (!profile.lastName || profile.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required';
    } else if (profile.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!profile.email || profile.email.trim().length === 0) {
      errors.email = 'Email address is required';
    } else {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profile.email.trim())) {
        errors.email = 'Please enter a valid email address';
      }
    }

    // Validate fitness level
    if (!profile.fitnessLevel) {
      errors.fitnessLevel = 'Fitness level is required';
    }

    // Validate goals
    if (!profile.goals || profile.goals.length === 0) {
      errors.goals = 'At least one fitness goal is required';
    }
    
    // If custom goal is selected, validate custom goal text
    if (profile.goals?.includes('custom') && !profile.customGoal) {
      errors.customGoal = 'Please specify your custom goal';
    }

    // Validate available equipment
    if (!profile.availableEquipment || profile.availableEquipment.length === 0) {
      errors.availableEquipment = 'Please select available equipment';
    }
    
    // If 'other' equipment is selected, validate custom equipment text
    if (profile.availableEquipment?.includes('other') && !profile.customEquipment) {
      errors.customEquipment = 'Please specify your custom equipment';
    }

    // Validate workout location
    if (!profile.preferredLocation) {
      errors.preferredLocation = 'Workout location is required';
    }

    // Validate workout frequency
    if (!profile.workoutFrequency) {
      errors.workoutFrequency = 'Workout frequency is required';
    }
    
    // If custom frequency is selected, validate custom frequency text
    if (profile.workoutFrequency === 'custom' && !profile.customFrequency) {
      errors.customFrequency = 'Please specify your custom workout frequency';
    }

    // Validate physical limitations
    if (!profile.limitations || profile.limitations.length === 0) {
      errors.limitations = 'Please select any physical limitations (select "none" if none apply)';
    }
    
    // Remove validations that shouldn't block progression through the form
    // Favorite exercises are optional and shouldn't produce validation errors
    delete errors.favoriteExercises;
    delete errors.dislikedExercises;
    
    // Don't validate preferredExerciseTypes as it's handled in a different section
    delete errors.preferredExerciseTypes;

    return errors;
  }, []);

  /**
   * Check if profile is complete enough to be used
   */
  const isProfileComplete = useCallback((profile: PartialUserProfile): boolean => {
    return Boolean(
      profile.firstName &&
      profile.firstName.trim().length >= 2 &&
      profile.lastName &&
      profile.lastName.trim().length >= 2 &&
      profile.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()) &&
      profile.fitnessLevel &&
      profile.goals &&
      profile.goals.length > 0 &&
      (!profile.goals.includes('custom') || Boolean(profile.customGoal)) &&
      profile.availableEquipment &&
      profile.availableEquipment.length > 0 &&
      (!profile.availableEquipment.includes('other') || Boolean(profile.customEquipment)) &&
      profile.preferredLocation &&
      profile.workoutFrequency &&
      (!profile.workoutFrequency === 'custom' || Boolean(profile.customFrequency)) &&
      profile.limitations &&
      profile.limitations.length > 0
    );
  }, []);

  return {
    validateProfile,
    isProfileComplete
  };
};

export default useProfileValidation; 