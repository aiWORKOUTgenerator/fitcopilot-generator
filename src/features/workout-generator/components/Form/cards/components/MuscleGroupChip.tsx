/**
 * Muscle Group Chip Component
 * 
 * Displays selected muscle groups as removable chips with expand/collapse functionality.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */
import React, { useMemo } from 'react';
import { MuscleGroup, MuscleGroupChipProps } from '../../../../types/muscle-types';
import { muscleGroupData } from '../../../../constants/muscle-data';

export const MuscleGroupChip: React.FC<MuscleGroupChipProps & {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}> = React.memo(({
  group,
  onRemove,
  selectedMuscleCount = 0,
  totalMuscleCount = 0,
  isExpanded = false,
  onToggleExpanded
}) => {
  const groupData = muscleGroupData[group];
  
  // Memoize completion percentage calculation to prevent recalculation on every render
  const completionPercentage = useMemo(() => {
    return totalMuscleCount > 0 
      ? Math.round((selectedMuscleCount / totalMuscleCount) * 100)
      : 0;
  }, [selectedMuscleCount, totalMuscleCount]);

  // Memoize completion status to avoid repeated calculations
  const isComplete = useMemo(() => completionPercentage === 100, [completionPercentage]);

  // Handle remove with confirmation for better UX - memoized to prevent function recreation
  const handleRemove = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering expand/collapse
    onRemove(group);
  }, [onRemove, group]);

  // Handle expand/collapse - memoized to prevent function recreation
  const handleToggleExpanded = React.useCallback(() => {
    if (onToggleExpanded) {
      onToggleExpanded();
    }
  }, [onToggleExpanded]);

  // Memoize keyboard handler to prevent recreation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggleExpanded();
    }
  }, [handleToggleExpanded]);

  return (
    <div 
      className={`muscle-group-chip ${isExpanded ? 'expanded' : ''}`}
      onClick={handleToggleExpanded}
      role="button"
      tabIndex={0}
      aria-label={`${groupData.display} muscle group chip. ${selectedMuscleCount} of ${totalMuscleCount} muscles selected. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onKeyDown={handleKeyDown}
    >
      {/* Chip Content */}
      <div className="chip-content">
        {/* Icon and Group Name */}
        <div className="chip-main">
          <span className="chip-icon" role="img" aria-label={`${groupData.display} icon`}>
            {groupData.icon}
          </span>
          <span className="chip-label">{groupData.display}</span>
        </div>

        {/* Muscle Count Badge */}
        {selectedMuscleCount > 0 && (
          <div className="chip-badge" title={`${selectedMuscleCount} specific muscles selected`}>
            <span className="badge-count">{selectedMuscleCount}</span>
            <span className="badge-total">/{totalMuscleCount}</span>
          </div>
        )}

        {/* Expand/Collapse Indicator */}
        {onToggleExpanded && (
          <div className="chip-expand-indicator" title={isExpanded ? 'Collapse details' : 'Expand to select specific muscles'}>
            <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>
              ▼
            </span>
          </div>
        )}

        {/* Remove Button */}
        <button
          className="chip-remove"
          onClick={handleRemove}
          title={`Remove ${groupData.display} muscle group`}
          aria-label={`Remove ${groupData.display} muscle group`}
          type="button"
        >
          ✕
        </button>
      </div>

      {/* Progress Indicator */}
      {selectedMuscleCount > 0 && (
        <div className="chip-progress">
          <div 
            className="progress-bar"
            style={{ width: `${completionPercentage}%` }}
            role="progressbar"
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${completionPercentage}% of muscles selected in ${groupData.display}`}
          />
        </div>
      )}

      {/* Subtle completion indicator */}
      {isComplete && (
        <div className="chip-complete-indicator" title="All muscles in this group selected">
          ✓
        </div>
      )}
    </div>
  );
});

// Add display name for React DevTools
MuscleGroupChip.displayName = 'MuscleGroupChip'; 