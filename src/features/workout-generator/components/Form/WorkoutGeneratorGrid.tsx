/**
 * Workout Generator Grid Component
 * 
 * Premium grid-based workout generator interface inspired by FitnessStats design.
 * This component will incrementally replace the existing form implementation.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '../../../profile/context';
import { useWorkoutForm } from '../../hooks/useWorkoutForm';
import { SessionSpecificInputs } from '../../types/workout';
import { 
  mapProfileToWorkoutContext, 
  isProfileSufficientForWorkout 
} from '../../utils/profileMapping';
import { MuscleGroupCard } from './cards/MuscleGroupCard';
import { EquipmentCard } from './cards/EquipmentCard';
import './WorkoutGeneratorGrid.scss';

interface WorkoutGeneratorGridProps {
  className?: string;
}

// Migration flags for incremental card replacement
const USE_MODULAR_CARDS = {
  equipment: true,    // ✅ Ready for migration
  focus: false,       // 🚧 Next target
  intensity: false,   // 🚧 Future
  duration: false,    // 🚧 Future
  restrictions: false,// 🚧 Future
  location: false,    // 🚧 Future
};

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
  
  // Form hook integration for session data management
  const {
    setTodaysFocus,
    setDailyIntensityLevel,
    setHealthRestrictionsToday,
    setEquipmentAvailableToday,
    setTimeConstraintsToday,
    setLocationToday,
    setEnergyLevel,
    setMoodLevel,
    setSleepQuality,
    setWorkoutCustomization,
    formValues
  } = useWorkoutForm();
  
  // Local state for daily selections to manage UI interactions
  const [dailySelections, setDailySelections] = useState<SessionSpecificInputs>({});
  
  // Sync local state with form state
  useEffect(() => {
    if (formValues.sessionInputs) {
      setDailySelections(formValues.sessionInputs);
    }
  }, [formValues.sessionInputs]);
  
  // Map profile data to workout context
  const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
  const isProfileSufficient = isProfileSufficientForWorkout(profile);

  // Debug logging for profile updates and state changes
  console.log('[WorkoutGeneratorGrid] Profile state:', {
    hasProfile: !!profile,
    profileLoading,
    profileError,
    isProfileSufficient,
    profileMapping: profileMapping ? 'mapped' : 'null',
    fitnessLevel: profile?.fitnessLevel,
    goals: profile?.goals,
    limitations: profile?.limitations,
    limitationsDisplay: profileMapping?.displayData?.limitations
  });
  
  console.log('[WorkoutGeneratorGrid] Daily selections state:', {
    dailySelections,
    formSessionInputs: formValues.sessionInputs,
    syncStatus: JSON.stringify(dailySelections) === JSON.stringify(formValues.sessionInputs || {}) ? 'synced' : 'out-of-sync'
  });

  // === EVENT HANDLERS FOR DAILY SELECTIONS ===
  
  // Focus selection handler
  const handleFocusSelection = useCallback((focus: string) => {
    console.log('[WorkoutGeneratorGrid] Focus selected:', focus);
    setTodaysFocus(focus);
    setDailySelections(prev => ({ ...prev, todaysFocus: focus as any }));
  }, [setTodaysFocus]);
  
  // Intensity selection handler
  const handleIntensitySelection = useCallback((level: number) => {
    console.log('[WorkoutGeneratorGrid] Intensity selected:', level);
    setDailyIntensityLevel(level);
    setDailySelections(prev => ({ ...prev, dailyIntensityLevel: level }));
  }, [setDailyIntensityLevel]);
  
  // Duration selection handler
  const handleDurationSelection = useCallback((duration: number) => {
    console.log('[WorkoutGeneratorGrid] Duration selected:', duration);
    setTimeConstraintsToday(duration);
    setDailySelections(prev => ({ ...prev, timeConstraintsToday: duration }));
  }, [setTimeConstraintsToday]);
  
  // Equipment toggle handler
  const handleEquipmentToggle = useCallback((equipment: string) => {
    const currentEquipment = dailySelections.equipmentAvailableToday || [];
    const isSelected = currentEquipment.includes(equipment);
    
    const newEquipment = isSelected 
      ? currentEquipment.filter(e => e !== equipment)
      : [...currentEquipment, equipment];
      
    console.log('[WorkoutGeneratorGrid] Equipment toggled:', { equipment, isSelected, newEquipment });
    setEquipmentAvailableToday(newEquipment);
    setDailySelections(prev => ({ ...prev, equipmentAvailableToday: newEquipment }));
  }, [setEquipmentAvailableToday, dailySelections.equipmentAvailableToday]);
  
  // Health restrictions toggle handler
  const handleHealthRestrictionToggle = useCallback((restriction: string) => {
    const currentRestrictions = dailySelections.healthRestrictionsToday || [];
    const isActive = currentRestrictions.includes(restriction);
    
    const newRestrictions = isActive
      ? currentRestrictions.filter(r => r !== restriction)
      : [...currentRestrictions, restriction];
      
    console.log('[WorkoutGeneratorGrid] Health restriction toggled:', { restriction, isActive, newRestrictions });
    setHealthRestrictionsToday(newRestrictions);
    setDailySelections(prev => ({ ...prev, healthRestrictionsToday: newRestrictions }));
  }, [setHealthRestrictionsToday, dailySelections.healthRestrictionsToday]);
  
  // Location selection handler
  const handleLocationSelection = useCallback((location: string) => {
    console.log('[WorkoutGeneratorGrid] Location selected:', location);
    setLocationToday(location);
    setDailySelections(prev => ({ ...prev, locationToday: location as any }));
  }, [setLocationToday]);
  
  // Stress/Mood level selection handler
  const handleStressSelection = useCallback((level: number) => {
    console.log('[WorkoutGeneratorGrid] Stress level selected:', level);
    setMoodLevel(level);
    setDailySelections(prev => ({ ...prev, moodLevel: level }));
  }, [setMoodLevel]);
  
  // Energy level selection handler
  const handleEnergySelection = useCallback((level: number) => {
    console.log('[WorkoutGeneratorGrid] Energy level selected:', level);
    setEnergyLevel(level);
    setDailySelections(prev => ({ ...prev, energyLevel: level }));
  }, [setEnergyLevel]);
  
  // Sleep quality selection handler
  const handleSleepSelection = useCallback((level: number) => {
    console.log('[WorkoutGeneratorGrid] Sleep quality selected:', level);
    setSleepQuality(level);
    setDailySelections(prev => ({ ...prev, sleepQuality: level }));
  }, [setSleepQuality]);
  
  // Workout customization text change handler
  const handleCustomizationChange = useCallback((customization: string) => {
    console.log('[WorkoutGeneratorGrid] Workout customization updated:', customization);
    setWorkoutCustomization(customization);
    setDailySelections(prev => ({ ...prev, workoutCustomization: customization }));
  }, [setWorkoutCustomization]);

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
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'fat-burning' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('fat-burning')}
                    title="Fat Burning & Cardio"
                  >
                    <span className="focus-icon">🔥</span>
                    <span className="focus-label">Fat Burning</span>
                  </div>
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'muscle-building' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('muscle-building')}
                    title="Muscle Building"
                  >
                    <span className="focus-icon">💪</span>
                    <span className="focus-label">Build Muscle</span>
                  </div>
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'endurance' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('endurance')}
                    title="Endurance & Stamina"
                  >
                    <span className="focus-icon">🏃</span>
                    <span className="focus-label">Endurance</span>
                  </div>
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'strength' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('strength')}
                    title="Strength Training"
                  >
                    <span className="focus-icon">🏋️</span>
                    <span className="focus-label">Strength</span>
                  </div>
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'flexibility' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('flexibility')}
                    title="Flexibility & Mobility"
                  >
                    <span className="focus-icon">🧘</span>
                    <span className="focus-label">Flexibility</span>
                  </div>
                  <div 
                    className={`focus-option ${dailySelections.todaysFocus === 'general-fitness' ? 'selected' : ''}`}
                    onClick={() => handleFocusSelection('general-fitness')}
                    title="General Fitness"
                  >
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
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 1 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(1)}
                    title="Very Low - Gentle, recovery-focused"
                  >
                    <span className="intensity-icon">🟢</span>
                    <span className="intensity-label">Very Low</span>
                  </div>
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 2 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(2)}
                    title="Low - Light activity, easy pace"
                  >
                    <span className="intensity-icon">🔵</span>
                    <span className="intensity-label">Low</span>
                  </div>
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 3 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(3)}
                    title="Moderate - Comfortable challenge"
                  >
                    <span className="intensity-icon">🟡</span>
                    <span className="intensity-label">Moderate</span>
                  </div>
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 4 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(4)}
                    title="High - Vigorous, challenging"
                  >
                    <span className="intensity-icon">🟠</span>
                    <span className="intensity-label">High</span>
                  </div>
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 5 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(5)}
                    title="Very High - Maximum effort"
                  >
                    <span className="intensity-icon">🔴</span>
                    <span className="intensity-label">Very High</span>
                  </div>
                  <div 
                    className={`intensity-option ${dailySelections.dailyIntensityLevel === 6 ? 'selected' : ''}`}
                    onClick={() => handleIntensitySelection(6)}
                    title="Extreme - Elite level, push limits"
                  >
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
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 10 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(10)}
                    title="10 minutes - Quick session"
                  >
                    <span className="duration-number">10</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 15 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(15)}
                    title="15 minutes - Short workout"
                  >
                    <span className="duration-number">15</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 20 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(20)}
                    title="20 minutes - Compact session"
                  >
                    <span className="duration-number">20</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 30 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(30)}
                    title="30 minutes - Standard workout"
                  >
                    <span className="duration-number">30</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 45 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(45)}
                    title="45 minutes - Extended session"
                  >
                    <span className="duration-number">45</span>
                    <span className="duration-unit">min</span>
                  </div>
                  <div 
                    className={`duration-option ${dailySelections.timeConstraintsToday === 60 ? 'selected' : ''}`}
                    onClick={() => handleDurationSelection(60)}
                    title="60 minutes - Full workout"
                  >
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

        {/* Equipment Card - Migrated to Modular Architecture */}
        {USE_MODULAR_CARDS.equipment ? (
          <EquipmentCard delay={400} />
        ) : (
          /* Legacy Equipment Card Implementation */
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
                          className={`workout-type-badge profile-equipment-badge ${
                            dailySelections.equipmentAvailableToday?.includes(equipment.value) ? 'selected' : ''
                          }`}
                          onClick={() => handleEquipmentToggle(equipment.value)}
                          style={{ 
                            cursor: 'pointer',
                            opacity: dailySelections.equipmentAvailableToday?.includes(equipment.value) ? 1 : 0.8
                          }}
                          title={`Click to ${dailySelections.equipmentAvailableToday?.includes(equipment.value) ? 'remove' : 'select'}: ${equipment.display}`}
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
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('none') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('none')}
                      title="None/Bodyweight Only"
                    >
                      <span className="equipment-label">No Equipment</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('dumbbells') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('dumbbells')}
                      title="Dumbbells"
                    >
                      <span className="equipment-label">Dumbbells</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('kettlebells') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('kettlebells')}
                      title="Kettlebells"
                    >
                      <span className="equipment-label">Kettlebells</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('resistance-bands') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('resistance-bands')}
                      title="Resistance Bands"
                    >
                      <span className="equipment-label">Resistance Bands</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('pull-up-bar') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('pull-up-bar')}
                      title="Pull-up Bar"
                    >
                      <span className="equipment-label">Pull-up Bar</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('yoga-mat') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('yoga-mat')}
                      title="Yoga Mat"
                    >
                      <span className="equipment-label">Yoga Mat</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('bench') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('bench')}
                      title="Weight Bench"
                    >
                      <span className="equipment-label">Bench</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('barbell') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('barbell')}
                      title="Barbell"
                    >
                      <span className="equipment-label">Barbell</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('trx') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('trx')}
                      title="TRX/Suspension Trainer"
                    >
                      <span className="equipment-label">TRX</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('medicine-ball') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('medicine-ball')}
                      title="Medicine Ball"
                    >
                      <span className="equipment-label">Medicine Ball</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('jump-rope') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('jump-rope')}
                      title="Jump Rope"
                    >
                      <span className="equipment-label">Jump Rope</span>
                    </div>
                    <div 
                      className={`equipment-option ${dailySelections.equipmentAvailableToday?.includes('stability-ball') ? 'selected' : ''}`}
                      onClick={() => handleEquipmentToggle('stability-ball')}
                      title="Stability Ball"
                    >
                      <span className="equipment-label">Stability Ball</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FormFieldCard>
        )}

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
              {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileMapping.displayData.limitations.length > 0 ? (
                <div className="profile-restrictions-section">
                  <div className="profile-restrictions-label">Health & Safety Focus:</div>
                  <div className="profile-restrictions-badges">
                    {profileMapping.displayData.limitations.slice(0, 3).map((limitation, index) => (
                      <span 
                        key={limitation.value}
                        className={`workout-type-badge profile-restriction-badge ${
                          dailySelections.healthRestrictionsToday?.includes(limitation.value) ? 'active-today' : ''
                        }`}
                        onClick={() => handleHealthRestrictionToggle(limitation.value)}
                        style={{ 
                          backgroundColor: dailySelections.healthRestrictionsToday?.includes(limitation.value) 
                            ? `${limitation.color}40` 
                            : `${limitation.color}20`,
                          borderColor: dailySelections.healthRestrictionsToday?.includes(limitation.value)
                            ? limitation.color
                            : `${limitation.color}60`,
                          color: limitation.color,
                          cursor: 'pointer',
                          opacity: dailySelections.healthRestrictionsToday?.includes(limitation.value) ? 1 : 0.8
                        }}
                        title={`Click to ${dailySelections.healthRestrictionsToday?.includes(limitation.value) ? 'remove' : 'add'} this restriction for today: ${limitation.display}`}
                      >
                        {limitation.display}
                      </span>
                    ))}
                    {profileMapping.displayData.limitations.length > 3 && (
                      <span className="restrictions-more-indicator">
                        +{profileMapping.displayData.limitations.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="header-fallback">
                  <div className="header-fallback-text">
                    <span className="header-icon">⚠️</span>
                    <span>Health & Safety</span>
                  </div>
                  <div className="header-subtitle">Set up your profile to see health considerations</div>
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
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('shoulders') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('shoulders')}
                    title="Shoulders soreness or discomfort"
                  >
                    <span className="restriction-label">Shoulders</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('arms') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('arms')}
                    title="Arms soreness or discomfort"
                  >
                    <span className="restriction-label">Arms</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('chest') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('chest')}
                    title="Chest soreness or discomfort"
                  >
                    <span className="restriction-label">Chest</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('back') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('back')}
                    title="Back soreness or discomfort"
                  >
                    <span className="restriction-label">Back</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('core') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('core')}
                    title="Core/Abs soreness or discomfort"
                  >
                    <span className="restriction-label">Core/Abs</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('hips') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('hips')}
                    title="Hips soreness or discomfort"
                  >
                    <span className="restriction-label">Hips</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('legs') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('legs')}
                    title="Legs soreness or discomfort"
                  >
                    <span className="restriction-label">Legs</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('knees') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('knees')}
                    title="Knees soreness or discomfort"
                  >
                    <span className="restriction-label">Knees</span>
                  </div>
                  <div 
                    className={`restriction-option ${dailySelections.healthRestrictionsToday?.includes('ankles') ? 'selected' : ''}`}
                    onClick={() => handleHealthRestrictionToggle('ankles')}
                    title="Ankles soreness or discomfort"
                  >
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
                  <div 
                    className={`location-option ${dailySelections.locationToday === 'home' ? 'selected' : ''}`}
                    onClick={() => handleLocationSelection('home')}
                    title="Home workouts - Space-efficient exercises"
                  >
                    <span className="location-icon">🏠</span>
                    <span className="location-label">Home</span>
                  </div>
                  <div 
                    className={`location-option ${dailySelections.locationToday === 'gym' ? 'selected' : ''}`}
                    onClick={() => handleLocationSelection('gym')}
                    title="Gym training - Full equipment access"
                  >
                    <span className="location-icon">🏋️</span>
                    <span className="location-label">Gym</span>
                  </div>
                  <div 
                    className={`location-option ${dailySelections.locationToday === 'outdoors' ? 'selected' : ''}`}
                    onClick={() => handleLocationSelection('outdoors')}
                    title="Outdoor activities - Fresh air workouts"
                  >
                    <span className="location-icon">🌳</span>
                    <span className="location-label">Outdoors</span>
                  </div>
                  <div 
                    className={`location-option ${dailySelections.locationToday === 'travel' ? 'selected' : ''}`}
                    onClick={() => handleLocationSelection('travel')}
                    title="Travel workouts - Portable exercises"
                  >
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
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 1 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(1)}
                    title="Very Low - Completely relaxed"
                  >
                    <span className="stress-icon">🟢</span>
                    <span className="stress-label">Very Low</span>
                  </div>
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 2 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(2)}
                    title="Low - Mostly calm and relaxed"
                  >
                    <span className="stress-icon">🔵</span>
                    <span className="stress-label">Low</span>
                  </div>
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 3 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(3)}
                    title="Moderate - Some tension, manageable"
                  >
                    <span className="stress-icon">🟡</span>
                    <span className="stress-label">Moderate</span>
                  </div>
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 4 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(4)}
                    title="High - Feeling stressed and tense"
                  >
                    <span className="stress-icon">🟠</span>
                    <span className="stress-label">High</span>
                  </div>
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 5 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(5)}
                    title="Very High - Significant stress and anxiety"
                  >
                    <span className="stress-icon">🔴</span>
                    <span className="stress-label">Very High</span>
                  </div>
                  <div 
                    className={`stress-option ${dailySelections.moodLevel === 6 ? 'selected' : ''}`}
                    onClick={() => handleStressSelection(6)}
                    title="Extreme - Overwhelmed and very anxious"
                  >
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
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 1 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(1)}
                    title="Very Low - Need gentle movement"
                  >
                    <span className="motivation-icon">🟢</span>
                    <span className="motivation-label">Very Low</span>
                  </div>
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 2 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(2)}
                    title="Low - Prefer lighter activities"
                  >
                    <span className="motivation-icon">🔵</span>
                    <span className="motivation-label">Low</span>
                  </div>
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 3 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(3)}
                    title="Moderate - Ready for balanced workout"
                  >
                    <span className="motivation-icon">🟡</span>
                    <span className="motivation-label">Moderate</span>
                  </div>
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 4 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(4)}
                    title="High - Feeling strong and motivated"
                  >
                    <span className="motivation-icon">🟠</span>
                    <span className="motivation-label">High</span>
                  </div>
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 5 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(5)}
                    title="Very High - Maximum motivation and energy"
                  >
                    <span className="motivation-icon">🔴</span>
                    <span className="motivation-label">Very High</span>
                  </div>
                  <div 
                    className={`motivation-option ${dailySelections.energyLevel === 6 ? 'selected' : ''}`}
                    onClick={() => handleEnergySelection(6)}
                    title="Extreme - Peak energy and drive"
                  >
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
        {/* Sleep Quality Card */}
        <FormFieldCard
          title="Sleep Quality"
          description="How well did you sleep last night?"
          delay={900}
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
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 6 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(6)}
                    title="Excellent - Deep, restful sleep all night"
                  >
                    <span className="sleep-label">Excellent</span>
                  </div>
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 5 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(5)}
                    title="Good - Solid sleep with minimal interruptions"
                  >
                    <span className="sleep-label">Good</span>
                  </div>
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 4 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(4)}
                    title="Fair - Decent sleep but some restlessness"
                  >
                    <span className="sleep-label">Fair</span>
                  </div>
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 3 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(3)}
                    title="Poor - Restless night with frequent waking"
                  >
                    <span className="sleep-label">Poor</span>
                  </div>
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 2 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(2)}
                    title="Very Poor - Little sleep, very restless"
                  >
                    <span className="sleep-label">Very Poor</span>
                  </div>
                  <div 
                    className={`sleep-option ${dailySelections.sleepQuality === 1 ? 'selected' : ''}`}
                    onClick={() => handleSleepSelection(1)}
                    title="Terrible - Almost no sleep, exhausted"
                  >
                    <span className="sleep-label">Terrible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FormFieldCard>

        {/* Workout Customization Card */}
        <FormFieldCard
          title="Workout Customization"
          description="Any specific requests or modifications?"
          delay={1000}
          variant="complex"
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
                  placeholder="e.g., Focus on upper body, avoid jumping exercises, include more stretching, use specific equipment..."
                  value={dailySelections.workoutCustomization || ''}
                  onChange={(e) => handleCustomizationChange(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                
                <div className="customization-character-count">
                  {(dailySelections.workoutCustomization || '').length}/500 characters
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