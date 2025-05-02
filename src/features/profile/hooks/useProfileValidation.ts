/**
 * useProfileValidation Hook
 * 
 * Custom hook for validating profile data
 */
import { useCallback } from 'react';
import { PartialUserProfile } from '../types';

type ValidationErrors = Record<string, string>;

/**
 * Hook to validate user profile data
 */
export const useProfileValidation = () => {
  /**
   * Validate profile data
   */
  const validateProfile = useCallback((profile: PartialUserProfile): ValidationErrors => {
    const errors: ValidationErrors = {};

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
    
    // If 'other' limitation is selected, validate limitation notes
    if (profile.limitations?.includes('other') && !profile.limitationNotes) {
      errors.limitationNotes = 'Please provide details about your limitations';
    }

    // Optional field validations
    
    // Weight validation if provided
    if (profile.weight !== undefined) {
      if (isNaN(profile.weight) || profile.weight <= 0) {
        errors.weight = 'Please enter a valid weight';
      }
      
      if (!profile.weightUnit) {
        errors.weightUnit = 'Please select a weight unit';
      }
    }
    
    // Height validation if provided
    if (profile.height !== undefined) {
      if (isNaN(profile.height) || profile.height <= 0) {
        errors.height = 'Please enter a valid height';
      }
      
      if (!profile.heightUnit) {
        errors.heightUnit = 'Please select a height unit';
      }
    }
    
    // Age validation if provided
    if (profile.age !== undefined) {
      if (isNaN(profile.age) || profile.age <= 0 || profile.age > 120) {
        errors.age = 'Please enter a valid age between 1-120';
      }
    }

    return errors;
  }, []);

  /**
   * Check if profile has all required fields
   */
  const isProfileComplete = useCallback((profile: PartialUserProfile): boolean => {
    const errors = validateProfile(profile);
    return Object.keys(errors).length === 0;
  }, [validateProfile]);

  return {
    validateProfile,
    isProfileComplete
  };
};

export default useProfileValidation; 