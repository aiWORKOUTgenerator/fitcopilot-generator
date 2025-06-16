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
  const { state, updateProfile, clearError } = useProfile();
  const { profile, loading, error } = state;
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

  // Local state for tracking completed steps and draft saving
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  
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
      isSubmitting: loading || isSavingDraft
    }));
  }, [loading, isSavingDraft]);
  
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
  
  // Simple form validation
  const validateForm = useCallback(() => {
    const errors = validateProfile(formState.formData);
    let stepErrors = {};
    
    // Only validate current step fields
    switch (formState.currentStep) {
      case 1: // Basic info
        stepErrors = Object.keys(errors)
          .filter(key => ['firstName', 'lastName', 'email', 'fitnessLevel', 'goals'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
      case 2: // Body metrics - all optional
        stepErrors = {};
        break;
      case 3: // Equipment & location  
        stepErrors = Object.keys(errors)
          .filter(key => ['availableEquipment', 'preferredLocation'].includes(key))
          .reduce((obj, key) => ({ ...obj, [key]: errors[key] }), {});
        break;
      case 4: // Health - all optional
        stepErrors = {};
        break;
      case 5: // Preferences - all optional
        stepErrors = {};
        break;
    }
    
    setFormState(state => ({ ...state, validationErrors: stepErrors }));
    return Object.keys(stepErrors).length === 0;
  }, [formState.currentStep, formState.formData, validateProfile]);
  
  // Dead simple step navigation
  const goToNextStep = useCallback(async (): Promise<boolean> => {
    console.log('[ProfileForm] Next step clicked');
    
    // Validate current step
    if (!validateForm()) {
      console.log('[ProfileForm] Validation failed');
      return false;
    }
    
    console.log('[ProfileForm] Validation passed, advancing step');
    
    // If we're on the last step, save the profile instead of advancing
    if (formState.currentStep === formState.totalSteps) {
      console.log('[ProfileForm] On last step, saving profile instead of advancing');
      const success = await submitForm();
      if (success) {
        console.log('[ProfileForm] Profile saved successfully from goToNextStep');
        // The ProfileEditModal will handle the completion via onComplete callback
      }
      return success;
    }
    
    // Just advance the step
    setFormState(state => {
      const newStep = state.currentStep + 1;
      console.log('[ProfileForm] Moving to step:', newStep);
      
      // Add specific logging for reaching step 5
      if (newStep === 5) {
        console.log('[ProfileForm] ✅ REACHED STEP 5 (PreferencesStep) - User should now see workout preferences');
      }
      
      return {
        ...state,
        currentStep: newStep,
        isDirty: false
      };
    });
    
    // Mark step as completed
    setCompletedSteps(prev => [...prev, formState.currentStep]);
    
    return true; // Successfully advanced to next step
    
  }, [validateForm, formState.currentStep, formState.totalSteps, submitForm]);
  
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
    // Add comprehensive debugging to track what's calling submitForm
    console.log('[ProfileForm] 🚨 submitForm() called!');
    console.log('[ProfileForm] Current step:', formState.currentStep);
    console.log('[ProfileForm] Total steps:', formState.totalSteps);
    console.log('[ProfileForm] Is last step:', formState.currentStep === formState.totalSteps);
    console.log('[ProfileForm] Stack trace:', new Error().stack);
    
    if (!validateForm()) {
      console.log('[ProfileForm] submitForm() validation failed, aborting');
      return false;
    }
    
    console.log('[ProfileForm] submitForm() validation passed, proceeding with save');
    
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
      
      console.log('[ProfileForm] submitForm() calling updateProfile with data:', updatedData);
      await updateProfile(updatedData);
      
      // Mark final step as completed
      setCompletedSteps(prev => 
        prev.includes(formState.currentStep) 
          ? prev 
          : [...prev, formState.currentStep]
      );
      
      setFormState(state => ({
        ...state,
        isDirty: false
      }));
      
      console.log('[ProfileForm] submitForm() completed successfully');
      return true;
    } catch (err) {
      console.log('[ProfileForm] submitForm() failed with error:', err);
      return false;
    } finally {
      setFormState(state => ({
        ...state,
        isSubmitting: false
      }));
    }
  }, [formState.formData, formState.currentStep, updateProfile, validateForm]);
  
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