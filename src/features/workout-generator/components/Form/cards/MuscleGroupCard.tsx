/**
 * Muscle Group Card Component
 * 
 * Advanced muscle group selector that replaces the Focus Area card.
 * Supports multi-selection with visual chips and expandable muscle grids.
 */
import React, { useState, useEffect } from 'react';
import { useProfile } from '../../../../profile/context';
import { 
  MuscleGroup, 
  MuscleSelectionData,
  MuscleSelectionValidation 
} from '../../../types/muscle-types';
import { 
  muscleGroupData, 
  MUSCLE_SELECTION_LIMITS 
} from '../../../constants/muscle-data';
import { 
  validateMuscleSelectionData,
  createMuscleSelectionSummary,
  canAddMoreGroups 
} from '../../../utils/muscle-helpers';
import { MuscleGroupDropdown } from './components/MuscleGroupDropdown';
import { MuscleGroupChip } from './components/MuscleGroupChip';
import { MuscleDetailGrid } from './components/MuscleDetailGrid';
import { MuscleSelectionSummary } from './components/MuscleSelectionSummary';
import './MuscleGroupCard.scss';

interface MuscleGroupCardProps {
  className?: string;
  onSelectionChange?: (selectionData: MuscleSelectionData) => void;
  initialSelection?: MuscleSelectionData;
}

/**
 * Main Muscle Group Card Component
 */
export const MuscleGroupCard: React.FC<MuscleGroupCardProps> = ({
  className = '',
  onSelectionChange,
  initialSelection
}) => {
  // Profile context integration
  const { state: profileState } = useProfile();
  const { profile, loading: profileLoading, error: profileError } = profileState;

  // Muscle selection state
  const [selectionData, setSelectionData] = useState<MuscleSelectionData>(
    initialSelection || {
      selectedGroups: [],
      selectedMuscles: {}
    }
  );

  // Expanded groups state (for muscle detail grids)
  const [expandedGroups, setExpandedGroups] = useState<Set<MuscleGroup>>(new Set());

  // Selection validation
  const [validation, setValidation] = useState<MuscleSelectionValidation | null>(null);

  // Update validation when selection changes
  useEffect(() => {
    const newValidation = validateMuscleSelectionData(selectionData);
    setValidation(newValidation);
    
    // Notify parent component of changes
    if (onSelectionChange) {
      onSelectionChange(selectionData);
    }
  }, [selectionData, onSelectionChange]);

  // Add muscle group
  const addMuscleGroup = (group: MuscleGroup) => {
    if (!canAddMoreGroups(selectionData) || selectionData.selectedGroups.includes(group)) {
      return;
    }

    setSelectionData(prev => ({
      ...prev,
      selectedGroups: [...prev.selectedGroups, group],
      selectedMuscles: {
        ...prev.selectedMuscles,
        [group]: [] // Initialize with empty muscle array
      }
    }));

    // Auto-expand the newly added group
    setExpandedGroups(prev => new Set([...prev, group]));
  };

  // Remove muscle group
  const removeMuscleGroup = (group: MuscleGroup) => {
    setSelectionData(prev => {
      const newSelectedMuscles = { ...prev.selectedMuscles };
      delete newSelectedMuscles[group];
      
      return {
        selectedGroups: prev.selectedGroups.filter(g => g !== group),
        selectedMuscles: newSelectedMuscles
      };
    });

    // Collapse the removed group
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(group);
      return newSet;
    });
  };

  // Toggle muscle in group
  const toggleMuscle = (group: MuscleGroup, muscle: string) => {
    setSelectionData(prev => {
      const currentMuscles = prev.selectedMuscles?.[group] || [];
      const isSelected = currentMuscles.includes(muscle);
      
      const newMuscles = isSelected
        ? currentMuscles.filter(m => m !== muscle)
        : [...currentMuscles, muscle];

      return {
        ...prev,
        selectedMuscles: {
          ...prev.selectedMuscles,
          [group]: newMuscles
        }
      };
    });
  };

  // Toggle expanded state for muscle detail grid
  const toggleExpanded = (group: MuscleGroup) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(group)) {
        newSet.delete(group);
      } else {
        newSet.add(group);
      }
      return newSet;
    });
  };

  // Get profile muscle preferences for header display
  const getProfileMusclePreferences = () => {
    if (!profile || profileLoading || profileError) return null;
    
    // Extract muscle-related data from profile
    // This would be integrated with the existing profile mapping system
    return {
      favoriteGroups: [], // Would come from profile.goals or similar
      lastTargeted: {} // Would come from workout history
    };
  };

  const profilePreferences = getProfileMusclePreferences();
  const selectionSummary = createMuscleSelectionSummary(selectionData);

  return (
    <div className={`muscle-group-card ${className}`}>
      <div className="muscle-card-structure">
        {/* HEADER: Profile Muscle Preferences Section */}
        <div className="muscle-card-header">
          {!profileLoading && !profileError && profilePreferences ? (
            <div className="profile-muscle-section">
              <div className="profile-muscle-label">Your Muscle Preferences:</div>
              <div className="profile-muscle-content">
                {profilePreferences.favoriteGroups.length > 0 ? (
                  <div className="profile-muscle-badges">
                    {profilePreferences.favoriteGroups.slice(0, 2).map((group) => (
                      <span 
                        key={group}
                        className="workout-type-badge profile-muscle-badge"
                        style={{ 
                          cursor: 'pointer',
                          opacity: 0.8
                        }}
                        title={`Click to select: ${muscleGroupData[group].display}`}
                        onClick={() => addMuscleGroup(group)}
                      >
                        <span className="workout-type-icon">{muscleGroupData[group].icon}</span>
                        {muscleGroupData[group].display}
                      </span>
                    ))}
                    {profilePreferences.favoriteGroups.length > 2 && (
                      <span className="muscle-more-indicator">
                        +{profilePreferences.favoriteGroups.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="profile-muscle-empty">
                    <span className="muscle-empty-text">Set up your profile to see muscle preferences</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="header-fallback">
              <div className="header-fallback-text">
                <span className="header-icon">🎯</span>
                <span>Target Muscles</span>
              </div>
              <div className="header-subtitle">Set up your profile to see muscle preferences</div>
            </div>
          )}
        </div>

        {/* BODY: Muscle Group Selector */}
        <div className="muscle-card-body">
          <div className="muscle-selector-container">
            
            {/* Selection Summary & Dropdown */}
            <div className="muscle-selection-header">
              <div className="muscle-selector-label">
                Select up to {MUSCLE_SELECTION_LIMITS.MAX_GROUPS} muscle groups:
              </div>
              
              {/* Selection Summary */}
              {selectionData.selectedGroups.length > 0 && (
                <MuscleSelectionSummary 
                  summary={selectionSummary}
                  validation={validation}
                />
              )}
              
              {/* Muscle Group Dropdown */}
              <MuscleGroupDropdown
                selectedGroups={selectionData.selectedGroups}
                onGroupSelect={addMuscleGroup}
                disabled={!canAddMoreGroups(selectionData)}
                maxGroups={MUSCLE_SELECTION_LIMITS.MAX_GROUPS}
                placeholder={
                  selectionData.selectedGroups.length === 0 
                    ? "Choose your first muscle group"
                    : canAddMoreGroups(selectionData)
                    ? `Add another muscle group (${selectionData.selectedGroups.length}/${MUSCLE_SELECTION_LIMITS.MAX_GROUPS})`
                    : `Maximum ${MUSCLE_SELECTION_LIMITS.MAX_GROUPS} groups selected`
                }
              />
            </div>

            {/* Selected Groups as Chips */}
            {selectionData.selectedGroups.length > 0 && (
              <div className="selected-muscle-groups">
                <div className="muscle-chips-container">
                  {selectionData.selectedGroups.map((group) => (
                    <MuscleGroupChip
                      key={group}
                      group={group}
                      onRemove={removeMuscleGroup}
                      selectedMuscleCount={selectionData.selectedMuscles?.[group]?.length || 0}
                      totalMuscleCount={muscleGroupData[group].muscles.length}
                      isExpanded={expandedGroups.has(group)}
                      onToggleExpanded={() => toggleExpanded(group)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Muscle Detail Grids */}
            {selectionData.selectedGroups.length > 0 && (
              <div className="muscle-detail-grids">
                {selectionData.selectedGroups.map((group) => (
                  <MuscleDetailGrid
                    key={group}
                    group={group}
                    selectedMuscles={selectionData.selectedMuscles?.[group] || []}
                    onMuscleToggle={(muscle) => toggleMuscle(group, muscle)}
                    isExpanded={expandedGroups.has(group)}
                    onToggleExpanded={() => toggleExpanded(group)}
                  />
                ))}
              </div>
            )}

            {/* Validation Messages */}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
              <div className="muscle-validation-messages">
                {validation.errors.map((error, index) => (
                  <div key={`error-${index}`} className="validation-error">
                    ⚠️ {error}
                  </div>
                ))}
                {validation.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="validation-warning">
                    💡 {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {selectionData.selectedGroups.length === 0 && (
              <div className="muscle-empty-state">
                <div className="empty-state-icon">🎯</div>
                <div className="empty-state-text">
                  <div className="empty-state-title">Choose Your Target Muscles</div>
                  <div className="empty-state-subtitle">
                    Select muscle groups to create a focused workout plan
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleGroupCard; 