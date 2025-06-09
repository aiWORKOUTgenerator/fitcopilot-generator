/**
 * useWorkoutGeneratorGrid Hook
 * 
 * Main state management hook for the workout generator grid
 */
import { useCallback } from 'react';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { useProfile } from '../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../utils/profileMapping';

export const useWorkoutGeneratorGrid = () => {
  const { formValues } = useWorkoutForm();
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;

  // Map profile data to workout context
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const isProfileSufficient = isProfileSufficientForWorkout(profile);

  // Check if all required fields are completed
  const isReadyToGenerate = useCallback(() => {
    const sessionInputs = formValues.sessionInputs;
    if (!sessionInputs) return false;

    const requiredFields = [
      'todaysFocus',
      'dailyIntensityLevel',
      'timeConstraintsToday',
      'locationToday'
    ];

    return requiredFields.every(field => sessionInputs[field] !== undefined && sessionInputs[field] !== null);
  }, [formValues.sessionInputs]);

  // Get completion status for UI feedback
  const getCompletionStatus = useCallback(() => {
    const sessionInputs = formValues.sessionInputs;
    if (!sessionInputs) return { completed: 0, total: 8 };

    const fields = [
      'todaysFocus',
      'dailyIntensityLevel', 
      'timeConstraintsToday',
      'targetMuscles',
      'equipmentAvailableToday',
      'healthRestrictionsToday',
      'locationToday',
      'energyLevel'
    ];

    const completed = fields.filter(field => {
      const value = sessionInputs[field];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    }).length;

    return { completed, total: fields.length };
  }, [formValues.sessionInputs]);

  return {
    // Profile state
    profile,
    profileLoading,
    profileError,
    profileMapping,
    isProfileSufficient,
    
    // Form state
    formValues,
    isReadyToGenerate: isReadyToGenerate(),
    completionStatus: getCompletionStatus(),
    
    // Debug information
    debugInfo: {
      hasProfile: !!profile,
      hasSessionInputs: !!formValues.sessionInputs,
      profileMappingExists: !!profileMapping,
      sessionInputsCount: formValues.sessionInputs ? Object.keys(formValues.sessionInputs).length : 0
    }
  };
}; 