/**
 * Textarea UI component
 */
import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text for the textarea */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the textarea */
  helperText?: string;
}

/**
 * Accessible textarea component with customizable styling
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
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
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