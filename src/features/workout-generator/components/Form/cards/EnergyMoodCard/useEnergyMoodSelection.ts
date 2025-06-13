/**
 * useEnergyMoodSelection Hook
 * 
 * Manages energy and motivation level selection state for the EnergyMoodCard.
 * Handles profile integration and daily energy/motivation level selection (1-6 scale).
 */
import { useCallback, useMemo } from 'react';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
import { useProfile } from '../../../../../profile/context';
import { mapProfileToWorkoutContext } from '../../../../utils/profileMapping';

interface EnergyLevelOption {
  value: number;
  label: string;
  icon: string;
  title: string;
}

export const useEnergyMoodSelection = () => {
  const { formValues, setEnergyLevel } = useWorkoutForm();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  // Get current energy level selection from session inputs
  const selectedEnergyLevel = formValues.sessionInputs?.energyLevel || 0;

  // Profile mapping for energy/motivation preferences
  const profileMapping = useMemo(() => {
    if (!profile) return null;
    return mapProfileToWorkoutContext(profile);
  }, [profile]);

  // Check if profile has sufficient data
  const isProfileSufficient = useMemo(() => {
    return !!(profile && profile.fitness_level && profile.preferences);
  }, [profile]);

  // Energy level options for the 3x2 grid (6 levels)
  const energyLevelOptions: EnergyLevelOption[] = [
    { 
      value: 1, 
      label: 'Very Low', 
      icon: '🟢',
      title: 'Very Low - Need gentle movement'
    },
    { 
      value: 2, 
      label: 'Low', 
      icon: '🔵',
      title: 'Low - Prefer lighter activities'
    },
    { 
      value: 3, 
      label: 'Moderate', 
      icon: '🟡',
      title: 'Moderate - Ready for balanced workout'
    },
    { 
      value: 4, 
      label: 'High', 
      icon: '🟠',
      title: 'High - Feeling strong and motivated'
    },
    { 
      value: 5, 
      label: 'Very High', 
      icon: '🔴',
      title: 'Very High - Maximum motivation and energy'
    },
    { 
      value: 6, 
      label: 'Extreme', 
      icon: '🟣',
      title: 'Extreme - Peak energy and drive'
    }
  ];

  // Handle energy level selection
  const handleEnergyLevelSelection = useCallback((level: number) => {
    console.log('[useEnergyMoodSelection] Energy level selected:', { 
      level, 
      previousLevel: selectedEnergyLevel 
    });
    
    setEnergyLevel(level);
  }, [selectedEnergyLevel, setEnergyLevel]);

  return {
    selectedEnergyLevel,
    handleEnergyLevelSelection,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping,
    energyLevelOptions
  };
}; 