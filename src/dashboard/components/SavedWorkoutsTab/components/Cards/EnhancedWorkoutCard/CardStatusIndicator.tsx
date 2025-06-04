/**
 * Card Status Indicator Component
 * 
 * Displays visual status indicators for workout cards:
 * - Completion status
 * - Favorite status  
 * - Rating indicators
 * - Progress indicators
 */
import React from 'react';
import { Check, Heart, Star, Clock, Target } from 'lucide-react';
import { GeneratedWorkout } from '../../../types/workout';

export interface CardStatusIndicatorProps {
  workout: GeneratedWorkout;
  isHovered?: boolean;
  showCompletionStatus?: boolean;
  showFavoriteStatus?: boolean;
  showRating?: boolean;
  showProgress?: boolean;
}

export const CardStatusIndicator: React.FC<CardStatusIndicatorProps> = ({
  workout,
  isHovered = false,
  showCompletionStatus = true,
  showFavoriteStatus = true, 
  showRating = true,
  showProgress = false
}) => {
  const renderCompletionIndicator = () => {
    if (!showCompletionStatus) return null;

    return (
      <div className={`status-indicator status-indicator--completion ${workout.isCompleted ? 'completed' : 'pending'}`}>
        {workout.isCompleted ? (
          <div className="completion-badge">
            <Check size={14} />
            <span className="completion-text">Complete</span>
            {workout.completedAt && (
              <span className="completion-date">
                {new Date(workout.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ) : (
          <div className="pending-badge">
            <Clock size={14} />
            <span className="pending-text">Pending</span>
          </div>
        )}
      </div>
    );
  };

  const renderFavoriteIndicator = () => {
    if (!showFavoriteStatus || !workout.isFavorite) return null;

    return (
      <div className="status-indicator status-indicator--favorite">
        <Heart size={14} fill="currentColor" />
        <span className="favorite-text">Favorite</span>
      </div>
    );
  };

  const renderRatingIndicator = () => {
    if (!showRating || !workout.rating) return null;

    return (
      <div className="status-indicator status-indicator--rating">
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={12}
              fill={star <= workout.rating! ? 'currentColor' : 'transparent'}
              className={star <= workout.rating! ? 'star-filled' : 'star-empty'}
            />
          ))}
        </div>
        <span className="rating-text">{workout.rating}/5</span>
      </div>
    );
  };

  const renderDifficultyIndicator = () => {
    const difficultyConfig = {
      beginner: { color: '#10B981', icon: Target, text: 'Beginner' },
      intermediate: { color: '#F59E0B', icon: Target, text: 'Intermediate' },
      advanced: { color: '#EF4444', icon: Target, text: 'Advanced' }
    };

    const config = difficultyConfig[workout.difficulty];
    const Icon = config.icon;

    return (
      <div 
        className={`status-indicator status-indicator--difficulty difficulty--${workout.difficulty}`}
        style={{ color: config.color }}
      >
        <Icon size={12} />
        <span className="difficulty-text">{config.text}</span>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (!showProgress) return null;

    // Calculate progress based on completion or other metrics
    const progress = workout.isCompleted ? 100 : 0;

    return (
      <div className="status-indicator status-indicator--progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    );
  };

  // Don't render anything if no indicators should be shown
  const hasIndicators = showCompletionStatus || showFavoriteStatus || showRating || showProgress;
  if (!hasIndicators) return null;

  return (
    <div className={`card-status-indicators ${isHovered ? 'card-status-indicators--hovered' : ''}`}>
      {renderCompletionIndicator()}
      {renderFavoriteIndicator()}
      {renderRatingIndicator()}
      {renderDifficultyIndicator()}
      {renderProgressIndicator()}
    </div>
  );
};

// Default export for easier importing
export default CardStatusIndicator; 