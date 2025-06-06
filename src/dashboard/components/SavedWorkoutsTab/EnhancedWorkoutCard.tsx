/**
 * Enhanced Workout Card Component - REFACTORED
 * 
 * Improved workout card using modular sub-components for better maintainability.
 * Week 2 Component Splitting: Reduced from 465 lines to composition-focused design.
 */
import React, { useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';

// Import extracted components
import { 
  CardThumbnail,
  CardMeta,
  CardActions,
  CardFooter,
  CardSelection
} from './components/Cards/shared';

// Import version-aware components
import { VersionAwareCardMeta } from './components/Cards/shared/VersionAwareCardMeta';

import './EnhancedWorkoutCard.scss';

interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  workoutType: string;
  equipment: string[];
  exercises: any[];
  createdAt: string;
  lastModified: string;
  isCompleted: boolean;
  completedAt?: string;
  tags: string[];
  isFavorite?: boolean;
  rating?: number;
}

interface EnhancedWorkoutCardProps {
  workout: GeneratedWorkout;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
  onToggleSelection?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  
  // NEW: Version-aware display options
  enableVersionDisplay?: boolean;
  showVersionDebug?: boolean;
}

/**
 * Enhanced Workout Card Component - Now uses modular sub-components
 */
export const EnhancedWorkoutCard: React.FC<EnhancedWorkoutCardProps> = ({
  workout,
  viewMode,
  isSelected = false,
  isSelectionMode = false,
  enableVersionDisplay = false,
  showVersionDebug = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onToggleSelection,
  onToggleFavorite,
  onRate
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(workout.id);
    }
  };

  return (
    <div 
      className={`enhanced-workout-card ${viewMode} ${workout.isCompleted ? 'completed' : 'pending'} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* Selection Overlay */}
      {onToggleSelection && (
        <CardSelection
          workout={workout}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          onToggleSelection={onToggleSelection}
        />
      )}

      {/* Card Header */}
      <div className="card-header">
        {/* Workout Thumbnail with Quick Actions */}
        <CardThumbnail
          workout={workout}
          showActions={showActions}
          isSelectionMode={isSelectionMode}
          onSelect={onSelect}
          onEdit={onEdit}
        />

        {/* Workout Info */}
        <div className="workout-info" onClick={onSelect}>
          {/* 🚀 TASK 1.2.1: Title now displayed in thumbnail header - removed from body */}
          <div className="workout-actions-row">
            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                className={`favorite-btn ${workout.isFavorite ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                title={workout.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {workout.isFavorite ? <Heart size={16} /> : <HeartOff size={16} />}
              </button>
            )}
          </div>

          {/* Workout Meta Information */}
          {enableVersionDisplay ? (
            <VersionAwareCardMeta
              workout={workout as any} // Cast to enhanced workout type
              viewMode={viewMode}
              showDescription={true}
              showVersionInfo={true}
              showDebugInfo={showVersionDebug || process.env.NODE_ENV === 'development'}
            />
          ) : (
            <CardMeta
              workout={workout}
              viewMode={viewMode}
              showDescription={true}
              showDebugInfo={process.env.NODE_ENV === 'development'}
            />
          )}
        </div>

        {/* More Actions Menu */}
        <CardActions
          workout={workout}
          onSelect={onSelect}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onCreateSimilar={onCreateSimilar}
          onMarkComplete={onMarkComplete}
          onDelete={onDelete}
        />
      </div>

      {/* Card Footer */}
      <CardFooter
        workout={workout}
        onRate={onRate}
        showDetailedDate={process.env.NODE_ENV === 'development'}
      />

      {/* Completion Progress Bar */}
      {workout.isCompleted && (
        <div className="completion-indicator"></div>
      )}

      {/* Hover Enhancement */}
      {isHovered && (
        <div className="hover-enhancement"></div>
      )}
    </div>
  );
};

// Maintain backward compatibility
export default EnhancedWorkoutCard; 