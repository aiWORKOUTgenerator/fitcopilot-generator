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
import { MuscleGroupCard } from './cards/MuscleGroupCard';
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

        {/* Target Muscles Card - Enhanced Muscle Group Selector */}
        <FormFieldCard
          title="Target Muscles"
          description="Select up to 3 muscle groups to focus on"
          delay={300}
          variant="complex"
        >
          <MuscleGroupCard
            profileLoading={profileLoading}
            profileError={profileError}
            isProfileSufficient={isProfileSufficient}
            profileMapping={profileMapping}
          />
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
          variant="complex"
        >
          <div className="restrictions-card-structure">
            {/* HEADER: Profile Limitations Section */}
            <div className="restrictions-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-restrictions-section">
                  <div className="profile-restrictions-label">Health & Safety Focus:</div>
                  <div className="profile-restrictions-badges">
                    <span className="profile-no-restrictions">Select areas to avoid today</span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span>Current Restrictions</span>
                  </div>
                  <div className="header-subtitle">Select any areas with soreness or discomfort</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Restrictions Selector */}
            <div className="restrictions-card-body">
              <div className="restrictions-selector-container">
                <div className="restrictions-selector-label">
                  Current soreness or discomfort:
                </div>
                
                <div className="restrictions-grid">
                  <div className="restriction-option" title="Shoulders soreness or discomfort" data-restriction="shoulders">
                    <span className="restriction-label">Shoulders</span>
                  </div>
                  <div className="restriction-option" title="Arms soreness or discomfort" data-restriction="arms">
                    <span className="restriction-label">Arms</span>
                  </div>
                  <div className="restriction-option" title="Chest soreness or discomfort" data-restriction="chest">
                    <span className="restriction-label">Chest</span>
                  </div>
                  <div className="restriction-option" title="Back soreness or discomfort" data-restriction="back">
                    <span className="restriction-label">Back</span>
                  </div>
                  <div className="restriction-option" title="Core/Abs soreness or discomfort" data-restriction="core">
                    <span className="restriction-label">Core/Abs</span>
                  </div>
                  <div className="restriction-option" title="Hips soreness or discomfort" data-restriction="hips">
                    <span className="restriction-label">Hips</span>
                  </div>
                  <div className="restriction-option" title="Legs soreness or discomfort" data-restriction="legs">
                    <span className="restriction-label">Legs</span>
                  </div>
                  <div className="restriction-option" title="Knees soreness or discomfort" data-restriction="knees">
                    <span className="restriction-label">Knees</span>
                  </div>
                  <div className="restriction-option" title="Ankles soreness or discomfort" data-restriction="ankles">
                    <span className="restriction-label">Ankles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>
      </div>

      {/* Second Row: Location + Additional Cards */}
      <div className="generator-row generator-row--second">
        {/* Location Card */}
        <FormFieldCard
          title="Location"
          description="Where will you work out today?"
          delay={600}
          variant="complex"
        >
          <div className="location-card-structure">
            {/* HEADER: Profile Location Section */}
            <div className="location-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-location-section">
                  <div className="profile-location-label">Your Preferred Location:</div>
                  <div className="profile-location-badges">
                    <span 
                      className="workout-type-badge profile-location-badge"
                      style={{ 
                        color: profileMapping.displayData.location.color,
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title={`Profile location: ${profileMapping.displayData.location.context}`}
                    >
                      <span className="workout-type-icon">
                        {profileMapping.displayData.location.value === 'home' && '🏠'}
                        {profileMapping.displayData.location.value === 'gym' && '🏋️'}
                        {profileMapping.displayData.location.value === 'outdoors' && '🌳'}
                        {(profileMapping.displayData.location.value === 'anywhere' || profileMapping.displayData.location.value === 'travel') && '✈️'}
                      </span>
                      {profileMapping.displayData.location.display}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span>Workout Location</span>
                  </div>
                  <div className="header-subtitle">Choose where you'll exercise today</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Location Selector */}
            <div className="location-card-body">
              <div className="location-selector-container">
                <div className="location-selector-label">
                  Today's workout location:
                </div>
                
                <div className="location-grid">
                  <div className="location-option" title="Home workouts - Space-efficient exercises" data-location="home">
                    <span className="location-icon">🏠</span>
                    <span className="location-label">Home</span>
                  </div>
                  <div className="location-option" title="Gym training - Full equipment access" data-location="gym">
                    <span className="location-icon">🏋️</span>
                    <span className="location-label">Gym</span>
                  </div>
                  <div className="location-option" title="Outdoor activities - Fresh air workouts" data-location="outdoors">
                    <span className="location-icon">🌳</span>
                    <span className="location-label">Outdoors</span>
                  </div>
                  <div className="location-option" title="Travel workouts - Portable exercises" data-location="travel">
                    <span className="location-icon">✈️</span>
                    <span className="location-label">Travel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Current Stress Level Card */}
        <FormFieldCard
          title="Stress Level"
          description="How stressed are you feeling today?"
          delay={700}
          variant="complex"
        >
          <div className="stress-card-structure">
            {/* HEADER: Profile Stress Section */}
            <div className="stress-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-stress-section">
                  <div className="profile-stress-label">Your Typical Stress:</div>
                  <div className="profile-stress-badges">
                    <span 
                      className="workout-type-badge profile-stress-badge"
                      style={{ 
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title="Click to use your typical stress level"
                    >
                      <span className="workout-type-icon">🧘</span>
                      Balanced
                    </span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">🧘</span>
                    <span>Stress Level</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see your stress patterns</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Stress Selector */}
            <div className="stress-card-body">
              <div className="stress-selector-container">
                <div className="stress-selector-label">Today's Stress:</div>
                {/* 6-level stress system in 3x2 grid matching intensity colors */}
                <div className="stress-options-grid">
                  <div className="stress-option" title="Very Low - Completely relaxed">
                    <span className="stress-icon">🟢</span>
                    <span className="stress-label">Very Low</span>
                  </div>
                  <div className="stress-option" title="Low - Mostly calm and relaxed">
                    <span className="stress-icon">🔵</span>
                    <span className="stress-label">Low</span>
                  </div>
                  <div className="stress-option" title="Moderate - Some tension, manageable">
                    <span className="stress-icon">🟡</span>
                    <span className="stress-label">Moderate</span>
                  </div>
                  <div className="stress-option" title="High - Feeling stressed and tense">
                    <span className="stress-icon">🟠</span>
                    <span className="stress-label">High</span>
                  </div>
                  <div className="stress-option" title="Very High - Significant stress and anxiety">
                    <span className="stress-icon">🔴</span>
                    <span className="stress-label">Very High</span>
                  </div>
                  <div className="stress-option" title="Extreme - Overwhelmed and very anxious">
                    <span className="stress-icon">🟣</span>
                    <span className="stress-label">Extreme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Energy/Motivation Level Card */}
        <FormFieldCard
          title="Energy Level"
          description="How motivated are you feeling today?"
          delay={800}
          variant="complex"
        >
          <div className="motivation-card-structure">
            {/* HEADER: Profile Energy Section */}
            <div className="motivation-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-motivation-section">
                  <div className="profile-motivation-label">Your Typical Energy:</div>
                  <div className="profile-motivation-badges">
                    <span 
                      className="workout-type-badge profile-motivation-badge"
                      style={{ 
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#22c55e',
                        cursor: 'pointer',
                        opacity: 0.8
                      }}
                      title="Click to use your typical energy level"
                    >
                      <span className="workout-type-icon">⚡</span>
                      Balanced
                    </span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">⚡</span>
                    <span>Energy Level</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see your energy patterns</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Energy/Motivation Selector */}
            <div className="motivation-card-body">
              <div className="motivation-selector-container">
                <div className="motivation-selector-label">Today's Energy:</div>
                {/* 6-level motivation system in 3x2 grid matching intensity colors */}
                <div className="motivation-options-grid">
                  <div className="motivation-option" title="Very Low - Need gentle movement">
                    <span className="motivation-icon">🟢</span>
                    <span className="motivation-label">Very Low</span>
                  </div>
                  <div className="motivation-option" title="Low - Prefer lighter activities">
                    <span className="motivation-icon">🔵</span>
                    <span className="motivation-label">Low</span>
                  </div>
                  <div className="motivation-option" title="Moderate - Ready for balanced workout">
                    <span className="motivation-icon">🟡</span>
                    <span className="motivation-label">Moderate</span>
                  </div>
                  <div className="motivation-option" title="High - Feeling strong and motivated">
                    <span className="motivation-icon">🟠</span>
                    <span className="motivation-label">High</span>
                  </div>
                  <div className="motivation-option" title="Very High - Maximum motivation and energy">
                    <span className="motivation-icon">🔴</span>
                    <span className="motivation-label">Very High</span>
                  </div>
                  <div className="motivation-option" title="Extreme - Peak energy and drive">
                    <span className="motivation-icon">🟣</span>
                    <span className="motivation-label">Extreme</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>
      </div>

      {/* Third Row: 2-Column Layout */}
      <div className="generator-row generator-row--third">
        {/* Current Soreness Card */}
        <FormFieldCard
          title="Current Soreness"
          description="Any areas feeling sore or tight today?"
          delay={900}
          variant="complex"
        >
          <div className="soreness-card-structure">
            {/* HEADER: Profile Soreness Section */}
            <div className="soreness-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-soreness-section">
                  <div className="profile-soreness-label">Recovery Focus:</div>
                  <div className="profile-soreness-badges">
                    <span className="profile-no-soreness">Select any sore areas today</span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span>Current Soreness</span>
                  </div>
                  <div className="header-subtitle">Select areas that need extra attention</div>
                </div>
              )}
            </div>

            {/* BODY: Today's Soreness Selector */}
            <div className="soreness-card-body">
              <div className="soreness-selector-container">
                <div className="soreness-selector-label">
                  Areas feeling sore or tight:
                </div>
                
                <div className="soreness-grid">
                  <div className="soreness-option" title="Shoulders feeling sore or tight" data-soreness="shoulders">
                    <span className="soreness-label">Shoulders</span>
                  </div>
                  <div className="soreness-option" title="Arms feeling sore or tight" data-soreness="arms">
                    <span className="soreness-label">Arms</span>
                  </div>
                  <div className="soreness-option" title="Chest feeling sore or tight" data-soreness="chest">
                    <span className="soreness-label">Chest</span>
                  </div>
                  <div className="soreness-option" title="Back feeling sore or tight" data-soreness="back">
                    <span className="soreness-label">Back</span>
                  </div>
                  <div className="soreness-option" title="Core/Abs feeling sore or tight" data-soreness="core">
                    <span className="soreness-label">Core/Abs</span>
                  </div>
                  <div className="soreness-option" title="Hips feeling sore or tight" data-soreness="hips">
                    <span className="soreness-label">Hips</span>
                  </div>
                  <div className="soreness-option" title="Legs feeling sore or tight" data-soreness="legs">
                    <span className="soreness-label">Legs</span>
                  </div>
                  <div className="soreness-option" title="Knees feeling sore or tight" data-soreness="knees">
                    <span className="soreness-label">Knees</span>
                  </div>
                  <div className="soreness-option" title="Ankles feeling sore or tight" data-soreness="ankles">
                    <span className="soreness-label">Ankles</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Sleep Quality Card */}
        <FormFieldCard
          title="Sleep Quality"
          description="How well did you sleep last night?"
          delay={1000}
          variant="complex"
        >
          <div className="sleep-card-structure">
            {/* HEADER: Profile Sleep Section */}
            <div className="sleep-card-header">
              {!profileLoading && !profileError && isProfileSufficient && profileMapping ? (
                <div className="profile-sleep-section">
                  <div className="profile-sleep-label">Your Typical Sleep:</div>
                  <div className="profile-sleep-badges">
                    <span className="profile-sleep-info">Rate last night's rest quality</span>
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span>Sleep Quality</span>
                  </div>
                  <div className="header-subtitle">Rate how well you slept last night</div>
                </div>
              )}
            </div>

            {/* BODY: Sleep Quality Selector */}
            <div className="sleep-card-body">
              <div className="sleep-selector-container">
                <div className="sleep-selector-label">
                  Last night's sleep quality:
                </div>
                
                <div className="sleep-grid">
                  <div className="sleep-option" title="Excellent - Deep, restful sleep all night" data-sleep="excellent">
                    <span className="sleep-label">Excellent</span>
                  </div>
                  <div className="sleep-option" title="Good - Solid sleep with minimal interruptions" data-sleep="good">
                    <span className="sleep-label">Good</span>
                  </div>
                  <div className="sleep-option" title="Fair - Decent sleep but some restlessness" data-sleep="fair">
                    <span className="sleep-label">Fair</span>
                  </div>
                  <div className="sleep-option" title="Poor - Restless night with frequent waking" data-sleep="poor">
                    <span className="sleep-label">Poor</span>
                  </div>
                  <div className="sleep-option" title="Very Poor - Little sleep, very restless" data-sleep="very-poor">
                    <span className="sleep-label">Very Poor</span>
                  </div>
                  <div className="sleep-option" title="Terrible - Almost no sleep, exhausted" data-sleep="terrible">
                    <span className="sleep-label">Terrible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>
      </div>

        {/* Generate Button */}
        <div className="generator-action">
          <div className="generate-button-card">
            <button className="generate-workout-btn" disabled>
              <span className="btn-icon">✨</span>
              <span className="btn-text">Review Workout</span>
              <span className="btn-subtitle">(Coming Soon)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGeneratorGrid;