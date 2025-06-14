/**
 * useFocusSelection Hook
 * 
 * Manages workout focus selection state and profile integration with analytics tracking
 */
import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext, isProfileSufficientForWorkout } from '../../../../utils/profileMapping';
import { useWorkoutFocusAnalytics } from '../../../../hooks/useWorkoutFocusAnalytics';

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
  
  // Ref to prevent multiple auto-restores
  const hasAutoRestored = useRef(false);

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

  // Stable callback for last selection loaded
  const onLastSelectionLoaded = useCallback((selection: any) => {
    // Auto-restore last selection if no current selection and haven't already restored
    if (selection && !formValues.sessionInputs?.todaysFocus && !hasAutoRestored.current) {
      console.log('[WorkoutFocusCard] Restoring last selection:', selection.focus);
      setTodaysFocus(selection.focus);
      hasAutoRestored.current = true;
    }
  }, [formValues.sessionInputs?.todaysFocus, setTodaysFocus]);

  // Stable callbacks for tracking events
  const onTrackingSuccess = useCallback((focus: string) => {
    console.log('[WorkoutFocusCard] Analytics tracking successful:', focus);
  }, []);

  const onTrackingError = useCallback((error: string) => {
    console.warn('[WorkoutFocusCard] Analytics tracking failed:', error);
  }, []);

  // Analytics integration with stable callbacks
  const {
    lastSelection,
    isLoadingLastSelection,
    trackFocus,
    hasPreviousSelection,
    mostPopularFocus
  } = useWorkoutFocusAnalytics({
    autoLoadLastSelection: true,
    autoTrack: true,
    context: {
      source: 'workout-generator',
      step: 'focus-selection'
    },
    onLastSelectionLoaded,
    onTrackingSuccess,
    onTrackingError
  });

  // Get current selected focus (prioritize form state, fallback to last selection)
  const selectedFocus = formValues.sessionInputs?.todaysFocus || lastSelection?.focus || '';

  // Focus selection handler with analytics tracking
  const handleFocusSelection = useCallback(async (focus: string) => {
    console.log('[WorkoutFocusCard] Focus selected:', focus);
    
    // Update form state immediately
    setTodaysFocus(focus);
    
    // Track selection for analytics (async, non-blocking)
    try {
      await trackFocus(focus, {
        source: 'workout-generator',
        step: 'focus-selection',
        selection_method: 'manual',
        has_profile_data: hasProfileData,
        profile_goals: profileGoals.map(g => g.value)
      });
    } catch (error) {
      // Analytics failure shouldn't block the user experience
      console.warn('[WorkoutFocusCard] Analytics tracking failed, but continuing:', error);
    }
  }, [setTodaysFocus, trackFocus, hasProfileData, profileGoals]);

  return {
    focusOptions: FOCUS_OPTIONS,
    selectedFocus,
    profileGoals,
    hasProfileData: !!hasProfileData,
    handleFocusSelection,
    // Analytics data for enhanced UX
    isLoadingLastSelection,
    hasPreviousSelection,
    mostPopularFocus,
    lastSelectionTimestamp: lastSelection?.timestamp
  };
}; 