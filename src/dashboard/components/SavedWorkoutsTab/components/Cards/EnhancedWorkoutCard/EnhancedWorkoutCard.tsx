/**
 * Enhanced Workout Card Component - MODULAR ARCHITECTURE
 * 
 * Phase 2, Day 4: Break down EnhancedWorkoutCard into modular components
 * Main component becomes composition of smaller, focused parts
 */
import React, { useState } from 'react';
import { GeneratedWorkout } from '../../../types/workout';

// Import modular sub-components
import { 
  CardStatusIndicator,
  CardActionsMenu, 
  CardErrorDisplay,
  type CardStatusIndicatorProps,
  type CardActionsMenuProps,
  type CardErrorDisplayProps
} from './index';

// Import shared components
import { 
  CardThumbnail,
  CardMeta,
  CardActions,
  CardFooter,
  CardSelection
} from '../shared';

import './EnhancedWorkoutCard.scss';

export interface EnhancedWorkoutCardProps {
  workout: GeneratedWorkout;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  isSelectionMode?: boolean;
  error?: Error | null;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
  onToggleSelection?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
}

/**
 * Enhanced Workout Card - Composition of modular components
 * Standalone component with enhanced features
 */
export const EnhancedWorkoutCard: React.FC<EnhancedWorkoutCardProps> = ({
  workout,
  viewMode,
  isSelected = false,
  isSelectionMode = false,
  error = null,
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

  // Handle error display
  if (error) {
    return (
      <CardErrorDisplay 
        error={error} 
        workout={workout}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const cardClasses = [
    'enhanced-workout-card',
    `enhanced-workout-card--${viewMode}`,
    workout.isCompleted ? 'enhanced-workout-card--completed' : 'enhanced-workout-card--pending',
    isSelected ? 'enhanced-workout-card--selected' : '',
    isSelectionMode ? 'enhanced-workout-card--selection-mode' : '',
    isHovered ? 'enhanced-workout-card--hovered' : ''
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      {/* Status Indicators */}
      <CardStatusIndicator 
        workout={workout}
        isHovered={isHovered}
      />

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
      <div className="enhanced-card-header">
        <CardThumbnail
          workout={workout}
          showActions={showActions}
          isSelectionMode={isSelectionMode}
          onSelect={onSelect}
          onEdit={onEdit}
        />

        <div className="enhanced-card-info" onClick={onSelect}>
          <div className="enhanced-card-title-row">
            <h3 className="enhanced-card-title">{workout.title}</h3>
          </div>

          <CardMeta
            workout={workout}
            viewMode={viewMode}
            showDescription={true}
            showDebugInfo={process.env.NODE_ENV === 'development'}
          />
        </div>
      </div>

      {/* Enhanced Actions Menu */}
      <CardActionsMenu
        workout={workout}
        showActions={showActions}
        onSelect={onSelect}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onCreateSimilar={onCreateSimilar}
        onMarkComplete={onMarkComplete}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        onRate={onRate}
      />

      {/* Enhanced Footer with Rating */}
      <CardFooter
        workout={workout}
        onRate={onRate}
        showDetailedDate={process.env.NODE_ENV === 'development'}
      />
    </div>
  );
};

// Default export for backward compatibility
export default EnhancedWorkoutCard; 