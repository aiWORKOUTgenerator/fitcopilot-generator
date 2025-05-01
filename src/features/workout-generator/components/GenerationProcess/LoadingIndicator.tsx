/**
 * LoadingIndicator Component
 * 
 * Displays an enhanced progress bar with informative status messages
 * during the workout generation process.
 */
import React from 'react';
import { ProgressBar } from '../../../../components/ui';
import './LoadingIndicator.scss';

interface LoadingIndicatorProps {
  /** Text to display as status message */
  message: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Optional estimated time remaining */
  estimatedTimeRemaining?: string;
  /** Optional ARIA label for accessibility (defaults to message if not provided) */
  ariaLabel?: string;
}

/**
 * Enhanced loading indicator with progress bar and time estimation
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  progress,
  estimatedTimeRemaining,
  ariaLabel
}) => {
  // Round progress to nearest integer for display
  const roundedProgress = Math.round(progress);
  
  // Determine color based on progress stage
  const getProgressColor = () => {
    if (progress < 30) return 'var(--wg-warning)'; // Starting phase
    if (progress < 70) return 'var(--wg-primary)'; // Middle phase
    return 'var(--wg-success)'; // Completion phase
  };
  
  // Default time remaining if not provided
  const timeRemaining = estimatedTimeRemaining || getDefaultTimeEstimate(progress);
  
  return (
    <div 
      className="loading-indicator"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel || message}
    >
      <div className="loading-indicator__content">
        <div className="loading-indicator__header">
          <p className="loading-indicator__message">{message}</p>
          <p className="loading-indicator__time-remaining">{timeRemaining}</p>
        </div>
        
        <div className="loading-indicator__progress-container">
          <ProgressBar 
            progress={progress}
            height={16}
            animated={true}
            ariaLabel={`Workout generation progress: ${roundedProgress}%`}
            color={getProgressColor()}
          />
          <div className="loading-indicator__progress-label">
            <span className="loading-indicator__percentage">{roundedProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate a default time estimate based on progress
 */
function getDefaultTimeEstimate(progress: number): string {
  if (progress < 20) return 'About 30 seconds remaining';
  if (progress < 50) return 'About 20 seconds remaining';
  if (progress < 80) return 'About 10 seconds remaining';
  return 'Almost done...';
}

export default LoadingIndicator; 