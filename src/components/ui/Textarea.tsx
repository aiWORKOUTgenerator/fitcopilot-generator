/**
 * Textarea UI Component
 * 
 * A fully accessible, customizable textarea component that supports labels,
 * error messages, and helper text. The component handles accessibility
 * attributes and styling based on its state.
 * 
 * @example
 * // Basic usage
 * <Textarea 
 *   id="comments"
 *   placeholder="Enter your comments"
 * />
 * 
 * @example
 * // With label and helper text
 * <Textarea
 *   id="description"
 *   label="Description"
 *   helperText="Enter a detailed description of your request"
 *   rows={6}
 * />
 * 
 * @example
 * // With error state
 * <Textarea
 *   id="bio"
 *   label="Biography"
 *   error="Biography cannot exceed 500 characters"
 *   value={bio}
 *   onChange={(e) => setBio(e.target.value)}
 * />
 */
import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** 
   * Text label displayed above the textarea
   * When provided, it's properly associated with the textarea through the htmlFor/id relationship
   */
  label?: string;
  
  /** 
   * Error message displayed when the textarea has invalid input
   * When provided, the textarea will be styled as invalid and the message shown below
   */
  error?: string;
  
  /** 
   * Additional information displayed below the textarea
   * Not shown when error is present
   */
  helperText?: string;
}

/**
 * A customizable textarea component that follows accessibility best practices.
 * 
 * Features:
 * - Proper label association through htmlFor/id
 * - ARIA attributes for accessibility (aria-invalid, aria-describedby)
 * - Visual indication of error states
 * - Custom styling with configurable row height
 * - Support for helper text and error messages
 * - Full support for all native textarea attributes
 *
 * Accessibility considerations:
 * - Associates labels with textarea using htmlFor/id
 * - Uses aria-invalid to indicate validation errors
 * - Uses aria-describedby to connect the textarea with error or helper text
 * - Provides visual error states through appropriate styling
 *
 * @param {TextareaProps} props - Component properties
 * @returns {JSX.Element} Rendered textarea component
 */
export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  error,
  helperText,
  className = '',
  rows = 4,
  ...props
}) => {
  // Determine if the textarea is in an error state
  const hasError = !!error;
  
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        className={`
          w-full px-3 py-2 bg-white border rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${hasError ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-900'}
          ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
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
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          className="mt-1 text-sm text-gray-500"
          id={`${id}-description`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}; 