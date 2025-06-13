/**
 * RestrictionsCard Component
 * 
 * Health restrictions and limitations selection card for daily workout customization.
 * Allows users to specify current soreness or discomfort to avoid in today's workout.
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useProfile } from '../../../../../profile/context';
import { useRestrictionsSelection } from './useRestrictionsSelection';
import './RestrictionsCard.scss';

interface RestrictionsCardProps extends BaseCardProps {}

export const RestrictionsCard: React.FC<RestrictionsCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const {
    selectedRestrictions,
    handleRestrictionToggle,
    isProfileSufficient,
    profileMapping,
    restrictionOptions
  } = useRestrictionsSelection();

  return (
    <FormFieldCard
      title="Restrictions"
      description="Any limitations or injuries?"
      delay={delay}
      variant="complex"
      className={`restrictions-card ${className}`}
    >
      <div className="restrictions-card-structure">
        {/* HEADER: Profile Limitations Section */}
        <div className="restrictions-card-header">
          {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.limitations.length > 0 ? (
            <div className="profile-restrictions-section">
              <div className="profile-restrictions-label">Health & Safety Focus:</div>
              <div className="profile-restrictions-badges">
                {profileMapping.displayData.limitations.slice(0, 3).map((limitation) => (
                  <span 
                    key={limitation.value}
                    className={`workout-type-badge profile-restriction-badge ${
                      selectedRestrictions.includes(limitation.value) ? 'active-today' : ''
                    }`}
                    onClick={() => handleRestrictionToggle(limitation.value)}
                    style={{ 
                      backgroundColor: selectedRestrictions.includes(limitation.value) 
                        ? `${limitation.color}40` 
                        : `${limitation.color}20`,
                      borderColor: selectedRestrictions.includes(limitation.value)
                        ? limitation.color
                        : `${limitation.color}60`,
                      color: limitation.color,
                      cursor: 'pointer',
                      opacity: selectedRestrictions.includes(limitation.value) ? 1 : 0.8
                    }}
                    title={`Click to ${selectedRestrictions.includes(limitation.value) ? 'remove' : 'add'} this restriction for today: ${limitation.display}`}
                  >
                    {limitation.display}
                  </span>
                ))}
                {profileMapping.displayData.limitations.length > 3 && (
                  <span className="restrictions-more-indicator">
                    +{profileMapping.displayData.limitations.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span className="header-icon">⚠️</span>
                <span>Health & Safety</span>
              </div>
              <div className="header-subtitle">Set up your profile to see health considerations</div>
            </div>
          )}
        </div>

        {/* BODY: Today's Restrictions Selector */}
        <div className="restrictions-card-body">
          <div className="restrictions-selector-container">
            <div className="restrictions-selector-label">
              Current soreness or discomfort:
            </div>
            
            <div className="restrictions-grid">
              {restrictionOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`restriction-option ${selectedRestrictions.includes(option.value) ? 'selected' : ''}`}
                  onClick={() => handleRestrictionToggle(option.value)}
                  title={option.title}
                >
                  <span className="restriction-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 