/**
 * Exercise List Component
 * 
 * Displays and manages the list of exercises in the workout editor
 * with accessibility improvements, smart parsing, and intelligent suggestions.
 * Enhanced with smart field components for better text handling.
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
 * Smart Exercise Field Component
 * Provides field-specific configuration for enhanced expansion
 */
const SmartExerciseField: React.FC<{
  field: 'name' | 'sets' | 'reps' | 'restPeriod';
  exercise: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  suggestions?: FieldSuggestion[];
}> = ({ field, exercise, onChange, onBlur, disabled, suggestions }) => {
  
  // Field-specific configuration
  const getFieldConfig = () => {
    switch (field) {
      case 'name':
        return {
          allowMultiLine: true,
          autoExpand: true,
          expansionThreshold: 25,
          maxExpandedLines: 3,
          placeholder: "Exercise name",
          type: "text" as const,
          className: "exercise-field-input exercise-field-input--name"
        };
      case 'reps':
        return {
          allowMultiLine: false,
          autoExpand: true,
          expansionThreshold: 15,
          maxExpandedLines: 2,
          placeholder: "e.g. 10 or 8-12",
          type: "text" as const,
          className: "exercise-field-input exercise-field-input--reps"
        };
      case 'sets':
        return {
          allowMultiLine: false,
          autoExpand: false,
          expansionThreshold: 10,
          maxExpandedLines: 1,
          placeholder: "Sets",
          type: "number" as const,
          min: 1,
          max: 20,
          className: "exercise-field-input exercise-field-input--sets"
        };
      case 'restPeriod':
        return {
          allowMultiLine: false,
          autoExpand: false,
          expansionThreshold: 10,
          maxExpandedLines: 1,
          placeholder: "Rest (sec)",
          type: "number" as const,
          min: 0,
          max: 300,
          className: "exercise-field-input exercise-field-input--restPeriod"
        };
      default:
        return {
          allowMultiLine: false,
          autoExpand: false,
          expansionThreshold: 30,
          maxExpandedLines: 1,
          type: "text" as const,
          className: "exercise-field-input"
        };
    }
  };

  const config = getFieldConfig();
  const value = exercise[field];
  const hasHighConfidenceSuggestions = suggestions?.some(s => s.confidence > 0.8);

  return (
    <div className={`smart-exercise-field ${hasHighConfidenceSuggestions ? 'has-suggestions' : ''}`}>
      <ExpandableInput
        id={`exercise-${exercise.id}-${field}`}
        value={value?.toString() || ''}
        onChange={(e) => {
          const newValue = field === 'sets' || field === 'restPeriod' 
            ? parseInt(e.target.value, 10) || (field === 'sets' ? 1 : 0)
            : e.target.value;
          onChange(newValue);
        }}
        onBlur={onBlur}
        disabled={disabled}
        aria-label={`${field} for ${exercise.name || 'exercise'}`}
        showTooltip={true}
        showExpansionIndicator={true}
        adaptiveWidth={true}
        adaptiveHeight={true}
        {...config}
      />
      
      {/* Visual indicator for parsing confidence */}
      {hasHighConfidenceSuggestions && (
        <div className="field-suggestion-indicator" title="Smart suggestions available">
          💡
        </div>
      )}
    </div>
  );
};

/**
 * Exercise List component for the workout editor
 */
const ExerciseList: React.FC<ExerciseListProps> = ({ isDisabled = false }) => {
  const { state, updateExercise, addExercise, removeExercise } = useWorkoutEditor();
  const { workout } = state;
  
  // State for managing validation results
  const [validationResults, setValidationResults] = useState<{[exerciseId: string]: FieldValidationResult}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[exerciseId: string]: boolean}>({});

  // Validate all exercises whenever they change (debounced)
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
    // Debounce validation updates
    const timer = setTimeout(() => {
      setValidationResults(exerciseValidations);
      
      // Auto-show suggestions for exercises with high-confidence issues
      const autoShowSuggestions: {[exerciseId: string]: boolean} = {};
      Object.entries(exerciseValidations).forEach(([exerciseId, validation]) => {
        const hasHighConfidenceSuggestions = validation.suggestions.some(s => s.confidence > 0.8);
        autoShowSuggestions[exerciseId] = hasHighConfidenceSuggestions;
      });
      setShowSuggestions(prev => ({ ...prev, ...autoShowSuggestions }));
    }, 300);

    return () => clearTimeout(timer);
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
    console.log('🔄 ExerciseList handleApplySuggestion called:', {
      exerciseId,
      field,
      value,
      suggestion
    });
    
    try {
      console.log('📝 Calling updateExercise with:', { exerciseId, field, value });
      await updateExercise(exerciseId, field, value);
      console.log('✅ updateExercise completed successfully');
      
      // Also update parsing status if it's from auto-parsing
      if (suggestion.source === 'auto_parsing' || suggestion.source === 'field_analysis') {
        console.log('📝 Updating parsing status to "parsed"');
        // Mark as successfully parsed
        await updateExercise(exerciseId, 'parsingStatus', 'parsed');
        await updateExercise(exerciseId, 'parsingConfidence', suggestion.confidence);
        console.log('✅ Parsing status updated');
      }
    } catch (error) {
      console.error('❌ Error in handleApplySuggestion:', error);
      throw error; // Re-throw to let the UI component handle it
    }
  };

  // Handle dismissing a suggestion
  const handleDismissSuggestion = (exerciseId: string, suggestion: FieldSuggestion) => {
    console.log('❌ ExerciseList handleDismissSuggestion called:', {
      exerciseId,
      suggestion
    });
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

  // Get field suggestions for a specific field
  const getFieldSuggestions = (exerciseId: string, field: string): FieldSuggestion[] => {
    const validation = validationResults[exerciseId];
    return validation?.suggestions?.filter(s => s.field === field) || [];
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
              
              {/* Enhanced Exercise Name Field */}
              <div className="workout-editor__exercise-name-wrapper">
                <SmartExerciseField
                  field="name"
                  exercise={exercise}
                  onChange={(value) => handleUpdateExercise(exercise.id, 'name', value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  suggestions={getFieldSuggestions(exercise.id, 'name')}
                />
              </div>
              
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
                <SmartExerciseField
                  field="sets"
                  exercise={exercise}
                  onChange={(value) => handleUpdateExercise(exercise.id, 'sets', value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  suggestions={getFieldSuggestions(exercise.id, 'sets')}
                />
              </div>
              
              <div className="workout-editor__exercise-field">
                <label htmlFor={`exercise-${exercise.id}-reps`}>Reps</label>
                <SmartExerciseField
                  field="reps"
                  exercise={exercise}
                  onChange={(value) => handleUpdateExercise(exercise.id, 'reps', value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  suggestions={getFieldSuggestions(exercise.id, 'reps')}
                />
              </div>
              
              <div className="workout-editor__exercise-field">
                <label htmlFor={`exercise-${exercise.id}-rest`}>Rest (sec)</label>
                <SmartExerciseField
                  field="restPeriod"
                  exercise={exercise}
                  onChange={(value) => handleUpdateExercise(exercise.id, 'restPeriod', value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  suggestions={getFieldSuggestions(exercise.id, 'restPeriod')}
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