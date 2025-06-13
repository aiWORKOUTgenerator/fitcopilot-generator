/**
 * SleepQualityCard Component
 * 
 * Sleep quality assessment card for daily workout customization.
 * Allows users to rate their previous night's sleep quality with 6-level system.
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useProfile } from '../../../../../profile/context';
import { useSleepQualitySelection } from './useSleepQualitySelection';
import './SleepQualityCard.scss';

interface SleepQualityCardProps extends BaseCardProps {}

export const SleepQualityCard: React.FC<SleepQualityCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const {
    selectedSleepQuality,
    handleSleepQualitySelection,
    isProfileSufficient,
    profileMapping,
    sleepQualityOptions
  } = useSleepQualitySelection();

  return (
    <FormFieldCard
      title="Sleep Quality"
      description="How well did you sleep last night?"
      delay={delay}
      variant="complex"
      className={`sleep-quality-card ${className}`}
    >
      <div className="sleep-card-structure">
        {/* HEADER: Profile Sleep Section */}
        <div className="sleep-card-header">
          {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
            <div className="profile-sleep-section">
              <div className="profile-sleep-label">Your Typical Sleep:</div>
              <div className="profile-sleep-badges">
                <span className="profile-sleep-info">Rate last night's rest quality</span>
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span>Sleep Quality</span>
              </div>
              <div className="header-subtitle">Rate how well you slept last night</div>
            </div>
          )}
        </div>

        {/* BODY: Sleep Quality Selector */}
        <div className="sleep-card-body">
          <div className="sleep-selector-container">
            <div className="sleep-selector-label">
              Last night's sleep quality:
            </div>
            
            <div className="sleep-grid">
              {sleepQualityOptions.map((option) => (
                <div 
                  key={option.value}
                  className={`sleep-option ${selectedSleepQuality === option.value ? 'selected' : ''}`}
                  onClick={() => handleSleepQualitySelection(option.value)}
                  title={option.title}
                >
                  <span className="sleep-label">{option.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 