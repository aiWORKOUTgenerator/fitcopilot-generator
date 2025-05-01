import React from 'react';
import './Card.scss';

export interface CardProps {
  /**
   * Content to be displayed inside the card
   */
  children: React.ReactNode;
  
  /**
   * Optional additional CSS classes
   */
  className?: string;
  
  /**
   * Optional click handler
   */
  onClick?: () => void;
  
  /**
   * Set to true for card with hover effects
   */
  hoverable?: boolean;
  
  /**
   * Set to true for cards with border
   */
  bordered?: boolean;
  
  /**
   * Set to true for cards with shadow
   */
  elevated?: boolean;
  
  /**
   * Set card padding level - small, medium, large
   */
  padding?: 'small' | 'medium' | 'large';
  
  /**
   * Set to true to use primary color accent (lime)
   */
  primary?: boolean;
}

/**
 * Card component for displaying content in a contained box with consistent styling
 * 
 * The Card component uses the following color tokens:
 * - `color('surface')` - For the background color
 * - `color('border')` - For the border in bordered variant
 * - `color('text')` - For the text color
 * - `color('surface', 'hover')` - For hover state background
 * - `color('primary')` - For primary variant accent (lime)
 * 
 * In dark mode:
 * - `dark-color('surface')` - Dark mode background
 * - `dark-color('border')` - Dark mode border
 * - `dark-color('text')` - Dark mode text color
 * - `dark-color('surface', 'hover')` - Dark mode hover background
 * - `dark-color('primary')` - Dark mode primary accent (lime)
 * 
 * Shadows and motion:
 * - Uses `card-shadow('card')` for elevation
 * - Uses `transition-preset('card')` for hover/interaction transitions
 * 
 * @param {CardProps} props - Card component props
 * @returns {JSX.Element} Card component
 * 
 * @example
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 * 
 * @example
 * <Card hoverable bordered padding="large" className="custom-card">
 *   <h3>Card with Custom Options</h3>
 *   <p>This card has hover effects, a border and large padding</p>
 * </Card>
 * 
 * @example
 * <Card primary elevated hoverable>
 *   <h3>Primary Card</h3>
 *   <p>This card uses the new lime accent color</p>
 * </Card>
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
  elevated = false,
  padding = 'medium',
  primary = false,
}) => {
  const cardClasses = [
    'card',
    hoverable ? 'card--hoverable' : '',
    bordered ? 'card--bordered' : '',
    elevated ? 'card--elevated' : '',
    primary ? 'card--primary' : '',
    `card--padding-${padding}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card; 