/**
 * CardHeader Component
 * 
 * Reusable header component for profile sections in cards
 */
import React from 'react';
import './CardHeader.scss';

interface ProfileBadge {
  value: string;
  display: string;
  icon?: string;
  color?: string;
  bgColor?: string;
}

interface FallbackHeader {
  icon: string;
  text: string;
  subtitle: string;
}

interface CardHeaderProps {
  label: string;
  badges?: ProfileBadge[];
  fallback: FallbackHeader;
  maxBadges?: number;
  onBadgeClick?: (badge: ProfileBadge) => void;
  className?: string;
}

/**
 * Reusable card header component for profile sections
 * Handles profile data display with fallback states
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  label,
  badges = [],
  fallback,
  maxBadges = 3,
  onBadgeClick,
  className = ''
}) => {
  const hasBadges = badges.length > 0;
  const displayBadges = badges.slice(0, maxBadges);
  const remainingCount = badges.length - maxBadges;

  if (hasBadges) {
    return (
      <div className={`card-header ${className}`}>
        <div className="profile-section">
          <div className="profile-label">{label}</div>
          <div className="profile-badges">
            {displayBadges.map((badge, index) => (
              <span 
                key={badge.value}
                className="workout-type-badge profile-badge"
                onClick={() => onBadgeClick?.(badge)}
                style={{ 
                  backgroundColor: badge.bgColor || 'rgba(59, 130, 246, 0.1)',
                  color: badge.color || '#3b82f6',
                  cursor: onBadgeClick ? 'pointer' : 'default',
                  opacity: 0.8
                }}
                title={`${badge.display}${onBadgeClick ? ' - Click to apply' : ''}`}
              >
                {badge.icon && <span className="workout-type-icon">{badge.icon}</span>}
                {badge.display}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="badges-more-indicator">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-header ${className}`}>
      <div className="header-fallback">
        <div className="header-fallback-text">
          <span className="header-icon">{fallback.icon}</span>
          <span>{fallback.text}</span>
        </div>
        <div className="header-subtitle">{fallback.subtitle}</div>
      </div>
    </div>
  );
};

export default CardHeader; 