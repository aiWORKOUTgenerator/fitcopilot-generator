/**
 * DurationCard Component
 * 
 * Workout duration selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { CardHeader } from '../shared/CardHeader';
import { useDurationSelection } from './useDurationSelection';
import './DurationCard.scss';

interface DurationCardProps {
  delay?: number;
}

/**
 * Workout Duration Selection Card Component
 * Handles selection of today's workout duration with profile integration
 */
export const DurationCard: React.FC<DurationCardProps> = ({ 
  delay = 0 
}) => {
  const {
    durationOptions,
    selectedDuration,
    profileDuration,
    hasProfileData,
    handleDurationSelection
  } = useDurationSelection();

  const profileSection = hasProfileData ? (
    <CardHeader
      label="Your Profile Suggests:"
      badges={profileDuration ? [{
        value: profileDuration.value.toString(),
        display: profileDuration.display,
        icon: profileDuration.icon,
        color: profileDuration.color,
        bgColor: profileDuration.bgColor
      }] : []}
      fallback={{
        icon: "⏱️",
        text: "Suggested Duration",
        subtitle: "Set up your profile to see personalized suggestions"
      }}
      maxBadges={1}
    />
  ) : null;

  return (
    <FormFieldCard
      title="Duration"
      description="How much time do you have today?"
      delay={delay}
      variant={hasProfileData ? 'complex' : 'standard'}
      profileSection={profileSection}
    >
      <div className="duration-selector-container">
        <div className="duration-selector-label">
          Select workout duration:
        </div>
        
        <div className="duration-options-grid">
          {durationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`duration-option ${
                selectedDuration === option.value ? 'selected' : ''
              }`}
              onClick={() => handleDurationSelection(option.value)}
              title={option.tooltip}
            >
              <span className="duration-number">{option.value}</span>
              <span className="duration-unit">min</span>
              <span className="duration-label">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="duration-scale-info">
          <span className="scale-info">Perfect for any schedule</span>
        </div>
      </div>
    </FormFieldCard>
  );
};

export default DurationCard; 