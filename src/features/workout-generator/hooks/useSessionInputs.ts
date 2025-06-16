/**
 * Session Input Management Hook
 * 
 * Specialized hook for managing WorkoutGeneratorGrid session inputs.
 * Extracted from useWorkoutForm.ts to follow Single Responsibility Principle.
 */

import { useCallback } from 'react';
import { SessionSpecificInputs } from '../types/workout';

/**
 * Hook for managing session-specific inputs from WorkoutGeneratorGrid cards
 * 
 * @param sessionInputs - Current session inputs state
 * @param updateSessionInputs - Function to update session inputs
 * @returns Session input management utilities
 */
export function useSessionInputs(
  sessionInputs: SessionSpecificInputs | undefined,
  updateSessionInputs: (inputs: SessionSpecificInputs | ((current: SessionSpecificInputs) => SessionSpecificInputs)) => void
) {
  
  // Enhanced session input updater for WorkoutGeneratorGrid cards
  const updateSessionInput = useCallback(<K extends keyof SessionSpecificInputs>(
    field: K, 
    value: SessionSpecificInputs[K]
  ) => {
    const currentSessionInputs = sessionInputs || {};
    const updatedSessionInputs = {
      ...currentSessionInputs,
      [field]: value
    };
    
    updateSessionInputs(updatedSessionInputs);

    // Enhanced debugging for session input capture
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useSessionInputs] Session input updated - ${String(field)}:`, {
        field,
        value,
        timestamp: new Date().toISOString(),
        sessionInputsBefore: currentSessionInputs,
        sessionInputsAfter: updatedSessionInputs,
        workoutGridCard: getCardNameFromField(field),
        dataFlowStep: 'CARD_TO_SESSION_INPUTS'
      });
    }
  }, [sessionInputs, updateSessionInputs]);
  
  // Helper function to identify which WorkoutGeneratorGrid card updated the field
  const getCardNameFromField = (field: keyof SessionSpecificInputs): string => {
    const fieldToCardMap: Record<string, string> = {
      'todaysFocus': 'WorkoutFocusCard',
      'dailyIntensityLevel': 'IntensityCard', 
      'timeConstraintsToday': 'DurationCard',
      'equipmentAvailableToday': 'EquipmentCard',
      'healthRestrictionsToday': 'RestrictionsCard',
      'locationToday': 'LocationCard',
      'environment': 'LocationCard',
      'energyLevel': 'EnergyMoodCard',
      'moodLevel': 'StressMoodCard',
      'sleepQuality': 'SleepQualityCard',
      'workoutCustomization': 'WorkoutCustomizationCard',
      'focusArea': 'MuscleGroupCard',
      'muscleTargeting': 'MuscleGroupCard'
    };
    return fieldToCardMap[String(field)] || 'UnknownCard';
  };

  // === CONVENIENCE METHODS FOR WORKOUTGRID INTEGRATION ===
  
  // Add convenience setters for individual WorkoutGrid fields
  const setTodaysFocus = useCallback((focus: string) => {
    updateSessionInputs(current => ({
      ...current,
      todaysFocus: focus as any // Type assertion for string literal types
    }));
  }, [updateSessionInputs]);

  const setDailyIntensityLevel = useCallback((level: number) => {
    updateSessionInputs(current => ({
      ...current,
      dailyIntensityLevel: level
    }));
  }, [updateSessionInputs]);
  
  const setHealthRestrictionsToday = useCallback((restrictions: string[]) => {
    updateSessionInputs(current => ({
      ...current,
      healthRestrictionsToday: restrictions
    }));
  }, [updateSessionInputs]);
  
  const setEquipmentAvailableToday = useCallback((equipment: string[]) => {
    updateSessionInputs(current => ({
      ...current,
      equipmentAvailableToday: equipment
    }));
  }, [updateSessionInputs]);
  
  const setTimeConstraintsToday = useCallback((time: number) => {
    updateSessionInputs(current => ({
      ...current,
      timeConstraintsToday: time
    }));
  }, [updateSessionInputs]);
  
  const setLocationToday = useCallback((location: string) => {
    updateSessionInputs(current => ({
      ...current,
      locationToday: location as any // Type assertion for string literal types
    }));
  }, [updateSessionInputs]);
  
  const setEnergyLevel = useCallback((level: number) => {
    updateSessionInputs(current => ({
      ...current,
      energyLevel: level
    }));
  }, [updateSessionInputs]);
  
  const setMoodLevel = useCallback((level: number) => {
    updateSessionInputs(current => ({
      ...current,
      moodLevel: level
    }));
  }, [updateSessionInputs]);
  
  const setSleepQuality = useCallback((level: number) => {
    updateSessionInputs(current => ({
      ...current,
      sleepQuality: level
    }));
  }, [updateSessionInputs]);
  
  const setWorkoutCustomization = useCallback((customization: string) => {
    updateSessionInputs(current => ({
      ...current,
      workoutCustomization: customization
    }));
  }, [updateSessionInputs]);

  return {
    // Core session input management
    updateSessionInput,
    getCardNameFromField,
    
    // Convenience setters for individual WorkoutGrid fields
    setTodaysFocus,
    setDailyIntensityLevel,
    setHealthRestrictionsToday,
    setEquipmentAvailableToday,
    setTimeConstraintsToday,
    setLocationToday,
    setEnergyLevel,
    setMoodLevel,
    setSleepQuality,
    setWorkoutCustomization
  };
} 