/**
 * Card Footer Component
 * 
 * Displays workout status, creation date, and rating stars.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React from 'react';
import { CheckCircle, Circle, Calendar, Star } from 'lucide-react';

interface CardFooterProps {
  workout: {
    id: string | number;
    isCompleted: boolean;
    completedAt?: string;
    createdAt: string;
    rating?: number;
  };
  onRate?: (id: string, rating: number) => void;
  showDetailedDate?: boolean;
}

/**
 * CardFooter Component - Displays status, dates, and rating
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  workout,
  onRate,
  showDetailedDate = false
}) => {
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

  // Format detailed date with time for debugging
  const formatDetailedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRating = (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRate) {
      onRate(workout.id.toString(), rating);
    }
  };

  return (
    <div className="card-footer">
      <div className="footer-left">
        {/* Status Info */}
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
        
        {/* Creation Date */}
        <div className="creation-date">
          <Calendar size={12} />
          <span>Created {formatDate(workout.createdAt)}</span>
          
          {/* Debug: Show detailed date info */}
          {showDetailedDate && (
            <div style={{ 
              fontSize: '0.6rem', 
              opacity: 0.6, 
              marginTop: '2px' 
            }}>
              {formatDetailedDate(workout.createdAt)}
            </div>
          )}
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
  );
};

export default CardFooter; 