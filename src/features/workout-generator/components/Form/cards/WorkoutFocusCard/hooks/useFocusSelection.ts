/**
 * useFocusSelection Hook
 * 
 * Manages workout focus selection state and profile integration
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { GridOption } from '../../shared/types';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

// Focus options (6 of 7 legacy options for clean 3x2 grid)
const FOCUS_OPTIONS: GridOption<string>[] = [
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
  const { profile, loading, error } = profileState;

  // Get current selected focus (convert to array for GridSelector)
  const selectedFocus = formValues.sessionInputs?.todaysFocus 
    ? [formValues.sessionInputs.todaysFocus as string] 
    : [];

  // Map profile data for display
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const profileGoals = useMemo(() => {
    if (!profileMapping?.displayData?.goals) return [];
    
    return profileMapping.displayData.goals.slice(0, 2).map(goal => ({
      value: goal.value,
      display: goal.display,
      icon: goal.icon,
      color: 'var(--color-text-secondary, #b3b3b3)',
      bgColor: 'rgba(255, 255, 255, 0.05)'
    }));
  }, [profileMapping]);

  // Handle focus selection changes
  const handleFocusChange = useCallback((focus: string[]) => {
    const selectedFocus = focus[0]; // Single selection
    console.log('[WorkoutFocusCard] Focus selection changed:', selectedFocus);
    setTodaysFocus(selectedFocus);
  }, [setTodaysFocus]);

  return {
    focusOptions: FOCUS_OPTIONS,
    selectedFocus,
    profileGoals,
    isLoading: loading,
    error: error?.message,
    handleFocusChange
  };
}; 