/**
 * RestrictionsCard Component
 * 
 * Health restrictions and limitations selection card
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';

interface RestrictionsCardProps extends BaseCardProps {}

export const RestrictionsCard: React.FC<RestrictionsCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  return (
    <FormFieldCard
      title="Restrictions"
      description="Any limitations or injuries?"
      delay={delay}
      variant="complex"
      className={`restrictions-card ${className}`}
    >
      <div>Restrictions selection coming soon...</div>
    </FormFieldCard>
  );
}; 