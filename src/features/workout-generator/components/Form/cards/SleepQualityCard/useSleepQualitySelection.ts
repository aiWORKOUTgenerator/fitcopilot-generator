/**
 * useSleepQualitySelection Hook
 * 
 * Manages sleep quality selection state for the SleepQualityCard.
 * Handles profile integration and daily sleep quality assessment (1-6 scale).
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

interface SleepQualityOption {
  value: number;
  label: string;
  title: string;
}

export const useSleepQualitySelection = () => {
  const { formValues, setSleepQuality } = useWorkoutForm();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Get current sleep quality selection from session inputs
  const selectedSleepQuality = formValues.sessionInputs?.sleepQuality || 0;

  // Profile mapping for sleep preferences  
  const profileMapping = useMemo(() => {
    if (!profile) return null;
    return mapProfileToWorkoutContext(profile);
  }, [profile]);

  // Check if profile has sufficient data
  const isProfileSufficient = useMemo(() => {
    return !!(profile && profile.fitness_level && profile.preferences);
  }, [profile]);

  // Sleep quality options (6 levels from best to worst)
  const sleepQualityOptions: SleepQualityOption[] = [
    { 
      value: 6, 
      label: 'Excellent', 
      title: 'Excellent - Deep, restful sleep all night'
    },
    { 
      value: 5, 
      label: 'Good', 
      title: 'Good - Solid sleep with minimal interruptions'
    },
    { 
      value: 4, 
      label: 'Fair', 
      title: 'Fair - Decent sleep but some restlessness'
    },
    { 
      value: 3, 
      label: 'Poor', 
      title: 'Poor - Restless night with frequent waking'
    },
    { 
      value: 2, 
      label: 'Very Poor', 
      title: 'Very Poor - Little sleep, very restless'
    },
    { 
      value: 1, 
      label: 'Terrible', 
      title: 'Terrible - Almost no sleep, exhausted'
    }
  ];

  // Handle sleep quality selection
  const handleSleepQualitySelection = useCallback((level: number) => {
    console.log('[useSleepQualitySelection] Sleep quality selected:', { 
      level, 
      previousLevel: selectedSleepQuality 
    });
    
    setSleepQuality(level);
  }, [selectedSleepQuality, setSleepQuality]);

  return {
    selectedSleepQuality,
    handleSleepQualitySelection,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping,
    sleepQualityOptions
  };
}; 