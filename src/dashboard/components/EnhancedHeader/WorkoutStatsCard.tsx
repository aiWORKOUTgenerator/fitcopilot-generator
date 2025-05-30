/**
 * Workout Stats Card Component
 * 
 * Individual statistic card with icon, value, label, and trend indicator.
 * Supports compact mode for header display and mobile optimization.
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type TrendType = 'up' | 'down' | 'neutral';

interface WorkoutStatsCardProps {
  /** Icon to display */
  icon: React.ReactNode;
  /** Primary value to display */
  value: number | string;
  /** Label for the statistic */
  label: string;
  /** Trend direction */
  trend?: TrendType;
  /** Additional subtitle text */
  subtitle?: string;
  /** Compact mode for header display */
  compact?: boolean;
  /** Mobile optimized version */
  mobile?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get trend icon based on trend type
 */
const getTrendIcon = (trend: TrendType) => {
  switch (trend) {
    case 'up':
      return <TrendingUp size={12} />;
    case 'down':
      return <TrendingDown size={12} />;
    case 'neutral':
    default:
      return <Minus size={12} />;
  }
};

/**
 * Get trend color class based on trend type
 */
const getTrendColorClass = (trend: TrendType) => {
  switch (trend) {
    case 'up':
      return 'trend-positive';
    case 'down':
      return 'trend-negative';
    case 'neutral':
    default:
      return 'trend-neutral';
  }
};

/**
 * WorkoutStatsCard Component
 */
export const WorkoutStatsCard: React.FC<WorkoutStatsCardProps> = ({
  icon,
  value,
  label,
  trend,
  subtitle,
  compact = false,
  mobile = false,
  onClick,
  className = ''
}) => {
  const cardClasses = [
    'workout-stats-card',
    compact && 'compact',
    mobile && 'mobile',
    onClick && 'clickable',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
    >
      {/* Card Content */}
      <div className="stats-card-content">
        {/* Icon */}
        <div className="stats-icon">
          {icon}
        </div>
        
        {/* Value and Label */}
        <div className="stats-data">
          <div className="stats-value">
            {value}
          </div>
          <div className="stats-label">
            {label}
          </div>
          {subtitle && !compact && (
            <div className="stats-subtitle">
              {subtitle}
            </div>
          )}
        </div>
        
        {/* Trend Indicator */}
        {trend && !mobile && (
          <div className={`stats-trend ${getTrendColorClass(trend)}`}>
            {getTrendIcon(trend)}
          </div>
        )}
      </div>
      
      {/* Mobile Trend Indicator */}
      {trend && mobile && (
        <div className={`mobile-trend ${getTrendColorClass(trend)}`}>
          {getTrendIcon(trend)}
        </div>
      )}
    </div>
  );
};

export default WorkoutStatsCard; 