/**
 * Form Progress Component
 * 
 * Visual progress indicator for multi-step forms
 */
import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps?: number[];
  isSavingDraft?: boolean;
  onStepClick?: (step: number) => void;
  className?: string;
}

/**
 * Step labels for the form progress
 */
const stepLabels = [
  'Basic Info',
  'Body Metrics',
  'Equipment',
  'Health',
  'Preferences'
];

/**
 * Visual progress indicator for multi-step forms
 */
const FormProgress: React.FC<FormProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps = [],
  isSavingDraft = false,
  onStepClick,
  className = ''
}) => {
  // Calculate progress percentage
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return (
    <div className={`form-progress ${className}`}>
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="step-indicators">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = completedSteps.includes(stepNumber);
          const isSaving = isSavingDraft && isActive;
          
          return (
            <div 
              key={stepNumber}
              className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed saved' : ''} ${isSaving ? 'saving' : ''}`}
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              <div className="step-number">
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
                  stepNumber
                )}
              </div>
              <div className="step-label">
                {stepLabels[index] || `Step ${stepNumber}`}
              </div>
              {isCompleted && (
                <div className="step-saved-indicator">
                  <span className="saved-text">Saved</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {isSavingDraft && (
        <div className="saving-indicator">
          <span className="saving-text">Saving progress...</span>
        </div>
      )}
    </div>
  );
};

export default FormProgress; 