/**
 * useWorkoutGeneratorGrid Hook
 * 
 * Main state management hook for the workout generator grid
 */
import { useCallback } from 'react';
import { useWorkoutForm } from '../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../../utils/profileMapping';

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

    // Check required fields using type-safe property access
    return (
      sessionInputs.todaysFocus !== undefined && sessionInputs.todaysFocus !== null &&
      sessionInputs.dailyIntensityLevel !== undefined && sessionInputs.dailyIntensityLevel !== null &&
      sessionInputs.timeConstraintsToday !== undefined && sessionInputs.timeConstraintsToday !== null &&
      sessionInputs.locationToday !== undefined && sessionInputs.locationToday !== null
    );
  }, [formValues.sessionInputs]);

  // Get completion status for UI feedback
  const getCompletionStatus = useCallback(() => {
    const sessionInputs = formValues.sessionInputs;
    if (!sessionInputs) return { completed: 0, total: 8 };

    let completed = 0;
    const total = 8;

    // Check each field using type-safe property access based on SessionSpecificInputs interface
    if (sessionInputs.todaysFocus !== undefined && sessionInputs.todaysFocus !== null) completed++;
    if (sessionInputs.dailyIntensityLevel !== undefined && sessionInputs.dailyIntensityLevel !== null) completed++;
    if (sessionInputs.timeConstraintsToday !== undefined && sessionInputs.timeConstraintsToday !== null) completed++;
    if (sessionInputs.focusArea && Array.isArray(sessionInputs.focusArea) && sessionInputs.focusArea.length > 0) completed++;
    if (sessionInputs.equipmentAvailableToday && Array.isArray(sessionInputs.equipmentAvailableToday) && sessionInputs.equipmentAvailableToday.length > 0) completed++;
    if (sessionInputs.healthRestrictionsToday && Array.isArray(sessionInputs.healthRestrictionsToday) && sessionInputs.healthRestrictionsToday.length > 0) completed++;
    if (sessionInputs.locationToday !== undefined && sessionInputs.locationToday !== null) completed++;
    if (sessionInputs.energyLevel !== undefined && sessionInputs.energyLevel !== null) completed++;

    return { completed, total };
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