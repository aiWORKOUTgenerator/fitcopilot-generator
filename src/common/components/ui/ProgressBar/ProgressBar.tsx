import React from 'react';
import './ProgressBar.scss';

interface ProgressBarProps {
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether to show the percentage label */
  showLabel?: boolean;
  /** Height of the progress bar in pixels */
  height?: number;
  /** Whether to show the animated stripes */
  animated?: boolean;
  /** Optional custom ARIA label */
  ariaLabel?: string;
}

/**
 * ProgressBar component for displaying progress visually
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  showLabel = true,
  height = 16,
  animated = true,
  ariaLabel
}) => {
  // Ensure progress stays within bounds
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  const roundedProgress = Math.round(normalizedProgress);
  
  return (
    <div className="progress-bar-container">
      <div 
        className="progress-bar-track"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={roundedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `${roundedProgress}% complete`}
      >
        <div 
          className="progress-bar-fill"
          style={{ width: `${normalizedProgress}%` }}
        >
          {animated && <div className="progress-bar-stripes" aria-hidden="true"></div>}
        </div>
        
        {showLabel && (
          <div className="progress-bar-label" aria-hidden="true">
            <span className="progress-bar-percentage">{roundedProgress}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 