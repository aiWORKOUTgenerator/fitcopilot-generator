/**
 * Card Thumbnail Component
 * 
 * Generates workout thumbnails with type-specific icons and colors.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React from 'react';
import { Play, Edit3 } from 'lucide-react';

interface CardThumbnailProps {
  workout: {
    id: string | number;
    workoutType: string;
  };
  showActions?: boolean;
  isSelectionMode?: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

/**
 * CardThumbnail Component - Generates workout thumbnails with quick actions
 */
export const CardThumbnail: React.FC<CardThumbnailProps> = ({
  workout,
  showActions = false,
  isSelectionMode = false,
  onSelect,
  onEdit
}) => {
  // Generate thumbnail color and icon based on workout type
  const getThumbnailData = () => {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const color = colors[workout.id.toString().length % colors.length];
    
    const getWorkoutIcon = (type: string) => {
      switch (type) {
        case 'Cardio': return '🏃';
        case 'Strength': return '💪';
        case 'Flexibility': return '🧘';
        default: return '🏋️';
      }
    };

    return {
      color,
      icon: getWorkoutIcon(workout.workoutType)
    };
  };

  const { color, icon } = getThumbnailData();

  const handleActionClick = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="workout-thumbnail-container">
      <div 
        className="workout-thumbnail"
        style={{ backgroundColor: color }}
      >
        <span className="thumbnail-icon">
          {icon}
        </span>
      </div>
      
      {/* Quick Actions Overlay */}
      {showActions && !isSelectionMode && (
        <div className="quick-actions-overlay">
          <button
            className="quick-action-btn primary"
            onClick={(e) => handleActionClick(onSelect, e)}
            title="View Workout"
          >
            <Play size={16} />
          </button>
          <button
            className="quick-action-btn secondary"
            onClick={(e) => handleActionClick(onEdit, e)}
            title="Edit Workout"
          >
            <Edit3 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CardThumbnail; 