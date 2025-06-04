/**
 * Workout Card Content Component
 * 
 * Displays workout description, details (duration, exercises, date), equipment, and tags.
 * Extracted from WorkoutCard as part of Week 2 Component Migration.
 */
import React from 'react';
import { WorkoutFormatters } from '../../../utils/ui/formatters';
import type { DisplayWorkout } from '../../../types/workout';

interface WorkoutCardContentProps {
  workout: DisplayWorkout;
}

/**
 * WorkoutCardContent - Displays main content area
 */
export const WorkoutCardContent: React.FC<WorkoutCardContentProps> = ({ workout }) => {
  return (
    <div className="workout-card__content">
      {/* Workout Description */}
      {workout.description && (
        <div className="workout-card__description">
          <p>{workout.description}</p>
        </div>
      )}

      {/* Workout Details */}
      <div className="workout-card__details">
        <div className="workout-card__detail-item">
          <span className="workout-card__detail-icon">⏱️</span>
          <span className="workout-card__detail-text">
            {WorkoutFormatters.formatDuration(workout.duration)}
          </span>
        </div>
        
        <div className="workout-card__detail-item">
          <span className="workout-card__detail-icon">🏋️</span>
          <span className="workout-card__detail-text">
            {WorkoutFormatters.formatExerciseCount(workout.exercises.length)}
          </span>
        </div>
        
        <div className="workout-card__detail-item">
          <span className="workout-card__detail-icon">📅</span>
          <span className="workout-card__detail-text">
            {WorkoutFormatters.formatDate(workout.createdAt)}
          </span>
        </div>
      </div>

      {/* Equipment Tags */}
      {workout.equipment && workout.equipment.length > 0 && (
        <div className="workout-card__equipment-tags">
          <span className="workout-card__equipment-text">
            {WorkoutFormatters.formatEquipmentList(workout.equipment, 3)}
          </span>
        </div>
      )}

      {/* Workout Tags */}
      {workout.tags && workout.tags.length > 0 && (
        <div className="workout-card__tags">
          {workout.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="workout-card__tag">
              #{tag}
            </span>
          ))}
          {workout.tags.length > 3 && (
            <span className="workout-card__tag workout-card__tag--more">
              +{workout.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutCardContent; 