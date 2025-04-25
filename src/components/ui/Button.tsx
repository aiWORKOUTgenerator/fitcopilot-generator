/**
 * Button UI component
 * 
 * A flexible and accessible button component that supports various visual styles,
 * sizes, loading states, and icon placement options.
 * 
 * @example
 * // Basic usage
 * <Button>Click me</Button>
 * 
 * @example
 * // With different variants
 * <Button variant="primary">Primary Button</Button>
 * <Button variant="secondary">Secondary Button</Button>
 * <Button variant="outline">Outline Button</Button>
 * <Button variant="text">Text Button</Button>
 * 
 * @example
 * // With loading state
 * <Button isLoading>Processing...</Button>
 * 
 * @example
 * // With icons
 * <Button startIcon={<SearchIcon />}>Search</Button>
 * <Button endIcon={<ArrowRightIcon />}>Next</Button>
 */
import React from 'react';

/** Button visual style variants */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

/** Button size variants */
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 
   * Visual variant of the button 
   * - primary: Filled button with brand color, high emphasis
   * - secondary: Filled button with gray color, medium emphasis
   * - outline: Border-only button, low emphasis
   * - text: Text-only button, lowest emphasis
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /** 
   * Size of the button 
   * - xs: Extra small, for tight spaces
   * - sm: Small, for compact UIs
   * - md: Medium, standard size
   * - lg: Large, for prominent actions
   * @default 'md'
   */
  size?: ButtonSize;
  
  /** 
   * Whether the button is in a loading state
   * When true, a spinner is displayed and the button is disabled
   * @default false 
   */
  isLoading?: boolean;
  
  /** 
   * Icon to display before the button text 
   * Should be a React node/component
   */
  startIcon?: React.ReactNode;
  
  /** 
   * Icon to display after the button text 
   * Should be a React node/component
   */
  endIcon?: React.ReactNode;
  
  /** 
   * Whether the button should take up the full width of its container 
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * A customizable button component with support for different variants, sizes, and states.
 * Implements accessibility best practices including focus states, ARIA attributes for loading status,
 * and keyboard navigation support.
 *
 * @param {ButtonProps} props - Component properties
 * @returns {JSX.Element} Rendered button component
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Determine button state (disabled or loading)
  const isDisabled = disabled || isLoading;
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';
  
  // Size classes
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-primary-500 disabled:text-gray-400 disabled:hover:bg-transparent',
    text: 'bg-transparent text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-400 disabled:hover:bg-transparent',
  };
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${widthClass}
    ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;
  
  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={isDisabled}
      aria-busy={isLoading ? 'true' : 'false'}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!isLoading && startIcon && <span className="mr-2">{startIcon}</span>}
      
      {children}
      
      {!isLoading && endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
}; 