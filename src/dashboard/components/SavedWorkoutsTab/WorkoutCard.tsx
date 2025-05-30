/**
 * Workout Card Component
 * 
 * Displays individual workout information with quick actions.
 * Supports both grid and list view modes with responsive design.
 */
import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { Button } from '../../../components/ui';

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
}

interface WorkoutCardProps {
  workout: GeneratedWorkout;
  viewMode: 'grid' | 'list';
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
}

/**
 * WorkoutCard displays workout information and actions
 */
const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'blue';
      case 'advanced': return 'purple';
      default: return 'gray';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '💪';
      case 'advanced': return '🏆';
      default: return '⭐';
    }
  };

  return (
    <Card 
      className={`workout-card ${viewMode} ${workout.isCompleted ? 'completed' : 'pending'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="workout-card-content" onClick={onSelect}>
        {/* Workout Header */}
        <div className="workout-header">
          <div className="workout-title-section">
            <h3 className="workout-title">{workout.title}</h3>
            <div className="workout-meta">
              <span className={`difficulty-badge ${getDifficultyColor(workout.difficulty)}`}>
                <span className="difficulty-icon">{getDifficultyIcon(workout.difficulty)}</span>
                <span className="difficulty-text">{workout.difficulty}</span>
              </span>
              <span className="workout-type">{workout.workoutType}</span>
            </div>
          </div>
          
          <div className="workout-status">
            {workout.isCompleted ? (
              <div className="status-badge completed">
                <span className="status-icon">✅</span>
                <span className="status-text">Completed</span>
              </div>
            ) : (
              <div className="status-badge pending">
                <span className="status-icon">⏳</span>
                <span className="status-text">Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* Workout Description */}
        <div className="workout-description">
          <p>{workout.description}</p>
        </div>

        {/* Workout Details */}
        <div className="workout-details">
          <div className="detail-item">
            <span className="detail-icon">⏱️</span>
            <span className="detail-text">{workout.duration} min</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🏋️</span>
            <span className="detail-text">{workout.exercises.length} exercises</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span className="detail-text">{formatDate(workout.createdAt)}</span>
          </div>
        </div>

        {/* Equipment Tags */}
        {workout.equipment.length > 0 && (
          <div className="equipment-tags">
            {workout.equipment.slice(0, 3).map((equipment, index) => (
              <span key={index} className="equipment-tag">
                {equipment}
              </span>
            ))}
            {workout.equipment.length > 3 && (
              <span className="equipment-tag more">
                +{workout.equipment.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Workout Tags */}
        {workout.tags.length > 0 && (
          <div className="workout-tags">
            {workout.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="workout-tag">
                #{tag}
              </span>
            ))}
            {workout.tags.length > 3 && (
              <span className="workout-tag more">
                +{workout.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className={`workout-actions ${showActions ? 'visible' : ''}`}>
        <div className="primary-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            View Details
          </Button>
          
          {!workout.isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete();
              }}
            >
              Mark Complete
            </Button>
          )}
        </div>
        
        <div className="secondary-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Edit workout"
          >
            ✏️
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate workout"
          >
            📋
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCreateSimilar();
            }}
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
            className="delete-action"
          >
            🗑️
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutCard; 