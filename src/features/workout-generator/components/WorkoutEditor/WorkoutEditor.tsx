/**
 * Workout Editor Component
 * 
 * Main component for editing workouts with accessibility enhancements
 * and loading state management.
 */
import React, { useEffect } from 'react';
import { useWorkoutEditor } from './WorkoutEditorContext';
import { Button, Input, Select } from '../../../../components/ui';
import { AutoResizeTextarea } from '../../../../components/ui/AutoResizeTextarea';
import { ExpandableInput } from '../../../../components/ui/ExpandableInput';
import { AutoResizeTextareaWithCounter } from '../../../../components/ui/AutoResizeTextareaWithCounter';
import { X, Save, Loader } from 'lucide-react';
import { WorkoutDifficulty } from '../../types/workout';
import ExerciseList from './ExerciseList';
import './workoutEditor.scss';

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
 * Main editor component for workouts
 */
const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  onSave,
  onCancel,
  isNewWorkout = true,
  isLoading = false
}) => {
  const { state, dispatch, clearError, clearAllErrors } = useWorkoutEditor();
  const { workout, isDirty, isSaving, validationErrors } = state;

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
        textarea.style.height = 'auto';
        // Then set height to scrollHeight to show all content
        textarea.style.height = `${textarea.scrollHeight}px`;
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

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'UPDATE_NOTES', payload: e.target.value });
  };

  // Handle save button click
  const handleSave = () => {
    // Validate the form before saving
    const errors: Record<string, string> = {};
    
    if (!workout.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (workout.exercises.length === 0) {
      errors.exercises = 'At least one exercise is required';
    }
    
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
      return;
    }
    
    // Set saving state
    dispatch({ type: 'SET_SAVING', payload: true });
    
    // Call the save callback
    onSave(workout);
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

  return (
    <div 
      className="workout-editor"
      onKeyDown={handleKeyDown}
      aria-busy={isLoading || isSaving}
    >
      <div className="workout-editor__header">
        <button 
          className="workout-editor__close-button"
          onClick={onCancel}
          aria-label="Close editor"
          disabled={isLoading || isSaving}
        >
          <X size={24} />
        </button>
        <h2 
          id="workout-editor-title" 
          className="workout-editor__title"
        >
          {isNewWorkout ? 'Create Workout' : 'Edit Workout'}
        </h2>
        {(isLoading || isSaving) && (
          <div className="workout-editor__loading" aria-live="polite">
            <Loader size={20} className="workout-editor__loading-icon" />
            <span>{isSaving ? 'Saving...' : 'Loading...'}</span>
          </div>
        )}
      </div>
      
      <div className="workout-editor__content">
        <div className="workout-editor__section">
          <label className="workout-editor__label" htmlFor="workout-title">
            Title
            <ExpandableInput
              id="workout-title"
              value={workout.title}
              onChange={handleTitleChange}
              onBlur={handleBlur}
              placeholder="Enter workout title"
              error={validationErrors.title}
              fullWidth
              size="md"
              disabled={isLoading || isSaving}
              aria-required="true"
              aria-invalid={!!validationErrors.title}
              aria-describedby={validationErrors.title ? "title-error" : undefined}
              showTooltip={true}
            />
            {validationErrors.title && (
              <div id="title-error" className="workout-editor__error">
                {validationErrors.title}
              </div>
            )}
          </label>
        </div>
        
        <div className="workout-editor__metadata">
          <div className="workout-editor__row">
            <div className="workout-editor__column">
              <label className="workout-editor__label" htmlFor="workout-difficulty">
                Difficulty
                <Select
                  id="workout-difficulty"
                  value={workout.difficulty}
                  onChange={handleDifficultyChange}
                  options={[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' }
                  ]}
                  fullWidth
                  disabled={isLoading || isSaving}
                />
              </label>
            </div>
            
            <div className="workout-editor__column">
              <label className="workout-editor__label" htmlFor="workout-duration">
                Duration (minutes)
                <ExpandableInput
                  id="workout-duration"
                  type="number"
                  value={workout.duration.toString()}
                  onChange={handleDurationChange}
                  onBlur={handleBlur}
                  min={1}
                  max={120}
                  fullWidth
                  size="md"
                  disabled={isLoading || isSaving}
                  aria-describedby={validationErrors.duration ? "duration-error" : undefined}
                />
                {validationErrors.duration && (
                  <div id="duration-error" className="workout-editor__error">
                    {validationErrors.duration}
                  </div>
                )}
              </label>
            </div>
            
            {workout.version && (
              <div className="workout-editor__column">
                <div className="workout-editor__version">
                  Version: {workout.version}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="workout-editor__section">
          <h3 className="workout-editor__section-title" id="exercises-heading">Exercises</h3>
          <div aria-labelledby="exercises-heading" role="region">
            <ExerciseList isDisabled={isLoading || isSaving} />
            {validationErrors.exercises && (
              <div className="workout-editor__error" id="exercises-error">
                {validationErrors.exercises}
              </div>
            )}
          </div>
        </div>
        
        <div className="workout-editor__section">
          <h3 className="workout-editor__section-title" id="notes-heading">Notes</h3>
          <AutoResizeTextareaWithCounter
            id="workout-notes"
            value={workout.notes || ''}
            onChange={handleNotesChange}
            placeholder="Add any additional notes about this workout..."
            minRows={5}
            maxRows={20}
            maxCharacters={1000}
            showWarning={true}
            expandOnMount={true}
            disabled={isLoading || isSaving}
            aria-labelledby="notes-heading"
          />
        </div>
      </div>
      
      <div className="workout-editor__footer">
        <Button
          variant="secondary"
          size="lg"
          onClick={onCancel}
          disabled={isLoading || isSaving}
          aria-label="Cancel and close editor"
        >
          Cancel
        </Button>
        
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={isSaveDisabled}
          startIcon={isSaving ? <Loader size={18} /> : <Save size={18} />}
          aria-label={isSaving ? "Saving workout" : "Save workout"}
        >
          {isSaving ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>
    </div>
  );
};

export default WorkoutEditor; 