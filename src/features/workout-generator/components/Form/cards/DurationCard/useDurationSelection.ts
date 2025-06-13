import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../../../utils/profileMapping';

interface DurationOption {
  value: number;
  label: string;
  tooltip: string;
}

interface ProfileDuration {
  value: number;
  display: string;
  icon: string;
  color: string;
  bgColor: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  {
    value: 10,
    label: 'Quick',
    tooltip: '10 minutes - Quick session'
  },
  {
    value: 15,
    label: 'Short',
    tooltip: '15 minutes - Short workout'
  },
  {
    value: 20,
    label: 'Compact',
    tooltip: '20 minutes - Compact session'
  },
  {
    value: 30,
    label: 'Standard',
    tooltip: '30 minutes - Standard workout'
  },
  {
    value: 45,
    label: 'Extended',
    tooltip: '45 minutes - Extended session'
  },
  {
    value: 60,
    label: 'Full',
    tooltip: '60 minutes - Full workout'
  }
];

export const useDurationSelection = () => {
  const { setTimeConstraintsToday, formValues } = useWorkoutForm();
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;
  
  // Get current duration from form values
  const selectedDuration = formValues.sessionInputs?.timeConstraintsToday || formValues.duration || 0;
  
  // Map profile data for display
  const profileMapping = useMemo(() => {
    return profile ? mapProfileToWorkoutContext(profile) : null;
  }, [profile]);
  
  const isProfileSufficient = useMemo(() => {
    return isProfileSufficientForWorkout(profile);
  }, [profile]);

  const hasProfileData = !profileLoading && !profileError && isProfileSufficient && profileMapping;

  // Get profile duration suggestion if available
  const profileDuration: ProfileDuration | null = useMemo(() => {
    if (!profileMapping?.displayData?.frequency) return null;
    
    // Map frequency to suggested duration
    const frequency = profileMapping.displayData.frequency.value;
    let suggestedDuration = 30; // Default
    
    switch (frequency) {
      case 'daily':
        suggestedDuration = 20; // Shorter for daily workouts
        break;
      case '4-5-times-week':
        suggestedDuration = 30; // Standard
        break;
      case '2-3-times-week':
        suggestedDuration = 45; // Longer for less frequent
        break;
      case 'weekly':
        suggestedDuration = 60; // Full workout for weekly
        break;
    }
    
    const option = DURATION_OPTIONS.find(opt => opt.value === suggestedDuration) || DURATION_OPTIONS[3];
    
    return {
      value: suggestedDuration,
      display: `${suggestedDuration} min (${option.label})`,
      icon: '⏱️',
      color: '#fff',
      bgColor: suggestedDuration <= 20 ? '#22c55e' : suggestedDuration <= 30 ? '#f59e0b' : '#ef4444'
    };
  }, [profileMapping]);

  // Handle duration selection
  const handleDurationSelection = useCallback((duration: number) => {
    console.log('[DurationCard] Duration selected:', duration);
    setTimeConstraintsToday(duration);
  }, [setTimeConstraintsToday]);

  return {
    durationOptions: DURATION_OPTIONS,
    selectedDuration,
    profileDuration,
    hasProfileData: !!hasProfileData,
    handleDurationSelection
  };
}; 