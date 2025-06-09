/**
 * CardHeader Component
 * 
 * Reusable header component for profile sections in cards
 */
import React from 'react';
import { CardProfileSection } from '../types';
import './CardHeader.scss';

interface CardHeaderProps extends CardProfileSection {
  isLoading?: boolean;
  error?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  label,
  badges = [],
  fallback,
  isLoading = false,
  error
}) => {
  // Show fallback if loading, error, or no badges
  const showFallback = isLoading || error || badges.length === 0;

  if (showFallback && fallback) {
    return (
      <div className="card-header-fallback">
        <div className="header-fallback-text">
          <span className="header-icon">{fallback.icon}</span>
          <span>{fallback.text}</span>
        </div>
        <div className="header-subtitle">{fallback.subtitle}</div>
      </div>
    );
  }

  return (
    <div className="card-header-profile-section">
      <div className="profile-section-label">{label}</div>
      <div className="profile-section-badges">
        {badges.slice(0, 3).map((badge, index) => (
          <span 
            key={badge.value}
            className="profile-badge"
            style={{ 
              backgroundColor: badge.bgColor || 'rgba(255, 255, 255, 0.05)',
              color: badge.color || 'var(--color-text-secondary, #b3b3b3)',
              borderColor: badge.color ? `${badge.color}40` : 'rgba(255, 255, 255, 0.1)'
            }}
            title={badge.display}
          >
            {badge.icon && <span className="badge-icon">{badge.icon}</span>}
            {badge.display}
          </span>
        ))}
        {badges.length > 3 && (
          <span className="badges-more-indicator">
            +{badges.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}; 