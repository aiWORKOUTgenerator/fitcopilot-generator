/**
 * Enhanced Workout Editor Component
 * 
 * Main component for editing workouts with premium glass morphism design,
 * accessibility enhancements, design system integration, auto-save functionality,
 * real-time validation, and unsaved changes management.
 */
import React, { useEffect } from 'react';
import { useWorkoutEditor } from './WorkoutEditorContext';
import { Button, Input, Select } from '../../../../components/ui';
import { AutoResizeTextarea } from '../../../../components/ui/AutoResizeTextarea';
import { ExpandableInput } from '../../../../components/ui/ExpandableInput';
import { AutoResizeTextareaWithCounter } from '../../../../components/ui/AutoResizeTextareaWithCounter';
import { FormFieldEnhanced } from '../../../profile/components/enhanced/FormFieldEnhanced';
import { X, Save, Loader, Edit3, FileText, Clock, Target, Dumbbell, Settings, Check, AlertCircle } from 'lucide-react';
import { WorkoutDifficulty } from '../../types/workout';
import { saveWorkout } from '../../services/workoutService';
import ExerciseList from './ExerciseList';

// Import our modular enhancements
import { 
  useAutoSave, 
  useWorkoutValidation, 
  useUnsavedChanges,
  type UseAutoSaveOptions 
} from './hooks';
import { 
  SaveStatusIndicator, 
  ValidationFeedback, 
  UnsavedChangesWarning 
} from './components';

import './workoutEditor.scss';

// Equipment options for workout editor
const EQUIPMENT_OPTIONS = [
  { id: 'none', label: 'None/Bodyweight Only' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance-bands', label: 'Resistance Bands' },
  { id: 'pull-up-bar', label: 'Pull-up Bar' },
  { id: 'yoga-mat', label: 'Yoga Mat' },
  { id: 'bench', label: 'Bench' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'trx', label: 'TRX/Suspension Trainer' },
  { id: 'medicine-ball', label: 'Medicine Ball' },
  { id: 'jump-rope', label: 'Jump Rope' },
  { id: 'stability-ball', label: 'Stability Ball' }
];

// Daily workout focus options for workout editor
const GOAL_OPTIONS = [
  { value: 'lose-weight', label: 'Fat Burning & Cardio' },
  { value: 'build-muscle', label: 'Muscle Building' },
  { value: 'improve-endurance', label: 'Endurance & Stamina' },
  { value: 'increase-strength', label: 'Strength Training' },
  { value: 'enhance-flexibility', label: 'Flexibility & Mobility' },
  { value: 'general-fitness', label: 'General Fitness' },
  { value: 'sport-specific', label: 'Sport-Specific Training' }
];

// Focus area options for session factors
const FOCUS_AREA_OPTIONS = [
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'lower-body', label: 'Lower Body' },
  { id: 'core', label: 'Core' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'chest', label: 'Chest' },
  { id: 'arms', label: 'Arms' },
  { id: 'mobility', label: 'Mobility/Flexibility' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'recovery', label: 'Recovery/Stretching' }
];

// Body areas that might experience soreness
const BODY_AREA_OPTIONS = [
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'core', label: 'Core/Abs' },
  { id: 'hips', label: 'Hips' },
  { id: 'legs', label: 'Legs' },
  { id: 'knees', label: 'Knees' },
  { id: 'ankles', label: 'Ankles' }
];

interface WorkoutEditorProps {
  /**
   * Callback when the workout is saved
   */
  onSave: (workout: any) => void;
  
  /**
   * Callback when editing is cancelled
   */
  onCancel: () => void;
  
  /**
   * Whether this is a new workout or an existing one
   */
  isNewWorkout?: boolean;
  
  /**
   * Whether the editor is in a loading state
   */
  isLoading?: boolean;
}

/**
 * Enhanced main editor component for workouts with premium glass morphism design
 */
const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  onSave,
  onCancel,
  isNewWorkout = true,
  isLoading = false
}) => {
  const { state, dispatch, clearError, clearAllErrors } = useWorkoutEditor();
  const { workout, isDirty, isSaving, validationErrors } = state;

  // ===== STEP 5: MODULAR HOOK INTEGRATION =====
  
  // Single consolidated save function that handles everything
  const handleSave = async (): Promise<{ success: boolean; data?: any; error?: string; timestamp: number; duration: number }> => {
    const startTime = Date.now();
    
    console.log('[WorkoutEditor] SIMPLIFIED SAVE FUNCTION:', {
      'workout_exists': !!workout,
      'workout_title': workout?.title || 'undefined',
      'workout_exercises_length': workout?.exercises?.length || 0,
      'isNewWorkout': isNewWorkout,
      'isDirty': isDirty
    });

    // GUARD: Check if workout data exists
    if (!workout) {
      console.error('[WorkoutEditor] SAVE FAILED: workout data is undefined');
      return {
        success: false,
        error: 'Workout data not available',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }

    // INLINE VALIDATION - Check validation hook first
    if (validation.hasErrors) {
      console.log('[WorkoutEditor] SAVE BLOCKED by validation hook:', validation.workoutValidation.errors);
      // Convert validation result to the format expected by the editor
      const errors: Record<string, string> = {};
      validation.workoutValidation.errors.forEach((error: any) => {
        if (error.field) {
          errors[error.field] = error.message;
        }
      });
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
      return {
        success: false,
        error: 'Validation failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }
    
    // INLINE VALIDATION - Basic field checks
    const errors: Record<string, string> = {};
    
    if (!workout.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!workout.exercises || workout.exercises.length === 0) {
      errors.exercises = 'At least one exercise is required';
    }
    
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
      return {
        success: false,
        error: 'Validation failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    }

    // Set saving state
    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      // CRITICAL FIX: Convert editor format to GeneratedWorkout format
      // Check if this workout is already saved (has postId)
      const workoutId = workout.postId;
      const isExistingWorkout = !!(workoutId && 
                                  workoutId !== 0 &&
                                  typeof workoutId === 'number' && 
                                  workoutId > 0);
      
      // Convert editor exercises to GeneratedWorkout exercise format
      const convertedExercises = workout.exercises.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        description: exercise.notes || '', // Map notes to description
        notes: exercise.notes
      }));
      
      // Prepare workout data in GeneratedWorkout format
      const workoutToSave = {
        id: workoutId, // Use postId as id
        title: workout.title,
        description: workout.notes || '',
        duration: workout.duration,
        difficulty: workout.difficulty,
        equipment: workout.equipment,
        goals: workout.goals,
        exercises: convertedExercises,
        version: workout.version || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        
        // Include session factors in save data
        sessionFactors: workout.sessionFactors
      };
      
      console.log('[WorkoutEditor] SAVE PREPARATION:', {
        'workout.postId': workout.postId,
        'resolved_workoutId': workoutId,
        'isExistingWorkout': isExistingWorkout,
        'has_exercises': !!workoutToSave.exercises,
        'exercises_length': workoutToSave.exercises?.length || 0,
        'version': workoutToSave.version,
        'save_method': isExistingWorkout ? 'UPDATE' : 'CREATE'
      });

      // Call the appropriate save service
      const savedWorkout = await saveWorkout(workoutToSave);
      
      console.log('[WorkoutEditor] SAVE RESPONSE:', {
        'response_id': savedWorkout.id,
        'response_post_id': (savedWorkout as any).post_id,
        'response_version': savedWorkout.version,
        'response_exercises_count': savedWorkout.exercises?.length || 0,
        'operation': isExistingWorkout ? 'UPDATE' : 'CREATE'
      });
      
      // FIXED: Merge save response with existing workout instead of replacing
      const updatedWorkout = {
        ...workout,
        // Update with save metadata from response
        postId: typeof savedWorkout.id === 'number' ? savedWorkout.id : 
                (typeof (savedWorkout as any).post_id === 'number' ? (savedWorkout as any).post_id : workout.postId),
        version: savedWorkout.version || workout.version,
        lastModified: savedWorkout.lastModified || workout.lastModified,
        // Keep all existing workout data (exercises, title, etc.)
        exercises: workout.exercises, // Preserve exercises array
        title: workout.title,         // Preserve title
        notes: workout.notes,         // Use notes field (not description)
        difficulty: workout.difficulty,
        duration: workout.duration,
        equipment: workout.equipment || [],
        goals: workout.goals || []
      };
      
      console.log('[WorkoutEditor] MERGED WORKOUT DATA:', {
        'has_exercises': !!updatedWorkout.exercises,
        'exercises_length': updatedWorkout.exercises?.length || 0,
        'has_title': !!updatedWorkout.title,
        'version': updatedWorkout.version,
        'postId': updatedWorkout.postId
      });
      
      // Update local state with merged workout data
      dispatch({ type: 'SET_WORKOUT', payload: updatedWorkout });
      
      // CRITICAL FIX: Call onSave prop to notify parent component of successful save
      console.log('[WorkoutEditor] Calling onSave prop with saved workout data:', {
        postId: updatedWorkout.postId,
        title: updatedWorkout.title,
        version: updatedWorkout.version
      });
      
      // Call the parent's save callback with the updated workout
      if (onSave) {
        onSave(updatedWorkout);
      }
      
      return {
        success: true,
        data: updatedWorkout,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } catch (error) {
      console.error('[WorkoutEditor] SAVE FAILED:', error);
      // Handle save error
      dispatch({ type: 'SET_FIELD_ERROR', payload: { field: 'general', message: 'Save failed. Please try again.' } });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Save failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      };
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Auto-save functionality with debounced saves
  const autoSave = useAutoSave(handleSave, {
    debounceMs: 2000,
    enabled: !isNewWorkout && isDirty, // Only auto-save existing workouts
    enabledWhenValid: true,
    maxRetries: 3
  });

  // Enhanced validation with real-time feedback
  const validation = useWorkoutValidation(workout, {
    validateOnChange: true,
    debounceMs: 300,
    enableSuggestions: true,
    contextualValidation: true
  });

  // Unsaved changes detection and warnings
  const unsavedChanges = useUnsavedChanges(
    workout, 
    state.originalWorkout || workout,
    {
      confirmOnNavigate: true,
      confirmOnClose: true,
      deepCompare: true,
      excludeFields: ['lastModified'],
      autoSaveEnabled: !isNewWorkout // Enable auto-save for existing workouts
    }
  );

  // Clear all validation errors when component unmounts
  useEffect(() => {
    return () => {
      clearAllErrors();
    };
  }, [clearAllErrors]);
  
  // Force immediate textarea height adjustment when component mounts
  useEffect(() => {
    // Use a delayed call to ensure DOM is fully rendered
    const timeoutId = setTimeout(() => {
      // Find all autosize textareas in the editor and trigger height adjustment
      const textareas = document.querySelectorAll('.workout-editor .auto-resize-textarea');
      textareas.forEach(textarea => {
        // Set height to auto first to ensure proper calculation
        (textarea as HTMLElement).style.height = 'auto';
        // Then set height to scrollHeight to show all content
        (textarea as HTMLElement).style.height = `${(textarea as HTMLElement).scrollHeight}px`;
      });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'UPDATE_TITLE', payload: e.target.value });
  };

  // Handle difficulty change
  const handleDifficultyChange = (value: string) => {
    dispatch({ 
      type: 'UPDATE_DIFFICULTY', 
      payload: value as WorkoutDifficulty 
    });
  };

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseInt(e.target.value, 10) || 0;
    dispatch({ type: 'UPDATE_DURATION', payload: duration });
  };

  // Handle equipment selection change
  const handleEquipmentChange = (equipment: string[]) => {
    dispatch({ type: 'UPDATE_EQUIPMENT', payload: equipment });
  };

  // Handle individual equipment toggle
  const handleEquipmentToggle = (equipmentId: string) => {
    const currentEquipment = workout.equipment || [];
    let updatedEquipment: string[];
    
    if (currentEquipment.includes(equipmentId)) {
      // Remove equipment if already selected
      updatedEquipment = currentEquipment.filter(id => id !== equipmentId);
    } else {
      // Add equipment if not selected
      updatedEquipment = [...currentEquipment, equipmentId];
      
      // If "none" is selected, remove all other equipment
      if (equipmentId === 'none') {
        updatedEquipment = ['none'];
      } else {
        // If other equipment is selected, remove "none"
        updatedEquipment = updatedEquipment.filter(id => id !== 'none');
      }
    }
    
    dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
  };

  // Handle goals selection change
  const handleGoalsChange = (goals: string[]) => {
    dispatch({ type: 'UPDATE_GOALS', payload: goals });
  };

  // Handle individual goal toggle
  const handleGoalToggle = (goalValue: string) => {
    const currentGoals = workout.goals || [];
    let updatedGoals: string[];
    
    if (currentGoals.includes(goalValue)) {
      // Remove goal if already selected
      updatedGoals = currentGoals.filter(goal => goal !== goalValue);
    } else {
      // Add goal if not selected
      updatedGoals = [...currentGoals, goalValue];
    }
    
    dispatch({ type: 'UPDATE_GOALS', payload: updatedGoals });
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'UPDATE_NOTES', payload: e.target.value });
  };

  // Handle focus area toggle
  const handleFocusAreaToggle = (areaId: string) => {
    const currentAreas = workout.sessionFactors?.focusArea || [];
    let newAreas: string[];
    
    if (currentAreas.includes(areaId)) {
      newAreas = currentAreas.filter(id => id !== areaId);
    } else {
      newAreas = [...currentAreas, areaId];
    }
    
    dispatch({ 
      type: 'UPDATE_SESSION_FACTORS', 
      payload: { 
        ...workout.sessionFactors, 
        focusArea: newAreas 
      } 
    });
  };

  // Handle soreness area toggle
  const handleSorenessToggle = (areaId: string) => {
    const currentAreas = workout.sessionFactors?.currentSoreness || [];
    let newAreas: string[];
    
    if (currentAreas.includes(areaId)) {
      newAreas = currentAreas.filter(id => id !== areaId);
    } else {
      newAreas = [...currentAreas, areaId];
    }
    
    dispatch({ 
      type: 'UPDATE_SESSION_FACTORS', 
      payload: { 
        ...workout.sessionFactors, 
        currentSoreness: newAreas 
      } 
    });
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (!isLoading && !isSaving && (isDirty || isNewWorkout)) {
        handleSave();
      }
    }
  };

  // Handle blur event for auto-save on focus change
  const handleBlur = () => {
    // In a real implementation, we might want to trigger an auto-save here
    // This would be connected to a debounced save function
    // For now, we just mark the state as dirty
    // dispatch({ type: 'SET_DIRTY', payload: true });
  };

  // Determine if save button should be disabled
  const isSaveDisabled = isLoading || isSaving || (!isDirty && !isNewWorkout);
  
  // Debug save button state only when values change (prevent infinite loop)
  useEffect(() => {
    console.log('[WorkoutEditor] SAVE BUTTON STATE DEBUG:', {
      'isSaveDisabled': isSaveDisabled,
      'isLoading': isLoading,
      'isSaving': isSaving,
      'isDirty': isDirty,
      'isNewWorkout': isNewWorkout,
      'conditions': {
        'isLoading_OR_isSaving': isLoading || isSaving,
        'NOT_isDirty_AND_NOT_isNewWorkout': (!isDirty && !isNewWorkout),
        'should_be_enabled_for_new': isNewWorkout,
        'should_be_enabled_for_dirty': isDirty
      }
    });
  }, [isSaveDisabled, isLoading, isSaving, isDirty, isNewWorkout]); // Only log when these values change

  // Calculate workout stats for display
  const totalExercises = workout.exercises.length;
  const estimatedDuration = workout.duration || workout.exercises.reduce((total, exercise: any) => {
    // Estimate duration based on exercise type
    return total + (exercise.duration ? parseInt(String(exercise.duration)) || 3 : 3);
  }, 0);

  return (
    <div 
      className="workout-editor workout-editor--enhanced"
      onKeyDown={handleKeyDown}
      aria-busy={isLoading || isSaving}
    >
      {/* Enhanced Header with Glass Morphism */}
      <header className="workout-editor__header">
        <div className="workout-editor__header-content">
          <div className="workout-editor__header-info">
            <div className="workout-editor__header-icon">
              <Edit3 size={24} />
            </div>
            <div className="workout-editor__header-text">
              <h1 
                id="workout-editor-title" 
                className="workout-editor__title"
              >
                {isNewWorkout ? 'Create New Workout' : 'Edit Workout'}
              </h1>
              <p className="workout-editor__subtitle">
                {isNewWorkout 
                  ? 'Design your perfect workout routine' 
                  : 'Modify your workout to match your goals'
                }
              </p>
              <div className="workout-editor__stats">
                <span className="stat">
                  <Dumbbell size={14} />
                  {totalExercises} exercises
                </span>
                <span className="stat">
                  <Clock size={14} />
                  {estimatedDuration} min
                </span>
                <span className="stat">
                  <Target size={14} />
                  {workout.difficulty || 'Not set'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="workout-editor__header-actions">
            {/* Step 5: Save Status Indicator */}
            <SaveStatusIndicator
              status={autoSave.saveStatus.status}
              lastSaved={unsavedChanges.lastSavedAt}
              hasUnsavedChanges={unsavedChanges.hasUnsavedChanges}
              queueLength={autoSave.saveStatus.queueLength}
              lastError={autoSave.saveStatus.status === 'error' ? 'Auto-save failed' : undefined}
              onRetry={() => {
                autoSave.forceSave(workout);
              }}
              compact={true}
            />
            
            {(isLoading || isSaving) && (
              <div className="workout-editor__loading" aria-live="polite">
                <Loader size={20} className="workout-editor__loading-icon" />
                <span className="workout-editor__loading-text">
                  {isSaving ? 'Saving...' : 'Loading...'}
                </span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading || isSaving}
              className="workout-editor__close-button"
              aria-label="Close editor"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
      </header>
      
      {/* Enhanced Content with Glass Morphism Sections */}
      <main className="workout-editor__content">
        {/* Basic Information Section */}
        <section className="workout-editor__section workout-editor__section--basic">
          <div className="workout-editor__section-header">
            <div className="workout-editor__section-icon">
              <FileText size={20} />
            </div>
            <div className="workout-editor__section-info">
              <h2 className="workout-editor__section-title">Basic Information</h2>
              <p className="workout-editor__section-description">
                Set the fundamental details of your workout
              </p>
            </div>
          </div>
          
          <div className="workout-editor__section-content">
            <div className="workout-editor__form-grid">
              <div className="workout-editor__form-field workout-editor__form-field--title">
                <FormFieldEnhanced
                  label="Workout Title"
                  error={validationErrors.title}
                  required
                  hint="Give your workout a memorable and descriptive name"
                  disabled={isLoading || isSaving}
                >
                  <input
                    type="text"
                    value={workout.title}
                    onChange={handleTitleChange}
                    onBlur={handleBlur}
                    placeholder="Enter a descriptive workout title"
                    maxLength={100}
                  />
                </FormFieldEnhanced>
              </div>
              
              <div className="workout-editor__form-row">
                <div className="workout-editor__form-field">
                  <FormFieldEnhanced
                    label="Difficulty Level"
                    disabled={isLoading || isSaving}
                    hint="Choose the appropriate difficulty level"
                  >
                    <select
                      value={workout.difficulty || ''}
                      onChange={(e) => handleDifficultyChange(e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </FormFieldEnhanced>
                </div>
                
                <div className="workout-editor__form-field">
                  <FormFieldEnhanced
                    label="Duration (minutes)"
                    error={validationErrors.duration}
                    disabled={isLoading || isSaving}
                    hint="Total workout time including rest periods"
                  >
                    <input
                      type="number"
                      value={workout.duration?.toString() || ''}
                      onChange={handleDurationChange}
                      onBlur={handleBlur}
                      min={1}
                      max={120}
                    />
                  </FormFieldEnhanced>
                </div>
              </div>

              {/* Equipment Selection */}
              <div className="workout-editor__form-field workout-editor__form-field--full-width">
                <FormFieldEnhanced
                  label="Available Equipment"
                  disabled={isLoading || isSaving}
                  hint="Select all equipment you have access to for this workout"
                >
                  <div className="workout-editor__checkbox-grid">
                    {EQUIPMENT_OPTIONS.map(equipment => {
                      const isSelected = (workout.equipment || []).includes(equipment.id);
                      const isDisabled = isLoading || isSaving;
                      
                      return (
                        <label 
                          key={equipment.id} 
                          className={`workout-editor__checkbox-label ${isSelected ? 'checkbox-label--selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="workout-editor__checkbox-input"
                            value={equipment.id}
                            checked={isSelected}
                            onChange={() => handleEquipmentToggle(equipment.id)}
                            disabled={isDisabled}
                          />
                          <div className="workout-editor__checkbox-box">
                            <Dumbbell size={14} className="workout-editor__checkbox-indicator" />
                          </div>
                          <span className="workout-editor__checkbox-text">{equipment.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormFieldEnhanced>
              </div>

              {/* Goals Selection */}
              <div className="workout-editor__form-field workout-editor__form-field--full-width">
                <FormFieldEnhanced
                  label="Workout Goals"
                  disabled={isLoading || isSaving}
                  hint="Select the primary goals for this workout (you can choose multiple)"
                >
                  <div className="workout-editor__checkbox-grid">
                    {GOAL_OPTIONS.map(goal => {
                      const isSelected = (workout.goals || []).includes(goal.value);
                      const isDisabled = isLoading || isSaving;
                      
                      return (
                        <label 
                          key={goal.value} 
                          className={`workout-editor__checkbox-label ${isSelected ? 'checkbox-label--selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="workout-editor__checkbox-input"
                            value={goal.value}
                            checked={isSelected}
                            onChange={() => handleGoalToggle(goal.value)}
                            disabled={isDisabled}
                          />
                          <div className="workout-editor__checkbox-box">
                            <Target size={14} className="workout-editor__checkbox-indicator" />
                          </div>
                          <span className="workout-editor__checkbox-text">{goal.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormFieldEnhanced>
              </div>

              {/* Focus Areas Selection */}
              <div className="workout-editor__form-field workout-editor__form-field--full-width">
                <FormFieldEnhanced
                  label="Focus Areas for This Session"
                  disabled={isLoading || isSaving}
                  hint="Select the body areas you want to focus on today"
                >
                  <div className="workout-editor__checkbox-grid">
                    {FOCUS_AREA_OPTIONS.map(area => {
                      const isSelected = (workout.sessionFactors?.focusArea || []).includes(area.id);
                      const isDisabled = isLoading || isSaving;
                      
                      return (
                        <label 
                          key={area.id} 
                          className={`workout-editor__checkbox-label ${isSelected ? 'checkbox-label--selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="workout-editor__checkbox-input"
                            value={area.id}
                            checked={isSelected}
                            onChange={() => handleFocusAreaToggle(area.id)}
                            disabled={isDisabled}
                          />
                          <div className="workout-editor__checkbox-box">
                            <Target size={14} className="workout-editor__checkbox-indicator" />
                          </div>
                          <span className="workout-editor__checkbox-text">{area.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormFieldEnhanced>
              </div>

              {/* Current Soreness Selection */}
              <div className="workout-editor__form-field workout-editor__form-field--full-width">
                <FormFieldEnhanced
                  label="Current Soreness or Discomfort"
                  disabled={isLoading || isSaving}
                  hint="Areas experiencing soreness that should be avoided or worked lightly"
                >
                  <div className="workout-editor__checkbox-grid">
                    {BODY_AREA_OPTIONS.map(area => {
                      const isSelected = (workout.sessionFactors?.currentSoreness || []).includes(area.id);
                      const isDisabled = isLoading || isSaving;
                      
                      return (
                        <label 
                          key={area.id} 
                          className={`workout-editor__checkbox-label ${isSelected ? 'checkbox-label--selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            className="workout-editor__checkbox-input"
                            value={area.id}
                            checked={isSelected}
                            onChange={() => handleSorenessToggle(area.id)}
                            disabled={isDisabled}
                          />
                          <div className="workout-editor__checkbox-box">
                            <AlertCircle size={14} className="workout-editor__checkbox-indicator" />
                          </div>
                          <span className="workout-editor__checkbox-text">{area.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </FormFieldEnhanced>
              </div>
              
              {workout.version && (
                <div className="workout-editor__version-info">
                  <span className="workout-editor__version-label">Version:</span>
                  <span className="workout-editor__version-number">{workout.version}</span>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Exercises Section */}
        <section className="workout-editor__section workout-editor__section--exercises">
          <div className="workout-editor__section-header">
            <div className="workout-editor__section-icon">
              <Target size={20} />
            </div>
            <div className="workout-editor__section-info">
              <h2 className="workout-editor__section-title">Exercises</h2>
              <p className="workout-editor__section-description">
                Add and configure the exercises for your workout
              </p>
            </div>
          </div>
          
          <div className="workout-editor__section-content">
            <div aria-labelledby="exercises-heading" role="region">
              <ExerciseList isDisabled={isLoading || isSaving} />
              {validationErrors.exercises && (
                <div className="workout-editor__error" id="exercises-error">
                  {validationErrors.exercises}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Notes Section */}
        <section className="workout-editor__section workout-editor__section--notes">
          <div className="workout-editor__section-header">
            <div className="workout-editor__section-icon">
              <FileText size={20} />
            </div>
            <div className="workout-editor__section-info">
              <h2 className="workout-editor__section-title">Additional Notes</h2>
              <p className="workout-editor__section-description">
                Add any extra information or instructions
              </p>
            </div>
          </div>
          
          <div className="workout-editor__section-content">
            <AutoResizeTextareaWithCounter
              id="workout-notes"
              value={workout.notes || ''}
              onChange={handleNotesChange}
              placeholder="Add any additional notes, tips, or instructions for this workout..."
              minRows={4}
              maxRows={undefined}
              maxCharacters={1000}
              showWarning={true}
              expandOnMount={true}
              performanceMode="standard"
              animateResize={true}
              disabled={isLoading || isSaving}
              aria-labelledby="notes-heading"
              className="workout-editor__notes-textarea"
            />
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer with Glass Morphism */}
      <footer className="workout-editor__footer">
        <div className="workout-editor__footer-content">
          <div className="workout-editor__footer-info">
            {isDirty && (
              <span className="workout-editor__unsaved-indicator">
                <span className="unsaved-dot"></span>
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="workout-editor__footer-actions">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isLoading || isSaving}
              aria-label="Cancel and close editor"
              className="workout-editor__cancel-button"
            >
              Cancel
            </Button>
            
            <Button
              variant="gradient"
              size="lg"
              onClick={handleSave}
              disabled={isSaveDisabled}
              startIcon={isSaving ? <Loader size={18} /> : <Save size={18} />}
              aria-label={isSaving ? "Saving workout" : "Save workout"}
              className="workout-editor__save-button"
            >
              {isSaving ? 'Saving...' : 'Save Workout'}
            </Button>
          </div>
        </div>
      </footer>

      {/* Step 5: Unsaved Changes Warning Modal */}
      <UnsavedChangesWarning
        isOpen={unsavedChanges.showConfirmation}
        changedFields={unsavedChanges.changedFields}
        confirmationType={unsavedChanges.confirmationType}
        confirmationMessage="You have unsaved changes that will be lost."
        onSave={unsavedChanges.handleConfirmSave}
        onDiscard={unsavedChanges.handleConfirmDiscard}
        onCancel={unsavedChanges.handleConfirmCancel}
        isSaving={isSaving}
      />
    </div>
  );
};

export default WorkoutEditor; 