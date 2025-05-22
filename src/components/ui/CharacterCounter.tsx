/**
 * Character Counter Component
 * 
 * Displays the character count for text inputs and textareas,
 * with optional maximum limit indicator.
 * 
 * @example
 * <CharacterCounter 
 *   current={text.length} 
 *   max={500} 
 *   showWarning
 * />
 */
import React from 'react';

export interface CharacterCounterProps {
  /**
   * Current number of characters
   */
  current: number;
  
  /**
   * Maximum allowed characters (optional)
   */
  max?: number;
  
  /**
   * Whether to show a warning when approaching the limit
   * Only applies when max is provided
   * @default true
   */
  showWarning?: boolean;
  
  /**
   * Threshold percentage when warning should appear
   * Only applies when max and showWarning are provided
   * @default 90
   */
  warningThreshold?: number;
  
  /**
   * CSS class name
   */
  className?: string;
}

/**
 * Character counter for text inputs and textareas
 * 
 * @param {CharacterCounterProps} props - Component properties
 * @returns {JSX.Element} Rendered character counter
 */
export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  showWarning = true,
  warningThreshold = 90,
  className = '',
}) => {
  // Determine if the counter should show a warning
  const isNearLimit = max && showWarning ? (current / max) * 100 >= warningThreshold : false;
  
  // Determine if the limit has been exceeded
  const isExceeded = max ? current > max : false;
  
  // Determine the counter state for styling
  const counterState = isExceeded ? 'exceeded' : isNearLimit ? 'warning' : 'normal';
  
  // Apply correct CSS classes based on state
  const counterClass = `character-counter character-counter--${counterState} ${className}`;
  
  return (
    <div className={counterClass} aria-live="polite">
      <span className="character-counter__text">
        {max ? (
          <>
            <span className="character-counter__current">{current}</span>
            <span className="character-counter__separator">/</span>
            <span className="character-counter__max">{max}</span>
            <span className="character-counter__label"> characters</span>
          </>
        ) : (
          <>
            <span className="character-counter__current">{current}</span>
            <span className="character-counter__label"> characters</span>
          </>
        )}
      </span>
    </div>
  );
};

export default CharacterCounter; 