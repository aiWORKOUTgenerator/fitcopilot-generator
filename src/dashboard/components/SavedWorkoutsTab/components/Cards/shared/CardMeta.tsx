/**
 * Card Meta Component
 * 
 * Displays workout metadata including difficulty, type, stats, and equipment.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React from 'react';
import { Clock, Target } from 'lucide-react';

interface CardMetaProps {
  workout: {
    id: string | number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    workoutType: string;
    duration: number;
    exercises: any[];
    equipment: string[];
    description?: string;
  };
  viewMode: 'grid' | 'list';
  showDescription?: boolean;
  showDebugInfo?: boolean;
}

const DIFFICULTY_CONFIG = {
  beginner: { 
    icon: '🟢', 
    color: 'green', 
    label: 'Beginner',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    textColor: '#10b981'
  },
  intermediate: { 
    icon: '🟡', 
    color: 'yellow', 
    label: 'Intermediate',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    textColor: '#f59e0b'
  },
  advanced: { 
    icon: '🔴', 
    color: 'red', 
    label: 'Advanced',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    textColor: '#ef4444'
  }
};

/**
 * CardMeta Component - Displays workout metadata
 */
export const CardMeta: React.FC<CardMetaProps> = ({
  workout,
  viewMode,
  showDescription = true,
  showDebugInfo = false
}) => {
  const difficultyConfig = DIFFICULTY_CONFIG[workout.difficulty];
  const exerciseCount = Array.isArray(workout.exercises) ? workout.exercises.length : 0;

  return (
    <div className="workout-meta">
      {/* Meta Badges */}
      <div className="meta-badges">
        <span 
          className="difficulty-badge"
          style={{ 
            backgroundColor: difficultyConfig.bgColor,
            color: difficultyConfig.textColor 
          }}
        >
          <span className="difficulty-icon">{difficultyConfig.icon}</span>
          {difficultyConfig.label}
        </span>
        
        <span className="workout-type-badge">
          {workout.workoutType}
        </span>

        {/* Debug Badge - Show workout ID */}
        {showDebugInfo && (
          <span className="workout-id-badge" style={{ 
            backgroundColor: 'rgba(156, 163, 175, 0.1)', 
            color: '#6b7280',
            fontSize: '0.75rem',
            padding: '2px 6px'
          }}>
            ID: {workout.id}
          </span>
        )}
      </div>

      {/* Meta Stats */}
      <div className="meta-stats">
        <div className="stat-item">
          <Clock size={14} />
          <span>{workout.duration} min</span>
        </div>
        <div className="stat-item">
          <Target size={14} />
          <span>{exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Workout Description (Grid mode only) */}
      {showDescription && viewMode === 'grid' && workout.description && (
        <p className="workout-description">{workout.description}</p>
      )}

      {/* Equipment Tags */}
      {workout.equipment.length > 0 && (
        <div className="equipment-tags">
          {workout.equipment.slice(0, 3).map((eq, index) => (
            <span key={index} className="equipment-tag">
              {eq}
            </span>
          ))}
          {workout.equipment.length > 3 && (
            <span className="equipment-more">
              +{workout.equipment.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CardMeta; 