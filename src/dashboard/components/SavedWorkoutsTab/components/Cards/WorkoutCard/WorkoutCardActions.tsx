/**
 * Workout Card Actions Component
 * 
 * Displays action buttons for workout interactions (view, edit, delete, etc.).
 * Extracted from WorkoutCard as part of Week 2 Component Migration.
 */
import React, { useState } from 'react';
import { WorkoutDetailsModal } from './WorkoutDetailsModal';
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

// Simple Button component for this use case
const SimpleButton: React.FC<{
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'primary', size = 'md', onClick, title, className = '', children }) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      title={title}
      style={{
        padding: size === 'sm' ? '6px 12px' : '8px 16px',
        fontSize: size === 'sm' ? '0.875rem' : '1rem',
        border: variant === 'outline' ? '1px solid #ccc' : 'none',
        background: variant === 'primary' ? '#007cba' : variant === 'outline' ? 'transparent' : 'transparent',
        color: variant === 'primary' ? 'white' : '#333',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  );
};

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleViewDetails = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`workout-card__actions ${showActions ? 'workout-card__actions--visible' : ''}`}>
        <div className="workout-card__primary-actions">
          <SimpleButton
            variant="primary"
            size="sm"
            onClick={handleViewDetails}
          >
            View Details
          </SimpleButton>
          
          {!workout.isCompleted && (
            <SimpleButton
              variant="outline"
              size="sm"
              onClick={(e) => handleActionClick(e, onMarkComplete)}
            >
              Mark Complete
            </SimpleButton>
          )}
        </div>
        
        <div className="workout-card__secondary-actions">
          <SimpleButton
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, onEdit)}
            title="Edit workout"
          >
            ✏️
          </SimpleButton>
          
          <SimpleButton
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, onDuplicate)}
            title="Duplicate workout"
          >
            📋
          </SimpleButton>
          
          <SimpleButton
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, onCreateSimilar)}
            title="Create similar workout"
          >
            🔄
          </SimpleButton>
          
          <SimpleButton
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
          </SimpleButton>
        </div>
      </div>

      {/* Workout Details Modal */}
      <WorkoutDetailsModal
        workout={workout}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default WorkoutCardActions; 