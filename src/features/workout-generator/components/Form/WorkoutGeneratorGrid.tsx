/**
 * Workout Generator Grid Component
 * 
 * Premium grid-based workout generator interface inspired by FitnessStats design.
 * This component will incrementally replace the existing form implementation.
 */
import React, { useState } from 'react';
import { useProfile } from '../../../profile/context';
import { 
  mapProfileToWorkoutContext, 
  isProfileSufficientForWorkout 
} from '../../utils/profileMapping';
import './WorkoutGeneratorGrid.scss';

interface WorkoutGeneratorGridProps {
  className?: string;
}

interface FormFieldCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: 'standard' | 'complex'; // New: indicates content complexity
}

/**
 * Individual form field card component with content-first architecture
 */
const FormFieldCard: React.FC<FormFieldCardProps> = ({
  title,
  description,
  children,
  delay = 0,
  className = '',
  variant = 'standard'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`form-field-card ${isVisible ? 'visible' : ''} ${variant === 'complex' ? 'form-field-card--complex' : ''} ${className}`}
    >
      <div className="form-field-card-inner">
        {/* Compact Header */}
        <div className="field-header">
        <div className="field-title">{title}</div>
        {description && (
          <div className="field-description">{description}</div>
        )}
        </div>

        {/* Content Area - Now gets majority of space */}
        <div className="field-content">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Main Workout Generator Grid Component
 */
export const WorkoutGeneratorGrid: React.FC<WorkoutGeneratorGridProps> = ({
  className = ''
}) => {
  // Profile context integration (matching InputStep.tsx)
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;
  
  // Map profile data to workout context
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const isProfileSufficient = isProfileSufficientForWorkout(profile);

  return (
    <div className={`workout-generator-container-premium ${className}`}>
      <div className="workout-generator-grid-premium">
        {/* Header */}
        <div className="grid-header">
          <div className="grid-insight">
            <span className="insight-text">🚀 Ready to create your perfect workout? Let's get started!</span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="generator-grid">
        {/* Workout Focus Card */}
        <FormFieldCard
          title="Workout Focus"
          description="What's your fitness focus today?"
          delay={0}
          variant="complex"
        >
          <div className="goal-card-structure">
            {/* HEADER: Profile Goals Section */}
            <div className="goal-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.goals.length > 0 ? (
                <div className="profile-goals-section">
                  <div className="profile-goals-label">Your Long-term Goals:</div>
                  <div className="profile-goals-badges">
                    {profileMapping.displayData.goals.slice(0, 2).map((goal, index) => (
                      <span 
                        key={goal.value}
                        className="workout-type-badge profile-goal-badge"
                        style={{ 
                          cursor: 'pointer',
                          opacity: 0.8
                        }}
                        title="Click to align today's workout with your long-term goals"
                      >
                        <span className="workout-type-icon">{goal.icon}</span>
                        {goal.display}
                      </span>
                    ))}
                    {profileMapping.displayData.goals.length > 2 && (
                      <span className="goals-more-indicator">
                        +{profileMapping.displayData.goals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">🎯</span>
                    <span>Profile Goals</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see personalized goals</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Focus Selector */}
            <div className="goal-card-body">
              <div className="focus-selector-container">
                <div className="focus-selector-label">Today's Focus:</div>
                {/* Note: Showing 6 of 7 legacy options for clean 3x2 grid. "Sport-Specific" can be accessed via advanced options */}
                <div className="focus-options-grid">
                  <div className="focus-option" title="Fat Burning & Cardio">
                    <span className="focus-icon">🔥</span>
                    <span className="focus-label">Fat Burning</span>
                  </div>
                  <div className="focus-option" title="Muscle Building">
                    <span className="focus-icon">💪</span>
                    <span className="focus-label">Build Muscle</span>
                  </div>
                  <div className="focus-option" title="Endurance & Stamina">
                    <span className="focus-icon">🏃</span>
                    <span className="focus-label">Endurance</span>
                  </div>
                  <div className="focus-option" title="Strength Training">
                    <span className="focus-icon">🏋️</span>
                    <span className="focus-label">Strength</span>
                  </div>
                  <div className="focus-option" title="Flexibility & Mobility">
                    <span className="focus-icon">🧘</span>
                    <span className="focus-label">Flexibility</span>
                  </div>
                  <div className="focus-option" title="General Fitness">
                    <span className="focus-icon">⚡</span>
                    <span className="focus-label">General</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Workout Intensity Card */}
        <FormFieldCard
          title="Workout Intensity"
          description="Choose your challenge level"
          delay={100}
          variant="complex"
        >
          <div className="intensity-card-structure">
            {/* HEADER: Profile Intensity Section */}
            <div className="intensity-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-intensity-section">
                  <div className="profile-intensity-label">Your Profile Level:</div>
                  <div className="profile-intensity-badges">
                    <span 
                      className="workout-type-badge profile-intensity-badge"
                      style={{ 
                        backgroundColor: profileMapping.displayData.fitnessLevel.bgColor,
                        color: profileMapping.displayData.fitnessLevel.color,
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title="Click to use your profile fitness level"
                    >
                      <span className="workout-type-icon">{profileMapping.displayData.fitnessLevel.icon}</span>
                      {profileMapping.displayData.fitnessLevel.display}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">💪</span>
                    <span>Profile Level</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see your fitness level</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Intensity Selector */}
            <div className="intensity-card-body">
              <div className="intensity-selector-container">
                <div className="intensity-selector-label">Today's Intensity:</div>
                {/* 6-level intensity system in 3x2 grid */}
                <div className="intensity-options-grid">
                  <div className="intensity-option" title="Very Low - Gentle, recovery-focused">
                    <span className="intensity-icon">🟢</span>
                    <span className="intensity-label">Very Low</span>
                  </div>
                  <div className="intensity-option" title="Low - Light activity, easy pace">
                    <span className="intensity-icon">🔵</span>
                    <span className="intensity-label">Low</span>
                  </div>
                  <div className="intensity-option" title="Moderate - Comfortable challenge">
                    <span className="intensity-icon">🟡</span>
                    <span className="intensity-label">Moderate</span>
                  </div>
                  <div className="intensity-option" title="High - Vigorous, challenging">
                    <span className="intensity-icon">🟠</span>
                    <span className="intensity-label">High</span>
                  </div>
                  <div className="intensity-option" title="Very High - Maximum effort">
                    <span className="intensity-icon">🔴</span>
                    <span className="intensity-label">Very High</span>
                  </div>
                  <div className="intensity-option" title="Extreme - Elite level, push limits">
                    <span className="intensity-icon">🟣</span>
                    <span className="intensity-label">Extreme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Duration Card */}
        <FormFieldCard
          title="Duration"
          description="How much time do you have?"
          delay={200}
          variant="complex"
        >
          <div className="duration-card-structure">
            {/* HEADER: Profile Duration Section */}
            <div className="duration-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-duration-section">
                  <div className="profile-duration-label">Your Profile Suggests:</div>
                  <div className="profile-duration-badges">
                    <span 
                      className="workout-type-badge profile-duration-badge"
                      style={{ 
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title="Based on your workout frequency preference"
                    >
                      <span className="workout-type-icon">⏱️</span>
                      {profileMapping.displayData.frequency.suggestedDuration}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">⏱️</span>
                    <span>Suggested Duration</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see personalized suggestions</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Duration Selector */}
            <div className="duration-card-body">
              <div className="duration-selector-container">
                <div className="duration-selector-label">Today's Duration:</div>
                {/* 6 duration options in 3x2 grid */}
                <div className="duration-options-grid">
                  <div className="duration-option" title="10 minutes - Quick session">
                    <span className="duration-number">10</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div className="duration-option" title="15 minutes - Short workout">
                    <span className="duration-number">15</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div className="duration-option" title="20 minutes - Compact session">
                    <span className="duration-number">20</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div className="duration-option" title="30 minutes - Standard workout">
                    <span className="duration-number">30</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div className="duration-option" title="45 minutes - Extended session">
                    <span className="duration-number">45</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div className="duration-option" title="60 minutes - Full workout">
                    <span className="duration-number">60</span>
                    <span className="duration-unit">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Focus Area Card */}
        <FormFieldCard
          title="Focus Area"
          description="Target specific muscle groups"
          delay={300}
          variant="complex"
        >
          <div className="focusarea-card-structure">
            {/* HEADER: Profile Focus Areas Section */}
            <div className="focusarea-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-focusarea-section">
                  <div className="profile-focusarea-label">Your Profile Goals:</div>
                  <div className="profile-focusarea-badges">
                    {profileMapping.displayData.goals.slice(0, 2).map((goal, index) => (
                      <span 
                        key={goal.value}
                        className="workout-type-badge profile-focusarea-badge"
                        style={{ 
                          cursor: 'pointer',
                          opacity: 0.8
                        }}
                        title={`Focus areas aligned with: ${goal.display}`}
                      >
                        <span className="workout-type-icon">{goal.icon}</span>
                        {goal.display}
                      </span>
                    ))}
                    {profileMapping.displayData.goals.length > 2 && (
                      <span className="focusarea-more-indicator">
                        +{profileMapping.displayData.goals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">🎯</span>
                    <span>Focus Areas</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see goal-aligned areas</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Focus Area Selector */}
            <div className="focusarea-card-body">
              <div className="focusarea-selector-container">
                <div className="focusarea-selector-label">Focus Areas for Today:</div>
                {/* All 10 focus area options from FOCUS_AREA_OPTIONS - no icons, compact */}
                <div className="focusarea-options-grid">
                  <div className="focusarea-option" title="Upper Body" data-focusarea="upper-body">
                    <span className="focusarea-label">Upper Body</span>
                  </div>
                  <div className="focusarea-option" title="Lower Body" data-focusarea="lower-body">
                    <span className="focusarea-label">Lower Body</span>
                  </div>
                  <div className="focusarea-option" title="Core" data-focusarea="core">
                    <span className="focusarea-label">Core</span>
                  </div>
                  <div className="focusarea-option" title="Back" data-focusarea="back">
                    <span className="focusarea-label">Back</span>
                  </div>
                  <div className="focusarea-option" title="Shoulders" data-focusarea="shoulders">
                    <span className="focusarea-label">Shoulders</span>
                  </div>
                  <div className="focusarea-option" title="Chest" data-focusarea="chest">
                    <span className="focusarea-label">Chest</span>
                  </div>
                  <div className="focusarea-option" title="Arms" data-focusarea="arms">
                    <span className="focusarea-label">Arms</span>
                  </div>
                  <div className="focusarea-option" title="Mobility/Flexibility" data-focusarea="mobility">
                    <span className="focusarea-label">Mobility</span>
                  </div>
                  <div className="focusarea-option" title="Cardio" data-focusarea="cardio">
                    <span className="focusarea-label">Cardio</span>
                  </div>
                  <div className="focusarea-option" title="Recovery/Stretching" data-focusarea="recovery">
                    <span className="focusarea-label">Recovery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Equipment Card */}
        <FormFieldCard
          title="Equipment"
          description="What do you have available?"
          delay={400}
          variant="complex"
        >
          <div className="equipment-card-structure">
            {/* HEADER: Profile Equipment Section */}
            <div className="equipment-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-equipment-section">
                  <div className="profile-equipment-label">Your Available Equipment:</div>
                  <div className="profile-equipment-badges">
                    {profileMapping.displayData.equipment.slice(0, 3).map((equipment, index) => (
                      <span 
                        key={equipment.value}
                        className="workout-type-badge profile-equipment-badge"
                        style={{ 
                          cursor: 'pointer',
                          opacity: 0.8
                        }}
                        title={`Click to select: ${equipment.display}`}
                      >
                        <span className="workout-type-icon">{equipment.icon}</span>
                        {equipment.display}
                      </span>
                    ))}
                    {profileMapping.displayData.equipment.length > 3 && (
                      <span className="equipment-more-indicator">
                        +{profileMapping.displayData.equipment.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">🏋️</span>
                    <span>Available Equipment</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see your equipment</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Equipment Selector */}
            <div className="equipment-card-body">
              <div className="equipment-selector-container">
                <div className="equipment-selector-label">Select for Today:</div>
                {/* All 12 equipment options from original EQUIPMENT_OPTIONS - no icons */}
                <div className="equipment-options-grid">
                  <div className="equipment-option" title="None/Bodyweight Only" data-equipment="none">
                    <span className="equipment-label">No Equipment</span>
                  </div>
                  <div className="equipment-option" title="Dumbbells" data-equipment="dumbbells">
                    <span className="equipment-label">Dumbbells</span>
                  </div>
                  <div className="equipment-option" title="Kettlebells" data-equipment="kettlebells">
                    <span className="equipment-label">Kettlebells</span>
                  </div>
                  <div className="equipment-option" title="Resistance Bands" data-equipment="resistance-bands">
                    <span className="equipment-label">Resistance Bands</span>
                  </div>
                  <div className="equipment-option" title="Pull-up Bar" data-equipment="pull-up-bar">
                    <span className="equipment-label">Pull-up Bar</span>
                  </div>
                  <div className="equipment-option" title="Yoga Mat" data-equipment="yoga-mat">
                    <span className="equipment-label">Yoga Mat</span>
                  </div>
                  <div className="equipment-option" title="Weight Bench" data-equipment="bench">
                    <span className="equipment-label">Bench</span>
                  </div>
                  <div className="equipment-option" title="Barbell" data-equipment="barbell">
                    <span className="equipment-label">Barbell</span>
                  </div>
                  <div className="equipment-option" title="TRX/Suspension Trainer" data-equipment="trx">
                    <span className="equipment-label">TRX</span>
                  </div>
                  <div className="equipment-option" title="Medicine Ball" data-equipment="medicine-ball">
                    <span className="equipment-label">Medicine Ball</span>
                  </div>
                  <div className="equipment-option" title="Jump Rope" data-equipment="jump-rope">
                    <span className="equipment-label">Jump Rope</span>
                  </div>
                  <div className="equipment-option" title="Stability Ball" data-equipment="stability-ball">
                    <span className="equipment-label">Stability Ball</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Restrictions Card */}
        <FormFieldCard
          title="Restrictions"
          description="Any limitations or injuries?"
          delay={500}
        >
          <div className="placeholder-content">
            <p>Restrictions input will go here</p>
          </div>
        </FormFieldCard>
      </div>

        {/* Generate Button */}
        <div className="generator-action">
          <div className="generate-button-card">
            <button className="generate-workout-btn" disabled>
              <span className="btn-icon">✨</span>
              <span className="btn-text">Generate Workout</span>
              <span className="btn-subtitle">(Coming Soon)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGeneratorGrid; 