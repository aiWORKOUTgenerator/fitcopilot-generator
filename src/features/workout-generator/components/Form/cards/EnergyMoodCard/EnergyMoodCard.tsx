/**
 * EnergyMoodCard Component
 * 
 * Energy and motivation level selection card for daily workout customization.
 * Allows users to specify their current energy/motivation level with 6-level intensity system.
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useProfile } from '../../../../../profile/context';
import { useEnergyMoodSelection } from './useEnergyMoodSelection';
import './EnergyMoodCard.scss';

interface EnergyMoodCardProps extends BaseCardProps {}

export const EnergyMoodCard: React.FC<EnergyMoodCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const {
    selectedEnergyLevel,
    handleEnergyLevelSelection,
    isProfileSufficient,
    profileMapping,
    energyLevelOptions
  } = useEnergyMoodSelection();

  return (
    <FormFieldCard
      title="Energy Level"
      description="How motivated are you feeling today?"
      delay={delay}
      variant="complex"
      className={`energy-mood-card ${className}`}
    >
      <div className="motivation-card-structure">
        {/* HEADER: Profile Energy Section */}
        <div className="motivation-card-header">
          {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
            <div className="profile-motivation-section">
              <div className="profile-motivation-label">Your Typical Energy:</div>
              <div className="profile-motivation-badges">
                <span 
                  className="workout-type-badge profile-motivation-badge"
                  style={{ 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    cursor: 'pointer',
                    opacity: 0.8
                  }}
                  title="Click to use your typical energy level"
                >
                  <span className="workout-type-icon">⚡</span>
                  Balanced
                </span>
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span className="header-icon">⚡</span>
                <span>Energy Level</span>
              </div>
              <div className="header-subtitle">Set up your profile to see your energy patterns</div>
            </div>
          )}
        </div>

        {/* BODY: Today's Energy/Motivation Selector */}
        <div className="motivation-card-body">
          <div className="motivation-selector-container">
            <div className="motivation-selector-label">
              Today's Energy:
            </div>
            
            <div className="motivation-options-grid">
              {energyLevelOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`motivation-option ${selectedEnergyLevel === option.value ? 'selected' : ''}`}
                  onClick={() => handleEnergyLevelSelection(option.value)}
                  title={option.title}
                >
                  <span className="motivation-icon">{option.icon}</span>
                  <span className="motivation-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 