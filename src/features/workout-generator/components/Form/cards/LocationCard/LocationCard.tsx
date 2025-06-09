/**
 * LocationCard Component
 * 
 * Workout location selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';

interface LocationCardProps extends BaseCardProps {}

export const LocationCard: React.FC<LocationCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  return (
    <FormFieldCard
      title="Location"
      description="Where will you work out today?"
      delay={delay}
      variant="complex"
      className={`location-card ${className}`}
    >
      <div>Location selection coming soon...</div>
    </FormFieldCard>
  );
}; 