/**
 * Form Navigation Component
 * 
 * Navigation controls for multi-step form
 */
import React from 'react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  className?: string;
}

/**
 * Navigation controls for multi-step form
 */
const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  isLastStep,
  onPrevious,
  onNext,
  onReset,
  className = ''
}) => {
  return (
    <div className={`form-navigation ${className}`}>
      <div className="nav-buttons">
        {currentStep > 1 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={onPrevious}
            disabled={isSubmitting}
          >
            Previous
          </button>
        )}
        
        {!isLastStep ? (
          <button
            type="button"
            className="button button-primary"
            onClick={onNext}
            disabled={isSubmitting}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            className="button button-success"
            onClick={onNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        )}
      </div>
      
      <div className="form-actions">
        <button
          type="button"
          className="button button-text"
          onClick={onReset}
          disabled={isSubmitting}
        >
          Reset Form
        </button>
      </div>
    </div>
  );
};

export default FormNavigation; 