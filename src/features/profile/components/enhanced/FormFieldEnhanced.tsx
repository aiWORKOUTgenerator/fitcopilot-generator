/**
 * Enhanced Form Field Component
 * 
 * This component demonstrates proper design system integration for registration forms.
 * It provides a consistent interface for form fields with built-in validation,
 * accessibility features, and design system styling.
 */

import React, { forwardRef, useId } from 'react';

export interface FormFieldEnhancedProps {
  /** Field label text */
  label: string;
  /** Whether the field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Hint text to display below the input */
  hint?: string;
  /** Whether the field is in a loading state */
  loading?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Input element or custom component */
  children: React.ReactElement;
}

/**
 * Enhanced form field component with design system integration
 */
export const FormFieldEnhanced = forwardRef<HTMLDivElement, FormFieldEnhancedProps>(
  ({ 
    label, 
    required = false, 
    error, 
    success, 
    hint, 
    loading = false, 
    disabled = false, 
    className = '', 
    children 
  }, ref) => {
    const fieldId = useId();
    const hintId = `${fieldId}-hint`;
    const errorId = `${fieldId}-error`;
    const successId = `${fieldId}-success`;

    // Build aria-describedby attribute
    const describedBy = [
      hint && hintId,
      error && errorId,
      success && successId
    ].filter(Boolean).join(' ');

    // Validate that children is a valid React element
    if (!React.isValidElement(children)) {
      console.error('FormFieldEnhanced: children must be a valid React element');
      return null;
    }

    // Enhanced child element with proper props handling
    const enhancedChild = React.cloneElement(children, {
      id: fieldId,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': !!error,
      'aria-required': required,
      className: `form-field-enhanced__input ${error ? 'form-field-enhanced__input--error' : ''} ${success ? 'form-field-enhanced__input--success' : ''} ${children.props?.className || ''}`.trim(),
      disabled: disabled || loading,
    });

    return (
      <div 
        ref={ref}
        className={`form-field-enhanced ${loading ? 'form-field-enhanced--loading' : ''} ${disabled ? 'form-field-enhanced--disabled' : ''} ${className}`.trim()}
      >
        <label htmlFor={fieldId} className="form-field-enhanced__label">
          {label}
          {required && <span className="form-field-enhanced__required">*</span>}
        </label>
        
        <div className="form-field-enhanced__input-wrapper">
          {enhancedChild}
        </div>
        
        {hint && (
          <div id={hintId} className="form-field-enhanced__hint">
            {hint}
          </div>
        )}
        
        {error && (
          <div id={errorId} className="form-field-enhanced__error">
            {error}
          </div>
        )}
        
        {success && !error && (
          <div id={successId} className="form-field-enhanced__success">
            {success}
          </div>
        )}
      </div>
    );
  }
);

FormFieldEnhanced.displayName = 'FormFieldEnhanced';

export interface RadioOptionEnhancedProps {
  /** Unique identifier for the radio option */
  id: string;
  /** The value of the radio option */
  value: string;
  /** Whether this option is selected */
  checked: boolean;
  /** Change handler */
  onChange: (value: string) => void;
  /** Option title */
  title: string;
  /** Option description */
  description: string;
  /** Whether the option is disabled */
  disabled?: boolean;
  /** Radio group name */
  name: string;
}

/**
 * Enhanced radio option component with card-like styling
 */
export const RadioOptionEnhanced: React.FC<RadioOptionEnhancedProps> = ({
  id,
  value,
  checked,
  onChange,
  title,
  description,
  disabled = false,
  name
}) => {
  const handleChange = () => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <div 
      className={`radio-option-enhanced ${checked ? 'radio-option-enhanced--selected' : ''}`}
      onClick={handleChange}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="radio-option-enhanced__input"
      />
      
      <div className="radio-option-enhanced__indicator" />
      
      <div className="radio-option-enhanced__content">
        <div className="radio-option-enhanced__title">{title}</div>
        <div className="radio-option-enhanced__description">{description}</div>
      </div>
    </div>
  );
};

export interface RadioGroupEnhancedProps {
  /** Group title */
  title: string;
  /** Group description */
  description?: string;
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Radio options */
  options: Array<{
    value: string;
    title: string;
    description: string;
  }>;
  /** Radio group name */
  name: string;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Enhanced radio group component with design system integration
 */
export const RadioGroupEnhanced: React.FC<RadioGroupEnhancedProps> = ({
  title,
  description,
  value,
  onChange,
  options,
  name,
  disabled = false,
  error,
  className = ''
}) => {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <div className={`radio-group-enhanced ${className}`.trim()}>
      <div className="radio-group-enhanced__title">{title}</div>
      
      {description && (
        <div className="radio-group-enhanced__description">{description}</div>
      )}
      
      <div 
        role="radiogroup" 
        aria-labelledby={`${groupId}-title`}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
      >
        {options.map((option, index) => (
          <RadioOptionEnhanced
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            title={option.title}
            description={option.description}
            disabled={disabled}
          />
        ))}
      </div>
      
      {error && (
        <div id={errorId} className="form-field-enhanced__error">
          {error}
        </div>
      )}
    </div>
  );
};

export interface FormSectionEnhancedProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Enhanced form section component with card styling
 */
export const FormSectionEnhanced: React.FC<FormSectionEnhancedProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`form-section-enhanced ${className}`.trim()}>
      <div className="form-section-enhanced__header">
        <h3 className="form-section-enhanced__title">{title}</h3>
        {description && (
          <p className="form-section-enhanced__description">{description}</p>
        )}
      </div>
      
      <div className="form-section-enhanced__content">
        {children}
      </div>
    </div>
  );
}; 