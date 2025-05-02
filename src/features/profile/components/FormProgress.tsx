/**
 * Form Progress Component
 * 
 * Visual progress indicator for multi-step forms
 */
import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
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
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div 
              key={stepNumber}
              className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => onStepClick && onStepClick(stepNumber)}
            >
              <div className="step-number">
                {stepNumber}
              </div>
              <div className="step-label">
                {stepLabels[index] || `Step ${stepNumber}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormProgress; 