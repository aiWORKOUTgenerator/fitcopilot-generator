/**
 * DurationCard Component
 * 
 * Workout duration selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';

interface DurationCardProps extends BaseCardProps {}

export const DurationCard: React.FC<DurationCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  return (
    <FormFieldCard
      title="Duration"
      description="How much time do you have?"
      delay={delay}
      variant="complex"
      className={`duration-card ${className}`}
    >
      <div>Duration selection coming soon...</div>
    </FormFieldCard>
  );
}; 