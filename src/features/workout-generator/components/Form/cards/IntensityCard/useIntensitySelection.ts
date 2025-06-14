import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../../../utils/profileMapping';

interface IntensityOption {
  value: number;
  label: string;
  icon: string;
  tooltip: string;
}

interface ProfileIntensity {
  value: number;
  display: string;
  icon: string;
  color: string;
  bgColor: string;
}

const INTENSITY_OPTIONS: IntensityOption[] = [
  {
    value: 1,
    label: 'Light',
    icon: '🚶',
    tooltip: 'Light - Easy recovery pace'
  },
  {
    value: 2,
    label: 'Easy',
    icon: '🏃‍♀️',
    tooltip: 'Easy - Comfortable effort'
  },
  {
    value: 3,
    label: 'Moderate',
    icon: '💪',
    tooltip: 'Moderate - Challenging but sustainable'
  },
  {
    value: 4,
    label: 'Hard',
    icon: '🔥',
    tooltip: 'Hard - Very challenging effort'
  },
  {
    value: 5,
    label: 'Very Hard',
    icon: '💥',
    tooltip: 'Very Hard - Intense, demanding effort'
  },
  {
    value: 6,
    label: 'Extreme',
    icon: '⚡',
    tooltip: 'Extreme - Maximum all-out effort'
  }
];

export const useIntensitySelection = () => {
  const { setDailyIntensityLevel, formValues } = useWorkoutForm();
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;
  
  // Get current intensity from form values
  const selectedIntensity = formValues.sessionInputs?.dailyIntensityLevel || formValues.intensity_level || 0;
  
  // Map profile data for display
  const profileMapping = useMemo(() => {
    return profile ? mapProfileToWorkoutContext(profile) : null;
  }, [profile]);
  
  const isProfileSufficient = useMemo(() => {
    return isProfileSufficientForWorkout(profile);
  }, [profile]);

  const hasProfileData = !profileLoading && !profileError && isProfileSufficient && profileMapping;

  // Get profile intensity suggestion if available
  const profileIntensity: ProfileIntensity | null = useMemo(() => {
    if (!profileMapping?.displayData?.fitnessLevel) return null;
    
    // Map fitness level to suggested intensity
    const fitnessLevel = profileMapping.displayData.fitnessLevel.value;
    let suggestedIntensity = 3; // Default moderate
    
    switch (fitnessLevel) {
      case 'beginner':
        suggestedIntensity = 2; // Easy
        break;
      case 'intermediate':
        suggestedIntensity = 3; // Moderate
        break;
      case 'advanced':
        suggestedIntensity = 4; // Hard
        break;
    }
    
    const option = INTENSITY_OPTIONS.find(opt => opt.value === suggestedIntensity) || INTENSITY_OPTIONS[2];
    
    return {
      value: suggestedIntensity,
      display: `${option.label} (${suggestedIntensity}/6)`,
      icon: option.icon,
      color: '#fff',
      bgColor: suggestedIntensity <= 2 ? '#22c55e' : suggestedIntensity <= 4 ? '#f59e0b' : '#ef4444'
    };
  }, [profileMapping]);

  // Handle intensity selection
  const handleIntensitySelection = useCallback((intensity: number) => {
    console.log('[IntensityCard] Intensity selected:', intensity);
    setDailyIntensityLevel(intensity);
  }, [setDailyIntensityLevel]);

  return {
    intensityOptions: INTENSITY_OPTIONS,
    selectedIntensity,
    profileIntensity,
    hasProfileData: !!hasProfileData,
    handleIntensitySelection
  };
}; 