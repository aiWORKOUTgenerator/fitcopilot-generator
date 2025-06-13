/**
 * WorkoutFocusCard Component
 * 
 * Workout focus selection card for workout generator
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { CardHeader } from '../shared/CardHeader';
import { useFocusSelection } from './useFocusSelection';
import './WorkoutFocusCard.scss';

interface WorkoutFocusCardProps {
  delay?: number;
}

/**
 * Workout Focus Selection Card Component
 * Handles selection of today's workout focus with profile integration
 */
export const WorkoutFocusCard: React.FC<WorkoutFocusCardProps> = ({ 
  delay = 0 
}) => {
  const {
    focusOptions,
    selectedFocus,
    profileGoals,
    hasProfileData,
    handleFocusSelection
  } = useFocusSelection();

  const profileSection = (
    <CardHeader
      label="Your Long-term Goals:"
      badges={profileGoals}
      maxBadges={2}
      fallback={{
        icon: "🎯",
        text: "Profile Goals",
        subtitle: "Set up your profile to see personalized goals"
      }}
      onBadgeClick={(badge) => handleFocusSelection(badge.value)}
    />
  );

  return (
    <FormFieldCard
      title="Workout Focus"
      description="What's your fitness focus today?"
      delay={delay}
      variant="complex"
      profileSection={hasProfileData ? profileSection : undefined}
    >
      <div className="focus-selector-container">
        <div className="focus-selector-label">Today's Focus:</div>
        <div className="focus-options-grid">
          {focusOptions.map((option) => (
            <div
              key={option.value}
              className={`focus-option ${selectedFocus === option.value ? 'selected' : ''}`}
              onClick={() => handleFocusSelection(option.value)}
              title={option.tooltip}
            >
              <span className="focus-icon">{option.icon}</span>
              <span className="focus-label">{option.label}</span>
            </div>
          ))}
        </div>
      </div>
    </FormFieldCard>
  );
};

export default WorkoutFocusCard; 