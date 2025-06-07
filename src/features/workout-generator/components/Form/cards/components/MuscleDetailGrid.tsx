/**
 * Muscle Detail Grid Component
 * 
 * Expandable grid for selecting specific muscles within a muscle group.
 */
import React from 'react';
import { MuscleGroup, MuscleDetailGridProps } from '../../../../types/muscle-types';
import { muscleGroupData } from '../../../../constants/muscle-data';

export const MuscleDetailGrid: React.FC<MuscleDetailGridProps> = ({
  group,
  selectedMuscles = [],
  onMuscleToggle,
  isExpanded = false,
  onToggleExpanded
}) => {
  const groupData = muscleGroupData[group];
  const muscles = groupData.muscles;

  // Quick select/deselect all muscles in group
  const handleSelectAll = () => {
    const allSelected = muscles.every(muscle => selectedMuscles.includes(muscle));
    
    if (allSelected) {
      // Deselect all
      muscles.forEach(muscle => {
        if (selectedMuscles.includes(muscle)) {
          onMuscleToggle(muscle);
        }
      });
    } else {
      // Select all
      muscles.forEach(muscle => {
        if (!selectedMuscles.includes(muscle)) {
          onMuscleToggle(muscle);
        }
      });
    }
  };

  // Calculate selection stats
  const selectedCount = selectedMuscles.length;
  const totalCount = muscles.length;
  const allSelected = selectedCount === totalCount;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  if (!isExpanded) {
    return null;
  }

  return (
    <div className="muscle-detail-grid" role="region" aria-label={`${groupData.display} muscle selection`}>
      {/* Grid Header */}
      <div className="muscle-grid-header">
        <div className="grid-title">
          <span className="grid-icon">{groupData.icon}</span>
          <span className="grid-label">{groupData.display} Muscles</span>
          <span className="grid-count">
            ({selectedCount}/{totalCount} selected)
          </span>
        </div>
        
        {/* Select All Toggle */}
        <div className="grid-controls">
          <button
            className={`select-all-btn ${allSelected ? 'all-selected' : someSelected ? 'some-selected' : ''}`}
            onClick={handleSelectAll}
            title={allSelected ? 'Deselect all muscles' : 'Select all muscles'}
            aria-label={`${allSelected ? 'Deselect' : 'Select'} all muscles in ${groupData.display}`}
            type="button"
          >
            <span className="select-all-icon">
              {allSelected ? '☑️' : someSelected ? '◐' : '☐'}
            </span>
            <span className="select-all-text">
              {allSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>
          
          {/* Collapse Button */}
          <button
            className="collapse-btn"
            onClick={onToggleExpanded}
            title="Collapse muscle selection"
            aria-label={`Collapse ${groupData.display} muscle selection`}
            type="button"
          >
            ▲
          </button>
        </div>
      </div>

      {/* Muscle Grid */}
      <div 
        className="muscle-options-grid"
        role="group"
        aria-label={`${groupData.display} muscle checkboxes`}
      >
        {muscles.map((muscle) => {
          const isSelected = selectedMuscles.includes(muscle);
          
          return (
            <label
              key={muscle}
              className={`muscle-option ${isSelected ? 'selected' : ''}`}
              title={`${isSelected ? 'Deselect' : 'Select'} ${muscle}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onMuscleToggle(muscle)}
                aria-label={`${muscle} muscle`}
                className="muscle-checkbox"
              />
              <span className="muscle-checkbox-custom">
                {isSelected && <span className="checkbox-checkmark">✓</span>}
              </span>
              <span className="muscle-label">{muscle}</span>
            </label>
          );
        })}
      </div>

      {/* Grid Footer */}
      <div className="muscle-grid-footer">
        {selectedCount > 0 ? (
          <div className="selection-summary">
            <span className="summary-icon">🎯</span>
            <span className="summary-text">
              {selectedCount === 1 
                ? `${selectedMuscles[0]} selected`
                : selectedCount === totalCount
                ? `All ${groupData.display.toLowerCase()} muscles selected`
                : `${selectedCount} of ${totalCount} muscles selected`
              }
            </span>
          </div>
        ) : (
          <div className="no-selection">
            <span className="no-selection-icon">💡</span>
            <span className="no-selection-text">
              Select specific muscles or leave empty to target the entire {groupData.display.toLowerCase()} group
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 