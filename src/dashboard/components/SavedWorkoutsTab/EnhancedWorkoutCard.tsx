/**
 * Enhanced Workout Card Component
 * 
 * Improved workout card with micro-interactions, hover effects,
 * bulk selection capabilities, and better visual hierarchy.
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Edit3, 
  Copy, 
  Trash2, 
  MoreVertical,
  Clock,
  Target,
  Zap,
  CheckCircle,
  Circle,
  Calendar,
  User,
  Heart,
  HeartOff,
  Star,
  ExternalLink
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button/Button';
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
 * Enhanced Workout Card Component
 */
export const EnhancedWorkoutCard: React.FC<EnhancedWorkoutCardProps> = ({
  workout,
  viewMode,
  isSelected = false,
  isSelectionMode = false,
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
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const moreActionsRef = useRef<HTMLDivElement>(null);

  // Close more actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
        setShowMoreActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get difficulty configuration
  const difficultyConfig = DIFFICULTY_CONFIG[workout.difficulty];

  // Format date display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Handle selection toggle
  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSelection) {
      onToggleSelection(workout.id);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(workout.id);
    }
  };

  // Handle rating
  const handleRating = (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRate) {
      onRate(workout.id, rating);
    }
  };

  // Handle action clicks
  const handleActionClick = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoreActions(false);
    action();
  };

  // Generate workout thumbnail (placeholder for now)
  const generateThumbnail = () => {
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    const color = colors[workout.id.length % colors.length];
    return (
      <div 
        className="workout-thumbnail"
        style={{ backgroundColor: color }}
      >
        <span className="thumbnail-icon">
          {workout.workoutType === 'Cardio' ? '🏃' : 
           workout.workoutType === 'Strength' ? '💪' : 
           workout.workoutType === 'Flexibility' ? '🧘' : '🏋️'}
        </span>
      </div>
    );
  };

  return (
    <Card 
      ref={cardRef}
      className={`enhanced-workout-card ${viewMode} ${workout.isCompleted ? 'completed' : 'pending'} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
        setShowMoreActions(false);
      }}
    >
      {/* Selection Overlay */}
      {isSelectionMode && (
        <div className="selection-overlay">
          <button
            className={`selection-checkbox ${isSelected ? 'selected' : ''}`}
            onClick={handleSelectionToggle}
            aria-label={`${isSelected ? 'Deselect' : 'Select'} ${workout.title}`}
          >
            {isSelected ? <CheckCircle size={20} /> : <Circle size={20} />}
          </button>
        </div>
      )}

      {/* Card Header */}
      <div className="card-header">
        {/* Workout Thumbnail */}
        <div className="workout-thumbnail-container">
          {generateThumbnail()}
          
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

        {/* Workout Info */}
        <div className="workout-info" onClick={onSelect}>
          <div className="workout-title-row">
            <h3 className="workout-title">{workout.title}</h3>
            
            {/* Favorite Button */}
            <button
              className={`favorite-btn ${workout.isFavorite ? 'favorited' : ''}`}
              onClick={handleFavoriteToggle}
              title={workout.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {workout.isFavorite ? <Heart size={16} /> : <HeartOff size={16} />}
            </button>
          </div>

          {/* Workout Meta */}
          <div className="workout-meta">
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
            </div>

            <div className="meta-stats">
              <div className="stat-item">
                <Clock size={14} />
                <span>{workout.duration} min</span>
              </div>
              <div className="stat-item">
                <Target size={14} />
                <span>{workout.exercises.length} exercises</span>
              </div>
            </div>
          </div>

          {/* Workout Description (Grid mode only) */}
          {viewMode === 'grid' && (
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

        {/* More Actions */}
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
              >
                <ExternalLink size={14} />
                View Details
              </button>
              <button
                className="action-item"
                onClick={(e) => handleActionClick(onEdit, e)}
              >
                <Edit3 size={14} />
                Edit
              </button>
              <button
                className="action-item"
                onClick={(e) => handleActionClick(onDuplicate, e)}
              >
                <Copy size={14} />
                Duplicate
              </button>
              <button
                className="action-item"
                onClick={(e) => handleActionClick(onCreateSimilar, e)}
              >
                <Zap size={14} />
                Create Similar
              </button>
              <div className="action-divider"></div>
              <button
                className="action-item"
                onClick={(e) => handleActionClick(onMarkComplete, e)}
              >
                <CheckCircle size={14} />
                {workout.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
              <button
                className="action-item danger"
                onClick={(e) => handleActionClick(onDelete, e)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        <div className="footer-left">
          <div className="status-info">
            {workout.isCompleted ? (
              <div className="status-badge completed">
                <CheckCircle size={14} />
                <span>Completed {workout.completedAt ? formatDate(workout.completedAt) : ''}</span>
              </div>
            ) : (
              <div className="status-badge pending">
                <Circle size={14} />
                <span>Not completed</span>
              </div>
            )}
          </div>
          
          <div className="creation-date">
            <Calendar size={12} />
            <span>Created {formatDate(workout.createdAt)}</span>
          </div>
        </div>

        <div className="footer-right">
          {/* Rating Stars */}
          {workout.rating !== undefined && onRate && (
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star ${star <= (workout.rating || 0) ? 'filled' : ''}`}
                  onClick={(e) => handleRating(star, e)}
                  title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                >
                  <Star size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion Progress Bar */}
      {workout.isCompleted && (
        <div className="completion-indicator"></div>
      )}

      {/* Hover Enhancement */}
      {isHovered && (
        <div className="hover-enhancement"></div>
      )}
    </Card>
  );
};

export default EnhancedWorkoutCard; 