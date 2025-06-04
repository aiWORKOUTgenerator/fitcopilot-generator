/**
 * Card Actions Menu Component
 * 
 * Enhanced action menu for workout cards with:
 * - Primary actions (view, edit, delete)
 * - Secondary actions (duplicate, create similar)
 * - Quick actions (favorite, rate, complete)
 * - Dropdown menu for additional options
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Edit, 
  Copy, 
  Plus, 
  Check, 
  Trash2, 
  Heart, 
  HeartOff, 
  MoreVertical,
  Star,
  Share,
  Download,
  Calendar
} from 'lucide-react';
import { GeneratedWorkout } from '../../../types/workout';

export interface CardActionsMenuProps {
  workout: GeneratedWorkout;
  showActions: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onCreateSimilar: () => void;
  onMarkComplete: () => void;
  onDelete: () => void;
  onToggleFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onShare?: (id: string) => void;
  onExport?: (id: string) => void;
  onSchedule?: (id: string) => void;
}

export const CardActionsMenu: React.FC<CardActionsMenuProps> = ({
  workout,
  showActions,
  onSelect,
  onEdit,
  onDuplicate,
  onCreateSimilar,
  onMarkComplete,
  onDelete,
  onToggleFavorite,
  onRate,
  onShare,
  onExport,
  onSchedule
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowRatingMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(String(workout.id));
    }
  };

  const handleRating = (rating: number) => {
    if (onRate) {
      onRate(String(workout.id), rating);
    }
    setShowRatingMenu(false);
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    setShowDropdown(false);
  };

  const renderPrimaryActions = () => (
    <div className="card-actions-primary">
      {/* View/Start Workout */}
      <button 
        className="action-btn action-btn--primary"
        onClick={handleAction(onSelect)}
        title="View workout details"
      >
        <Play size={16} />
      </button>

      {/* Edit */}
      <button 
        className="action-btn action-btn--secondary"
        onClick={handleAction(onEdit)}
        title="Edit workout"
      >
        <Edit size={16} />
      </button>

      {/* Favorite Toggle */}
      {onToggleFavorite && (
        <button 
          className={`action-btn action-btn--favorite ${workout.isFavorite ? 'favorited' : ''}`}
          onClick={handleFavoriteToggle}
          title={workout.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {workout.isFavorite ? <Heart size={16} fill="currentColor" /> : <HeartOff size={16} />}
        </button>
      )}
    </div>
  );

  const renderSecondaryActions = () => (
    <div className="card-actions-secondary">
      {/* Complete/Mark Complete */}
      {!workout.isCompleted && (
        <button 
          className="action-btn action-btn--complete"
          onClick={handleAction(onMarkComplete)}
          title="Mark as complete"
        >
          <Check size={16} />
          <span>Complete</span>
        </button>
      )}

      {/* Duplicate */}
      <button 
        className="action-btn action-btn--duplicate"
        onClick={handleAction(onDuplicate)}
        title="Duplicate workout"
      >
        <Copy size={16} />
        <span>Duplicate</span>
      </button>

      {/* Create Similar */}
      <button 
        className="action-btn action-btn--similar"
        onClick={handleAction(onCreateSimilar)}
        title="Create similar workout"
      >
        <Plus size={16} />
        <span>Similar</span>
      </button>
    </div>
  );

  const renderRatingMenu = () => {
    if (!showRatingMenu) return null;

    return (
      <div className="rating-menu">
        <div className="rating-menu__header">Rate this workout</div>
        <div className="rating-menu__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`rating-star ${star <= (workout.rating || 0) ? 'active' : ''}`}
              onClick={() => handleRating(star)}
            >
              <Star size={20} fill={star <= (workout.rating || 0) ? 'currentColor' : 'transparent'} />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdownMenu = () => {
    if (!showDropdown) return null;

    return (
      <div className="card-actions-dropdown" ref={dropdownRef}>
        {/* Rating */}
        {onRate && (
          <button 
            className="dropdown-item"
            onClick={() => setShowRatingMenu(!showRatingMenu)}
          >
            <Star size={16} />
            <span>Rate workout</span>
            {workout.rating && (
              <span className="current-rating">{workout.rating}/5</span>
            )}
          </button>
        )}

        {/* Share */}
        {onShare && (
          <button 
            className="dropdown-item"
            onClick={handleAction(() => onShare(String(workout.id)))}
          >
            <Share size={16} />
            <span>Share workout</span>
          </button>
        )}

        {/* Export */}
        {onExport && (
          <button 
            className="dropdown-item"
            onClick={handleAction(() => onExport(String(workout.id)))}
          >
            <Download size={16} />
            <span>Export workout</span>
          </button>
        )}

        {/* Schedule */}
        {onSchedule && (
          <button 
            className="dropdown-item"
            onClick={handleAction(() => onSchedule(String(workout.id)))}
          >
            <Calendar size={16} />
            <span>Schedule workout</span>
          </button>
        )}

        <div className="dropdown-divider" />

        {/* Delete */}
        <button 
          className="dropdown-item dropdown-item--danger"
          onClick={handleAction(onDelete)}
        >
          <Trash2 size={16} />
          <span>Delete workout</span>
        </button>

        {/* Rating submenu */}
        {renderRatingMenu()}
      </div>
    );
  };

  // Don't render if actions should be hidden
  if (!showActions) return null;

  return (
    <div className="card-actions-menu">
      {/* Primary Actions - Always visible when showing actions */}
      {renderPrimaryActions()}

      {/* Secondary Actions - Contextual */}
      {renderSecondaryActions()}

      {/* More Actions Dropdown */}
      <div className="card-actions-more">
        <button 
          className="action-btn action-btn--more"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown(!showDropdown);
          }}
          title="More actions"
        >
          <MoreVertical size={16} />
        </button>

        {renderDropdownMenu()}
      </div>
    </div>
  );
};

// Default export for easier importing
export default CardActionsMenu; 