/**
 * WorkoutCustomizationCard Component
 * 
 * Workout customization and preferences input card for personalized workout modifications.
 * Allows users to specify custom requests, preferences, and workout modifications via textarea.
 */
import React from 'react';
import { FormFieldCard } from '../shared/FormFieldCard';
import { BaseCardProps } from '../shared/types';
import { useWorkoutCustomizationSelection } from './useWorkoutCustomizationSelection';
import './WorkoutCustomizationCard.scss';

interface WorkoutCustomizationCardProps extends BaseCardProps {}

export const WorkoutCustomizationCard: React.FC<WorkoutCustomizationCardProps> = ({ 
  delay = 0, 
  className = '' 
}) => {
  const {
    customizationText,
    handleCustomizationChange,
    characterCount,
    maxLength,
    placeholder
  } = useWorkoutCustomizationSelection();

  return (
    <FormFieldCard
      title="Workout Customization"
      description="Any specific requests or modifications?"
      delay={delay}
      variant="complex"
      className={`workout-customization-card ${className}`}
    >
      <div className="customization-card-structure">
        {/* HEADER: Customization Section */}
        <div className="customization-card-header">
          <div className="header-fallback">
            <div className="header-fallback-text">
              <span className="header-icon">✏️</span>
              <span>Custom Requests</span>
            </div>
            <div className="header-subtitle">Add any specific preferences or modifications</div>
          </div>
        </div>

        {/* BODY: Customization Text Input */}
        <div className="customization-card-body">
          <div className="customization-input-container">
            <div className="customization-input-label">
              Additional preferences or notes:
            </div>
            
            <textarea
              className="customization-textarea"
              placeholder={placeholder}
              value={customizationText}
              onChange={handleCustomizationChange}
              rows={4}
              maxLength={maxLength}
              aria-label="Workout customization notes and preferences"
              aria-describedby="customization-character-count"
            />
            
            <div 
              id="customization-character-count"
              className="customization-character-count"
              aria-live="polite"
            >
              {characterCount}/{maxLength} characters
            </div>
          </div>
        </div>
      </div>
    </FormFieldCard>
  );
}; 