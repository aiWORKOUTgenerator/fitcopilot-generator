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
}

/**
 * Card component for displaying content in a contained box with consistent styling
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
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  bordered = true,
  elevated = false,
  padding = 'medium',
}) => {
  const cardClasses = [
    'card',
    hoverable ? 'card--hoverable' : '',
    bordered ? 'card--bordered' : '',
    elevated ? 'card--elevated' : '',
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