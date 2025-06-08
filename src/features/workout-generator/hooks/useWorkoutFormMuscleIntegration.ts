/**
 * Hook for integrating muscle selection with workout form state
 * 
 * Provides coordination between muscle targeting and other workout form parameters,
 * ensuring consistent state management and validation across the entire form.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useMuscleSelection } from './useMuscleSelection';
import { useWorkoutForm } from './useWorkoutForm';
import { MuscleGroup, MuscleSelectionData } from '../types/muscle-types';
import { WorkoutFormParams } from '../types/workout';
import { 
  formatMuscleSelectionForAPI,
  calculateWorkoutBalance,
  generateMuscleSelectionSummary
} from '../utils/muscle-helpers';

/**
 * Extended workout form parameters with muscle targeting
 */
export interface WorkoutFormWithMuscleParams extends WorkoutFormParams {
  muscleSelection?: MuscleSelectionData;
  targetMuscleGroups?: MuscleGroup[];
  primaryMuscleGroup?: MuscleGroup;
}

/**
 * Hook return type for workout form with muscle integration
 */
export interface UseWorkoutFormMuscleIntegrationReturn {
  // Muscle selection functionality
  muscleSelection: ReturnType<typeof useMuscleSelection>;
  
  // Workout form functionality
  workoutForm: ReturnType<typeof useWorkoutForm>;
  
  // Integration methods
  getCompleteFormData: () => WorkoutFormWithMuscleParams;
  updateFormWithMuscleData: () => void;
  validateCompleteForm: () => boolean;
  resetCompleteForm: () => void;
  
  // Enhanced form state
  isFormComplete: boolean;
  formCompletionPercentage: number;
  estimatedWorkoutDuration: number;
  workoutComplexity: 'Simple' | 'Moderate' | 'Complex';
  balanceScore: number;
  
  // Quick actions
  applyMusclePreset: (preset: 'upper-body' | 'lower-body' | 'full-body' | 'core-focus') => void;
  optimizeForGoals: () => void;
}

/**
 * Hook for integrating muscle selection with workout form
 */
export const useWorkoutFormMuscleIntegration = (): UseWorkoutFormMuscleIntegrationReturn => {
  
  // Initialize both hooks
  const muscleSelection = useMuscleSelection();
  const workoutForm = useWorkoutForm();
  
  // Sync muscle selection with form session inputs
  useEffect(() => {
    const currentFocusArea = workoutForm.formValues.sessionInputs?.focusArea || [];
    const muscleGroups = muscleSelection.selectionData.selectedGroups.map(group => group.toString());
    
    // Update session inputs if muscle selection has changed
    if (JSON.stringify(currentFocusArea) !== JSON.stringify(muscleGroups)) {
      workoutForm.updateField('sessionInputs', {
        ...workoutForm.formValues.sessionInputs,
        focusArea: muscleGroups
      });
    }
  }, [muscleSelection.selectionData.selectedGroups, workoutForm]);
  
  // Get complete form data including muscle selection
  const getCompleteFormData = useCallback((): WorkoutFormWithMuscleParams => {
    const musclePayload = formatMuscleSelectionForAPI(muscleSelection.selectionData);
    
    return {
      ...workoutForm.formValues,
      muscleSelection: muscleSelection.selectionData,
      targetMuscleGroups: musclePayload.targetMuscleGroups,
      primaryMuscleGroup: musclePayload.primaryFocus,
      sessionInputs: {
        ...workoutForm.formValues.sessionInputs,
        focusArea: muscleSelection.selectionData.selectedGroups.map(g => g.toString())
      }
    };
  }, [muscleSelection.selectionData, workoutForm.formValues]);
  
  // Update form with current muscle data
  const updateFormWithMuscleData = useCallback(() => {
    const muscleGroups = muscleSelection.selectionData.selectedGroups.map(g => g.toString());
    workoutForm.updateField('sessionInputs', {
      ...workoutForm.formValues.sessionInputs,
      focusArea: muscleGroups
    });
  }, [muscleSelection.selectionData.selectedGroups, workoutForm]);
  
  // Validate complete form including muscle selection
  const validateCompleteForm = useCallback((): boolean => {
    const isWorkoutFormValid = workoutForm.validateForm();
    const isMuscleSelectionValid = muscleSelection.validation.isValid;
    
    return isWorkoutFormValid && isMuscleSelectionValid;
  }, [workoutForm, muscleSelection.validation.isValid]);
  
  // Reset complete form
  const resetCompleteForm = useCallback(() => {
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
    muscleSelection.clearSelection();
  }, [workoutForm, muscleSelection]);
  
  // Calculate form completion percentage
  const formCompletionPercentage = useMemo(() => {
    let completed = 0;
    let total = 7; // Total required fields
    
    if (workoutForm.formValues.duration > 0) completed++;
    if (workoutForm.formValues.difficulty) completed++;
    if (workoutForm.formValues.goals && workoutForm.formValues.goals.trim()) completed++;
    if (workoutForm.formValues.equipment && workoutForm.formValues.equipment.length > 0) completed++;
    if (workoutForm.formValues.intensity && workoutForm.formValues.intensity > 0) completed++;
    if (muscleSelection.selectionData.selectedGroups.length > 0) completed++;
    if (workoutForm.formValues.sessionInputs && Object.keys(workoutForm.formValues.sessionInputs).length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  }, [workoutForm.formValues, muscleSelection.selectionData]);
  
  // Calculate estimated workout duration including muscle targeting
  const estimatedWorkoutDuration = useMemo(() => {
    const baseDuration = workoutForm.formValues.duration || 30;
    const muscleGroups = muscleSelection.selectionData.selectedGroups.length;
    const complexity = muscleGroups > 2 ? 1.2 : muscleGroups > 1 ? 1.1 : 1.0;
    
    return Math.round(baseDuration * complexity);
  }, [workoutForm.formValues.duration, muscleSelection.selectionData.selectedGroups.length]);
  
  // Calculate workout complexity
  const workoutComplexity = useMemo((): 'Simple' | 'Moderate' | 'Complex' => {
    const muscleGroups = muscleSelection.selectionData.selectedGroups.length;
    const hasSpecificMuscles = Object.values(muscleSelection.selectionData.selectedMuscles || {})
      .some(muscles => muscles && muscles.length > 0);
    const hasAdvancedSettings = workoutForm.formValues.intensity && workoutForm.formValues.intensity > 3;
    const hasRestrictions = workoutForm.formValues.restrictions && workoutForm.formValues.restrictions.trim();
    
    if (muscleGroups >= 3 || hasSpecificMuscles || hasAdvancedSettings || hasRestrictions) {
      return 'Complex';
    } else if (muscleGroups === 2 || workoutForm.formValues.equipment?.length > 2) {
      return 'Moderate';
    } else {
      return 'Simple';
    }
  }, [muscleSelection.selectionData, workoutForm.formValues]);
  
  // Calculate balance score
  const balanceScore = useMemo(() => {
    const balance = calculateWorkoutBalance(muscleSelection.selectionData);
    return balance.score;
  }, [muscleSelection.selectionData]);
  
  // Check if form is complete
  const isFormComplete = useMemo(() => {
    return formCompletionPercentage >= 80 && validateCompleteForm();
  }, [formCompletionPercentage, validateCompleteForm]);
  
  // Apply muscle group presets
  const applyMusclePreset = useCallback((preset: 'upper-body' | 'lower-body' | 'full-body' | 'core-focus') => {
    muscleSelection.clearSelection();
    
    switch (preset) {
      case 'upper-body':
        muscleSelection.addMuscleGroup(MuscleGroup.Chest);
        muscleSelection.addMuscleGroup(MuscleGroup.Back);
        break;
      case 'lower-body':
        muscleSelection.addMuscleGroup(MuscleGroup.Legs);
        muscleSelection.addMuscleGroup(MuscleGroup.Core);
        break;
      case 'full-body':
        muscleSelection.addMuscleGroup(MuscleGroup.Chest);
        muscleSelection.addMuscleGroup(MuscleGroup.Back);
        muscleSelection.addMuscleGroup(MuscleGroup.Legs);
        break;
      case 'core-focus':
        muscleSelection.addMuscleGroup(MuscleGroup.Core);
        muscleSelection.addMuscleGroup(MuscleGroup.Back);
        break;
    }
    
    updateFormWithMuscleData();
  }, [muscleSelection, updateFormWithMuscleData]);
  
  // Optimize muscle selection for current goals
  const optimizeForGoals = useCallback(() => {
    const goals = workoutForm.formValues.goals?.toLowerCase() || '';
    
    muscleSelection.clearSelection();
    
    if (goals.includes('strength') || goals.includes('muscle')) {
      // Focus on major muscle groups for strength
      muscleSelection.addMuscleGroup(MuscleGroup.Chest);
      muscleSelection.addMuscleGroup(MuscleGroup.Back);
      muscleSelection.addMuscleGroup(MuscleGroup.Legs);
    } else if (goals.includes('cardio') || goals.includes('endurance')) {
      // Full body for cardio
      muscleSelection.addMuscleGroup(MuscleGroup.Legs);
      muscleSelection.addMuscleGroup(MuscleGroup.Core);
    } else if (goals.includes('tone') || goals.includes('definition')) {
      // Balanced approach for toning
      muscleSelection.addMuscleGroup(MuscleGroup.Arms);
      muscleSelection.addMuscleGroup(MuscleGroup.Core);
    } else if (goals.includes('flexibility') || goals.includes('mobility')) {
      // Core and back for flexibility base
      muscleSelection.addMuscleGroup(MuscleGroup.Core);
      muscleSelection.addMuscleGroup(MuscleGroup.Back);
    } else {
      // Default balanced selection
      muscleSelection.addMuscleGroup(MuscleGroup.Chest);
      muscleSelection.addMuscleGroup(MuscleGroup.Legs);
    }
    
    updateFormWithMuscleData();
  }, [workoutForm.formValues.goals, muscleSelection, updateFormWithMuscleData]);
  
  return {
    muscleSelection,
    workoutForm,
    getCompleteFormData,
    updateFormWithMuscleData,
    validateCompleteForm,
    resetCompleteForm,
    isFormComplete,
    formCompletionPercentage,
    estimatedWorkoutDuration,
    workoutComplexity,
    balanceScore,
    applyMusclePreset,
    optimizeForGoals
  };
}; 