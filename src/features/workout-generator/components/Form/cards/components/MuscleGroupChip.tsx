/**
 * Muscle Group Chip Component
 * 
 * Displays selected muscle groups as removable chips with expand/collapse functionality.
 */
import React from 'react';
import { MuscleGroup, MuscleGroupChipProps } from '../../../../types/muscle-types';
import { muscleGroupData } from '../../../../constants/muscle-data';

export const MuscleGroupChip: React.FC<MuscleGroupChipProps & {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}> = ({
  group,
  onRemove,
  selectedMuscleCount = 0,
  totalMuscleCount = 0,
  isExpanded = false,
  onToggleExpanded
}) => {
  const groupData = muscleGroupData[group];
  
  // Calculate completion percentage for visual indicator
  const completionPercentage = totalMuscleCount > 0 
    ? Math.round((selectedMuscleCount / totalMuscleCount) * 100)
    : 0;

  // Handle remove with confirmation for better UX
  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering expand/collapse
    onRemove(group);
  };

  // Handle expand/collapse
  const handleToggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    }
  };

  return (
    <div 
      className={`muscle-group-chip ${isExpanded ? 'expanded' : ''}`}
      onClick={handleToggleExpanded}
      role="button"
      tabIndex={0}
      aria-label={`${groupData.display} muscle group chip. ${selectedMuscleCount} of ${totalMuscleCount} muscles selected. Click to ${isExpanded ? 'collapse' : 'expand'} details.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggleExpanded();
        }
      }}
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
      {completionPercentage === 100 && (
        <div className="chip-complete-indicator" title="All muscles in this group selected">
          ✓
        </div>
      )}
    </div>
  );
}; 