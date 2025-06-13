/**
 * useStressMoodSelection Hook
 * 
 * Manages stress and mood level selection state for the StressMoodCard.
 * Handles profile integration and daily stress/mood level selection (1-6 scale).
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

interface StressLevelOption {
  value: number;
  label: string;
  icon: string;
  title: string;
}

export const useStressMoodSelection = () => {
  const { formValues, setMoodLevel } = useWorkoutForm();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Get current stress level selection from session inputs (moodLevel maps to stress)
  const selectedStressLevel = formValues.sessionInputs?.moodLevel || 0;

  // Profile mapping for stress/mood preferences
  const profileMapping = useMemo(() => {
    if (!profile) return null;
    return mapProfileToWorkoutContext(profile);
  }, [profile]);

  // Check if profile has sufficient data
  const isProfileSufficient = useMemo(() => {
    return !!(profile && profile.fitness_level && profile.preferences);
  }, [profile]);

  // Stress level options for the 3x2 grid (6 levels)
  const stressLevelOptions: StressLevelOption[] = [
    { 
      value: 1, 
      label: 'Very Low', 
      icon: '🟢',
      title: 'Very Low - Completely relaxed'
    },
    { 
      value: 2, 
      label: 'Low', 
      icon: '🔵',
      title: 'Low - Mostly calm and relaxed'
    },
    { 
      value: 3, 
      label: 'Moderate', 
      icon: '🟡',
      title: 'Moderate - Some tension, manageable'
    },
    { 
      value: 4, 
      label: 'High', 
      icon: '🟠',
      title: 'High - Feeling stressed and tense'
    },
    { 
      value: 5, 
      label: 'Very High', 
      icon: '🔴',
      title: 'Very High - Significant stress and anxiety'
    },
    { 
      value: 6, 
      label: 'Extreme', 
      icon: '🟣',
      title: 'Extreme - Overwhelmed and very anxious'
    }
  ];

  // Handle stress level selection
  const handleStressLevelSelection = useCallback((level: number) => {
    console.log('[useStressMoodSelection] Stress level selected:', { 
      level, 
      previousLevel: selectedStressLevel 
    });
    
    setMoodLevel(level);
  }, [selectedStressLevel, setMoodLevel]);

  return {
    selectedStressLevel,
    handleStressLevelSelection,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping,
    stressLevelOptions
  };
}; 