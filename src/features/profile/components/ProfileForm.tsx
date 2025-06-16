/**
 * Profile Form Component
 * 
 * Multi-step form for user profile creation and editing
 */
import React from 'react';
import { useProfileForm } from '../hooks';
import BasicInfoStep from './form-steps/BasicInfoStep';
import BodyMetricsStep from './form-steps/BodyMetricsStep';
import EquipmentStep from './form-steps/EquipmentStep';
import HealthStep from './form-steps/HealthStep';
import PreferencesStep from './form-steps/PreferencesStep';
import FormNavigation from './FormNavigation';
import FormProgress from './FormProgress';

interface ProfileFormProps {
  onComplete?: () => void;
  className?: string;
}

/**
 * Multi-step form for managing user fitness profile
 */
const ProfileForm: React.FC<ProfileFormProps> = ({ onComplete, className = '' }) => {
  const {
    currentStep,
    totalSteps,
    formData,
    validationErrors,
    isDirty,
    isSubmitting,
    isSavingDraft,
    completedSteps,
    serverError,
    handleChange,
    validateForm,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submitForm,
    resetForm
  } = useProfileForm();

  // Handle async navigation (for save on last step)
  const handleNavigation = async (direction: 'next' | 'previous') => {
    if (direction === 'next') {
      const success = await goToNextStep();
      // If we successfully saved on the last step, trigger completion
      if (success && currentStep === totalSteps && onComplete) {
        console.log('[ProfileForm] Triggering onComplete after successful save');
        onComplete();
      }
    } else {
      goToPreviousStep();
    }
  };

  // Handle form submission (should not be called anymore since Save button is type="button")
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('[ProfileForm] 🚨 handleSubmit() called! This should not happen anymore.');
    console.log('[ProfileForm] Event:', e);
    console.log('[ProfileForm] Event type:', e.type);
    console.log('[ProfileForm] Event target:', e.target);
    console.log('[ProfileForm] Current step:', currentStep);
    console.log('[ProfileForm] Total steps:', totalSteps);
    console.log('[ProfileForm] Is last step:', currentStep === totalSteps);
    console.log('[ProfileForm] Stack trace:', new Error().stack);
    
    e.preventDefault();
    
    // This should not be called anymore since Save button is type="button"
    console.log('[ProfileForm] Form submission prevented - using button click handler instead');
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
          />
        );
      
      case 2:
        return (
          <BodyMetricsStep 
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
          />
        );
      
      case 3:
        return (
          <EquipmentStep 
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
          />
        );
      
      case 4:
        return (
          <HealthStep 
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
          />
        );
      
      case 5:
        return (
          <PreferencesStep 
            formData={formData}
            errors={validationErrors}
            onChange={handleChange}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`profile-form-container ${className}`}>
      <form onSubmit={handleSubmit} className="profile-form">
        {serverError && (
          <div className="error-message">
            {serverError}
          </div>
        )}
        
        <FormProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          completedSteps={completedSteps}
          isSavingDraft={isSavingDraft}
          onStepClick={goToStep} 
        />
        
        <div className="form-step-container">
          {renderStep()}
        </div>
        
        <FormNavigation 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          isSubmitting={isSubmitting}
          onPrevious={() => handleNavigation('previous')}
          onNext={() => handleNavigation('next')}
          onReset={resetForm}
          isLastStep={currentStep === totalSteps}
        />
      </form>
    </div>
  );
};

export default ProfileForm; 