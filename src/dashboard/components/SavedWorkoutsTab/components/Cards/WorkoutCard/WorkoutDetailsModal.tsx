/**
 * Workout Details Modal Component
 * 
 * Displays detailed workout information including the enhanced WorkoutSelectionSummary
 * Opens when clicking "View Details" from WorkoutCardActions
 */
import React from 'react';
import { X } from 'lucide-react';
import { WorkoutSelectionSummary } from '../../../../../features/workout-generator/components/common/WorkoutSelectionSummary';
import type { DisplayWorkout } from '../../../types/workout';
import './WorkoutDetailsModal.scss';

interface WorkoutDetailsModalProps {
  workout: DisplayWorkout;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WorkoutDetailsModal - Shows comprehensive workout details in a modal
 */
export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({
  workout,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="workout-details-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="workout-details-modal">
        <div className="workout-details-modal__header">
          <h2 className="workout-details-modal__title">
            {workout.title || 'Workout Details'}
          </h2>
          <button
            className="workout-details-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="workout-details-modal__content">
          {/* Enhanced Workout Selections Summary */}
          <WorkoutSelectionSummary 
            workout={workout}
            className="workout-details-modal__selections"
          />

          {/* Workout Metadata */}
          <div className="workout-details-modal__metadata">
            <h3>Workout Information</h3>
            <div className="metadata-grid">
              {workout.createdAt && (
                <div className="metadata-item">
                  <span className="metadata-label">Created:</span>
                  <span className="metadata-value">
                    {new Date(workout.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {workout.isCompleted && (
                <div className="metadata-item">
                  <span className="metadata-label">Status:</span>
                  <span className="metadata-value metadata-value--completed">
                    ✅ Completed
                  </span>
                </div>
              )}
              {workout.id && (
                <div className="metadata-item">
                  <span className="metadata-label">Workout ID:</span>
                  <span className="metadata-value">#{workout.id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Exercise Preview */}
          {workout.exercises && workout.exercises.length > 0 && (
            <div className="workout-details-modal__exercises">
              <h3>Exercise Preview</h3>
              <div className="exercise-count">
                {workout.exercises.length} exercises included
              </div>
              <div className="exercise-list">
                {workout.exercises.slice(0, 5).map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <span className="exercise-name">{exercise.name || `Exercise ${index + 1}`}</span>
                    {exercise.sets && exercise.reps && (
                      <span className="exercise-details">
                        {exercise.sets} sets × {exercise.reps} reps
                      </span>
                    )}
                  </div>
                ))}
                {workout.exercises.length > 5 && (
                  <div className="exercise-item exercise-item--more">
                    +{workout.exercises.length - 5} more exercises...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="workout-details-modal__footer">
          <button
            className="workout-details-modal__close-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetailsModal; 