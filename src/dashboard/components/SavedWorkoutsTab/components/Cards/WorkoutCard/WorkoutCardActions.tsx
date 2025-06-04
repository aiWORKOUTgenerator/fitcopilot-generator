/**
 * Workout Card Actions Component
 * 
 * Displays action buttons for workout interactions (view, edit, delete, etc.).
 * Extracted from WorkoutCard as part of Week 2 Component Migration.
 */
import React from 'react';
import { Button } from '../../../../../components/ui';
import type { DisplayWorkout } from '../../../types/workout';

interface WorkoutCardActionsProps {
  workout: DisplayWorkout;
  showActions: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
  onSelect: () => void;
}

/**
 * WorkoutCardActions - Displays action buttons with hover state
 */
export const WorkoutCardActions: React.FC<WorkoutCardActionsProps> = ({
  workout,
  showActions,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onSelect
}) => {
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className={`workout-card__actions ${showActions ? 'workout-card__actions--visible' : ''}`}>
      <div className="workout-card__primary-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => handleActionClick(e, onSelect)}
        >
          View Details
        </Button>
        
        {!workout.isCompleted && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => handleActionClick(e, onMarkComplete)}
          >
            Mark Complete
          </Button>
        )}
      </div>
      
      <div className="workout-card__secondary-actions">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleActionClick(e, onEdit)}
          title="Edit workout"
        >
          ✏️
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleActionClick(e, onDuplicate)}
          title="Duplicate workout"
        >
          📋
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleActionClick(e, onCreateSimilar)}
          title="Create similar workout"
        >
          🔄
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this workout?')) {
              onDelete();
            }
          }}
          title="Delete workout"
          className="workout-card__delete-action"
        >
          🗑️
        </Button>
      </div>
    </div>
  );
};

export default WorkoutCardActions; 