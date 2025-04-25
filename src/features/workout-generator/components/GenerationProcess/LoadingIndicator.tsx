/**
 * LoadingIndicator Component
 * 
 * Displays an animated loading indicator with optional custom message
 * during the workout generation process.
 */
import React from 'react';

interface LoadingIndicatorProps {
  /** Text to display next to the loading spinner */
  message?: string;
}

/**
 * Loading indicator component with animation
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Generating your personalized workout...'
}) => {
  return (
    <div className="loading-indicator">
      <div className="loading-indicator__spinner"></div>
      
      <div className="loading-indicator__content">
        <p className="loading-indicator__message">{message}</p>
        <div className="loading-indicator__progress-bar">
          <div className="loading-indicator__progress-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator; 