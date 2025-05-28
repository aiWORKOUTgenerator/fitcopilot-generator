/**
 * Enhanced Exercise List Component
 * 
 * Displays and manages the list of exercises in the workout editor with premium glass morphism design,
 * accessibility improvements, smart parsing, intelligent suggestions, and enhanced user experience.
 * Enhanced with smart field components for better text handling and visual feedback.
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useWorkoutEditor } from './WorkoutEditorContext';
import { Button } from '../../../../components/ui';
import { ExpandableInput } from '../../../../components/ui/ExpandableInput';
import { AutoResizeTextareaWithCounter } from '../../../../components/ui/AutoResizeTextareaWithCounter';
import SmartFieldSuggestions from './SmartFieldSuggestions';
import { FieldValidator, FieldValidationResult } from '../../utils/FieldValidator';
import { FieldSuggestion } from '../../utils/ExerciseDataParser';
import { Plus, Trash2, GripVertical, CheckCircle, AlertTriangle, AlertCircle, Target, Dumbbell } from 'lucide-react';
import './workoutEditor.scss';
import './SmartFieldSuggestions.scss';

interface ExerciseListProps {
  /**
   * Whether the list is disabled (for loading/saving states)
   */
  isDisabled?: boolean;
}

/**
 * Enhanced Smart Exercise Field Component
 * Provides field-specific configuration for enhanced expansion with premium styling
 */
const SmartExerciseField: React.FC<{
  field: 'name' | 'sets' | 'reps' | 'restPeriod';
  exercise: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
  suggestions?: FieldSuggestion[];
}> = ({ field, exercise, onChange, onBlur, disabled, suggestions }) => {
  
  // Enhanced field-specific configuration with premium styling
  const getFieldConfig = () => {
    switch (field) {
      case 'name':
        return {
          allowMultiLine: true,
          autoExpand: true,
          expansionThreshold: 25,
          maxExpandedLines: 3,
          placeholder: "Exercise name (e.g., Push-ups, Squats)",
          type: "text" as const,
          className: "exercise-field-input exercise-field-input--name enhanced-field",
          icon: <Target size={16} />
        };
      case 'reps':
        return {
          allowMultiLine: false,
          autoExpand: true,
          expansionThreshold: 15,
          maxExpandedLines: 2,
          placeholder: "e.g. 10 or 8-12",
          type: "text" as const,
          className: "exercise-field-input exercise-field-input--reps enhanced-field",
          icon: <Dumbbell size={16} />
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
          className: "exercise-field-input exercise-field-input--sets enhanced-field"
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
          className: "exercise-field-input exercise-field-input--restPeriod enhanced-field"
        };
      default:
        return {
          allowMultiLine: false,
          autoExpand: false,
          expansionThreshold: 30,
          maxExpandedLines: 1,
          type: "text" as const,
          className: "exercise-field-input enhanced-field"
        };
    }
  };

  const config = getFieldConfig();
  const value = exercise[field];
  const hasHighConfidenceSuggestions = suggestions?.some(s => s.confidence > 0.8);
  const hasAnySuggestions = suggestions && suggestions.length > 0;

  return (
    <div className={`smart-exercise-field ${hasHighConfidenceSuggestions ? 'has-suggestions' : ''} ${hasAnySuggestions ? 'has-any-suggestions' : ''}`}>
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
      
      {/* Enhanced visual indicator for parsing confidence */}
      {hasHighConfidenceSuggestions && (
        <div 
          className="field-suggestion-indicator field-suggestion-indicator--high" 
          title="High-confidence smart suggestions available"
          aria-label="Smart suggestions available"
        >
          ✨
        </div>
      )}
      
      {/* Lower confidence suggestions indicator */}
      {hasAnySuggestions && !hasHighConfidenceSuggestions && (
        <div 
          className="field-suggestion-indicator field-suggestion-indicator--low" 
          title="Suggestions available"
          aria-label="Suggestions available"
        >
          💡
        </div>
      )}
    </div>
  );
};

/**
 * Enhanced Exercise List component for the workout editor with premium design
 */
const ExerciseList: React.FC<ExerciseListProps> = ({ isDisabled = false }) => {
  const { state, updateExercise, addExercise, removeExercise } = useWorkoutEditor();
  const { workout } = state;
  
  // State for managing validation results and enhanced UX
  const [validationResults, setValidationResults] = useState<{[exerciseId: string]: FieldValidationResult}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[exerciseId: string]: boolean}>({});
  const [draggedExercise, setDraggedExercise] = useState<string | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState(false);

  // Enhanced validation with better performance
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
    // Debounce validation updates for better performance
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

  // Enhanced textarea height adjustment with better performance
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

  // Enhanced add exercise with loading state
  const handleAddExercise = async () => {
    if (isAddingExercise) return;
    
    try {
      setIsAddingExercise(true);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      addExercise();
    } finally {
      setIsAddingExercise(false);
    }
  };

  // Enhanced remove exercise with confirmation for non-empty exercises
  const handleRemoveExercise = (id: string) => {
    const exercise = workout.exercises.find(ex => ex.id === id);
    if (exercise && (exercise.name || exercise.notes)) {
      const confirmed = window.confirm('Are you sure you want to remove this exercise? This action cannot be undone.');
      if (!confirmed) return;
    }
    removeExercise(id);
  };

  // Enhanced update exercise with better change tracking
  const handleUpdateExercise = (id: string, field: string, value: any) => {
    updateExercise(id, field, value);
  };

  // Enhanced blur handler with auto-save indication
  const handleBlur = () => {
    // In a real implementation, we might want to trigger an auto-save here
    // This would be connected to a debounced save function
  };

  // Enhanced suggestion handling with better UX feedback
  const handleApplySuggestion = async (exerciseId: string, field: string, value: any, suggestion: FieldSuggestion) => {
    try {
      // Apply the suggestion
      handleUpdateExercise(exerciseId, field, value);
      
      // Provide visual feedback
      const fieldElement = document.getElementById(`exercise-${exerciseId}-${field}`);
      if (fieldElement) {
        fieldElement.classList.add('suggestion-applied');
        setTimeout(() => {
          fieldElement.classList.remove('suggestion-applied');
        }, 1000);
      }
      
      // Update validation to reflect the change
      setTimeout(() => {
        const updatedValidation = validationResults[exerciseId];
        if (updatedValidation) {
          const filteredSuggestions = updatedValidation.suggestions.filter(s => s !== suggestion);
          setValidationResults(prev => ({
            ...prev,
            [exerciseId]: {
              ...updatedValidation,
              suggestions: filteredSuggestions
            }
          }));
        }
      }, 100);
      
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      // TODO: Show error toast
    }
  };

  // Enhanced dismiss suggestion
  const handleDismissSuggestion = (exerciseId: string, suggestion: FieldSuggestion) => {
    const updatedValidation = validationResults[exerciseId];
    if (updatedValidation) {
      const filteredSuggestions = updatedValidation.suggestions.filter(s => s !== suggestion);
      setValidationResults(prev => ({
        ...prev,
        [exerciseId]: {
          ...updatedValidation,
          suggestions: filteredSuggestions
        }
      }));
    }
  };

  // Enhanced apply all suggestions
  const handleApplyAllSuggestions = async (exerciseId: string, suggestions: FieldSuggestion[]) => {
    try {
      // Apply all suggestions in sequence
      for (const suggestion of suggestions) {
        await handleApplySuggestion(exerciseId, suggestion.field, suggestion.suggestedValue, suggestion);
        // Small delay between applications for better UX
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Hide suggestions panel after applying all
      setShowSuggestions(prev => ({
        ...prev,
        [exerciseId]: false
      }));
      
    } catch (error) {
      console.error('Failed to apply all suggestions:', error);
      // TODO: Show error toast
    }
  };

  // Enhanced toggle suggestions with better state management
  const toggleSuggestions = (exerciseId: string) => {
    setShowSuggestions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  // Enhanced validation status icon with better visual feedback
  const getValidationIcon = (validation: FieldValidationResult) => {
    if (!validation.isValid) {
      return (
        <div title="Validation errors found">
          <AlertCircle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--error" />
        </div>
      );
    }
    if (validation.hasWarnings || validation.suggestions.length > 0) {
      return (
        <div title="Suggestions available">
          <AlertTriangle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--warning" />
        </div>
      );
    }
    if (validation.confidence > 0.8) {
      return (
        <div title="Exercise looks good">
          <CheckCircle size={16} className="workout-editor__validation-icon workout-editor__validation-icon--success" />
        </div>
      );
    }
    return null;
  };

  // Get field suggestions for a specific field
  const getFieldSuggestions = (exerciseId: string, field: string): FieldSuggestion[] => {
    const validation = validationResults[exerciseId];
    return validation?.suggestions?.filter(s => s.field === field) || [];
  };

  // Enhanced exercise list stats for better UX
  const exerciseStats = useMemo(() => {
    const totalExercises = workout.exercises.length;
    const validExercises = Object.values(validationResults).filter(v => v.isValid).length;
    const exercisesWithSuggestions = Object.values(validationResults).filter(v => v.suggestions.length > 0).length;
    const exercisesWithErrors = Object.values(validationResults).filter(v => !v.isValid).length;
    
    return {
      total: totalExercises,
      valid: validExercises,
      withSuggestions: exercisesWithSuggestions,
      withErrors: exercisesWithErrors,
      completionRate: totalExercises > 0 ? Math.round((validExercises / totalExercises) * 100) : 0,
      hasIssues: exercisesWithErrors > 0 || exercisesWithSuggestions > 0
    };
  }, [workout.exercises, validationResults]);

  // Enhanced drag and drop functionality
  const handleDragStart = (exerciseId: string) => {
    setDraggedExercise(exerciseId);
  };

  const handleDragEnd = () => {
    setDraggedExercise(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedExercise) return;

    const draggedIndex = workout.exercises.findIndex(ex => ex.id === draggedExercise);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    // TODO: Implement exercise reordering
    // This would require adding a reorderExercise action to the context
    console.log(`Reorder exercise from ${draggedIndex} to ${targetIndex}`);
    setDraggedExercise(null);
  };

  return (
    <div 
      className="workout-editor__exercise-list workout-editor__exercise-list--enhanced"
      aria-disabled={isDisabled}
      role="region"
      aria-label="Exercise list"
    >
      {/* Enhanced Exercise List Header with Stats */}
      {workout.exercises.length > 0 && (
        <div className="workout-editor__exercise-list-header">
          <div className="exercise-list-stats">
            <div className="stats-primary">
              <span className="stat stat--total">
                <Target size={14} />
                <span className="stat__label">{exerciseStats.total} exercises</span>
              </span>
              <span className={`stat stat--completion ${exerciseStats.completionRate === 100 ? 'stat--complete' : ''}`}>
                <CheckCircle size={14} />
                <span className="stat__label">{exerciseStats.completionRate}% complete</span>
                <div className="stat__progress">
                  <div 
                    className="stat__progress-bar" 
                    style={{ width: `${exerciseStats.completionRate}%` }}
                    aria-label={`${exerciseStats.completionRate}% of exercises are valid`}
                  ></div>
                </div>
              </span>
            </div>
            
            {exerciseStats.hasIssues && (
              <div className="stats-secondary">
                {exerciseStats.withErrors > 0 && (
                  <span className="stat stat--errors">
                    <AlertCircle size={14} />
                    <span className="stat__label">{exerciseStats.withErrors} with errors</span>
                  </span>
                )}
                {exerciseStats.withSuggestions > 0 && (
                  <span className="stat stat--suggestions">
                    <AlertTriangle size={14} />
                    <span className="stat__label">{exerciseStats.withSuggestions} with suggestions</span>
                  </span>
                )}
              </div>
            )}
            
            {!exerciseStats.hasIssues && exerciseStats.total > 0 && (
              <div className="stats-success">
                <span className="stat stat--success">
                  <CheckCircle size={14} />
                  <span className="stat__label">All exercises look good!</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {workout.exercises.length === 0 ? (
        <div 
          className="workout-editor__empty-state workout-editor__empty-state--enhanced" 
          aria-live="polite"
        >
          <div className="empty-state-icon">
            <Dumbbell size={48} />
          </div>
          <h3 className="empty-state-title">No exercises added yet</h3>
          <p className="empty-state-description">
            Start building your workout by adding your first exercise below.
          </p>
        </div>
      ) : (
        <div className="workout-editor__exercise-items">
          {workout.exercises.map((exercise, index) => (
            <div 
              key={exercise.id} 
              className={`workout-editor__exercise-item workout-editor__exercise-item--enhanced ${draggedExercise === exercise.id ? 'dragging' : ''} ${validationResults[exercise.id]?.isValid === false ? 'has-errors' : ''} ${validationResults[exercise.id]?.suggestions?.length > 0 ? 'has-suggestions' : ''}`}
              aria-labelledby={`exercise-${exercise.id}-name`}
              draggable={!isDisabled}
              onDragStart={() => handleDragStart(exercise.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              role="listitem"
              aria-describedby={`exercise-${exercise.id}-status`}
            >
              <div className="workout-editor__exercise-header">
                <div 
                  className={`workout-editor__exercise-drag-handle ${isDisabled ? 'disabled' : ''}`}
                  aria-hidden="true"
                  title={isDisabled ? 'Drag disabled' : 'Drag to reorder exercise'}
                  tabIndex={isDisabled ? -1 : 0}
                  role="button"
                  aria-label={`Drag to reorder ${exercise.name || 'exercise'}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // TODO: Implement keyboard drag and drop
                      console.log('Keyboard drag initiated for', exercise.id);
                    }
                  }}
                >
                  <GripVertical size={20} />
                  <div className="drag-handle__indicator" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                
                <div className="workout-editor__exercise-number">
                  <span className="exercise-number__value">{index + 1}</span>
                  <span className="exercise-number__label">.</span>
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
                
                {/* Enhanced validation status and smart suggestions toggle */}
                <div className="workout-editor__exercise-status" id={`exercise-${exercise.id}-status`}>
                  {validationResults[exercise.id] && getValidationIcon(validationResults[exercise.id])}
                  {validationResults[exercise.id]?.suggestions?.length > 0 && (
                    <button
                      type="button"
                      className={`workout-editor__suggestions-toggle ${showSuggestions[exercise.id] ? 'active' : ''}`}
                      onClick={() => toggleSuggestions(exercise.id)}
                      title={`${validationResults[exercise.id].suggestions.length} suggestions available`}
                      aria-label={`Toggle suggestions for ${exercise.name || 'exercise'}`}
                      aria-expanded={showSuggestions[exercise.id]}
                      aria-controls={`suggestions-${exercise.id}`}
                      disabled={isDisabled}
                    >
                      <span className="suggestions-count">{validationResults[exercise.id].suggestions.length}</span>
                      <span className="suggestions-icon">💡</span>
                      <span className="suggestions-text">suggestions</span>
                    </button>
                  )}
                </div>
                
                <button
                  className="workout-editor__exercise-remove"
                  onClick={() => handleRemoveExercise(exercise.id)}
                  aria-label={`Remove ${exercise.name || 'exercise'}`}
                  disabled={isDisabled}
                  title="Remove exercise"
                >
                  <Trash2 size={18} />
                  <span className="remove-btn__text">Remove</span>
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
                  placeholder="Add notes, tips, or form cues for this exercise..."
                  disabled={isDisabled}
                  aria-label={`Notes for ${exercise.name || 'exercise'}`}
                  minRows={3}
                  maxRows={undefined}
                  maxCharacters={500}
                  showWarning={true}
                  expandOnMount={true}
                  performanceMode="optimized"
                  animateResize={true}
                  className="exercise-notes enhanced-textarea"
                />
              </div>
              
              {/* Enhanced Smart Field Suggestions */}
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
          ))}
        </div>
      )}
      
      {/* Enhanced Add Exercise Button */}
      <div className="workout-editor__add-exercise">
        <Button
          variant="secondary"
          size="md"
          onClick={handleAddExercise}
          startIcon={<Plus size={18} />}
          disabled={isDisabled || isAddingExercise}
          isLoading={isAddingExercise}
          aria-label="Add a new exercise to the workout"
          className="add-exercise-btn"
        >
          {isAddingExercise ? 'Adding...' : 'Add Exercise'}
        </Button>
      </div>
    </div>
  );
};

export default ExerciseList; 