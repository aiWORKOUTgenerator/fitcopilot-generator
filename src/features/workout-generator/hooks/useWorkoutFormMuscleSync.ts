/**
 * Hook for synchronizing muscle selection with workout form state
 * 
 * This is a lightweight bridge that syncs external muscle selection data
 * with the workout form without creating competing state instances.
 */

import { useEffect, useCallback } from 'react';
import { useWorkoutForm } from './useWorkoutForm';
import { MuscleSelectionData } from '../types/muscle-types';
import { formatMuscleSelectionForAPI } from '../utils/muscle-helpers';

/**
 * Hook for muscle selection and form synchronization
 * Takes external muscle selection data to avoid state conflicts
 */
export const useWorkoutFormMuscleSync = (muscleSelectionData: MuscleSelectionData) => {
  const workoutForm = useWorkoutForm();
  
  // Sync muscle selection to form's session inputs only when it changes
  useEffect(() => {
    const muscleGroups = muscleSelectionData.selectedGroups.map(group => group.toString());
    const currentFocusArea = workoutForm.formValues.sessionInputs?.focusArea || [];
    
    // Only update if there's a meaningful change
    if (JSON.stringify(currentFocusArea.sort()) !== JSON.stringify(muscleGroups.sort())) {
      workoutForm.updateField('sessionInputs', {
        ...workoutForm.formValues.sessionInputs,
        focusArea: muscleGroups
      });
    }
  }, [muscleSelectionData.selectedGroups, workoutForm]);
  
  // Get complete form data including muscle selection for API submission
  const getFormDataWithMuscleSelection = useCallback(() => {
    const musclePayload = formatMuscleSelectionForAPI(muscleSelectionData);
    
    return {
      ...workoutForm.formValues,
      // Add muscle selection data to the form
      muscleSelection: muscleSelectionData,
      targetMuscleGroups: musclePayload.targetMuscleGroups,
      specificMuscles: musclePayload.specificMuscles,
      primaryFocus: musclePayload.primaryFocus,
      // Ensure session inputs include muscle data
      sessionInputs: {
        ...workoutForm.formValues.sessionInputs,
        focusArea: muscleSelectionData.selectedGroups.map(g => g.toString())
      }
    };
  }, [muscleSelectionData, workoutForm.formValues]);
  
  // Enhanced validation that includes muscle selection
  const validateCompleteForm = useCallback(() => {
    const baseValidation = workoutForm.validateForm();
    const hasMuscleSelection = muscleSelectionData.selectedGroups.length > 0;
    
    return baseValidation && hasMuscleSelection;
  }, [workoutForm, muscleSelectionData.selectedGroups.length]);
  
  // Reset form (muscle selection should be managed externally)
  const resetForm = useCallback(() => {
    workoutForm.resetFormErrors();
    workoutForm.updateForm({
      duration: 30,
      difficulty: 'beginner',
      equipment: [],
      goals: '',
      restrictions: '',
      preferences: '',
      intensity: 3,
      sessionInputs: {}
    });
  }, [workoutForm]);
  
  return {
    // Form state and methods  
    workoutForm,
    
    // Integration methods
    getFormDataWithMuscleSelection,
    validateCompleteForm,
    resetForm,
    
    // Combined state information
    isFormReady: workoutForm.formValues.duration > 0 && 
                 workoutForm.formValues.difficulty && 
                 workoutForm.formValues.goals?.trim(),
    hasMuscleSelection: muscleSelectionData.selectedGroups.length > 0,
    formCompletionPercentage: calculateFormCompletion(workoutForm.formValues, muscleSelectionData)
  };
};

/**
 * Calculate form completion percentage including muscle selection
 */
function calculateFormCompletion(formValues: any, muscleSelection: any): number {
  let completed = 0;
  const total = 7;
  
  if (formValues.duration > 0) completed++;
  if (formValues.difficulty) completed++;
  if (formValues.goals?.trim()) completed++;
  if (formValues.equipment?.length > 0) completed++;
  if (formValues.intensity > 0) completed++;
  if (muscleSelection.selectedGroups.length > 0) completed++;
  if (formValues.sessionInputs && Object.keys(formValues.sessionInputs).length > 0) completed++;
  
  return Math.round((completed / total) * 100);
} 