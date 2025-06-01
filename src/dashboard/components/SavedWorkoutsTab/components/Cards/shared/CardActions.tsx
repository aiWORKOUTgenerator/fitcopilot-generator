/**
 * Card Actions Component
 * 
 * Handles workout action dropdown menu with all available actions.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical,
  ExternalLink,
  Edit3,
  Copy,
  Zap,
  CheckCircle,
  Trash2
} from 'lucide-react';

interface CardActionsProps {
  workout: {
    id: string | number;
    title: string;
    isCompleted: boolean;
  };
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
  onDelete: () => void;
}

/**
 * CardActions Component - Action dropdown menu for workouts
 */
export const CardActions: React.FC<CardActionsProps> = ({
  workout,
  onSelect,
  onEdit,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onDelete
}) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionClick = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreActions(false);
    action();
  };

  return (
    <div className="card-actions" ref={moreActionsRef}>
      <button
        className="more-actions-btn"
        onClick={(e) => {
          e.stopPropagation();
          setShowMoreActions(!showMoreActions);
        }}
        title="More actions"
      >
        <MoreVertical size={16} />
      </button>

      {/* Actions Dropdown */}
      {showMoreActions && (
        <div className="actions-dropdown">
          <button
            className="action-item"
            onClick={(e) => handleActionClick(onSelect, e)}
            title={`View details for ${workout.title}`}
          >
            <ExternalLink size={14} />
            View Details
          </button>
          
          <button
            className="action-item"
            onClick={(e) => handleActionClick(onEdit, e)}
            title={`Edit ${workout.title}`}
          >
            <Edit3 size={14} />
            Edit
          </button>
          
          <button
            className="action-item"
            onClick={(e) => handleActionClick(onDuplicate, e)}
            title={`Duplicate ${workout.title}`}
          >
            <Copy size={14} />
            Duplicate
          </button>
          
          <button
            className="action-item"
            onClick={(e) => handleActionClick(onCreateSimilar, e)}
            title={`Create workout similar to ${workout.title}`}
          >
            <Zap size={14} />
            Create Similar
          </button>
          
          <div className="action-divider"></div>
          
          <button
            className="action-item"
            onClick={(e) => handleActionClick(onMarkComplete, e)}
            title={`Mark ${workout.title} as ${workout.isCompleted ? 'incomplete' : 'complete'}`}
          >
            <CheckCircle size={14} />
            {workout.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
          
          <button
            className="action-item danger"
            onClick={(e) => handleActionClick(onDelete, e)}
            title={`Delete ${workout.title}`}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CardActions; 