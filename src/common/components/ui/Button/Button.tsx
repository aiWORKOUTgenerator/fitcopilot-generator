/**
 * Button UI component
 * 
 * A flexible and accessible button component that supports various visual styles,
 * sizes, loading states, and icon placement options with gradient support.
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
import React, { forwardRef } from 'react';
import './Button.scss';

/** Button visual style variants */
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

/** Button size variants */
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 
   * Visual variant of the button 
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /** 
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  
  /** 
   * Whether the button is in a loading state
   * @default false
   */
  isLoading?: boolean;
  
  /** 
   * Icon to display before the button text
   */
  startIcon?: React.ReactNode;
  
  /** 
   * Icon to display after the button text
   */
  endIcon?: React.ReactNode;
  
  /**
   * Make button take full width of container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Button content
   */
  children: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Button component for user interactions
 * 
 * @param {ButtonProps} props - Button component props
 * @returns {JSX.Element} Button component
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * @example
 * <Button 
 *   variant="outline"
 *   size="lg"
 *   isLoading={isSubmitting}
 *   disabled={!isValid}
 * >
 *   Submit
 * </Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}, ref) => {
  const buttonClasses = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    isLoading ? 'btn--loading' : '',
    fullWidth ? 'btn--full-width' : '',
    disabled ? 'btn--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || isLoading}
      type={type}
      aria-busy={isLoading}
      {...props}
    >
      <span className="btn__content">
        {!isLoading && startIcon && (
          <span className="btn__icon btn__icon--start">{startIcon}</span>
        )}
        
        <span className="btn__text">{children}</span>
        
        {!isLoading && endIcon && (
          <span className="btn__icon btn__icon--end">{endIcon}</span>
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
