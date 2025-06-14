/**
 * Workout Card Header Component
 * 
 * Displays workout title, difficulty badge, workout type, and completion status.
 * Extracted from WorkoutCard as part of Week 2 Component Migration.
 */
import React from 'react';
import { WorkoutFormatters } from '../../../utils/ui/formatters';
import type { DisplayWorkout } from '../../../types/workout';

interface WorkoutCardHeaderProps {
  workout: DisplayWorkout;
}

/**
 * WorkoutCardHeader - Displays title, meta, and status
 */
export const WorkoutCardHeader: React.FC<WorkoutCardHeaderProps> = ({ workout }) => {
  // PHASE 5: Get fitness-specific data with fallback logic
  const fitnessLevel = (workout as any).fitness_level || workout.difficulty || 'intermediate';
  const intensityLevel = (workout as any).intensity_level || 3;
  const exerciseComplexity = (workout as any).exercise_complexity || 'moderate';

  return (
    <div className="workout-card__header">
      <div className="workout-card__title-section">
        {/* 🚀 TASK 1.2.1: Title now displayed in thumbnail header - removed from body */}
        
        <div className="workout-card__meta">
          {/* PHASE 5: Enhanced fitness-specific badges */}
          <span className={`workout-card__fitness-level-badge workout-card__fitness-level-badge--${fitnessLevel}`}>
            <span className="workout-card__fitness-level-icon">
              {WorkoutFormatters.getFitnessLevelIcon(fitnessLevel)}
            </span>
            <span className="workout-card__fitness-level-text">
              {WorkoutFormatters.formatFitnessLevel(fitnessLevel)}
            </span>
          </span>
          
          <span className={`workout-card__intensity-level-badge workout-card__intensity-level-badge--${intensityLevel}`}>
            <span className="workout-card__intensity-level-icon">
              {WorkoutFormatters.getIntensityLevelIcon(intensityLevel)}
            </span>
            <span className="workout-card__intensity-level-text">
              {intensityLevel}/5
            </span>
          </span>
          
          <span className={`workout-card__exercise-complexity-badge workout-card__exercise-complexity-badge--${exerciseComplexity}`}>
            <span className="workout-card__exercise-complexity-icon">
              {WorkoutFormatters.getExerciseComplexityIcon(exerciseComplexity)}
            </span>
            <span className="workout-card__exercise-complexity-text">
              {WorkoutFormatters.formatExerciseComplexity(exerciseComplexity)}
            </span>
          </span>
          
          {workout.workoutType && (
            <span className="workout-card__workout-type">
              {workout.workoutType}
            </span>
          )}
        </div>
      </div>
      
      <div className="workout-card__status">
        {workout.isCompleted ? (
          <div className="workout-card__status-badge workout-card__status-badge--completed">
            <span className="workout-card__status-icon">✅</span>
            <span className="workout-card__status-text">Completed</span>
          </div>
        ) : (
          <div className="workout-card__status-badge workout-card__status-badge--pending">
            <span className="workout-card__status-icon">⏳</span>
            <span className="workout-card__status-text">Pending</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCardHeader; 