/**
 * useFocusSelection Hook
 * 
 * Manages workout focus selection state and profile integration
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../../../utils/profileMapping';

interface FocusOption {
  value: string;
  label: string;
  icon: string;
  tooltip: string;
}

interface ProfileGoal {
  value: string;
  display: string;
  icon: string;
}

const FOCUS_OPTIONS: FocusOption[] = [
  {
    value: 'fat-burning',
    label: 'Fat Burning',
    icon: '🔥',
    tooltip: 'Fat Burning & Cardio'
  },
  {
    value: 'muscle-building',
    label: 'Build Muscle',
    icon: '💪',
    tooltip: 'Muscle Building'
  },
  {
    value: 'endurance',
    label: 'Endurance',
    icon: '🏃',
    tooltip: 'Endurance & Stamina'
  },
  {
    value: 'strength',
    label: 'Strength',
    icon: '🏋️',
    tooltip: 'Strength Training'
  },
  {
    value: 'flexibility',
    label: 'Flexibility',
    icon: '🧘',
    tooltip: 'Flexibility & Mobility'
  },
  {
    value: 'general-fitness',
    label: 'General',
    icon: '⚡',
    tooltip: 'General Fitness'
  }
];

export const useFocusSelection = () => {
  const { setTodaysFocus, formValues } = useWorkoutForm();
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;

  // Get current selected focus
  const selectedFocus = formValues.sessionInputs?.todaysFocus || '';

  // Profile integration
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const isProfileSufficient = isProfileSufficientForWorkout(profile);
  const hasProfileData = !profileLoading && !profileError && isProfileSufficient && profileMapping;

  // Extract profile goals for display
  const profileGoals: ProfileGoal[] = useMemo(() => {
    if (!hasProfileData || !profileMapping) return [];
    
    return profileMapping.displayData.goals.map(goal => ({
      value: goal.value,
      display: goal.display, 
      icon: goal.icon
    }));
  }, [hasProfileData, profileMapping]);

  // Focus selection handler
  const handleFocusSelection = useCallback((focus: string) => {
    console.log('[WorkoutFocusCard] Focus selected:', focus);
    setTodaysFocus(focus);
  }, [setTodaysFocus]);

  return {
    focusOptions: FOCUS_OPTIONS,
    selectedFocus,
    profileGoals,
    hasProfileData: !!hasProfileData,
    handleFocusSelection
  };
}; 