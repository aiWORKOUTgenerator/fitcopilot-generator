/**
 * IntensityCard Component
 * 
 * Workout intensity level selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';

interface IntensityCardProps extends BaseCardProps {}

export const IntensityCard: React.FC<IntensityCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  return (
    <FormFieldCard
      title="Workout Intensity"
      description="Choose your challenge level"
      delay={delay}
      variant="complex"
      className={`intensity-card ${className}`}
    >
      <div>Intensity selection coming soon...</div>
    </FormFieldCard>
  );
}; 