/**
 * Input UI Component
 * 
 * A fully accessible, customizable input component that supports labels,
 * error messages, and helper text. The component handles accessibility
 * attributes and styling based on its state.
 * 
 * @example
 * // Basic usage
 * <Input 
 *   id="username"
 *   placeholder="Enter your username"
 * />
 * 
 * @example
 * // With label and helper text
 * <Input
 *   id="email"
 *   label="Email address"
 *   helperText="We'll never share your email with anyone else"
 *   type="email"
 * />
 * 
 * @example
 * // With error state
 * <Input
 *   id="password"
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 */
import React from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'> {
  /** 
   * Text label displayed above the input
   * When provided, it's properly associated with the input through the htmlFor/id relationship
   */
  label?: string;
  
  /** 
   * Error message displayed when the input has invalid input
   * When provided, the input will be styled as invalid and the message shown below
   */
  error?: string;
  
  /** 
   * Additional information displayed below the input
   * Not shown when error is present
   */
  helperText?: string;
  
  /**
   * Size variant of the input
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional prefix element (icon or text) displayed before the input
   */
  prefix?: React.ReactNode;
  
  /**
   * Optional suffix element (icon or text) displayed after the input
   */
  suffix?: React.ReactNode;
}

/**
 * A customizable input component that follows accessibility best practices.
 * 
 * Features:
 * - Proper label association through htmlFor/id
 * - ARIA attributes for accessibility (aria-invalid, aria-describedby)
 * - Visual indication of error states
 * - Support for different sizes
 * - Support for helper text and error messages
 * - Support for prefix and suffix elements
 * - Full support for all native input attributes
 *
 * Accessibility considerations:
 * - Associates labels with input using htmlFor/id
 * - Uses aria-invalid to indicate validation errors
 * - Uses aria-describedby to connect the input with error or helper text
 * - Provides visual error states through appropriate styling
 *
 * @param {InputProps} props - Component properties
 * @returns {JSX.Element} Rendered input component
 */
export const Input: React.FC<InputProps> = ({
  id,
  label,
  error,
  helperText,
  className = '',
  size = 'md',
  prefix,
  suffix,
  ...props
}) => {
  // Determine if the input is in an error state
  const hasError = !!error;
  
  // If we have prefix or suffix, we need to use an input group
  const hasDecorators = !!prefix || !!suffix;
  
  // Base input element
  const inputElement = (
    <input
      id={id}
      className={`
        input 
        input--${size} 
        ${hasError ? 'input--error' : ''} 
        ${className}
      `}
      aria-invalid={hasError ? 'true' : 'false'}
      aria-describedby={
        error
          ? `${id}-error`
          : helperText
          ? `${id}-description`
          : undefined
      }
      {...props}
    />
  );
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1"
        >
          {label}
        </label>
      )}
      
      {hasDecorators ? (
        <div className="input-group">
          {prefix && (
            <div className="input-group-prefix">
              {prefix}
            </div>
          )}
          
          {inputElement}
          
          {suffix && (
            <div className="input-group-suffix">
              {suffix}
            </div>
          )}
        </div>
      ) : (
        inputElement
      )}
      
      {error && (
        <p className="input-message input-message--error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          className="input-message"
          id={`${id}-description`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 