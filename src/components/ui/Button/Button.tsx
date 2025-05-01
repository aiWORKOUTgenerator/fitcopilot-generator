/**
 * Button Component
 * 
 * A flexible, accessible button component that supports various visual styles,
 * loading states, icon placement, and semantic variations.
 * 
 * @usage
 * ```jsx
 * // Primary button with text
 * <Button variant="gradient">Click me</Button>
 * 
 * // Button with loading state
 * <Button variant="gradient" isLoading>Loading...</Button>
 * 
 * // Button with leading icon
 * <Button variant="secondary" startIcon={<Icon name="arrow" />}>Schedule Session</Button>
 * 
 * // Button with trailing icon
 * <Button variant="gradient" endIcon={<Icon name="arrow" />}>Schedule Session</Button>
 * 
 * // Text-only button
 * <Button variant="text">View more</Button>
 * 
 * // Full width button
 * <Button variant="gradient" fullWidth>Schedule Session</Button>
 * 
 * // Button as another element (like a link)
 * <Button variant="gradient" as="a" href="/path">Go to Path</Button>
 * 
 * // Success and danger variants
 * <Button variant="success">Success</Button>
 * <Button variant="danger">Danger</Button>
 * 
 * // Gradient button variants
 * <Button variant="gradient">Get Started</Button>
 * <Button variant="gradient-secondary">Learn More</Button>
 * 
 * // Purple gradient variants (for gym/fitness theme)
 * <Button variant="gradient-violet">Join Now</Button>
 * <Button variant="gradient-violet-secondary">Learn More</Button>
 * ```
 * 
 * @features
 * - Multiple visual variants (primary, secondary, outline, text, success, danger)
 * - Gradient variants (lime-green and violet)
 * - Multiple size variants (sm, md, lg)
 * - Loading states with spinner
 * - Disabled states
 * - Icon support (start and end positions)
 * - Polymorphic component (can render as button, a, etc.)
 * - Full accessibility support 
 * - Full width option
 */

import React, { forwardRef, ButtonHTMLAttributes, ReactNode, ElementType } from 'react';
import './Button.scss';

// Button variants
export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'text' 
  | 'success' 
  | 'danger'
  | 'gradient'
  | 'gradient-secondary'
  | 'gradient-violet'
  | 'gradient-violet-secondary';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Polymorphic component props
export type PolymorphicProps<E extends ElementType = ElementType> = {
  as?: E;
};

// Base button props
export interface ButtonBaseProps {
  /** Visual style variant */
  variant?: ButtonVariant;
  
  /** Size variant */
  size?: ButtonSize;
  
  /** Shows loading spinner and disables button */
  isLoading?: boolean;
  
  /** Full width button that expands to container width */
  fullWidth?: boolean;
  
  /** Icon element to display before button text */
  startIcon?: ReactNode;
  
  /** Icon element to display after button text */
  endIcon?: ReactNode;
  
  /** Button content */
  children?: ReactNode;
  
  /** Additional CSS class names */
  className?: string;
  
  /** ID for form association */
  form?: string;
  
  /** Data attributes (useful for testing) */
  dataAttributes?: { [key: string]: string };
}

// Used for type inference with polymorphic components
export type ButtonProps<E extends ElementType = 'button'> = 
  ButtonBaseProps & 
  PolymorphicProps<E> & 
  Omit<React.ComponentPropsWithRef<E>, keyof ButtonBaseProps | keyof PolymorphicProps<E>>;

/**
 * Button component with enhanced features and accessibility support
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      startIcon,
      endIcon,
      children,
      className,
      disabled = false,
      as: Component = 'button',
      dataAttributes = {},
      ...props
    }, 
    ref
  ) => {
    // Generate consistent class names manually without classnames dependency
    const buttonClasses = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      isLoading ? 'btn--loading' : '',
      disabled ? 'btn--disabled' : '',
      fullWidth ? 'btn--full-width' : '',
      className || ''
    ].filter(Boolean).join(' ');
    
    // Generate data attributes for testing
    const dataProps = Object.entries(dataAttributes).reduce(
      (acc, [key, value]) => ({ ...acc, [`data-${key}`]: value }),
      {}
    );
    
    // Enhanced accessibility attributes
    const accessibilityProps = {
      disabled: disabled || isLoading,
      'aria-busy': isLoading,
      'aria-disabled': disabled || isLoading,
      ...(isLoading ? { 
        'aria-live': 'polite' as const,
        'aria-label': `${typeof children === 'string' ? children : 'Button'} loading`
      } : {})
    };
    
    // Element type can be 'button', 'a' or any valid HTML element
    return (
      <Component
        ref={ref}
        className={buttonClasses}
        {...accessibilityProps}
        {...dataProps}
        {...props}
      >
        <span className="btn__content">
          {startIcon && (
            <span className="btn__icon btn__icon--start">
              {startIcon}
            </span>
          )}
          
          {children && (
            <span className="btn__text">{children}</span>
          )}
          
          {endIcon && (
            <span className="btn__icon btn__icon--end">
              {endIcon}
            </span>
          )}
        </span>
      </Component>
    );
  }
);

// Set display name for debugging
Button.displayName = 'Button';

// Memoize for performance optimization
export default React.memo(Button);
