/**
 * WorkoutFocusCard Component
 * 
 * Workout focus selection card for workout generator
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { GridSelector } from '../shared/GridSelector';
import { CardHeader } from '../shared/CardHeader';
import { useFocusSelection } from './hooks/useFocusSelection';
import { BaseCardProps } from '../shared/types';
import './WorkoutFocusCard.scss';

interface WorkoutFocusCardProps extends BaseCardProps {}

export const WorkoutFocusCard: React.FC<WorkoutFocusCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const {
    focusOptions,
    selectedFocus,
    profileGoals,
    isLoading,
    error,
    handleFocusChange
  } = useFocusSelection();

  return (
    <FormFieldCard
      title="Workout Focus"
      description="What's your fitness focus today?"
      delay={delay}
      variant="complex"
      className={`workout-focus-card ${className}`}
      profileSection={
        <CardHeader
          label="Your Long-term Goals:"
          badges={profileGoals}
          isLoading={isLoading}
          error={error}
          fallback={{
            icon: "🎯",
            text: "Profile Goals",
            subtitle: "Set up your profile to see personalized goals"
          }}
        />
      }
    >
      <GridSelector
        options={focusOptions}
        selectedValues={selectedFocus}
        onSelectionChange={handleFocusChange}
        multiSelect={false}
        gridColumns={3}
        label="Today's Focus:"
        className="focus-selector"
      />
    </FormFieldCard>
  );
}; 