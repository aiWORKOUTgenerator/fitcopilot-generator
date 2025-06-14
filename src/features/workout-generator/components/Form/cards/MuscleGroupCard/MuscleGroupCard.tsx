/**
 * MuscleGroupCard Component
 * 
 * Enhanced muscle group selector that replaces the Focus Area card.
 * Maintains the same header/body structure while providing sophisticated
 * muscle targeting with up to 3 muscle groups and specific muscle selection.
 * Optimized for performance with memoized calculations and error boundaries.
 */

import React, { useState, useEffect, useCallback, useMemo, ErrorInfo } from 'react';
import { useMuscleSelection } from '../../../../hooks/useMuscleSelection';
import { useWorkoutForm } from '../../../../hooks/useWorkoutForm';
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

// Error Boundary Component for robust error handling
class MuscleGroupErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[MuscleGroupCard] Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="muscle-card-error">
          <div className="error-title">Unable to load muscle group selector</div>
          <div className="error-subtitle">Please refresh the page to try again</div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton component for better perceived performance
const MuscleGroupSkeleton: React.FC = () => (
  <div className="muscle-card-skeleton">
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-subtitle"></div>
    </div>
    <div className="skeleton-body">
      <div className="skeleton-dropdown"></div>
      <div className="skeleton-chips">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-chip"></div>
        ))}
      </div>
    </div>
  </div>
);

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
   * Memoize stable selection data to prevent unnecessary re-renders
   * Only updates when actual selection data changes
   */
  const stableSelectionData = useMemo(() => 
    muscleSelection.selectionData, 
    [
      muscleSelection.selectionData.selectedGroups.length,
      Object.keys(muscleSelection.selectionData.selectedMuscles).length
    ]
  );
  
  /**
   * HYBRID SYNC: Update form with muscle targeting data for completion calculation
   */
  const { updateForm } = useWorkoutForm();
  
  useEffect(() => {
    if (stableSelectionData.selectedGroups.length > 0) {
      const muscleTargeting = {
        targetMuscleGroups: stableSelectionData.selectedGroups,
        specificMuscles: stableSelectionData.selectedMuscles,
        primaryFocus: stableSelectionData.selectedGroups[0],
        selectionSummary: muscleSelection.getSelectionSummary().displayText
      };
      
      updateForm({ muscleTargeting });
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[MuscleGroupCard] Syncing muscle data to form:', {
          muscleTargeting,
          selectionData: stableSelectionData
        });
      }
    } else {
      // Clear muscle targeting when no selection
      updateForm({ muscleTargeting: undefined });
    }
  }, [
    stableSelectionData.selectedGroups.length,
    Object.keys(stableSelectionData.selectedMuscles).length,
    updateForm,
    muscleSelection
  ]);
  
  /**
   * External sync callback with optimized dependencies
   * Provides integration with parent form systems
   */
  useEffect(() => {
    if (onSelectionChange && typeof onSelectionChange === 'function') {
      try {
        onSelectionChange();
      } catch (error) {
        console.warn('[MuscleGroupCard] External sync callback failed:', error);
      }
    }
  }, [
    onSelectionChange,
    stableSelectionData.selectedGroups.length,
    Object.keys(stableSelectionData.selectedMuscles).length
  ]);
  
  /**
   * Memoized profile-based muscle preferences with error handling
   * Maps user fitness goals to relevant muscle group suggestions
   */
  const profileSuggestedGroups = useMemo(() => {
    try {
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
        const goalKey = goal.value?.toLowerCase() || goal.toLowerCase?.() || '';
        if (goalToMuscleMap[goalKey]) {
          goalToMuscleMap[goalKey].forEach(group => suggestedGroups.add(group));
        }
      });
      
      return Array.from(suggestedGroups).slice(0, 3);
    } catch (error) {
      console.warn('[MuscleGroupCard] Profile suggestions calculation failed:', error);
      return null;
    }
  }, [profileMapping?.displayData?.goals]);
  
  /**
   * Memoized available groups for dropdown selection
   * Prevents unnecessary recalculations and flickering
   */
  const availableGroups = useMemo(() => 
    MUSCLE_GROUP_DISPLAY_ORDER.filter(
      group => !stableSelectionData.selectedGroups.includes(group)
    ), [stableSelectionData.selectedGroups]
  );
  
  /**
   * Memoized selection statistics for performance
   */
  const selectionStats = useMemo(() => {
    const totalSelected = stableSelectionData.selectedGroups.length;
    const canAddMore = totalSelected < 3;
    const hasSelection = totalSelected > 0;
    const isAtLimit = totalSelected >= 3;
    
    return { totalSelected, canAddMore, hasSelection, isAtLimit };
  }, [stableSelectionData.selectedGroups.length]);
  
  /**
   * Handle muscle group selection from dropdown
   * Optimized for performance with minimal state updates
   */
  const handleGroupSelect = useCallback((group: MuscleGroup) => {
    try {
      if (!muscleSelection.isGroupSelected(group) && muscleSelection.canAddMore) {
        muscleSelection.addMuscleGroup(group);
        setExpandedGroups(prev => new Set([...prev, group]));
      }
      setShowDropdown(false);
    } catch (error) {
      console.error('[MuscleGroupCard] Error selecting group:', error);
    }
  }, [muscleSelection]);
  
  /**
   * Handle muscle group removal with immediate UI feedback
   * Ensures consistent state between UI and data layers
   */
  const handleGroupRemove = useCallback((group: MuscleGroup) => {
    try {
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(group);
        return newSet;
      });
      
      muscleSelection.removeMuscleGroup(group);
    } catch (error) {
      console.error('[MuscleGroupCard] Error removing group:', error);
    }
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
   * Memoized muscle selection toggle handler
   */
  const handleMuscleToggle = useCallback((group: MuscleGroup, muscle: string) => {
    try {
      muscleSelection.toggleMuscle(group, muscle);
    } catch (error) {
      console.error('[MuscleGroupCard] Error toggling muscle:', error);
    }
  }, [muscleSelection]);
  
  // Show loading skeleton while profile is loading
  if (profileLoading) {
    return <MuscleGroupSkeleton />;
  }
  
  return (
    <MuscleGroupErrorBoundary>
      <div className="muscle-card-structure">
        {/* HEADER: Profile Muscle Recommendations + Selected Groups */}
        <div className="muscle-card-header">
          {!profileError && isProfileSufficient && profileMapping && profileSuggestedGroups?.length ? (
            <div className="profile-muscle-section">
              <div className="profile-muscle-label">Suggested for Your Goals:</div>
              <div className="profile-muscle-suggestions">
                {profileSuggestedGroups.map((group: MuscleGroup) => (
                  <ProfileSuggestionBadge
                    key={group}
                    group={group}
                    isSelected={stableSelectionData.selectedGroups.includes(group)}
                    onSelect={handleGroupSelect}
                  />
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
          {selectionStats.hasSelection && (
            <div className="selected-muscle-chips">
              {stableSelectionData.selectedGroups.map((group) => {
                const selectedMuscles = muscleSelection.getMusclesInGroup(group);
                const totalMuscles = getMusclesInGroup(group).length;
                return (
                  <MuscleGroupChipMemo
                    key={`chip-${group}`}
                    group={group}
                    selectedCount={selectedMuscles.length}
                    totalCount={totalMuscles}
                    onRemove={handleGroupRemove}
                  />
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
              Select Muscle Groups ({selectionStats.totalSelected}/3):
            </div>
            
            {!selectionStats.isAtLimit && (
              <div className="dropdown-container">
                <button
                  className="muscle-dropdown-trigger"
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={selectionStats.isAtLimit}
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
                      <DropdownOptionMemo
                        key={group}
                        group={group}
                        onSelect={handleGroupSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {selectionStats.isAtLimit && (
              <div className="selector-limit-message">
                Maximum 3 muscle groups selected. Remove one to add another.
              </div>
            )}
          </div>
          
          {/* Muscle Detail Grids for Selected Groups */}
          {selectionStats.hasSelection && (
            <div className="muscle-detail-grids">
              {stableSelectionData.selectedGroups.map((group) => (
                <MuscleDetailGridMemo
                  key={`grid-${group}`}
                  group={group}
                  isExpanded={expandedGroups.has(group)}
                  onToggleExpanded={toggleGroupExpanded}
                  onMuscleToggle={handleMuscleToggle}
                  muscleSelection={muscleSelection}
                />
              ))}
            </div>
          )}
          
          {/* Selection Summary and Empty State */}
          {!selectionStats.hasSelection ? (
            <div className="selection-empty-state">
              <div className="empty-state-title">No muscle groups selected</div>
              <div className="empty-state-subtitle">
                Choose up to 3 muscle groups to create a focused workout
              </div>
            </div>
          ) : (
            <SelectionSummaryMemo 
              muscleSelection={muscleSelection}
              selectionData={stableSelectionData}
            />
          )}
        </div>
      </div>
    </MuscleGroupErrorBoundary>
  );
};

// Memoized sub-components for better performance
const ProfileSuggestionBadge = React.memo<{
  group: MuscleGroup;
  isSelected: boolean;
  onSelect: (group: MuscleGroup) => void;
}>(({ group, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    if (!isSelected) onSelect(group);
  }, [group, isSelected, onSelect]);
  
  return (
    <button
      className={`muscle-suggestion-badge ${isSelected ? 'suggestion-badge--selected' : ''}`}
      onClick={handleClick}
      disabled={isSelected}
      title={muscleGroupData[group].description}
      id={`muscle-suggestion-${group.toLowerCase()}`}
      name="muscle-suggestion"
      value={group}
    >
      {muscleGroupData[group].display}
    </button>
  );
});

const MuscleGroupChipMemo = React.memo<{
  group: MuscleGroup;
  selectedCount: number;
  totalCount: number;
  onRemove: (group: MuscleGroup) => void;
}>(({ group, selectedCount, totalCount, onRemove }) => {
  const handleRemove = useCallback(() => onRemove(group), [group, onRemove]);
  
  return (
    <div className="muscle-group-chip">
      <div className="chip-content">
        <span className="chip-label">{muscleGroupData[group].display}</span>
        {selectedCount > 0 && (
          <span className="chip-count">({selectedCount}/{totalCount})</span>
        )}
      </div>
      <button
        className="chip-remove"
        onClick={handleRemove}
        title={`Remove ${muscleGroupData[group].display}`}
        id={`remove-muscle-${group.toLowerCase()}`}
        name="remove-muscle-chip"
        value={group}
        aria-label={`Remove ${muscleGroupData[group].display} muscle group`}
      >
        <X size={12} />
      </button>
    </div>
  );
});

const DropdownOptionMemo = React.memo<{
  group: MuscleGroup;
  onSelect: (group: MuscleGroup) => void;
}>(({ group, onSelect }) => {
  const handleClick = useCallback(() => onSelect(group), [group, onSelect]);
  
  return (
    <button
      className="dropdown-option"
      onClick={handleClick}
      title={muscleGroupData[group].description}
      role="option"
      id={`muscle-group-option-${group.toLowerCase()}`}
      name="muscle-group-option"
      value={group}
    >
      <div className="option-content">
        <span className="option-label">{muscleGroupData[group].display}</span>
        <span className="option-muscle-count">
          {getMusclesInGroup(group).length} muscles
        </span>
      </div>
    </button>
  );
});

const MuscleDetailGridMemo = React.memo<{
  group: MuscleGroup;
  isExpanded: boolean;
  onToggleExpanded: (group: MuscleGroup) => void;
  onMuscleToggle: (group: MuscleGroup, muscle: string) => void;
  muscleSelection: any;
}>(({ group, isExpanded, onToggleExpanded, onMuscleToggle, muscleSelection }) => {
  const groupMuscles = useMemo(() => getMusclesInGroup(group), [group]);
  const selectedMuscles = useMemo(() => muscleSelection.getMusclesInGroup(group), [muscleSelection, group]);
  
  const handleToggle = useCallback(() => onToggleExpanded(group), [group, onToggleExpanded]);
  
  return (
    <div className="muscle-detail-grid">
      <button
        className="grid-header"
        onClick={handleToggle}
        title={`${isExpanded ? 'Collapse' : 'Expand'} ${muscleGroupData[group].display} details`}
        id={`muscle-grid-toggle-${group.toLowerCase()}`}
        name="muscle-grid-toggle"
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
          {groupMuscles.map((muscle) => (
            <MuscleOptionMemo
              key={muscle}
              group={group}
              muscle={muscle}
              isSelected={muscleSelection.isMuscleSelected(group, muscle)}
              onToggle={onMuscleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const MuscleOptionMemo = React.memo<{
  group: MuscleGroup;
  muscle: string;
  isSelected: boolean;
  onToggle: (group: MuscleGroup, muscle: string) => void;
}>(({ group, muscle, isSelected, onToggle }) => {
  const handleChange = useCallback(() => onToggle(group, muscle), [group, muscle, onToggle]);
  const muscleId = `muscle-${group}-${muscle.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <label
      className={`muscle-option ${isSelected ? 'muscle-option--selected' : ''}`}
      htmlFor={muscleId}
    >
      <input
        type="checkbox"
        id={muscleId}
        name={`muscle-selection-${group}`}
        value={muscle}
        checked={isSelected}
        onChange={handleChange}
        className="muscle-checkbox"
        aria-label={`Select ${muscle} in ${muscleGroupData[group].display} group`}
      />
      <span className="muscle-label">{muscle}</span>
    </label>
  );
});

const SelectionSummaryMemo = React.memo<{
  muscleSelection: any;
  selectionData: any;
}>(({ muscleSelection }) => {
  const summary = useMemo(() => muscleSelection.getSelectionSummary(), [muscleSelection]);
  const warnings = useMemo(() => muscleSelection.validation.warnings, [muscleSelection.validation.warnings]);
  
  return (
    <div className="selection-summary">
      <div className="summary-text">
        {summary.displayText}
      </div>
      {warnings.length > 0 && (
        <div className="summary-warnings">
          {warnings.map((warning: string, index: number) => (
            <div key={index} className="warning-item">⚠️ {warning}</div>
          ))}
        </div>
      )}
    </div>
  );
});

// Add display names for React DevTools
ProfileSuggestionBadge.displayName = 'ProfileSuggestionBadge';
MuscleGroupChipMemo.displayName = 'MuscleGroupChipMemo';
DropdownOptionMemo.displayName = 'DropdownOptionMemo';
MuscleDetailGridMemo.displayName = 'MuscleDetailGridMemo';
MuscleOptionMemo.displayName = 'MuscleOptionMemo';
SelectionSummaryMemo.displayName = 'SelectionSummaryMemo'; 