/**
 * Expandable Input Component
 * 
 * An enhanced input component that better handles text overflow
 * by displaying tooltips and allowing dynamic expansion when needed.
 * 
 * @example
 * <ExpandableInput 
 *   id="exercise-name"
 *   value={name}
 *   onChange={handleNameChange}
 *   placeholder="Exercise name"
 *   showTooltip
 * />
 */
import React, { useState, useRef, useEffect } from 'react';
import { Input, InputProps } from './Input';

export interface ExpandableInputProps extends InputProps {
  /**
   * Whether to show a tooltip with the full text on hover when text is truncated
   * @default true
   */
  showTooltip?: boolean;
  
  /**
   * Whether to expand the input width when focused
   * @default false
   */
  expandOnFocus?: boolean;
  
  /**
   * Maximum width of the expanded input (in pixels)
   * Only used when expandOnFocus is true
   * @default 300
   */
  maxExpandedWidth?: number;
}

/**
 * An input component with enhanced overflow handling.
 * 
 * Features:
 * - Shows tooltip with full text on hover when text is truncated
 * - Can optionally expand width when focused
 * - Maintains all functionality of the base Input component
 * 
 * @param {ExpandableInputProps} props - Component properties
 * @returns {JSX.Element} Rendered expandable input
 */
export const ExpandableInput: React.FC<ExpandableInputProps> = ({
  showTooltip = true,
  expandOnFocus = false,
  maxExpandedWidth = 300,
  className = '',
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Check if the input text is overflowing
  const checkOverflow = () => {
    const input = inputRef.current;
    if (!input) return;
    
    // Compare scroll width to client width to detect overflow
    const isTextOverflowing = input.scrollWidth > input.clientWidth;
    setIsOverflowing(isTextOverflowing);
    
    // Set tooltip content if overflowing and tooltip is enabled
    if (isTextOverflowing && showTooltip) {
      setTooltip(props.value?.toString() || '');
    } else {
      setTooltip(null);
    }
  };
  
  // Check for overflow when value changes
  useEffect(() => {
    checkOverflow();
  }, [props.value]);
  
  // Handle focus event
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };
  
  // Handle blur event
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Apply expandable styling based on props and state
  const expandableClassName = `
    expandable-input
    ${isOverflowing ? 'expandable-input--overflowing' : ''}
    ${isFocused && expandOnFocus ? 'expandable-input--expanded' : ''}
    ${className}
  `;
  
  // Generate inline styles for expansion
  const expandableStyle = {
    ...(isFocused && expandOnFocus && isOverflowing ? { maxWidth: `${maxExpandedWidth}px` } : {}),
  };
  
  return (
    <div className="expandable-input-wrapper">
      <Input
        {...props}
        ref={inputRef}
        className={expandableClassName}
        style={expandableStyle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        title={tooltip || undefined}
      />
    </div>
  );
};

export default ExpandableInput; 