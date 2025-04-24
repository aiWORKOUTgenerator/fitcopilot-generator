/**
 * Select UI component
 */
import React from 'react';

export interface SelectOption {
  /** Unique value for the option */
  value: string;
  /** Display label for the option */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /** Unique identifier for the select */
  id: string;
  /** Options to display in the select */
  options: SelectOption[];
  /** Label text for the select */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the select */
  helperText?: string;
  /** Handler for change events */
  onChange: (value: string) => void;
}

/**
 * Accessible select component with customizable styling
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