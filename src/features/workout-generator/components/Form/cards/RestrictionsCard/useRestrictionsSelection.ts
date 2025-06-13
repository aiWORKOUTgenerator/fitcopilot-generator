/**
 * useRestrictionsSelection Hook
 * 
 * Manages health restrictions and limitations selection state for the RestrictionsCard.
 * Handles profile integration and daily restriction selection with toggle functionality.
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

interface RestrictionOption {
  value: string;
  label: string;
  title: string;
}

export const useRestrictionsSelection = () => {
  const { formValues, setHealthRestrictionsToday } = useWorkoutForm();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Get current selections from session inputs
  const selectedRestrictions = formValues.sessionInputs?.healthRestrictionsToday || [];

  // Profile mapping for restrictions/limitations
  const profileMapping = useMemo(() => {
    if (!profile) return null;
    return mapProfileToWorkoutContext(profile);
  }, [profile]);

  // Check if profile has sufficient data
  const isProfileSufficient = useMemo(() => {
    return !!(profile && profile.fitness_level && profile.preferences);
  }, [profile]);

  // Restriction options for the grid
  const restrictionOptions: RestrictionOption[] = [
    { value: 'shoulders', label: 'Shoulders', title: 'Shoulders soreness or discomfort' },
    { value: 'arms', label: 'Arms', title: 'Arms soreness or discomfort' },
    { value: 'chest', label: 'Chest', title: 'Chest soreness or discomfort' },
    { value: 'back', label: 'Back', title: 'Back soreness or discomfort' },
    { value: 'core', label: 'Core/Abs', title: 'Core/Abs soreness or discomfort' },
    { value: 'hips', label: 'Hips', title: 'Hips soreness or discomfort' },
    { value: 'legs', label: 'Legs', title: 'Legs soreness or discomfort' },
    { value: 'knees', label: 'Knees', title: 'Knees soreness or discomfort' },
    { value: 'ankles', label: 'Ankles', title: 'Ankles soreness or discomfort' }
  ];

  // Handle restriction toggle
  const handleRestrictionToggle = useCallback((restriction: string) => {
    const isActive = selectedRestrictions.includes(restriction);
    
    const newRestrictions = isActive
      ? selectedRestrictions.filter(r => r !== restriction)
      : [...selectedRestrictions, restriction];
      
    console.log('[useRestrictionsSelection] Restriction toggled:', { 
      restriction, 
      isActive, 
      newRestrictions 
    });
    
    setHealthRestrictionsToday(newRestrictions);
  }, [selectedRestrictions, setHealthRestrictionsToday]);

  return {
    selectedRestrictions,
    handleRestrictionToggle,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping,
    restrictionOptions
  };
}; 