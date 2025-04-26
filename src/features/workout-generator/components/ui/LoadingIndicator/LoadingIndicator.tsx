/**
 * LoadingIndicator Component
 * 
 * Displays an animated loading indicator with optional custom message
 * during the workout generation process.
 */
import React from 'react';
import './LoadingIndicator.scss';

interface LoadingIndicatorProps {
  /** Text to display next to the loading spinner */
  message?: string;
  /** Current progress percentage (0-100) */
  progress?: number;
}

/**
 * Loading indicator component with animation
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Generating your personalized workout...',
  progress = 0
}) => {
  return (
    <div className="loading-indicator">
      <div className="loading-indicator__spinner"></div>
      
      <div className="loading-indicator__content">
        <p className="loading-indicator__message">{message}</p>
        <div className="loading-indicator__progress-bar">
          <div 
            className="loading-indicator__progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="loading-indicator__progress-text">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator; 