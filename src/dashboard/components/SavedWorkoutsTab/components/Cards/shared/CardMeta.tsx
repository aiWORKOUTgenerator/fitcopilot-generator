/**
 * Card Meta Component
 * 
 * Displays workout metadata including difficulty, type, stats, and equipment.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 * 
 * UPDATED: Now uses WorkoutService for accurate exercise count calculation
 */
import React, { useState, useEffect } from 'react';
import { Clock, Target } from 'lucide-react';
import { getWorkout } from '../../../../../../features/workout-generator/services/workoutService';

interface CardMetaProps {
  workout: {
    id: string | number;
    // PHASE 5: New fitness-specific fields
    fitness_level?: 'beginner' | 'intermediate' | 'advanced';
    intensity_level?: number;
    exercise_complexity?: 'basic' | 'moderate' | 'advanced';
    // SPRINT 3: NEW WorkoutGeneratorGrid fields
    stress_level?: 'low' | 'moderate' | 'high' | 'very_high';
    energy_level?: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
    sleep_quality?: 'poor' | 'fair' | 'good' | 'excellent';
    location?: 'home' | 'gym' | 'outdoors' | 'travel' | 'any';
    custom_notes?: string;
    primary_muscle_focus?: string;
    // BACKWARD COMPATIBILITY: Keep difficulty field during transition
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    workoutType: string;
    duration: number;
    exercises: any[];
    sections?: Array<{ exercises: any[] }>;
    equipment: string[];
    description?: string;
  };
  viewMode: 'grid' | 'list';
  showDescription?: boolean;
  showDebugInfo?: boolean;
}

// PHASE 5: Enhanced fitness-specific configuration
const FITNESS_LEVEL_CONFIG = {
  beginner: { 
    icon: '🟢', 
    color: 'green', 
    label: 'Beginner',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981',
    description: 'New to fitness'
  },
  intermediate: { 
    icon: '🟡', 
    color: 'yellow', 
    label: 'Intermediate',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b',
    description: '6+ months experience'
  },
  advanced: { 
    icon: '🔴', 
    color: 'red', 
    label: 'Advanced',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#ef4444',
    description: '2+ years experience'
  }
};

// PHASE 5: Intensity level configuration
const INTENSITY_CONFIG = {
  1: { icon: '💤', label: 'Very Light', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
  2: { icon: '🚶', label: 'Light', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  3: { icon: '💪', label: 'Moderate', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  4: { icon: '🔥', label: 'High', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  5: { icon: '⚡', label: 'Maximum', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

// PHASE 5: Exercise complexity configuration
const COMPLEXITY_CONFIG = {
  basic: { icon: '⚙️', label: 'Basic', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  moderate: { icon: '🔧', label: 'Moderate', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  advanced: { icon: '🛠️', label: 'Advanced', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' }
};

// SPRINT 3: NEW WorkoutGeneratorGrid parameter configurations following fitness model
const STRESS_LEVEL_CONFIG = {
  low: { 
    icon: '😌', 
    label: 'Calm', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Low stress, relaxed state'
  },
  moderate: { 
    icon: '😐', 
    label: 'Moderate', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Manageable stress level'
  },
  high: { 
    icon: '😰', 
    label: 'Stressed', 
    color: '#f97316', 
    bgColor: 'rgba(249, 115, 22, 0.1)',
    description: 'High stress, needs gentle workout'
  },
  very_high: { 
    icon: '😫', 
    label: 'Very Stressed', 
    color: '#ef4444', 
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Very high stress, restorative focus'
  }
};

const ENERGY_LEVEL_CONFIG = {
  very_low: { 
    icon: '😴', 
    label: 'Drained', 
    color: '#6b7280', 
    bgColor: 'rgba(107, 114, 128, 0.1)',
    description: 'Very low energy, gentle movements only'
  },
  low: { 
    icon: '😑', 
    label: 'Low Energy', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Low energy, build gradually'
  },
  moderate: { 
    icon: '😊', 
    label: 'Balanced', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Balanced energy, standard approach'
  },
  high: { 
    icon: '😄', 
    label: 'Energetic', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'High energy, can handle challenges'
  },
  very_high: { 
    icon: '🤩', 
    label: 'Pumped', 
    color: '#8b5cf6', 
    bgColor: 'rgba(139, 92, 246, 0.1)',
    description: 'Very high energy, maximum intensity'
  }
};

const SLEEP_QUALITY_CONFIG = {
  poor: { 
    icon: '😵', 
    label: 'Poor Sleep', 
    color: '#ef4444', 
    bgColor: 'rgba(239, 68, 68, 0.1)',
    description: 'Poor sleep, reduce intensity'
  },
  fair: { 
    icon: '😪', 
    label: 'Fair Sleep', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Fair sleep, moderate intensity'
  },
  good: { 
    icon: '😌', 
    label: 'Good Sleep', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Good sleep, normal intensity'
  },
  excellent: { 
    icon: '😴', 
    label: 'Great Sleep', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'Excellent sleep, high intensity ready'
  }
};

const LOCATION_CONFIG = {
  home: { 
    icon: '🏠', 
    label: 'Home', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Home workout, bodyweight focus'
  },
  gym: { 
    icon: '🏋️', 
    label: 'Gym', 
    color: '#3b82f6', 
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'Gym setting, full equipment'
  },
  outdoors: { 
    icon: '🌳', 
    label: 'Outdoors', 
    color: '#10b981', 
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'Outdoor workout, natural movement'
  },
  travel: { 
    icon: '✈️', 
    label: 'Travel', 
    color: '#f59e0b', 
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'Travel workout, minimal equipment'
  },
  any: { 
    icon: '📍', 
    label: 'Any Location', 
    color: '#6b7280', 
    bgColor: 'rgba(107, 114, 128, 0.1)',
    description: 'Location flexible'
  }
};

/**
 * CardMeta Component - Displays workout metadata
 */
export const CardMeta: React.FC<CardMetaProps> = ({
  workout,
  viewMode,
  showDescription = true,
  showDebugInfo = false
}) => {
  const difficultyConfig = FITNESS_LEVEL_CONFIG[workout.difficulty];
  const [accurateExerciseCount, setAccurateExerciseCount] = useState<number | null>(null);
  
  // PHASE 5: Get fitness-specific configurations with fallback logic
  const fitnessLevel = workout.fitness_level || workout.difficulty || 'intermediate';
  const intensityLevel = workout.intensity_level || 3;
  const exerciseComplexity = workout.exercise_complexity || 'moderate';
  
  // SPRINT 3: NEW WorkoutGeneratorGrid parameter configurations
  const stressLevel = workout.stress_level;
  const energyLevel = workout.energy_level;
  const sleepQuality = workout.sleep_quality;
  const location = workout.location;
  const customNotes = workout.custom_notes;
  const primaryMuscleFocus = workout.primary_muscle_focus;
  
  const fitnessLevelConfig = FITNESS_LEVEL_CONFIG[fitnessLevel];
  const intensityConfig = INTENSITY_CONFIG[intensityLevel as keyof typeof INTENSITY_CONFIG];
  const complexityConfig = COMPLEXITY_CONFIG[exerciseComplexity];
  
  // SPRINT 3: NEW WorkoutGeneratorGrid configurations
  const stressConfig = stressLevel ? STRESS_LEVEL_CONFIG[stressLevel] : null;
  const energyConfig = energyLevel ? ENERGY_LEVEL_CONFIG[energyLevel] : null;
  const sleepConfig = sleepQuality ? SLEEP_QUALITY_CONFIG[sleepQuality] : null;
  const locationConfig = location && location !== 'any' ? LOCATION_CONFIG[location] : null;

  // Use WorkoutService to get accurate exercise count from full workout data
  useEffect(() => {
    const fetchAccurateCount = async () => {
      try {
        // Get full workout data using WorkoutService (same as UnifiedWorkoutModal)
        const fullWorkout = await getWorkout(workout.id.toString());
        const serviceCount = fullWorkout.exercises?.length || 0;
        
        console.log('[CardMeta] WorkoutService exercise count:', {
          workoutId: workout.id,
          serviceCount,
          fallbackCount: workout.exercises?.length || 0,
          hasSections: !!fullWorkout.sections?.length
        });
        
        setAccurateExerciseCount(serviceCount);
      } catch (error) {
        console.warn('[CardMeta] Failed to get accurate exercise count, using fallback:', error);
        // Fallback to original calculation
        const fallbackCount = workout.exercises?.length || workout.sections?.reduce((total, section) => total + (section.exercises?.length || 0), 0) || 0;
        
        console.log('[CardMeta] Using fallback pattern:', {
          workoutId: workout.id,
          directExercises: workout.exercises?.length || 0,
          sectionExercises: workout.sections?.reduce((total, section) => total + (section.exercises?.length || 0), 0) || 0,
          finalCount: fallbackCount
        });
        
        setAccurateExerciseCount(fallbackCount);
      }
    };
    
    fetchAccurateCount();
  }, [workout.id, workout.exercises, workout.sections]);
  
  // Calculate exercise count using existing logic
  const exerciseCount = accurateExerciseCount !== null ? accurateExerciseCount : 
    (workout.exercises?.length || workout.sections?.reduce((total, section) => total + (section.exercises?.length || 0), 0) || 0);

  return (
    <div className="workout-meta">
      {/* SPRINT 3: Enhanced Meta Badges with Fitness-Specific and WorkoutGeneratorGrid Parameters */}
      <div className="meta-badges">
        {/* Primary Fitness Badges (EXISTING) */}
        <div className="primary-fitness-badges">
          {/* Fitness Level Badge */}
          <span 
            className="fitness-level-badge"
            style={{ 
              backgroundColor: fitnessLevelConfig.bgColor,
              color: fitnessLevelConfig.textColor 
            }}
            title={`Fitness Level: ${fitnessLevelConfig.label} - ${fitnessLevelConfig.description}`}
          >
            <span className="fitness-level-icon">{fitnessLevelConfig.icon}</span>
            {fitnessLevelConfig.label}
          </span>
          
          {/* Intensity Level Badge */}
          <span 
            className="intensity-level-badge"
            style={{ 
              backgroundColor: intensityConfig.bgColor,
              color: intensityConfig.color 
            }}
            title={`Today's Intensity: ${intensityConfig.label} (${intensityLevel}/5)`}
          >
            <span className="intensity-level-icon">{intensityConfig.icon}</span>
            {intensityLevel}/5
          </span>
          
          {/* Exercise Complexity Badge */}
          <span 
            className="exercise-complexity-badge"
            style={{ 
              backgroundColor: complexityConfig.bgColor,
              color: complexityConfig.color 
            }}
            title={`Exercise Complexity: ${complexityConfig.label}`}
          >
            <span className="exercise-complexity-icon">{complexityConfig.icon}</span>
            {complexityConfig.label}
          </span>
        </div>
        
        {/* SPRINT 3: NEW Daily State Badges */}
        {(stressConfig || energyConfig || sleepConfig) && (
          <div className="daily-state-badges">
            {stressConfig && (
              <span 
                className="stress-level-badge"
                style={{ 
                  backgroundColor: stressConfig.bgColor,
                  color: stressConfig.color 
                }}
                title={`Stress Level: ${stressConfig.label} - ${stressConfig.description}`}
              >
                <span className="stress-icon">{stressConfig.icon}</span>
                {stressConfig.label}
              </span>
            )}
            
            {energyConfig && (
              <span 
                className="energy-level-badge"
                style={{ 
                  backgroundColor: energyConfig.bgColor,
                  color: energyConfig.color 
                }}
                title={`Energy Level: ${energyConfig.label} - ${energyConfig.description}`}
              >
                <span className="energy-icon">{energyConfig.icon}</span>
                {energyConfig.label}
              </span>
            )}
            
            {sleepConfig && (
              <span 
                className="sleep-quality-badge"
                style={{ 
                  backgroundColor: sleepConfig.bgColor,
                  color: sleepConfig.color 
                }}
                title={`Sleep Quality: ${sleepConfig.label} - ${sleepConfig.description}`}
              >
                <span className="sleep-icon">{sleepConfig.icon}</span>
                {sleepConfig.label}
              </span>
            )}
          </div>
        )}
        
        {/* SPRINT 3: NEW Environment Badge */}
        {locationConfig && (
          <div className="environment-badges">
            <span 
              className="location-badge"
              style={{ 
                backgroundColor: locationConfig.bgColor,
                color: locationConfig.color 
              }}
              title={`Location: ${locationConfig.label} - ${locationConfig.description}`}
            >
              <span className="location-icon">{locationConfig.icon}</span>
              {locationConfig.label}
            </span>
          </div>
        )}
        
        {/* SPRINT 3: NEW Primary Muscle Focus Badge */}
        {primaryMuscleFocus && (
          <div className="muscle-focus-badges">
            <span 
              className="muscle-focus-badge"
              style={{ 
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                color: '#8b5cf6'
              }}
              title={`Primary Focus: ${primaryMuscleFocus}`}
            >
              <span className="muscle-focus-icon">🎯</span>
              {primaryMuscleFocus}
            </span>
          </div>
        )}
        
        {/* Workout Type Badge (EXISTING) */}
        <span className="workout-type-badge">
          {workout.workoutType}
        </span>

        {/* Custom Notes Indicator */}
        {customNotes && (
          <span 
            className="custom-notes-badge"
            style={{ 
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              fontSize: '0.75rem',
              padding: '2px 6px'
            }}
            title={`Custom Notes: ${customNotes.substring(0, 100)}${customNotes.length > 100 ? '...' : ''}`}
          >
            <span className="notes-icon">📝</span>
            Notes
          </span>
        )}

        {/* Debug Badge - Show workout ID */}
        {showDebugInfo && (
          <span className="workout-id-badge" style={{ 
            backgroundColor: 'rgba(156, 163, 175, 0.1)', 
            color: '#6b7280',
            fontSize: '0.75rem',
            padding: '2px 6px'
          }}>
            ID: {workout.id}
          </span>
        )}
      </div>

      {/* Meta Stats */}
      <div className="meta-stats">
        <div className="stat-item">
          <Clock size={14} />
          <span>{workout.duration} min</span>
        </div>
        <div className="stat-item">
          <Target size={14} />
          <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Workout Description (Grid mode only) */}
      {showDescription && viewMode === 'grid' && workout.description && (
        <p className="workout-description">{workout.description}</p>
      )}

      {/* Equipment Tags */}
      {workout.equipment.length > 0 && (
        <div className="equipment-tags">
          {workout.equipment.slice(0, 3).map((eq, index) => (
            <span key={index} className="equipment-tag">
              {eq}
            </span>
          ))}
          {workout.equipment.length > 3 && (
            <span className="equipment-more">
              +{workout.equipment.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CardMeta; 