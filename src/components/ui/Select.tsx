/**
 * Select UI Component
 * 
 * A fully accessible and customizable dropdown select component with support for
 * options, labels, helper text, and error states.
 * 
 * @example
 * // Basic usage
 * const options = [
 *   { value: 'option1', label: 'Option 1' },
 *   { value: 'option2', label: 'Option 2' },
 * ];
 * 
 * <Select
 *   id="example-select"
 *   options={options}
 *   onChange={(value) => console.log('Selected:', value)}
 * />
 * 
 * @example
 * // With label and helper text
 * <Select
 *   id="example-select"
 *   label="Select an option"
 *   helperText="This is some helpful information"
 *   options={options}
 *   onChange={handleChange}
 * />
 * 
 * @example
 * // With error state
 * <Select
 *   id="example-select"
 *   label="Select an option"
 *   error="This field is required"
 *   options={options}
 *   onChange={handleChange}
 * />
 */
import React from 'react';

/**
 * Represents a single option in the select dropdown
 */
export interface SelectOption {
  /** 
   * Unique value for the option that will be passed to onChange handler 
   */
  value: string;
  
  /** 
   * Human-readable text displayed in the dropdown 
   */
  label: string;
  
  /** 
   * Whether this option is selectable 
   * @default false
   */
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** 
   * Unique identifier for the select, used for label association and ARIA attributes 
   */
  id: string;
  
  /** 
   * Array of options to display in the dropdown 
   */
  options: SelectOption[];
  
  /** 
   * Text label displayed above the select 
   */
  label?: string;
  
  /** 
   * Error message displayed when the select has invalid input
   * When provided, the select will be styled as invalid and the message shown below
   */
  error?: string;
  
  /** 
   * Additional information displayed below the select 
   * Not shown when error is present
   */
  helperText?: string;
  
  /** 
   * Handler called when the selected value changes
   * @param value - The selected option's value
   */
  onChange: (value: string) => void;
}

/**
 * A customizable select/dropdown component that follows accessibility best practices.
 * 
 * Features:
 * - Proper label association through htmlFor/id
 * - ARIA attributes for accessibility (aria-invalid, aria-describedby)
 * - Visual indication of error states
 * - Support for disabled options
 * - Custom styling with Tailwind CSS
 *
 * @param {SelectProps} props - Component properties
 * @returns {JSX.Element} Rendered select component
 */
export const Select: React.FC<SelectProps> = ({
  id,
  options,
  label,
  error,
  helperText,
  className = '',
  onChange,
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
      <div className="relative">
        <select
          id={id}
          className={`
            appearance-none w-full px-3 py-2 bg-white border rounded-md shadow-sm
            text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            ${hasError ? 'border-red-300 text-red-900' : 'border-gray-300 text-gray-900'}
            ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            error
              ? `${id}-error`
              : helperText
              ? `${id}-description`
              : undefined
          }
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
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