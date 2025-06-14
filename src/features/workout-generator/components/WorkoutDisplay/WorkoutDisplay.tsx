/**
 * WorkoutDisplay Component
 * 
 * Clean, semantic workout display that replaces the over-engineered 5-format system.
 * Enhanced with user selections summary to show how WorkoutGeneratorGrid choices influenced AI generation.
 * Focuses on readability, accessibility, and performance.
 * 
 * @component
 */
import React from 'react';
import { GeneratedWorkout, WorkoutSection, Exercise } from '../../types/workout';
import { Button } from '../../../../components/ui';
import { PrinterIcon, Share2, Copy, Settings, MapPin, Clock, Target, Zap } from 'lucide-react';
import './WorkoutDisplay.scss';

interface WorkoutDisplayProps {
  /** The workout data to display */
  workout: GeneratedWorkout;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Optional CSS class name */
  className?: string;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Whether to show user selections summary */
  showSelections?: boolean;
  /** Callback for action button clicks */
  onAction?: (action: string, data?: any) => void;
}

/**
 * Clean, accessible workout display component with enhanced selections summary
 */
const WorkoutDisplay: React.FC<WorkoutDisplayProps> = ({
  workout,
  variant = 'default',
  className = '',
  showActions = false,
  showSelections = true,
  onAction,
}) => {
  
  const handlePrint = () => {
    window.print();
    onAction?.('print', { workout });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workout.title,
          text: `Check out my workout: ${workout.title}`,
          url: window.location.href,
        });
        onAction?.('share', { workout, method: 'native' });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback for browsers without Web Share API
      onAction?.('share', { workout, method: 'fallback' });
    }
  };

  const handleCopy = async () => {
    const workoutText = generateWorkoutText(workout);
    try {
      await navigator.clipboard.writeText(workoutText);
      onAction?.('copy', { workout, text: workoutText });
    } catch (error) {
      console.error('Failed to copy workout text');
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => {
    const isTimedExercise = 'duration' in exercise;
    const isRepsExercise = 'sets' in exercise;

    return (
      <div key={`exercise-${index}`} className="workout-display__exercise">
        <h4 className="workout-display__exercise-name">
          {exercise.name}
        </h4>
        
        <div className="workout-display__exercise-details">
          {isRepsExercise && (
            <span className="workout-display__exercise-metric">
              {exercise.sets} sets × {exercise.reps} reps
            </span>
          )}
          {isTimedExercise && (
            <span className="workout-display__exercise-metric">
              {exercise.duration}
            </span>
          )}
        </div>
        
        {exercise.description && (
          <p className="workout-display__exercise-description">
            {exercise.description}
          </p>
        )}
        
        {exercise.tips && exercise.tips.length > 0 && (
          <div className="workout-display__exercise-tips">
            <strong>Tips:</strong>
            <ul>
              {exercise.tips.map((tip, tipIndex) => (
                <li key={tipIndex}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: WorkoutSection, index: number) => {
    return (
      <section key={`section-${index}`} className="workout-display__section">
        <header className="workout-display__section-header">
          <h3 className="workout-display__section-name">
            {section.name}
          </h3>
          {section.duration && (
            <span className="workout-display__section-duration">
              {section.duration} min
            </span>
          )}
        </header>
        
        <div className="workout-display__exercises">
          {section.exercises.map((exercise, exerciseIndex) => 
            renderExercise(exercise, exerciseIndex)
          )}
        </div>
      </section>
    );
  };

  /**
   * Render user selections summary showing how WorkoutGeneratorGrid choices influenced AI generation
   */
  const renderUserSelections = () => {
    // Check if we have any WorkoutGeneratorGrid parameters to display
    const hasSelections = workout.fitness_level || workout.intensity_level || workout.exercise_complexity ||
                         workout.stress_level || workout.energy_level || workout.sleep_quality ||
                         workout.location || workout.custom_notes || workout.primary_muscle_focus ||
                         workout.duration || workout.goals || workout.equipment;

    if (!hasSelections) return null;

    return (
      <section className="workout-display__selections" aria-labelledby="selections-title">
        <header className="workout-display__selections-header">
          <h3 id="selections-title" className="workout-display__selections-title">
            <Settings size={20} />
            Your Selections
          </h3>
          <p className="workout-display__selections-subtitle">
            These preferences shaped your personalized workout
          </p>
        </header>

        <div className="workout-display__selections-grid">
          
          {/* Core Workout Parameters */}
          <div className="selections-category selections-category--core">
            <h4 className="selections-category__title">
              <Target size={16} />
              Workout Setup
            </h4>
            <div className="selections-category__items">
              {workout.duration && (
                <div className="selection-item">
                  <Clock size={14} />
                  <span className="selection-item__label">Duration:</span>
                  <span className="selection-item__value">{workout.duration} minutes</span>
                </div>
              )}
              {workout.goals && (
                <div className="selection-item">
                  <Target size={14} />
                  <span className="selection-item__label">Goal:</span>
                  <span className="selection-item__value">{formatGoals(workout.goals)}</span>
                </div>
              )}
              {workout.equipment && workout.equipment.length > 0 && (
                <div className="selection-item">
                  <span className="selection-item__icon">🏋️</span>
                  <span className="selection-item__label">Equipment:</span>
                  <span className="selection-item__value">{Array.isArray(workout.equipment) ? workout.equipment.join(', ') : workout.equipment}</span>
                </div>
              )}
            </div>
          </div>

          {/* Fitness Parameters */}
          {(workout.fitness_level || workout.intensity_level || workout.exercise_complexity) && (
            <div className="selections-category selections-category--fitness">
              <h4 className="selections-category__title">
                <Zap size={16} />
                Fitness Level
              </h4>
              <div className="selections-category__items">
                {workout.fitness_level && (
                  <div className="selection-item">
                    <span className="selection-item__icon">🟡</span>
                    <span className="selection-item__label">Level:</span>
                    <span className="selection-item__value">{formatFitnessLevel(workout.fitness_level)}</span>
                  </div>
                )}
                {workout.intensity_level && (
                  <div className="selection-item">
                    <span className="selection-item__icon">🔥</span>
                    <span className="selection-item__label">Intensity:</span>
                    <span className="selection-item__value">{workout.intensity_level}/5</span>
                  </div>
                )}
                {workout.exercise_complexity && (
                  <div className="selection-item">
                    <span className="selection-item__icon">🔧</span>
                    <span className="selection-item__label">Complexity:</span>
                    <span className="selection-item__value">{formatComplexity(workout.exercise_complexity)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Daily State Parameters */}
          {(workout.stress_level || workout.energy_level || workout.sleep_quality) && (
            <div className="selections-category selections-category--daily-state">
              <h4 className="selections-category__title">
                <span className="selections-category__icon">🌟</span>
                Today's State
              </h4>
              <div className="selections-category__items">
                {workout.stress_level && (
                  <div className="selection-item">
                    <span className="selection-item__icon">{getStressIcon(workout.stress_level)}</span>
                    <span className="selection-item__label">Stress:</span>
                    <span className="selection-item__value">{formatStressLevel(workout.stress_level)}</span>
                  </div>
                )}
                {workout.energy_level && (
                  <div className="selection-item">
                    <span className="selection-item__icon">{getEnergyIcon(workout.energy_level)}</span>
                    <span className="selection-item__label">Energy:</span>
                    <span className="selection-item__value">{formatEnergyLevel(workout.energy_level)}</span>
                  </div>
                )}
                {workout.sleep_quality && (
                  <div className="selection-item">
                    <span className="selection-item__icon">{getSleepIcon(workout.sleep_quality)}</span>
                    <span className="selection-item__label">Sleep:</span>
                    <span className="selection-item__value">{formatSleepQuality(workout.sleep_quality)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Environment & Customization */}
          {(workout.location || workout.primary_muscle_focus || workout.custom_notes) && (
            <div className="selections-category selections-category--environment">
              <h4 className="selections-category__title">
                <MapPin size={16} />
                Environment & Focus
              </h4>
              <div className="selections-category__items">
                {workout.location && workout.location !== 'any' && (
                  <div className="selection-item">
                    <span className="selection-item__icon">{getLocationIcon(workout.location)}</span>
                    <span className="selection-item__label">Location:</span>
                    <span className="selection-item__value">{formatLocation(workout.location)}</span>
                  </div>
                )}
                {workout.primary_muscle_focus && (
                  <div className="selection-item">
                    <span className="selection-item__icon">🎯</span>
                    <span className="selection-item__label">Focus:</span>
                    <span className="selection-item__value">{workout.primary_muscle_focus}</span>
                  </div>
                )}
                {workout.custom_notes && (
                  <div className="selection-item selection-item--notes">
                    <span className="selection-item__icon">📝</span>
                    <span className="selection-item__label">Notes:</span>
                    <span className="selection-item__value">{workout.custom_notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* AI Generation Context */}
        <div className="workout-display__ai-context">
          <p className="ai-context-text">
            <span className="ai-context-icon">🤖</span>
            Your AI trainer considered these preferences to create a workout perfectly tailored to your current state and goals.
          </p>
        </div>
      </section>
    );
  };

  return (
    <article 
      className={`
        workout-display 
        workout-display--${variant}
        ${className}
      `}
      role="main"
      aria-labelledby="workout-title"
    >
      <header className="workout-display__header">
        <h2 id="workout-title" className="workout-display__title">
          {workout.title}
        </h2>
        
        {workout.description && (
          <p className="workout-display__description">
            {workout.description}
          </p>
        )}
      </header>
      
      <main className="workout-display__content">
        {showSelections && renderUserSelections()}
        {workout.sections && workout.sections.length > 0 ? (
          workout.sections.map((section, index) => renderSection(section, index))
        ) : workout.exercises && workout.exercises.length > 0 ? (
          <section className="workout-display__section">
            <header className="workout-display__section-header">
              <h3 className="workout-display__section-name">Exercises</h3>
            </header>
            <div className="workout-display__exercises">
              {workout.exercises.map((exercise, exerciseIndex) => 
                renderExercise(exercise, exerciseIndex)
              )}
            </div>
          </section>
        ) : (
          <div className="workout-display__no-content">
            <p>No workout content available</p>
          </div>
        )}
      </main>
      
      {showActions && (
        <footer className="workout-display__actions">
          <Button
            variant="secondary"
            size="md"
            onClick={handlePrint}
            startIcon={<PrinterIcon size={16} />}
            aria-label="Print workout"
          >
            Print
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleShare}
            startIcon={<Share2 size={16} />}
            aria-label="Share workout"
          >
            Share
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleCopy}
            startIcon={<Copy size={16} />}
            aria-label="Copy workout text"
          >
            Copy
          </Button>
        </footer>
      )}
    </article>
  );
};

/**
 * Generate plain text version of workout for copying/sharing
 */
const generateWorkoutText = (workout: GeneratedWorkout): string => {
  let text = `${workout.title}\n`;
  text += '='.repeat(workout.title.length) + '\n\n';
  
  if (workout.description) {
    text += `${workout.description}\n\n`;
  }
  
  workout.sections?.forEach((section, sectionIndex) => {
    text += `${section.name}`;
    if (section.duration) {
      text += ` (${section.duration} min)`;
    }
    text += '\n' + '-'.repeat(section.name.length) + '\n';
    
    section.exercises.forEach((exercise, exerciseIndex) => {
      text += `${exerciseIndex + 1}. ${exercise.name}\n`;
      
      if ('sets' in exercise) {
        text += `   ${exercise.sets} sets × ${exercise.reps} reps\n`;
      } else if ('duration' in exercise) {
        text += `   ${exercise.duration}\n`;
      }
      
      if (exercise.description) {
        text += `   ${exercise.description}\n`;
      }
      
      text += '\n';
    });
    
    text += '\n';
  });
  
  return text;
};

/**
 * Formatting utilities for user selections display
 */
const formatGoals = (goals: string): string => {
  return goals.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatFitnessLevel = (level: string): string => {
  return level.charAt(0).toUpperCase() + level.slice(1);
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
  return labels[location as keyof typeof labels] || location;
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

export default WorkoutDisplay; 