/**
 * GeneratingStep Component
 * 
 * Displays a loading state during workout generation with progress feedback and error handling.
 */
import React, { useState, useEffect, memo } from 'react';
import { Card, Button } from '../../../../../components/ui';
import { LoadingIndicator } from '../../GenerationProcess/LoadingIndicator';
import ErrorBoundary from '../../common/ErrorBoundary';
import '../form.scss';

interface GeneratingStepProps {
  /** Optional error message to display if generation fails */
  error: string | null;
  /** Callback when the user cancels generation */
  onCancel: () => void;
  /** Current generation progress (0-100) */
  progress?: number;
  /** Callback when generation progress completes (reaches 100%) */
  onComplete?: () => void;
}

const fitnessTips = [
  "Maintain proper form throughout your workout to prevent injuries and maximize results.",
  "Consistency beats intensity - regular moderate workouts yield better results than occasional intense sessions.",
  "Stay hydrated before, during, and after your workout for optimal performance.",
  "Allow 48-72 hours of recovery time for muscle groups you've trained intensively.",
  "Proper warm-up and cool-down routines can significantly reduce injury risk."
];

/**
 * Component shown during workout generation process
 */
export const GeneratingStep: React.FC<GeneratingStepProps> = ({
  error,
  onCancel,
  progress = 0,
  onComplete,
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  
  // Rotate through fitness tips every 8 seconds
  useEffect(() => {
    if (error) return; // Don't rotate tips if there's an error
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % fitnessTips.length);
    }, 8000);
    
    return () => clearInterval(tipInterval);
  }, [error]);

  // Call onComplete when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Get current progress message based on progress value
  const getProgressMessage = () => {
    if (progress < 25) return "Analyzing your fitness goals...";
    if (progress < 50) return "Designing your workout structure...";
    if (progress < 75) return "Selecting optimal exercises...";
    return "Finalizing your personalized plan...";
  };

  // Render error state if an error occurred
  if (error) {
    return (
      <div className="generating-step generating-step--error" role="alert" aria-live="assertive">
        <Card elevated padding="large">
          <h3 className="generating-step__title">Generation Error</h3>
          
          <div className="generating-step__error-container">
            <p className="generating-step__error-message">{error}</p>
            <p className="generating-step__error-help">
              Please try again or adjust your workout parameters.
            </p>
          </div>
          
          <div className="generating-step__actions">
            <Button 
              variant="outline"
              onClick={onCancel}
              className="generating-step__cancel-button"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Render loading state
  return (
    <ErrorBoundary
      fallback={
        <div className="generating-step generating-step--error" role="alert">
          <Card elevated padding="large">
            <h3>Something went wrong</h3>
            <p>An error occurred while generating your workout.</p>
            <Button 
              onClick={onCancel}
              variant="outline"
              className="generating-step__cancel-button"
            >
              Go Back
            </Button>
          </Card>
        </div>
      }
    >
      <div className="generating-step" role="region" aria-live="polite" aria-label="Workout generation in progress">
        <Card elevated padding="large">
          <LoadingIndicator />
          <div className="generating-step__content">
            <h3 className="generating-step__title">Creating Your Custom Workout</h3>
            <p className="generating-step__message" aria-live="polite">{getProgressMessage()}</p>
            
            <div className="generating-step__progress-container" aria-hidden={progress < 1}>
              <div 
                className="generating-step__progress-bar" 
                role="progressbar" 
                aria-valuenow={progress} 
                aria-valuemin={0} 
                aria-valuemax={100}
              >
                <div className="generating-step__progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            
            <div className="generating-step__tip">
              <h4 className="generating-step__tip-title">Fitness Tip</h4>
              <p className="generating-step__tip-content">{fitnessTips[currentTip]}</p>
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default memo(GeneratingStep); 