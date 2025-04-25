/**
 * GeneratingStep Component
 * 
 * Displays a loading state during workout generation with progress feedback and error handling.
 */
import React from 'react';
import { LoadingIndicator } from '../../GenerationProcess/LoadingIndicator';
import ErrorBoundary from '../../common/ErrorBoundary';

interface GeneratingStepProps {
  /** Optional error message to display if generation fails */
  error: string | null;
  /** Callback when the user cancels generation */
  onCancel: () => void;
}

/**
 * Component shown during workout generation process
 */
export const GeneratingStep: React.FC<GeneratingStepProps> = ({
  error,
  onCancel,
}) => {
  // Render error state if an error occurred
  if (error) {
    return (
      <div className="generating-step generating-step--error">
        <h3 className="generating-step__title">Generation Error</h3>
        
        <div className="generating-step__error-container">
          <p className="generating-step__error-message">{error}</p>
          <p className="generating-step__error-help">
            Please try again or adjust your workout parameters.
          </p>
        </div>
        
        <div className="generating-step__actions">
          <button 
            type="button"
            className="generating-step__cancel-button"
            onClick={onCancel}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render loading state
  return (
    <ErrorBoundary
      fallback={
        <div className="generating-step generating-step--error">
          <h3>Something went wrong</h3>
          <p>An error occurred while generating your workout.</p>
          <button 
            onClick={onCancel}
            className="generating-step__cancel-button"
          >
            Go Back
          </button>
        </div>
      }
    >
      <div className="generating-step">
        <div className="generating-step__content">
          <p className="generating-step__message">Analyzing your fitness goals...</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}; 