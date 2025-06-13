/**
 * MuscleGroupCard Component
 * 
 * Enhanced muscle group selector that replaces the Focus Area card.
 * Maintains the same header/body structure while providing sophisticated
 * muscle targeting with up to 3 muscle groups and specific muscle selection.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useMuscleSelection } from '../../../../hooks/useMuscleSelection';
import { MuscleGroup } from '../../../../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_GROUP_DISPLAY_ORDER,
  getMusclesInGroup 
} from '../../../../constants/muscle-data';
import { ChevronDown, X, Plus } from 'lucide-react';
import './MuscleGroupCard.scss';

interface MuscleGroupCardProps {
  profileLoading?: boolean;
  profileError?: any;
  isProfileSufficient?: boolean;
  profileMapping?: any;
  // Optional callback for external integration (legacy bridge support)
  onSelectionChange?: () => void;
}

export const MuscleGroupCard: React.FC<MuscleGroupCardProps> = ({
  profileLoading = false,
  profileError = null,
  isProfileSufficient = false,
  profileMapping = null,
  onSelectionChange
}) => {
  
  /**
   * Initialize muscle selection with internal state management
   * Ensures reliable functionality independent of external systems
   */
  const muscleSelection = useMuscleSelection(3, true);
  const [expandedGroups, setExpandedGroups] = useState<Set<MuscleGroup>>(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  
  /**
   * Direct state reference for optimal performance
   * Prevents unnecessary re-renders and state conflicts
   */
  const stableSelectionData = muscleSelection.selectionData;
  
  /**
   * External sync callback with optimized dependencies
   * Provides integration with parent form systems
   */
  useEffect(() => {
    if (onSelectionChange && typeof onSelectionChange === 'function') {
      try {
        onSelectionChange();
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[MuscleGroupCard] External sync callback failed:', error);
        }
      }
    }
  }, [
    onSelectionChange,
    muscleSelection.selectionData.selectedGroups.length,
    Object.keys(muscleSelection.selectionData.selectedMuscles).length
  ]);
  
  /**
   * Handle muscle group selection from dropdown
   * Optimized for performance with minimal state updates
   */
  const handleGroupSelect = useCallback((group: MuscleGroup) => {
    if (!muscleSelection.isGroupSelected(group) && muscleSelection.canAddMore) {
      muscleSelection.addMuscleGroup(group);
      setExpandedGroups(prev => new Set([...prev, group]));
    }
    setShowDropdown(false);
  }, [muscleSelection]);
  
  /**
   * Handle muscle group removal with immediate UI feedback
   * Ensures consistent state between UI and data layers
   */
  const handleGroupRemove = useCallback((group: MuscleGroup) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(group);
      return newSet;
    });
    
    muscleSelection.removeMuscleGroup(group);
  }, [muscleSelection]);
  
  /**
   * Toggle expanded state for muscle detail grids
   * Provides progressive disclosure of muscle-specific options
   */
  const toggleGroupExpanded = useCallback((group: MuscleGroup) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  }, []);
  
  /**
   * Get available groups for dropdown selection
   * Memoized to prevent unnecessary recalculations and flickering
   */
  const availableGroups = useMemo(() => 
    MUSCLE_GROUP_DISPLAY_ORDER.filter(
      group => !stableSelectionData.selectedGroups.includes(group)
    ), [stableSelectionData.selectedGroups]
  );
  
  /**
   * Generate profile-based muscle preferences display
   * Maps user fitness goals to relevant muscle group suggestions
   */
  const getProfileMuscleDisplay = useCallback(() => {
    if (!profileMapping?.displayData?.goals) return null;
    
    // Map profile goals to suggested muscle groups
    const goalToMuscleMap: { [key: string]: MuscleGroup[] } = {
      'strength': [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Legs],
      'muscle': [MuscleGroup.Chest, MuscleGroup.Back, MuscleGroup.Arms],
      'cardio': [MuscleGroup.Legs, MuscleGroup.Core],
      'flexibility': [MuscleGroup.Core, MuscleGroup.Back],
      'endurance': [MuscleGroup.Legs, MuscleGroup.Core, MuscleGroup.Back]
    };
    
    const suggestedGroups = new Set<MuscleGroup>();
    profileMapping.displayData.goals.forEach((goal: any) => {
      const goalKey = goal.value.toLowerCase();
      if (goalToMuscleMap[goalKey]) {
        goalToMuscleMap[goalKey].forEach(group => suggestedGroups.add(group));
      }
    });
    
    return Array.from(suggestedGroups).slice(0, 3);
  }, [profileMapping]);
  
  const profileSuggestedGroups = getProfileMuscleDisplay();
  
  return (
    <div className="muscle-card-structure">
      {/* HEADER: Profile Muscle Recommendations + Selected Groups */}
      <div className="muscle-card-header">
        {!profileLoading && !profileError && isProfileSufficient && profileMapping && profileSuggestedGroups?.length ? (
          <div className="profile-muscle-section">
            <div className="profile-muscle-label">Suggested for Your Goals:</div>
            <div className="profile-muscle-suggestions">
              {profileSuggestedGroups.map((group: MuscleGroup) => (
                <button
                  key={group}
                  className={`muscle-suggestion-badge ${
                    stableSelectionData.selectedGroups.includes(group) ? 'suggestion-badge--selected' : ''
                  }`}
                  onClick={() => !stableSelectionData.selectedGroups.includes(group) && handleGroupSelect(group)}
                  disabled={stableSelectionData.selectedGroups.includes(group)}
                  title={`${muscleGroupData[group].description}`}
                  id={`muscle-suggestion-${group.toLowerCase()}`}
                  name={`muscle-suggestion`}
                  value={group}
                >
                  {muscleGroupData[group].display}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="header-fallback">
            <div className="header-fallback-text">
              <span>Target Muscles</span>
            </div>
            <div className="header-subtitle">Select up to 3 muscle groups to focus on</div>
          </div>
        )}
        
        {/* Selected Muscle Groups as Chips */}
        {stableSelectionData.selectedGroups.length > 0 && (
          <div className="selected-muscle-chips">
            {stableSelectionData.selectedGroups.map((group, index) => {
              const selectedMuscles = muscleSelection.getMusclesInGroup(group);
              const totalMuscles = getMusclesInGroup(group).length;
              return (
                <div 
                  key={`chip-${group}`} 
                  className="muscle-group-chip"
                >
                  <div className="chip-content">
                    <span className="chip-label">{muscleGroupData[group].display}</span>
                    {selectedMuscles.length > 0 && (
                      <span className="chip-count">({selectedMuscles.length}/{totalMuscles})</span>
                    )}
                  </div>
                  <button
                    className="chip-remove"
                    onClick={() => handleGroupRemove(group)}
                    title={`Remove ${muscleGroupData[group].display}`}
                    id={`remove-muscle-${group.toLowerCase()}`}
                    name={`remove-muscle-chip`}
                    value={group}
                    aria-label={`Remove ${muscleGroupData[group].display} muscle group`}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* BODY: Muscle Group Selector + Detail Grids */}
      <div className="muscle-card-body">
        {/* Muscle Group Dropdown Selector */}
        <div className="muscle-group-selector">
          <div className="selector-label">
            Select Muscle Groups ({stableSelectionData.selectedGroups.length}/3):
          </div>
          
          {stableSelectionData.selectedGroups.length < 3 && (
            <div className="dropdown-container">
              <button
                className="muscle-dropdown-trigger"
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={stableSelectionData.selectedGroups.length >= 3}
                aria-expanded={showDropdown}
                aria-haspopup="listbox"
                id="muscle-group-dropdown-trigger"
                name="muscle-group-selector"
              >
                <Plus size={14} />
                <span>Add Muscle Group</span>
                <ChevronDown size={14} className={`dropdown-chevron ${showDropdown ? 'chevron--open' : ''}`} />
              </button>
              
              {showDropdown && availableGroups.length > 0 && (
                <div 
                  className="muscle-dropdown-menu"
                  role="listbox"
                  aria-labelledby="muscle-group-dropdown-trigger"
                >
                  {availableGroups.map((group) => (
                    <button
                      key={group}
                      className="dropdown-option"
                      onClick={() => handleGroupSelect(group)}
                      title={muscleGroupData[group].description}
                      role="option"
                      id={`muscle-group-option-${group.toLowerCase()}`}
                      name={`muscle-group-option`}
                      value={group}
                    >
                      <div className="option-content">
                        <span className="option-label">{muscleGroupData[group].display}</span>
                        <span className="option-muscle-count">
                          {getMusclesInGroup(group).length} muscles
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {stableSelectionData.selectedGroups.length >= 3 && (
            <div className="selector-limit-message">
              Maximum 3 muscle groups selected. Remove one to add another.
            </div>
          )}
        </div>
        
        {/* Muscle Detail Grids for Selected Groups */}
        {stableSelectionData.selectedGroups.length > 0 && (
          <div className="muscle-detail-grids">
            {stableSelectionData.selectedGroups.map((group, index) => {
              const groupMuscles = getMusclesInGroup(group);
              const isExpanded = expandedGroups.has(group);
              const selectedMuscles = muscleSelection.getMusclesInGroup(group);
              
              return (
                <div key={`grid-${group}`} className="muscle-detail-grid">
                  <button
                    className="grid-header"
                    onClick={() => toggleGroupExpanded(group)}
                    title={`${isExpanded ? 'Collapse' : 'Expand'} ${muscleGroupData[group].display} details`}
                    id={`muscle-grid-toggle-${group.toLowerCase()}`}
                    name={`muscle-grid-toggle`}
                    value={group}
                    aria-expanded={isExpanded}
                    aria-controls={`muscle-grid-content-${group.toLowerCase()}`}
                  >
                    <div className="grid-header-content">
                      <span className="grid-title">{muscleGroupData[group].display}</span>
                      <span className="grid-progress">
                        {selectedMuscles.length > 0 ? `${selectedMuscles.length}/${groupMuscles.length}` : 'All'}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`grid-chevron ${isExpanded ? 'chevron--open' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div 
                      className="muscle-options-grid"
                      id={`muscle-grid-content-${group.toLowerCase()}`}
                      role="group"
                      aria-labelledby={`muscle-grid-toggle-${group.toLowerCase()}`}
                    >
                      {groupMuscles.map((muscle) => {
                        const isSelected = muscleSelection.isMuscleSelected(group, muscle);
                        return (
                          <label
                            key={muscle}
                            className={`muscle-option ${isSelected ? 'muscle-option--selected' : ''}`}
                            htmlFor={`muscle-${group}-${muscle.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <input
                              type="checkbox"
                              id={`muscle-${group}-${muscle.replace(/\s+/g, '-').toLowerCase()}`}
                              name={`muscle-selection-${group}`}
                              value={muscle}
                              checked={isSelected}
                              onChange={() => muscleSelection.toggleMuscle(group, muscle)}
                              className="muscle-checkbox"
                              aria-label={`Select ${muscle} in ${muscleGroupData[group].display} group`}
                            />
                            <span className="muscle-label">{muscle}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Selection Summary */}
        {stableSelectionData.selectedGroups.length === 0 && (
          <div className="selection-empty-state">
            <div className="empty-state-title">No muscle groups selected</div>
            <div className="empty-state-subtitle">
              Choose up to 3 muscle groups to create a focused workout
            </div>
          </div>
        )}
        
        {stableSelectionData.selectedGroups.length > 0 && (
          <div className="selection-summary">
            <div className="summary-text">
              {muscleSelection.getSelectionSummary().displayText}
            </div>
            {muscleSelection.validation.warnings.length > 0 && (
              <div className="summary-warnings">
                {muscleSelection.validation.warnings.map((warning, index) => (
                  <div key={index} className="warning-item">⚠️ {warning}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 