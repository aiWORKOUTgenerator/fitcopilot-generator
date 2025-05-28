/**
 * Enhanced Workout Editor Component
 * 
 * Main component for editing workouts with premium glass morphism design,
 * accessibility enhancements, and design system integration to match EnhancedWorkoutModal.
 */
import React, { useEffect } from 'react';
import { useWorkoutEditor } from './WorkoutEditorContext';
import { Button, Input, Select } from '../../../../components/ui';
import { AutoResizeTextarea } from '../../../../components/ui/AutoResizeTextarea';
import { ExpandableInput } from '../../../../components/ui/ExpandableInput';
import { AutoResizeTextareaWithCounter } from '../../../../components/ui/AutoResizeTextareaWithCounter';
import { FormFieldEnhanced } from '../../../profile/components/enhanced/FormFieldEnhanced';
import { FormSectionEnhanced } from '../../../profile/components/enhanced/FormSectionEnhanced';
import { X, Save, Loader, Edit3, FileText, Clock, Target, Dumbbell } from 'lucide-react';
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

  // Calculate workout stats for display
  const totalExercises = workout.exercises.length;
  const estimatedDuration = workout.duration || workout.exercises.reduce((total, exercise) => {
    // Estimate duration based on exercise type
    return total + ('duration' in exercise ? parseInt(exercise.duration) || 3 : 3);
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
                      value={workout.difficulty}
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
                      value={workout.duration.toString()}
                      onChange={handleDurationChange}
                      onBlur={handleBlur}
                      min={1}
                      max={120}
                    />
                  </FormFieldEnhanced>
                </div>
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
    </div>
  );
};

export default WorkoutEditor; 