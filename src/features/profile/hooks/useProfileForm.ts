/**
 * useProfileForm Hook
 * 
 * Custom hook for managing profile form state and validation
 */
import { useState, useCallback, useEffect } from 'react';
import { ProfileFormState, PartialUserProfile, INITIAL_PROFILE } from '../types';
import useProfileValidation from './useProfileValidation';
import { useProfile } from '../context';

/**
 * Hook for managing profile form state
 * 
 * @param initialStep - The initial step to show in multi-step form
 * @returns Profile form state and handlers
 */
export const useProfileForm = (initialStep = 1) => {
  const { profile, updateUserProfile, saveDraftUserProfile, isUpdating, isSavingDraft, error, completedSteps } = useProfile();
  const { validateProfile, isProfileComplete } = useProfileValidation();
  
  // Define total steps in the profile form
  const TOTAL_STEPS = 5;
  
  // Initialize form state
  const [formState, setFormState] = useState<ProfileFormState>({
    currentStep: initialStep,
    totalSteps: TOTAL_STEPS,
    formData: { ...INITIAL_PROFILE },
    validationErrors: {},
    isDirty: false,
    isSubmitting: false
  });
  
  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormState(state => ({
        ...state,
        formData: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          fitnessLevel: profile.fitnessLevel,
          goals: profile.goals,
          customGoal: profile.customGoal,
          weight: profile.weight,
          weightUnit: profile.weightUnit,
          height: profile.height,
          heightUnit: profile.heightUnit,
          age: profile.age,
          gender: profile.gender,
          availableEquipment: profile.availableEquipment,
          customEquipment: profile.customEquipment,
          preferredLocation: profile.preferredLocation,
          limitations: profile.limitations,
          limitationNotes: profile.limitationNotes,
          medicalConditions: profile.medicalConditions,
          preferredWorkoutDuration: profile.preferredWorkoutDuration,
          workoutFrequency: profile.workoutFrequency,
          customFrequency: profile.customFrequency,
          favoriteExercises: profile.favoriteExercises,
          dislikedExercises: profile.dislikedExercises,
          profileComplete: profile.profileComplete
        },
        isDirty: false
      }));
    }
  }, [profile]);
  
  // Update form state from API update process
  useEffect(() => {
    setFormState(state => ({
      ...state,
      isSubmitting: isUpdating || isSavingDraft
    }));
  }, [isUpdating, isSavingDraft]);
  
  // Field change handler
  const handleChange = useCallback((field: string, value: any) => {
    setFormState(state => ({
      ...state,
      formData: { ...state.formData, [field]: value },
      isDirty: true,
      // Clear validation error for this field if it exists
      validationErrors: {
        ...state.validationErrors,
        [field]: undefined
      }
    }));
  }, []);
  
  // Form validation
  const validateForm = useCallback((step?: number) => {
    const currentStep = step || formState.currentStep;
    const errors = validateProfile(formState.formData);
    
    // Filter errors relevant to current step
    let stepErrors = {};
    
    switch (currentStep) {
      case 1: // Basic info
        stepErrors = Object.keys(errors)
          .filter(key => ['firstName', 'lastName', 'email', 'fitnessLevel', 'goals', 'customGoal'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
        
      case 2: // Body metrics
        stepErrors = Object.keys(errors)
          .filter(key => ['weight', 'weightUnit', 'height', 'heightUnit', 'age', 'gender'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
        
      case 3: // Equipment & location
        stepErrors = Object.keys(errors)
          .filter(key => ['availableEquipment', 'customEquipment', 'preferredLocation'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
        
      case 4: // Health considerations
        stepErrors = Object.keys(errors)
          .filter(key => ['limitations', 'limitationNotes', 'medicalConditions'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
        
      case 5: // Preferences
        stepErrors = Object.keys(errors)
          .filter(key => [
            'preferredWorkoutDuration', 
            'workoutFrequency', 
            'customFrequency',
            'favoriteExercises',
            'dislikedExercises'
          ].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
        
      default:
        stepErrors = errors;
    }
    
    setFormState(state => ({
      ...state,
      validationErrors: stepErrors
    }));
    
    return Object.keys(stepErrors).length === 0;
  }, [formState.currentStep, formState.formData, validateProfile]);
  
  // Step navigation with auto-save
  const goToNextStep = useCallback(async () => {
    if (validateForm()) {
      // Auto-save current step data before moving to next step
      try {
        await saveDraftUserProfile(formState.formData, formState.currentStep);
        
        setFormState(state => ({
          ...state,
          currentStep: Math.min(state.currentStep + 1, state.totalSteps),
          isDirty: false
        }));
      } catch (error) {
        console.error('Failed to auto-save step data:', error);
        // Still allow progression even if save fails
        setFormState(state => ({
          ...state,
          currentStep: Math.min(state.currentStep + 1, state.totalSteps)
        }));
      }
    }
  }, [validateForm, formState.formData, formState.currentStep, formState.totalSteps, saveDraftUserProfile]);
  
  const goToPreviousStep = useCallback(() => {
    setFormState(state => ({
      ...state,
      currentStep: Math.max(state.currentStep - 1, 1)
    }));
  }, []);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= formState.totalSteps) {
      setFormState(state => ({
        ...state,
        currentStep: step
      }));
    }
  }, [formState.totalSteps]);
  
  // Form submission
  const submitForm = useCallback(async () => {
    if (!validateForm()) {
      return false;
    }
    
    setFormState(state => ({
      ...state,
      isSubmitting: true
    }));
    
    try {
      // Mark the profile as complete before submitting
      const updatedData: PartialUserProfile = {
        ...formState.formData,
        profileComplete: true
      };
      
      await updateUserProfile(updatedData);
      
      setFormState(state => ({
        ...state,
        isDirty: false
      }));
      
      return true;
    } catch (err) {
      return false;
    } finally {
      setFormState(state => ({
        ...state,
        isSubmitting: false
      }));
    }
  }, [formState.formData, updateUserProfile, validateForm]);
  
  // Reset form
  const resetForm = useCallback(() => {
    setFormState(state => ({
      ...state,
      formData: { ...INITIAL_PROFILE },
      validationErrors: {},
      isDirty: false,
      currentStep: initialStep
    }));
  }, [initialStep]);
  
  return {
    ...formState,
    completedSteps,
    isSavingDraft,
    handleChange,
    validateForm,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submitForm,
    resetForm,
    serverError: error
  };
};

export default useProfileForm; 