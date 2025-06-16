/**
 * WorkoutSelectionSummary Component
 * 
 * Simple extraction of the "Your Selections" section from WorkoutDisplay.tsx
 * Shows user preferences that influenced AI workout generation
 */
import React from 'react';
import { GeneratedWorkout } from '../../../types/workout';
import { Settings, Target, Clock, Zap, MapPin } from 'lucide-react';
import './WorkoutSelectionSummary.scss';

interface WorkoutSelectionSummaryProps {
  /** The workout data containing user selections */
  workout: GeneratedWorkout;
  /** Optional CSS class name */
  className?: string;
  /** Custom title override */
  title?: string;
  /** Custom subtitle override */
  subtitle?: string;
}

// Utility functions - moved before component to fix hoisting issues
const formatGoals = (goals: string): string => {
  return goals.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatFitnessLevel = (level: string): string => {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

const formatIntensityLevel = (level: number): string => {
  const labels = {
    1: 'Light',
    2: 'Easy', 
    3: 'Moderate',
    4: 'Hard',
    5: 'Very Hard',
    6: 'Extreme'
  };
  return labels[level as keyof typeof labels] || 'Unknown';
};

const formatComplexity = (complexity: string): string => {
  return complexity.charAt(0).toUpperCase() + complexity.slice(1);
};

const formatStressLevel = (stress: string): string => {
  const labels = {
    'low': 'Calm',
    'moderate': 'Moderate',
    'high': 'Stressed',
    'very_high': 'Very Stressed'
  };
  return labels[stress as keyof typeof labels] || stress;
};

const formatEnergyLevel = (energy: string): string => {
  const labels = {
    'very_low': 'Drained',
    'low': 'Low Energy',
    'moderate': 'Balanced',
    'high': 'Energetic',
    'very_high': 'Pumped'
  };
  return labels[energy as keyof typeof labels] || energy;
};

const formatSleepQuality = (sleep: string): string => {
  const labels = {
    'poor': 'Poor Sleep',
    'fair': 'Fair Sleep',
    'good': 'Good Sleep',
    'excellent': 'Excellent Sleep'
  };
  return labels[sleep as keyof typeof labels] || sleep;
};

const formatLocation = (location: string): string => {
  const labels = {
    'home': 'Home',
    'gym': 'Gym',
    'outdoors': 'Outdoors',
    'travel': 'Travel',
    'any': 'Any Location'
  };
  return labels[location?.toLowerCase() as keyof typeof labels] || 
         (location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Any Location');
};

const formatRestrictions = (restrictions: string | string[]): string => {
  if (Array.isArray(restrictions)) {
    return restrictions.map(restriction => 
      restriction.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  }
  return restrictions.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getStressIcon = (stress: string): string => {
  const icons = {
    'low': '😌',
    'moderate': '😐',
    'high': '😰',
    'very_high': '😫'
  };
  return icons[stress as keyof typeof icons] || '😐';
};

const getEnergyIcon = (energy: string): string => {
  const icons = {
    'very_low': '😴',
    'low': '😑',
    'moderate': '😊',
    'high': '😄',
    'very_high': '🤩'
  };
  return icons[energy as keyof typeof icons] || '😊';
};

const getSleepIcon = (sleep: string): string => {
  const icons = {
    'poor': '😵',
    'fair': '😪',
    'good': '😌',
    'excellent': '😴'
  };
  return icons[sleep as keyof typeof icons] || '😌';
};

const getLocationIcon = (location: string): string => {
  const icons = {
    'home': '🏠',
    'gym': '🏋️',
    'outdoors': '🌳',
    'travel': '✈️',
    'any': '📍'
  };
  return icons[location as keyof typeof icons] || '📍';
};

// Mapping functions for sessionInputs to workout fields
const mapMoodToStress = (moodLevel: number): string => {
  // moodLevel 1-6 maps to stress levels (higher mood = lower stress)
  const mapping = {
    1: 'very_high', // Very low mood = very high stress
    2: 'high',      // Low mood = high stress
    3: 'moderate',  // Moderate mood = moderate stress
    4: 'moderate',  // Good mood = moderate stress
    5: 'low',       // High mood = low stress
    6: 'low'        // Very high mood = low stress
  };
  return mapping[moodLevel as keyof typeof mapping] || 'moderate';
};

const mapEnergyLevel = (energyLevel: number): string => {
  // energyLevel 1-6 maps directly to energy level strings
  const mapping = {
    1: 'very_low',
    2: 'low',
    3: 'moderate',
    4: 'high',
    5: 'very_high',
    6: 'very_high' // Cap at very_high
  };
  return mapping[energyLevel as keyof typeof mapping] || 'moderate';
};

const mapSleepQuality = (sleepQuality: number): string => {
  // sleepQuality 1-6 maps to sleep quality strings
  const mapping = {
    1: 'poor',
    2: 'poor',
    3: 'fair',
    4: 'good',
    5: 'good',
    6: 'excellent'
  };
  return mapping[sleepQuality as keyof typeof mapping] || 'fair';
};

/**
 * Simple component that displays user selections from WorkoutGeneratorGrid
 * Direct extraction from WorkoutDisplay.tsx renderUserSelections()
 */
export const WorkoutSelectionSummary: React.FC<WorkoutSelectionSummaryProps> = ({
  workout,
  className = '',
  title = 'Your Selections',
  subtitle = 'These preferences shaped your personalized workout'
}) => {
  // SMART FALLBACK SYSTEM - Always show enhanced sections with intelligent defaults
  const sessionInputs = workout.sessionInputs || {};
  
  // Create enhanced data with smart fallbacks
  const enhancedData = {
    // Workout Setup (ALWAYS SHOW)
    duration: sessionInputs.timeConstraintsToday || workout.duration || '30',
    goals: sessionInputs.todaysFocus || workout.goals || 'general-fitness',
    intensity: sessionInputs.dailyIntensityLevel || workout.intensity_level || 3,
    
    // Fitness Level (ALWAYS SHOW)
    fitness_level: workout.fitness_level || 'intermediate',
    exercise_complexity: workout.exercise_complexity || 'moderate',
    
    // Today's State (ALWAYS SHOW with defaults)
    stress_level: workout.stress_level || (sessionInputs.moodLevel ? mapMoodToStress(Number(sessionInputs.moodLevel)) : 'moderate'),
    energy_level: workout.energy_level || (sessionInputs.energyLevel ? mapEnergyLevel(Number(sessionInputs.energyLevel)) : 'moderate'),
    sleep_quality: workout.sleep_quality || (sessionInputs.sleepQuality ? mapSleepQuality(Number(sessionInputs.sleepQuality)) : 'good'),
    
    // Environment & Focus (ALWAYS SHOW)
    location: sessionInputs.locationToday || workout.location || 'home',
    equipment: sessionInputs.equipmentAvailableToday || workout.equipment || ['bodyweight'],
    custom_notes: sessionInputs.workoutCustomization || workout.custom_notes || null,
    
    // Health Restrictions (SHOW if any exist)
    restrictions: sessionInputs.healthRestrictionsToday || (workout as any).restrictions || null,
    
    // Muscle Targeting (SHOW if any exist)
    primary_muscle_focus: workout.primary_muscle_focus || sessionInputs.focusArea || null
  };

  console.log('🎯 Enhanced WorkoutSelectionSummary - Smart Fallback Data:', enhancedData);

  return (
    <section className={`workout-selection-summary ${className}`} aria-labelledby="selections-title">
      <header className="workout-selection-summary__header">
        <h3 id="selections-title" className="workout-selection-summary__title">
          <Settings size={20} />
          {title}
        </h3>
        <p className="workout-selection-summary__subtitle">
          {subtitle}
        </p>
      </header>

      <div className="workout-selection-summary__grid">
        
        {/* 1. Workout Setup - ALWAYS VISIBLE */}
        <div className="selections-category selections-category--core">
          <h4 className="selections-category__title">
            <Target size={16} />
            Workout Setup
          </h4>
          <div className="selections-category__items">
            <div className="selection-item">
              <Clock size={14} />
              <span className="selection-item__label">Duration:</span>
              <span className="selection-item__value">{enhancedData.duration} minutes</span>
            </div>
            <div className="selection-item">
              <Target size={14} />
              <span className="selection-item__label">Focus:</span>
              <span className="selection-item__value">{formatGoals(String(enhancedData.goals))}</span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">🔥</span>
              <span className="selection-item__label">Intensity:</span>
              <span className="selection-item__value">{formatIntensityLevel(Number(enhancedData.intensity))}</span>
            </div>
          </div>
        </div>

        {/* 2. Fitness Level - ALWAYS VISIBLE */}
        <div className="selections-category selections-category--fitness">
          <h4 className="selections-category__title">
            <Zap size={16} />
            Fitness Level
          </h4>
          <div className="selections-category__items">
            <div className="selection-item">
              <span className="selection-item__icon">🟡</span>
              <span className="selection-item__label">Level:</span>
              <span className="selection-item__value">{formatFitnessLevel(enhancedData.fitness_level)}</span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">🔧</span>
              <span className="selection-item__label">Complexity:</span>
              <span className="selection-item__value">{formatComplexity(enhancedData.exercise_complexity)}</span>
            </div>
          </div>
        </div>

        {/* 3. Today's State - ALWAYS VISIBLE */}
        <div className="selections-category selections-category--daily-state">
          <h4 className="selections-category__title">
            <span className="selections-category__icon">🌟</span>
            Today's State
          </h4>
          <div className="selections-category__items">
            <div className="selection-item">
              <span className="selection-item__icon">{getStressIcon(enhancedData.stress_level)}</span>
              <span className="selection-item__label">Stress:</span>
              <span className="selection-item__value">{formatStressLevel(enhancedData.stress_level)}</span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">{getEnergyIcon(enhancedData.energy_level)}</span>
              <span className="selection-item__label">Energy:</span>
              <span className="selection-item__value">{formatEnergyLevel(enhancedData.energy_level)}</span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">{getSleepIcon(enhancedData.sleep_quality)}</span>
              <span className="selection-item__label">Sleep:</span>
              <span className="selection-item__value">{formatSleepQuality(enhancedData.sleep_quality)}</span>
            </div>
          </div>
        </div>

        {/* 4. Environment & Focus - ALWAYS VISIBLE */}
        <div className="selections-category selections-category--environment">
          <h4 className="selections-category__title">
            <MapPin size={16} />
            Environment & Focus
          </h4>
          <div className="selections-category__items">
            <div className="selection-item">
              <span className="selection-item__icon">📍</span>
              <span className="selection-item__label">Location:</span>
              <span className="selection-item__value">{formatLocation(enhancedData.location)}</span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">🏋️</span>
              <span className="selection-item__label">Equipment:</span>
              <span className="selection-item__value">
                {Array.isArray(enhancedData.equipment) 
                  ? enhancedData.equipment.map((eq: string) => 
                      eq.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    ).join(', ')
                  : String(enhancedData.equipment).replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                }
              </span>
            </div>
            {enhancedData.custom_notes && (
              <div className="selection-item selection-item--notes">
                <span className="selection-item__icon">📝</span>
                <span className="selection-item__label">Notes:</span>
                <span className="selection-item__value">{enhancedData.custom_notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Health Restrictions - SHOW IF EXISTS */}
        {enhancedData.restrictions && (
          <div className="selections-category selections-category--restrictions">
            <h4 className="selections-category__title">
              <span className="selections-category__icon">⚠️</span>
              Health Restrictions
            </h4>
            <div className="selections-category__items">
              <div className="selection-item">
                <span className="selection-item__icon">🚫</span>
                <span className="selection-item__label">Avoid:</span>
                <span className="selection-item__value">
                  {formatRestrictions(enhancedData.restrictions)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 6. Muscle Targeting - SHOW IF EXISTS */}
        {enhancedData.primary_muscle_focus && (
          <div className="selections-category selections-category--muscle-targeting">
            <h4 className="selections-category__title">
              <span className="selections-category__icon">🎯</span>
              Muscle Targeting
            </h4>
            <div className="selections-category__items">
              <div className="selection-item">
                <span className="selection-item__icon">💪</span>
                <span className="selection-item__label">Focus Areas:</span>
                <span className="selection-item__value">
                  {String(enhancedData.primary_muscle_focus).replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 7. Profile Context - ALWAYS SHOW with smart defaults */}
        <div className="selections-category selections-category--profile">
          <h4 className="selections-category__title">
            <span className="selections-category__icon">👤</span>
            Profile Context
          </h4>
          <div className="selections-category__items">
            <div className="selection-item">
              <span className="selection-item__icon">📊</span>
              <span className="selection-item__label">AI Personalization:</span>
              <span className="selection-item__value">
                {enhancedData.fitness_level === 'beginner' ? 'Gentle progression focus' :
                 enhancedData.fitness_level === 'advanced' ? 'High-intensity optimization' :
                 'Balanced training approach'}
              </span>
            </div>
            <div className="selection-item">
              <span className="selection-item__icon">🎯</span>
              <span className="selection-item__label">Workout Style:</span>
              <span className="selection-item__value">
                {enhancedData.location === 'gym' ? 'Equipment-based training' :
                 enhancedData.location === 'outdoors' ? 'Nature-focused fitness' :
                 'Home workout optimization'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Generation Context */}
      <div className="workout-selection-summary__ai-context">
        <p className="ai-context-text">
          <span className="ai-context-icon">🤖</span>
          Your AI trainer considered these preferences to create a workout perfectly tailored to your current state and goals.
        </p>
      </div>
    </section>
  );
};

 