/**
 * IntensityCard Component
 * 
 * Workout intensity level selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { CardHeader } from '../shared/CardHeader';
import { useIntensitySelection } from './useIntensitySelection';
import './IntensityCard.scss';

interface IntensityCardProps {
  delay?: number;
}

/**
 * Workout Intensity Selection Card Component
 * Handles selection of today's workout intensity level with profile integration
 */
export const IntensityCard: React.FC<IntensityCardProps> = ({ 
  delay = 0 
}) => {
  const {
    intensityOptions,
    selectedIntensity,
    profileIntensity,
    hasProfileData,
    handleIntensitySelection
  } = useIntensitySelection();

  const profileSection = hasProfileData ? (
    <CardHeader
      label="Your Typical Intensity:"
      badges={profileIntensity ? [{
        value: profileIntensity.value.toString(),
        display: profileIntensity.display,
        icon: profileIntensity.icon,
        color: profileIntensity.color,
        bgColor: profileIntensity.bgColor
      }] : []}
      fallback={{
        icon: "💪",
        text: "Workout Intensity",
        subtitle: "Set up your profile to see your typical intensity"
      }}
      maxBadges={1}
    />
  ) : null;

  return (
    <FormFieldCard
      title="Intensity Level"
      description="How intense should today's workout be?"
      delay={delay}
      variant={hasProfileData ? 'complex' : 'standard'}
      profileSection={profileSection}
    >
      <div className="intensity-selector-container">
        <div className="intensity-selector-label">
          Select intensity level (1-5 scale):
        </div>
        
        <div className="intensity-rating-selector">
          {intensityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`intensity-rating-button ${
                selectedIntensity === option.value ? 'selected' : ''
              }`}
              onClick={() => handleIntensitySelection(option.value)}
              title={option.tooltip}
            >
              <span className="intensity-rating-number">{option.value}</span>
              <span className="intensity-rating-icon">{option.icon}</span>
              <span className="intensity-rating-label">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="intensity-scale-labels">
          <span className="scale-label-start">Light</span>
          <span className="scale-label-end">Very Intense</span>
        </div>
      </div>
    </FormFieldCard>
  );
};

export default IntensityCard; 