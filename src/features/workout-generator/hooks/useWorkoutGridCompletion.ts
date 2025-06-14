/**
 * Simple Workout Grid Completion Hook
 * 
 * Provides completion percentage calculation and muscle selection state
 * for the WorkoutGeneratorGrid. Replaces the over-engineered integration system.
 */

import { useMemo } from 'react';
import { useWorkoutForm } from './useWorkoutForm';

/**
 * Simple hook for WorkoutGeneratorGrid completion tracking
 * 
 * Returns only what's actually needed:
 * - completionPercentage: % of cards completed (0-100)
 * - hasMuscleSelection: boolean if muscles are selected
 * - selectionSummary: text summary of selected muscles
 */
export function useWorkoutGridCompletion() {
  const { formValues } = useWorkoutForm();
  
  // Calculate completion percentage for all 11 WorkoutGeneratorGrid cards
  const completionPercentage = useMemo(() => {
    let completed = 0;
    const total = 11;
    
    const sessionInputs = formValues.sessionInputs || {};
    
    // Count completed cards
    if (sessionInputs.todaysFocus) completed++;
    if (sessionInputs.dailyIntensityLevel !== undefined && sessionInputs.dailyIntensityLevel > 0) completed++;
    if (sessionInputs.timeConstraintsToday && sessionInputs.timeConstraintsToday > 0) completed++;
    if (formValues.muscleTargeting?.targetMuscleGroups?.length > 0) completed++;
    if (sessionInputs.equipmentAvailableToday?.length > 0) completed++;
    if (sessionInputs.healthRestrictionsToday?.length > 0) completed++;
    if (sessionInputs.locationToday) completed++;
    if (sessionInputs.moodLevel !== undefined) completed++;
    if (sessionInputs.energyLevel !== undefined) completed++;
    if (sessionInputs.sleepQuality !== undefined) completed++;
    if (sessionInputs.workoutCustomization?.trim()) completed++;
    
    return Math.round((completed / total) * 100);
  }, [formValues.sessionInputs, formValues.muscleTargeting?.targetMuscleGroups?.length]);
  
  // Check if muscles are selected
  const hasMuscleSelection = (formValues.muscleTargeting?.targetMuscleGroups?.length || 0) > 0;
  
  // Generate muscle selection summary
  const selectionSummary = formValues.muscleTargeting?.selectionSummary || 'No muscle groups selected';
  
  return {
    completionPercentage,
    hasMuscleSelection,
    selectionSummary,
    muscleSelection: { // For compatibility with existing code
      selectionData: {
        selectedGroups: formValues.muscleTargeting?.targetMuscleGroups || []
      }
    }
  };
} 