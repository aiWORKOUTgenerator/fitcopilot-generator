/**
 * Exercise List Component
 * 
 * Displays and manages the list of exercises in the workout editor
 * with accessibility improvements, smart parsing, and intelligent suggestions.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useWorkoutEditor } from './WorkoutEditorContext';
import { Button } from '../../../../components/ui';
import { ExpandableInput } from '../../../../components/ui/ExpandableInput';
import { AutoResizeTextareaWithCounter } from '../../../../components/ui/AutoResizeTextareaWithCounter';
import SmartFieldSuggestions from './SmartFieldSuggestions';
import { FieldValidator, FieldValidationResult } from '../../utils/FieldValidator';
import { FieldSuggestion } from '../../utils/ExerciseDataParser';
import { Plus, Trash2, GripVertical, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import './workoutEditor.scss';
import './SmartFieldSuggestions.scss';

interface ExerciseListProps {
  /**
   * Whether the list is disabled (for loading/saving states)
   */
  isDisabled?: boolean;
}

/**
 * Exercise List component for the workout editor
 */
const ExerciseList: React.FC<ExerciseListProps> = ({ isDisabled = false }) => {
  const { state, updateExercise, addExercise, removeExercise } = useWorkoutEditor();
  const { workout } = state;
  
  // State for managing validation results
  const [validationResults, setValidationResults] = useState<{[exerciseId: string]: FieldValidationResult}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[exerciseId: string]: boolean}>({});

  // Validate all exercises whenever they change
  const exerciseValidations = useMemo(() => {
    const results: {[exerciseId: string]: FieldValidationResult} = {};
    
    workout.exercises.forEach(exercise => {
      // Convert workout exercise to validator exercise format
      const validatorExercise = {
        id: exercise.id,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        restPeriod: exercise.restPeriod,
        notes: exercise.notes
      };
      
      results[exercise.id] = FieldValidator.validateExercise(validatorExercise);
    });
    
    return results;
  }, [workout.exercises]);
  
  // Update validation results when they change
  useEffect(() => {
    setValidationResults(exerciseValidations);
    
    // Auto-show suggestions for exercises with high-confidence issues
    const autoShowSuggestions: {[exerciseId: string]: boolean} = {};
    Object.entries(exerciseValidations).forEach(([exerciseId, validation]) => {
      const hasHighConfidenceSuggestions = validation.suggestions.some(s => s.confidence > 0.8);
      autoShowSuggestions[exerciseId] = hasHighConfidenceSuggestions;
    });
    setShowSuggestions(autoShowSuggestions);
  }, [exerciseValidations]);

  // Force immediate textarea height adjustment when exercises change
  useEffect(() => {
    if (workout.exercises.length === 0) return;
    
    // Use a small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      // Find all autosize textareas in exercise items and trigger height adjustment
      workout.exercises.forEach(exercise => {
        const textarea = document.getElementById(`exercise-${exercise.id}-notes`) as HTMLTextAreaElement;
        if (textarea) {
          // Manually adjust height to show all content
          textarea.style.height = 'auto';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }
      });
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [workout.exercises]);

  // Add a new exercise
  const handleAddExercise = () => {
    addExercise();
  };

  // Remove an exercise
  const handleRemoveExercise = (id: string) => {
    removeExercise(id);
  };

  // Update exercise field
  const handleUpdateExercise = (id: string, field: string, value: any) => {
    updateExercise(id, field, value);
  };

  // Handle blur event for auto-save on focus change
  const handleBlur = () => {
    // In a real implementation, we might want to trigger an auto-save here
    // This would be connected to a debounced save function
    // For now, we just mark the state as dirty
    // dispatch({ type: 'SET_DIRTY', payload: true });
  };

  // Handle applying a single suggestion
  const handleApplySuggestion = async (exerciseId: string, field: string, value: any, suggestion: FieldSuggestion) => {
    try {
      await updateExercise(exerciseId, field, value);
      
      // Also update parsing status if it's from auto-parsing
      if (suggestion.source === 'auto_parsing' || suggestion.source === 'field_analysis') {
        // Mark as successfully parsed
        await updateExercise(exerciseId, 'parsingStatus', 'parsed');
        await updateExercise(exerciseId, 'parsingConfidence', suggestion.confidence);
      }
    } catch (error) {
      console.error('Error applying suggestion:', error);
      throw error; // Re-throw to let the UI component handle it
    }
  };

  // Handle dismissing a suggestion
  const handleDismissSuggestion = (exerciseId: string, suggestion: FieldSuggestion) => {
    // For now, we just log it - in a real app we might store dismissed suggestions
    console.log(`Dismissed suggestion for ${exerciseId}:`, suggestion);
  };

  // Handle applying all suggestions for an exercise
  const handleApplyAllSuggestions = async (exerciseId: string, suggestions: FieldSuggestion[]) => {
    try {
      // Apply suggestions in order of confidence
      const sortedSuggestions = [...suggestions].sort((a, b) => b.confidence - a.confidence);
      
      for (const suggestion of sortedSuggestions) {
        await updateExercise(exerciseId, suggestion.field, suggestion.suggestedValue);
      }
      
      // Mark as successfully parsed
      const highestConfidence = Math.max(...suggestions.map(s => s.confidence));
      await updateExercise(exerciseId, 'parsingStatus', 'parsed');
      await updateExercise(exerciseId, 'parsingConfidence', highestConfidence);
      
      // Hide suggestions after applying all
      setShowSuggestions(prev => ({ ...prev, [exerciseId]: false }));
    } catch (error) {
      console.error('Error applying all suggestions:', error);
    }
  };

  // Toggle showing suggestions for an exercise
  const toggleSuggestions = (exerciseId: string) => {
    setShowSuggestions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  // Get validation status icon for an exercise
  const getValidationIcon = (validation: FieldValidationResult) => {
    if (!validation.isValid) {
      return <AlertCircle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--error" />;
    }
    if (validation.hasWarnings || validation.suggestions.length > 0) {
      return <AlertTriangle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--warning" />;
    }
    if (validation.confidence > 0.8) {
      return <CheckCircle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--success" />;
    }
    return null;
  };

  return (
    <div 
      className="workout-editor__exercise-list"
      aria-disabled={isDisabled}
    >
      {workout.exercises.length === 0 ? (
        <div 
          className="workout-editor__empty-state" 
          aria-live="polite"
        >
          <p>No exercises added yet.</p>
        </div>
      ) : (
        workout.exercises.map((exercise, index) => (
          <div 
            key={exercise.id} 
            className="workout-editor__exercise-item"
            aria-labelledby={`exercise-${exercise.id}-name`}
          >
            <div className="workout-editor__exercise-header">
              <div 
                className="workout-editor__exercise-drag-handle"
                aria-hidden="true" // Hide from screen readers as drag functionality is not critical
              >
                <GripVertical size={20} />
              </div>
              <div className="workout-editor__exercise-number">
                {index + 1}.
              </div>
              <ExpandableInput
                id={`exercise-${exercise.id}-name`}
                value={exercise.name}
                onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                onBlur={handleBlur}
                placeholder="Exercise name"
                className="workout-editor__exercise-name-input"
                disabled={isDisabled}
                aria-label={`Exercise ${index + 1} name`}
                showTooltip={true}
              />
              
              {/* Validation status and smart suggestions toggle */}
              <div className="workout-editor__exercise-status">
                {validationResults[exercise.id] && getValidationIcon(validationResults[exercise.id])}
                {validationResults[exercise.id]?.suggestions?.length > 0 && (
                  <button
                    type="button"
                    className={`workout-editor__suggestions-toggle ${showSuggestions[exercise.id] ? 'active' : ''}`}
                    onClick={() => toggleSuggestions(exercise.id)}
                    title={`${validationResults[exercise.id].suggestions.length} suggestions available`}
                    disabled={isDisabled}
                  >
                    💡
                  </button>
                )}
              </div>
              
              <button
                className="workout-editor__exercise-remove"
                onClick={() => handleRemoveExercise(exercise.id)}
                aria-label={`Remove ${exercise.name}`}
                disabled={isDisabled}
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="workout-editor__exercise-details">
              <div className="workout-editor__exercise-field">
                <label htmlFor={`exercise-${exercise.id}-sets`}>Sets</label>
                <ExpandableInput
                  id={`exercise-${exercise.id}-sets`}
                  type="number"
                  value={exercise.sets.toString()}
                  onChange={(e) => handleUpdateExercise(
                    exercise.id, 
                    'sets', 
                    parseInt(e.target.value, 10) || 1
                  )}
                  onBlur={handleBlur}
                  min={1}
                  max={20}
                  size="sm"
                  disabled={isDisabled}
                  aria-label={`Sets for ${exercise.name}`}
                />
              </div>
              
              <div className="workout-editor__exercise-field">
                <label htmlFor={`exercise-${exercise.id}-reps`}>Reps</label>
                <ExpandableInput
                  id={`exercise-${exercise.id}-reps`}
                  value={exercise.reps.toString()}
                  onChange={(e) => handleUpdateExercise(
                    exercise.id, 
                    'reps', 
                    e.target.value
                  )}
                  onBlur={handleBlur}
                  placeholder="e.g. 10 or 8-12"
                  size="sm"
                  disabled={isDisabled}
                  aria-label={`Reps for ${exercise.name}`}
                />
              </div>
              
              <div className="workout-editor__exercise-field">
                <label htmlFor={`exercise-${exercise.id}-rest`}>Rest (sec)</label>
                <ExpandableInput
                  id={`exercise-${exercise.id}-rest`}
                  type="number"
                  value={exercise.restPeriod?.toString() || '60'}
                  onChange={(e) => handleUpdateExercise(
                    exercise.id, 
                    'restPeriod', 
                    parseInt(e.target.value, 10) || 60
                  )}
                  onBlur={handleBlur}
                  min={0}
                  max={300}
                  size="sm"
                  disabled={isDisabled}
                  aria-label={`Rest period for ${exercise.name} in seconds`}
                />
              </div>
            </div>
            
            <div className="workout-editor__exercise-notes">
              <label htmlFor={`exercise-${exercise.id}-notes`}>Notes</label>
              <AutoResizeTextareaWithCounter
                id={`exercise-${exercise.id}-notes`}
                value={exercise.notes || ''}
                onChange={(e) => handleUpdateExercise(
                  exercise.id, 
                  'notes', 
                  e.target.value
                )}
                onBlur={handleBlur}
                placeholder="Notes for this exercise"
                disabled={isDisabled}
                aria-label={`Notes for ${exercise.name}`}
                minRows={3}
                maxRows={undefined}
                maxCharacters={500}
                showWarning={true}
                expandOnMount={true}
                performanceMode="optimized"
                animateResize={true}
                className="exercise-notes"
              />
            </div>
            
            {/* Smart Field Suggestions */}
            {validationResults[exercise.id] && validationResults[exercise.id].suggestions.length > 0 && (
              <SmartFieldSuggestions
                exercise={{
                  id: exercise.id,
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restPeriod: exercise.restPeriod,
                  notes: exercise.notes
                }}
                validationResult={validationResults[exercise.id]}
                onApplySuggestion={(field, value, suggestion) => 
                  handleApplySuggestion(exercise.id, field, value, suggestion)
                }
                onDismissSuggestion={(suggestion) => 
                  handleDismissSuggestion(exercise.id, suggestion)
                }
                onApplyAllSuggestions={(suggestions) => 
                  handleApplyAllSuggestions(exercise.id, suggestions)
                }
                show={showSuggestions[exercise.id]}
                maxSuggestions={3}
              />
            )}
          </div>
        ))
      )}
      
      <div className="workout-editor__add-exercise">
        <Button
          variant="secondary"
          size="md"
          onClick={handleAddExercise}
          startIcon={<Plus size={18} />}
          disabled={isDisabled}
          aria-label="Add a new exercise to the workout"
        >
          Add Exercise
        </Button>
      </div>
    </div>
  );
};

export default ExerciseList; 