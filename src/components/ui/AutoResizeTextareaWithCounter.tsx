/**
 * Auto-Resize Textarea with Character Counter Component
 * 
 * An enhanced textarea that automatically adjusts its height based on content
 * and includes a character counter with optional limits.
 * 
 * @example
 * <AutoResizeTextareaWithCounter
 *   id="description"
 *   value={description}
 *   onChange={handleChange}
 *   placeholder="Enter description..."
 *   minRows={2}
 *   maxRows={10}
 *   maxCharacters={500}
 * />
 */
import React, { useState, useEffect } from 'react';
import { AutoResizeTextarea, AutoResizeTextareaProps } from './AutoResizeTextarea';
import CharacterCounter from './CharacterCounter';
import './CharacterCounter.scss';

export interface AutoResizeTextareaWithCounterProps extends AutoResizeTextareaProps {
  /**
   * Maximum number of characters allowed
   * If provided, counter will show current/max format
   */
  maxCharacters?: number;
  
  /**
   * Whether to show warning when approaching the character limit
   * Only applies when maxCharacters is provided
   * @default true
   */
  showWarning?: boolean;
  
  /**
   * Threshold percentage when warning should appear
   * Only applies when maxCharacters and showWarning are provided
   * @default 90
   */
  warningThreshold?: number;
  
  /**
   * Whether to enforce the character limit by truncating input
   * @default false
   */
  enforceLimit?: boolean;
}

/**
 * A textarea that automatically adjusts its height and includes a character counter.
 * 
 * Features:
 * - Auto-resizes height based on content
 * - Displays character count with optional maximum limit
 * - Can show warnings when approaching limit
 * - Can enforce maximum character limit
 * - Preserves all functionality of AutoResizeTextarea
 * 
 * @param {AutoResizeTextareaWithCounterProps} props - Component properties
 * @returns {JSX.Element} Rendered component
 */
export const AutoResizeTextareaWithCounter: React.FC<AutoResizeTextareaWithCounterProps> = ({
  maxCharacters,
  showWarning = true,
  warningThreshold = 90,
  enforceLimit = false,
  onChange,
  value = '',
  className = '',
  ...props
}) => {
  // Track character count for the counter display
  const [characterCount, setCharacterCount] = useState(value.toString().length);
  
  // Update character count when value changes
  useEffect(() => {
    setCharacterCount(value.toString().length);
  }, [value]);
  
  // Handle change event with optional limit enforcement
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // If enforceLimit is true and we have a maxCharacters, truncate if needed
    if (enforceLimit && maxCharacters && newValue.length > maxCharacters) {
      // Create a new synthetic event with the truncated value
      const truncatedEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue.slice(0, maxCharacters)
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      // Call original onChange with truncated value
      if (onChange) {
        onChange(truncatedEvent);
      }
    } else {
      // Pass through the original event
      if (onChange) {
        onChange(e);
      }
    }
    
    // Update character count
    setCharacterCount(e.target.value.length);
  };
  
  return (
    <div className="textarea-with-counter">
      <AutoResizeTextarea
        value={value}
        onChange={handleChange}
        className={`textarea-with-counter__textarea ${className}`}
        {...props}
      />
      <CharacterCounter
        current={characterCount}
        max={maxCharacters}
        showWarning={showWarning}
        warningThreshold={warningThreshold}
        className="textarea-with-counter__counter"
      />
    </div>
  );
};

export default AutoResizeTextareaWithCounter; 