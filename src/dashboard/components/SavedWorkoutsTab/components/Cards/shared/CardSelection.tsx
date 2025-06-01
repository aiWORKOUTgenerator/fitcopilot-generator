/**
 * Card Selection Component
 * 
 * Handles workout card selection overlay for bulk operations.
 * Extracted from EnhancedWorkoutCard as part of Week 2 Component Splitting.
 */
import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface CardSelectionProps {
  workout: {
    id: string | number;
    title: string;
  };
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelection: (id: string) => void;
}

/**
 * CardSelection Component - Selection overlay for bulk operations
 */
export const CardSelection: React.FC<CardSelectionProps> = ({
  workout,
  isSelected,
  isSelectionMode,
  onToggleSelection
}) => {
  const handleSelectionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelection(workout.id.toString());
  };

  if (!isSelectionMode) {
    return null;
  }

  return (
    <div className="selection-overlay">
      <button
        className={`selection-checkbox ${isSelected ? 'selected' : ''}`}
        onClick={handleSelectionToggle}
        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${workout.title}`}
        title={`${isSelected ? 'Deselect' : 'Select'} this workout`}
      >
        {isSelected ? <CheckCircle size={20} /> : <Circle size={20} />}
      </button>
    </div>
  );
};

export default CardSelection; 