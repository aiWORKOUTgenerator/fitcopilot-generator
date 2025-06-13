/**
 * StressMoodCard Component
 * 
 * Stress and mood level selection card for daily workout customization.
 * Allows users to specify their current stress/mood level with 6-level intensity system.
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useProfile } from '../../../../../profile/context';
import { useStressMoodSelection } from './useStressMoodSelection';
import './StressMoodCard.scss';

interface StressMoodCardProps extends BaseCardProps {}

export const StressMoodCard: React.FC<StressMoodCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const {
    selectedStressLevel,
    handleStressLevelSelection,
    isProfileSufficient,
    profileMapping,
    stressLevelOptions
  } = useStressMoodSelection();

  return (
    <FormFieldCard
      title="Stress Level"
      description="How stressed are you feeling today?"
      delay={delay}
      variant="complex"
      className={`stress-mood-card ${className}`}
    >
      <div className="stress-card-structure">
        {/* HEADER: Profile Stress Section */}
        <div className="stress-card-header">
          {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
            <div className="profile-stress-section">
              <div className="profile-stress-label">Your Typical Stress:</div>
              <div className="profile-stress-badges">
                <span 
                  className="workout-type-badge profile-stress-badge"
                  style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                  title="Click to use your typical stress level"
                >
                  <span className="workout-type-icon">🧘</span>
                  Balanced
                </span>
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span className="header-icon">🧘</span>
                <span>Stress Level</span>
              </div>
              <div className="header-subtitle">Set up your profile to see your stress patterns</div>
            </div>
          )}
        </div>

        {/* BODY: Today's Stress Selector */}
        <div className="stress-card-body">
          <div className="stress-selector-container">
            <div className="stress-selector-label">
              Today's Stress:
            </div>
            
            <div className="stress-options-grid">
              {stressLevelOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`stress-option ${selectedStressLevel === option.value ? 'selected' : ''}`}
                  onClick={() => handleStressLevelSelection(option.value)}
                  title={option.title}
                >
                  <span className="stress-icon">{option.icon}</span>
                  <span className="stress-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 