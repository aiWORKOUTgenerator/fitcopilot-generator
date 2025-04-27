/**
 * LoadingIndicator Component
 * 
 * Displays an animated loading indicator with optional custom message
 * during the workout generation process.
 */
import React from 'react';
import { ProgressBar } from '../../../../common/components';
import './LoadingIndicator.scss';

interface LoadingIndicatorProps {
  /** Text to display next to the loading spinner */
  message?: string;
  /** Current progress percentage (0-100) */
  progress?: number;
  /** Optional ARIA label for accessibility (defaults to message if not provided) */
  ariaLabel?: string;
}

/**
 * Loading indicator component with animation and accessibility features
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Generating your personalized workout...',
  progress = 0,
  ariaLabel
}) => {
  return (
    <div 
      className="loading-indicator"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel || message}
    >
      <div 
        className="loading-indicator__spinner" 
        aria-hidden="true"
      ></div>
      
      <div className="loading-indicator__content">
        <p className="loading-indicator__message">{message}</p>
        <ProgressBar 
          progress={progress}
          height={12}
          animated={true}
          ariaLabel={`Workout generation progress: ${Math.round(progress)}%`}
        />
      </div>
    </div>
  );
};

export default LoadingIndicator; 