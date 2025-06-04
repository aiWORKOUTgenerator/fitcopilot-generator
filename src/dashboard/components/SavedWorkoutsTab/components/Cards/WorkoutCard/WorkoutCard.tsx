/**
 * Workout Card Component
 * 
 * Displays individual workout information with quick actions.
 * Supports both grid and list view modes with responsive design.
 * 
 * Modular version - Week 2 Component Migration
 */
import React, { useState } from 'react';
import Card from '../../../../../components/ui/Card';
import { WorkoutFormatters } from '../../../utils/ui/formatters';
import { WorkoutCardHeader } from './WorkoutCardHeader';
import { WorkoutCardContent } from './WorkoutCardContent';
import { WorkoutCardActions } from './WorkoutCardActions';
import type { DisplayWorkout } from '../../../types/workout';

// Import modular styles
import './WorkoutCard.scss';

export interface WorkoutCardProps {
  workout: DisplayWorkout;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onCreateSimilar?: () => void;
  onMarkComplete?: () => void;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * WorkoutCard - Main card component using composition pattern
 */
export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete,
  isSelected = false,
  showActions: showActionsProp,
  className = '',
  children
}) => {
  const [showActionsLocal, setShowActionsLocal] = useState(false);
  
  // Use prop value if provided, otherwise use local state
  const showActions = showActionsProp !== undefined ? showActionsProp : showActionsLocal;

  const cardClasses = [
    'workout-card',
    `workout-card--${viewMode}`,
    workout.isCompleted ? 'workout-card--completed' : 'workout-card--pending',
    isSelected ? 'workout-card--selected' : '',
    showActions ? 'workout-card--actions-visible' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Card 
      className={cardClasses}
      onMouseEnter={() => setShowActionsLocal(true)}
      onMouseLeave={() => setShowActionsLocal(false)}
      onClick={onSelect}
    >
      <WorkoutCardHeader workout={workout} />
      
      <WorkoutCardContent workout={workout} />
      
      <WorkoutCardActions
        workout={workout}
        showActions={showActions}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onCreateSimilar={onCreateSimilar}
        onMarkComplete={onMarkComplete}
        onSelect={onSelect}
      />
      
      {/* Additional content from composition (e.g., EnhancedWorkoutCard enhancements) */}
      {children}
    </Card>
  );
};

export default WorkoutCard; 