/**
 * Quick Action Button Component
 * 
 * Specialized button for header quick actions with tooltip support,
 * multiple variants, and accessibility features.
 */
import React, { useState } from 'react';

export type QuickActionVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface QuickActionButtonProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: QuickActionVariant;
  /** Tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Badge count for notifications */
  badge?: number;
}

/**
 * QuickActionButton Component
 */
export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'secondary',
  tooltip,
  disabled = false,
  loading = false,
  className = '',
  badge
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const buttonClasses = [
    'quick-action-button',
    `variant-${variant}`,
    disabled && 'disabled',
    loading && 'loading',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="quick-action-wrapper">
      <button
        className={buttonClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || loading}
        aria-label={tooltip || label}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        {/* Icon Container */}
        <span className="action-icon">
          {loading ? (
            <div className="loading-spinner" aria-hidden="true">
              <div className="spinner"></div>
            </div>
          ) : (
            icon
          )}
        </span>
        
        {/* Label */}
        <span className="action-label">
          {label}
        </span>
        
        {/* Badge */}
        {badge && badge > 0 && (
          <span className="action-badge" aria-label={`${badge} notifications`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {tooltip && showTooltip && (
        <div 
          className="action-tooltip"
          role="tooltip"
          aria-hidden="true"
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default QuickActionButton; 