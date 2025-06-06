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
  return (
    <div className="workout-card__header">
      <div className="workout-card__title-section">
        {/* 🚀 TASK 1.2.1: Title now displayed in thumbnail header - removed from body */}
        
        <div className="workout-card__meta">
          <span className={`workout-card__difficulty-badge workout-card__difficulty-badge--${workout.difficulty}`}>
            <span className="workout-card__difficulty-icon">
              {WorkoutFormatters.getDifficultyIcon(workout.difficulty)}
            </span>
            <span className="workout-card__difficulty-text">
              {WorkoutFormatters.formatDifficulty(workout.difficulty)}
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