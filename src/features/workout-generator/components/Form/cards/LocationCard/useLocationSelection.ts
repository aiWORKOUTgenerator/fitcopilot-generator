/**
 * useLocationSelection Hook
 * 
 * Manages workout location selection state for the LocationCard.
 * Handles profile integration and daily location selection for where to exercise.
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

interface LocationOption {
  value: string;
  label: string;
  icon: string;
  title: string;
}

export const useLocationSelection = () => {
  const { formValues, setLocationToday } = useWorkoutForm();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Get current location selection from session inputs
  const selectedLocation = formValues.sessionInputs?.locationToday || '';

  // Profile mapping for location preferences
  const profileMapping = useMemo(() => {
    if (!profile) return null;
    return mapProfileToWorkoutContext(profile);
  }, [profile]);

  // Check if profile has sufficient data
  const isProfileSufficient = useMemo(() => {
    return !!(profile && profile.fitness_level && profile.preferences);
  }, [profile]);

  // Location options for the grid
  const locationOptions: LocationOption[] = [
    { 
      value: 'home', 
      label: 'Home', 
      icon: '🏠',
      title: 'Home workouts - Space-efficient exercises'
    },
    { 
      value: 'gym', 
      label: 'Gym', 
      icon: '🏋️',
      title: 'Gym training - Full equipment access'
    },
    { 
      value: 'outdoors', 
      label: 'Outdoors', 
      icon: '🌳',
      title: 'Outdoor activities - Fresh air workouts'
    },
    { 
      value: 'travel', 
      label: 'Travel', 
      icon: '✈️',
      title: 'Travel workouts - Portable exercises'
    }
  ];

  // Handle location selection
  const handleLocationSelection = useCallback((location: string) => {
    console.log('[useLocationSelection] Location selected:', { 
      location, 
      previousLocation: selectedLocation 
    });
    
    setLocationToday(location);
  }, [selectedLocation, setLocationToday]);

  return {
    selectedLocation,
    handleLocationSelection,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping,
    locationOptions
  };
}; 