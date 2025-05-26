/**
 * Registration Steps Component
 * 
 * Shows the registration steps overview with completion status and green glowing borders
 */
import React from 'react';
import { useProfile } from '../../features/profile/context';

interface RegistrationStepsProps {
  className?: string;
}

/**
 * Step configuration with labels and descriptions
 */
const REGISTRATION_STEPS = [
  {
    number: 1,
    title: 'Basic Information',
    description: 'Fitness level and primary goals'
  },
  {
    number: 2,
    title: 'Body Metrics',
    description: 'Weight, height, age, and gender'
  },
  {
    number: 3,
    title: 'Equipment & Location',
    description: 'Available equipment and workout preferences'
  },
  {
    number: 4,
    title: 'Health Considerations',
    description: 'Physical limitations and medical conditions'
  },
  {
    number: 5,
    title: 'Workout Preferences',
    description: 'Duration, frequency, and exercise preferences'
  }
];

/**
 * Registration Steps Overview Component
 */
const RegistrationSteps: React.FC<RegistrationStepsProps> = ({ className = '' }) => {
  const { completedSteps, isSavingDraft, isProfileComplete } = useProfile();

  return (
    <div className={`registration-steps ${className}`}>
      <h3 className="registration-steps__title">Registration Steps</h3>
      <div className="registration-steps__overview">
        {REGISTRATION_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.number);
          const isSaving = isSavingDraft && step.number === completedSteps.length + 1;
          
          return (
            <div 
              key={step.number}
              className={`registration-step-item ${isCompleted ? 'completed saved' : ''} ${isSaving ? 'saving' : ''}`}
            >
              <div className="registration-step-item__number">
                {isSaving ? (
                  <div className="saving-spinner">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24">
                      <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4" 
                        fill="none" 
                        strokeDasharray="32" 
                        strokeDashoffset="32"
                      />
                    </svg>
                  </div>
                ) : isCompleted ? (
                  <svg className="checkmark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="registration-step-item__content">
                <h4 className="registration-step-item__title">{step.title}</h4>
                <p className="registration-step-item__description">{step.description}</p>
              </div>
              {isCompleted && (
                <div className="registration-step-item__saved-indicator">
                  <span className="saved-text">Saved</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {isProfileComplete && (
        <div className="registration-steps__completion">
          <div className="completion-message">
            <svg className="completion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
            <span>Profile Complete!</span>
          </div>
        </div>
      )}
      
      {isSavingDraft && (
        <div className="registration-steps__saving">
          <span className="saving-text">Saving progress...</span>
        </div>
      )}
    </div>
  );
};

export default RegistrationSteps; 