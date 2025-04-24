/**
 * Checkbox UI component
 */
import React from 'react';

export interface CheckboxProps {
  /** Unique identifier for the checkbox */
  id: string;
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Handler for change events */
  onChange: (checked: boolean) => void;
  /** Label text for the checkbox (optional) */
  label?: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Optional className to add to the checkbox */
  className?: string;
}

/**
 * Accessible checkbox component with customizable styling
 *
 * @param {CheckboxProps} props - Component properties
 * @returns {JSX.Element} Rendered checkbox component
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
          aria-describedby={label ? `${id}-description` : undefined}
        />
      </div>
      {label && (
        <div className="ml-2 text-sm">
          <label 
            htmlFor={id} 
            className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}
          >
            {label}
          </label>
        </div>
      )}
    </div>
  );
}; 