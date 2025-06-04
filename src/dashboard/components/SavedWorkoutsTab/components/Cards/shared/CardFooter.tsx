/**
 * Card Footer Component
 * 
 * Displays workout footer information including creation date, rating, and completion status.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React from 'react';
import { Star, Calendar, CheckCircle } from 'lucide-react';
import { WorkoutFormatters } from '../../../utils/ui/formatters';

interface CardFooterProps {
  workout: {
    id: string | number;
    createdAt: string;
    isCompleted: boolean;
    completedAt?: string;
    rating?: number;
  };
  onRate?: (id: string, rating: number) => void;
  showDetailedDate?: boolean;
}

/**
 * CardFooter Component - Displays footer information
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  workout,
  onRate,
  showDetailedDate = false
}) => {
  const handleRating = (rating: number) => {
    if (onRate) {
      onRate(workout.id.toString(), rating);
    }
  };

  return (
    <div className="card-footer">
      {/* Left side - Date info */}
      <div className="footer-left">
        {workout.isCompleted && workout.completedAt ? (
          <div className="completion-info">
            <CheckCircle size={12} className="completion-icon" />
            <span>Completed {WorkoutFormatters.formatRelativeDate(workout.completedAt)}</span>
          </div>
        ) : (
          <div className="creation-info">
            <Calendar size={12} />
            <span>Created {WorkoutFormatters.formatRelativeDate(workout.createdAt)}</span>
          </div>
        )}

        {/* Detailed date for debugging */}
        {showDetailedDate && (
          <div className="detailed-date" style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            marginTop: '2px' 
          }}>
            Full date: {WorkoutFormatters.formatDate(workout.createdAt)}
          </div>
        )}
      </div>

      {/* Right side - Rating */}
      {onRate && (
        <div className="footer-right">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${workout.rating && workout.rating >= star ? 'filled' : ''}`}
                onClick={() => handleRating(star)}
                title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Star size={14} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardFooter; 