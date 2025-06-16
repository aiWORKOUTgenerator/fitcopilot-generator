/**
 * Unified Workout Modal Component
 * 
 * Advanced modal system that combines view and edit modes with smooth transitions,
 * optimized performance, and enhanced user experience.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  Edit3, 
  Save, 
  Eye, 
  Play,
  Copy,
  Trash2,
  Clock,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
  Loader,
  Plus,
  Minus
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { useWorkoutContext } from '../../../features/workout-generator/context/WorkoutContext';
import { useNavigation } from '../../../features/workout-generator/navigation/NavigationContext';
import { GeneratedWorkout, Exercise, TimedExercise, SetsExercise } from '../../../features/workout-generator/types/workout';
import { WorkoutSelectionSummary } from './components/WorkoutSelectionSummary';
import { WorkoutSelectionSummary as EnhancedSelectionSummary } from '../../../features/workout-generator/components/common/WorkoutSelectionSummary';
import { getWorkout } from '../../../features/workout-generator/services/workoutService';
import './UnifiedModal.scss';

export type ModalMode = 'view' | 'edit';

interface UnifiedWorkoutModalProps {
  /** The workout to display/edit */
  workout: GeneratedWorkout | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Current modal mode */
  mode: ModalMode;
  /** Loading state for async operations */
  isLoading?: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when mode changes */
  onModeChange: (mode: ModalMode) => void;
  /** Callback when workout is saved */
  onSave: (workout: GeneratedWorkout) => Promise<void>;
  /** Callback when workout is deleted */
  onDelete?: (workoutId: string) => Promise<void>;
  /** Callback when workout is duplicated */
  onDuplicate?: (workout: GeneratedWorkout) => Promise<void>;
  /** Callback when workout is started */
  onStart?: (workout: GeneratedWorkout) => void;
}

/**
 * Exercise Section Component with collapsible behavior
 */
interface ExerciseSectionProps {
  title: string;
  exercises: any[];
  duration?: number;
  isExpanded: boolean;
  onToggle: () => void;
  mode: ModalMode;
}

const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  title,
  exercises,
  duration,
  isExpanded,
  onToggle,
  mode
}) => {
  return (
    <div className={`exercise-section ${isExpanded ? 'expanded' : ''}`}>
      <div className="section-header" onClick={onToggle}>
        <div className="section-info">
          <h3 className="section-title">{title}</h3>
          <div className="section-meta">
            <span className="exercise-count">
              <Target size={14} />
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </span>
            {duration && (
              <span className="section-duration">
                <Clock size={14} />
                {duration} min
              </span>
            )}
          </div>
        </div>
        <div className="section-toggle">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      
      <div className={`section-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="exercises-list">
          {exercises.map((exercise, index) => {
            // Type-safe check for exercise format
            const isTimeBased = 'duration' in exercise && exercise.duration;
            const hasSetReps = 'sets' in exercise || 'reps' in exercise;
            
            return (
              <div key={index} className="exercise-item">
                <div className="exercise-header">
                  <h4 className="exercise-name">{exercise.name || 'Unnamed Exercise'}</h4>
                  <div className="exercise-details">
                    {isTimeBased && (
                      <span className="exercise-duration">
                        <Clock size={12} />
                        {exercise.duration}
                      </span>
                    )}
                    {hasSetReps && (
                      <>
                        {exercise.sets && (
                          <span className="exercise-sets">
                            {exercise.sets} sets
                          </span>
                        )}
                        {exercise.reps && (
                          <span className="exercise-reps">
                            {exercise.reps} reps
                          </span>
                        )}
                      </>
                    )}
                    {/* Fallback for exercises without clear format */}
                    {!isTimeBased && !hasSetReps && (
                      <span className="exercise-fallback">
                        Exercise details
                      </span>
                    )}
                  </div>
                </div>
                {exercise.description && (
                  <p className="exercise-description">{exercise.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/**
 * Editable Exercise Section Component for edit mode
 */
interface EditableExerciseSectionProps {
  title: string;
  exercises: Exercise[];
  sectionType: 'warm-up' | 'main' | 'cool-down';
  isExpanded: boolean;
  onToggle: () => void;
  onExercisesChange: (exercises: Exercise[], sectionType: string) => void;
}

const EditableExerciseSection: React.FC<EditableExerciseSectionProps> = ({
  title,
  exercises,
  sectionType,
  isExpanded,
  onToggle,
  onExercisesChange
}) => {
  // Helper function to determine if exercise is timed
  const isTimedExercise = (exercise: Exercise): exercise is TimedExercise => {
    return 'duration' in exercise;
  };

  // Helper function to determine if exercise is sets-based
  const isSetsExercise = (exercise: Exercise): exercise is SetsExercise => {
    return 'sets' in exercise && 'reps' in exercise;
  };

  // Update individual exercise
  const updateExercise = (index: number, updatedExercise: Exercise) => {
    const newExercises = [...exercises];
    newExercises[index] = updatedExercise;
    onExercisesChange(newExercises, sectionType);
  };

  // Remove exercise
  const removeExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    onExercisesChange(newExercises, sectionType);
  };

  // Add new exercise
  const addExercise = () => {
    const newExercise: Exercise = sectionType === 'main' 
      ? {
          name: '',
          sets: 3,
          reps: 12,
          description: '',
          type: 'main',
          section: title
        }
      : {
          name: '',
          duration: '30 seconds',
          description: '',
          type: sectionType as 'warm-up' | 'cool-down',
          section: title
        };
    
    const newExercises = [...exercises, newExercise];
    onExercisesChange(newExercises, sectionType);
  };

  return (
    <div className={`exercise-section editable ${isExpanded ? 'expanded' : ''}`}>
      <div className="section-header" onClick={onToggle}>
        <div className="section-info">
          <h3 className="section-title">{title}</h3>
          <div className="section-meta">
            <span className="exercise-count">
              <Target size={14} />
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="section-toggle">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      
      <div className={`section-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="exercises-list">
          {exercises.map((exercise, index) => (
            <div key={index} className="exercise-item editable">
              <div className="exercise-form">
                {/* Exercise Name */}
                <div className="form-row">
                  <label className="form-label">Exercise Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, { ...exercise, name: e.target.value })}
                    placeholder="Enter exercise name"
                  />
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    className="remove-exercise-btn"
                    aria-label="Remove exercise"
                  >
                    <Minus size={16} />
                  </Button>
                </div>

                {/* Exercise Details - Timed vs Sets */}
                <div className="form-row">
                  {isTimedExercise(exercise) ? (
                    <>
                      <div className="form-field">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          value={exercise.duration}
                          onChange={(e) => updateExercise(index, { ...exercise, duration: e.target.value })}
                          placeholder="e.g., 30 seconds, 2 minutes"
                        />
                      </div>
                    </>
                  ) : isSetsExercise(exercise) ? (
                    <>
                      <div className="form-field">
                        <label className="form-label">Sets</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max="20"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(index, { 
                            ...exercise, 
                            sets: parseInt(e.target.value) || 1 
                          })}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Reps</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          max="100"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(index, { 
                            ...exercise, 
                            reps: parseInt(e.target.value) || 1 
                          })}
                        />
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Exercise Description */}
                <div className="form-row">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={exercise.description}
                    onChange={(e) => updateExercise(index, { ...exercise, description: e.target.value })}
                    placeholder="Exercise instructions or notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Exercise Button */}
          <div className="add-exercise-section">
            <Button
              variant="outline"
              size="sm"
              onClick={addExercise}
              className="add-exercise-btn"
            >
              <Plus size={16} />
              Add Exercise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Unified Workout Modal Component
 */
export const UnifiedWorkoutModal: React.FC<UnifiedWorkoutModalProps> = ({
  workout,
  isOpen,
  mode,
  isLoading = false,
  onClose,
  onModeChange,
  onSave,
  onDelete,
  onDuplicate,
  onStart
}) => {
  const { updateWorkoutAndRefresh, deleteWorkoutAndRefresh } = useWorkoutContext();
  const { openEditor } = useNavigation();
  
  // Local state management
  const [editedWorkout, setEditedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['warm-up', 'main', 'cool-down']));
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // CRITICAL FIX: Load complete workout data using WorkoutService (same as EnhancedWorkoutModal)
  const [completeWorkout, setCompleteWorkout] = useState<GeneratedWorkout | null>(null);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);

  // CRITICAL FIX: Load complete workout data when modal opens (same as EnhancedWorkoutModal)
  useEffect(() => {
    const loadCompleteWorkout = async () => {
      if (isOpen && workout?.id) {
        setIsLoadingComplete(true);
        try {
          console.log('[UnifiedWorkoutModal] Loading complete workout data using WorkoutService (same as EnhancedWorkoutModal)');
          const completeData = await getWorkout(workout.id.toString());
          console.log('[UnifiedWorkoutModal] Complete workout loaded:', {
            id: completeData.id,
            title: completeData.title,
            exerciseCount: completeData.exercises?.length || 0,
            sectionCount: completeData.sections?.length || 0
          });
          setCompleteWorkout(completeData);
        } catch (error) {
          console.error('[UnifiedWorkoutModal] Failed to load complete workout:', error);
          // Fallback to original workout data
          setCompleteWorkout(workout);
        } finally {
          setIsLoadingComplete(false);
        }
      }
    };

    loadCompleteWorkout();
  }, [isOpen, workout?.id]);

  // Initialize edited workout when switching to edit mode
  useEffect(() => {
    const workoutToEdit = completeWorkout || workout;
    if (mode === 'edit' && workoutToEdit) {
      setEditedWorkout({ ...workoutToEdit });
      setHasChanges(false);
    }
  }, [mode, completeWorkout, workout]);

  // Handle escape key with proper cleanup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving && !isDeleting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSaving, isDeleting, onClose]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Any resize-specific logic can go here
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Use WorkoutSelectionSummary's proven calculation logic for header stats
  const workoutStats = useMemo(() => {
    const currentWorkout = mode === 'edit' ? editedWorkout : (completeWorkout || workout);
    if (!currentWorkout) return null;

    // EXACT COPY of calculateWorkoutStats from WorkoutSelectionSummary
    const totalExercises = currentWorkout.exercises?.length || 
      currentWorkout.sections?.reduce((total, section) => total + (section.exercises?.length || 0), 0) || 0;
    
    const estimatedDuration = currentWorkout.duration || 30;
    const difficulty = currentWorkout.difficulty || 'intermediate';

    // Debug: Log workout stats calculation
    console.log('🎯 UnifiedWorkoutModal - Workout stats calculated');

    return {
      totalExercises,
      estimatedDuration,
      difficulty,
      workout: currentWorkout, // For WorkoutSelectionSummary in body
      fitness_level: currentWorkout.fitness_level,
      intensity_level: currentWorkout.intensity_level,
      exercise_complexity: currentWorkout.exercise_complexity,
      stress_level: currentWorkout.stress_level,
      energy_level: currentWorkout.energy_level,
      sleep_quality: currentWorkout.sleep_quality,
      location: currentWorkout.location,
      primary_muscle_focus: currentWorkout.primary_muscle_focus,
      custom_notes: currentWorkout.custom_notes
    };
  }, [mode, editedWorkout, completeWorkout, workout]);

  // Section toggle handler
  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  // Exercise update handler for edit mode
  const handleExercisesChange = useCallback((newExercises: Exercise[], sectionType: string) => {
    if (mode !== 'edit' || !editedWorkout) return;

    // Get all exercises and replace the ones for this section
    const allExercises = editedWorkout.exercises || [];
    
    // Filter out exercises from the current section
    const otherExercises = allExercises.filter(ex => {
      const exerciseSection = ex.section?.toLowerCase() || '';
      const exerciseType = ex.type || '';
      
      if (sectionType === 'warm-up') {
        return exerciseType !== 'warm-up' && !exerciseSection.includes('warm');
      } else if (sectionType === 'cool-down') {
        return exerciseType !== 'cool-down' && !exerciseSection.includes('cool');
      } else {
        return exerciseType === 'warm-up' || exerciseType === 'cool-down' || 
               exerciseSection.includes('warm') || exerciseSection.includes('cool');
      }
    });

    // Combine other exercises with new exercises for this section
    const updatedExercises = [...otherExercises, ...newExercises];

    setEditedWorkout(prev => prev ? {
      ...prev,
      exercises: updatedExercises
    } : null);
    setHasChanges(true);
  }, [mode, editedWorkout]);

  // Close handler with unsaved changes check
  const handleClose = useCallback(() => {
    if (hasChanges && mode === 'edit') {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    onClose();
  }, [hasChanges, mode, onClose]);

  // Dual Modal System Handlers
  const handleOpenEnhancedView = useCallback(() => {
    if (!workout || !workout.id) return;
    
    const workoutId = workout.id;
    console.log('[UnifiedWorkoutModal] Opening EnhancedWorkoutModal for view:', {
      id: workoutId,
      title: workout.title
    });
    
    // Close current modal and open EnhancedWorkoutModal
    onClose();
    openEditor(workoutId.toString(), { referrer: 'library' });
  }, [workout, onClose, openEditor]);

  const handleOpenWorkoutEditor = useCallback(() => {
    if (!workout || !workout.id) return;
    
    const workoutId = workout.id;
    console.log('[UnifiedWorkoutModal] Opening WorkoutEditorModal for edit:', {
      id: workoutId,
      title: workout.title
    });
    
    // Close current modal and open WorkoutEditorModal
    onClose();
    // The openEditor will open the EnhancedWorkoutModal first, then user can switch to edit
    openEditor(workoutId.toString(), { referrer: 'library' });
  }, [workout, onClose, openEditor]);

  // Legacy mode switch handler (kept for backward compatibility)
  const handleModeSwitch = useCallback((newMode: ModalMode) => {
    if (newMode === mode || isTransitioning) return;

    if (hasChanges && mode === 'edit' && newMode === 'view') {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch to view mode without saving?'
      );
      if (!confirmSwitch) return;
    }

    setIsTransitioning(true);
    onModeChange(newMode);

    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
      if (newMode === 'view') {
        setHasChanges(false);
        setEditedWorkout(null);
      }
    }, 150);
  }, [mode, hasChanges, onModeChange, isTransitioning]);

  // Input change handler for edit mode
  const handleInputChange = useCallback((field: keyof GeneratedWorkout, value: any) => {
    if (mode !== 'edit' || !editedWorkout) return;

    setEditedWorkout(prev => ({
      ...prev!,
      [field]: value
    }));
    setHasChanges(true);
  }, [mode, editedWorkout]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!editedWorkout || isSaving || mode !== 'edit') return;

    setIsSaving(true);
    try {
      console.log('[UnifiedWorkoutModal] Preparing to save workout:', {
        id: editedWorkout.id,
        title: editedWorkout.title,
        originalVersion: workout?.version,
        editedVersion: editedWorkout.version,
        exerciseCount: editedWorkout.exercises?.length || 0
      });

      // CRITICAL FIX: Ensure version is preserved from original workout
      const updatedWorkout = {
        ...editedWorkout,
        // Preserve version from original workout if not already set
        version: editedWorkout.version || workout?.version || 1,
        updated_at: new Date().toISOString()
      };

      console.log('[UnifiedWorkoutModal] Saving workout with version:', {
        id: updatedWorkout.id,
        version: updatedWorkout.version,
        title: updatedWorkout.title
      });

      await onSave(updatedWorkout);
      setHasChanges(false);
      
      console.log('[UnifiedWorkoutModal] Workout saved successfully');
      
      // Auto-switch to view mode after saving
      setTimeout(() => {
        handleModeSwitch('view');
      }, 500);
    } catch (error) {
      console.error('[UnifiedWorkoutModal] Failed to save workout:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editedWorkout, isSaving, mode, onSave, handleModeSwitch, workout]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!workout || isDeleting) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${workout.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const workoutId = workout.id?.toString() || '';
      if (onDelete) {
        await onDelete(workoutId);
      } else {
        await deleteWorkoutAndRefresh(workoutId);
      }
      onClose();
    } catch (error) {
      console.error('Failed to delete workout:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [workout, isDeleting, onDelete, deleteWorkoutAndRefresh, onClose]);

  // Duplicate handler
  const handleDuplicate = useCallback(async () => {
    if (!workout || !onDuplicate) return;

    try {
      await onDuplicate(workout);
    } catch (error) {
      console.error('Failed to duplicate workout:', error);
    }
  }, [workout, onDuplicate]);

  // Start workout handler
  const handleStart = useCallback(() => {
    if (!workout || !onStart) return;
    onStart(workout);
  }, [workout, onStart]);



  // Backdrop click handler
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving && !isDeleting) {
      handleClose();
    }
  }, [isSaving, isDeleting, handleClose]);

  // Don't render if not open or no workout
  if (!isOpen || !workout) return null;

  // CRITICAL FIX: Use complete workout data (same as EnhancedWorkoutModal)
  const currentWorkout = mode === 'edit' ? editedWorkout : (completeWorkout || workout);
  if (!currentWorkout) return null;

  return (
    <div 
      className={`unified-workout-modal-overlay ${isOpen ? 'visible' : ''} glass-morphism`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className={`unified-workout-modal glass-surface ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Enhanced Modal Header with Glass Morphism */}
        <div className="modal-header glass-header">
          <div className="header-content">
            <div className="workout-info">
              {mode === 'edit' ? (
                <input
                  id="modal-title"
                  type="text"
                  className="workout-title-input glass-input"
                  value={currentWorkout.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSaving}
                  placeholder="Enter workout title"
                  aria-label="Workout title"
                />
              ) : (
                <h2 id="modal-title" className="workout-title">{currentWorkout.title}</h2>
              )}
              
              {workoutStats && (
                <div className="workout-stats" id="modal-description">
                  {/* Core Workout Stats */}
                  <div className="stat glass-stat">
                    <Target size={16} aria-hidden="true" />
                    <span>{workoutStats.totalExercises} exercises</span>
                  </div>
                  <div className="stat glass-stat">
                    <Clock size={16} aria-hidden="true" />
                    <span>{workoutStats.estimatedDuration} min</span>
                  </div>
                  
                  {/* PHASE 5: Enhanced fitness-specific stats */}
                  <div className="stat glass-stat">
                    <span className={`fitness-level fitness-level-${workoutStats.fitness_level || workoutStats.difficulty}`}>
                      {workoutStats.fitness_level ? 
                        `🟢 ${workoutStats.fitness_level}` : 
                        `🟡 ${workoutStats.difficulty}`
                      }
                    </span>
                  </div>
                  {workoutStats.intensity_level && (
                    <div className="stat glass-stat">
                      <Zap size={16} aria-hidden="true" />
                      <span className="intensity-level">
                        {workoutStats.intensity_level}/5
                      </span>
                    </div>
                  )}
                  {workoutStats.exercise_complexity && (
                    <div className="stat glass-stat">
                      <span className={`exercise-complexity exercise-complexity-${workoutStats.exercise_complexity}`}>
                        🔧 {workoutStats.exercise_complexity}
                      </span>
                    </div>
                  )}
                  
                  {/* SPRINT 3: NEW WorkoutGeneratorGrid daily state stats */}
                  {workoutStats.stress_level && (
                    <div className="stat glass-stat daily-state-stat">
                      <span className="daily-state-icon">
                        {workoutStats.stress_level === 'low' && '😌'}
                        {workoutStats.stress_level === 'moderate' && '😐'}
                        {workoutStats.stress_level === 'high' && '😰'}
                        {workoutStats.stress_level === 'very_high' && '😫'}
                      </span>
                      <span>Stress: {
                        workoutStats.stress_level === 'low' ? 'Calm' :
                        workoutStats.stress_level === 'moderate' ? 'Moderate' :
                        workoutStats.stress_level === 'high' ? 'Stressed' :
                        'Very Stressed'
                      }</span>
                    </div>
                  )}
                  
                  {workoutStats.energy_level && (
                    <div className="stat glass-stat daily-state-stat">
                      <span className="daily-state-icon">
                        {workoutStats.energy_level === 'very_low' && '😴'}
                        {workoutStats.energy_level === 'low' && '😑'}
                        {workoutStats.energy_level === 'moderate' && '😊'}
                        {workoutStats.energy_level === 'high' && '😄'}
                        {workoutStats.energy_level === 'very_high' && '🤩'}
                      </span>
                      <span>Energy: {
                        workoutStats.energy_level === 'very_low' ? 'Drained' :
                        workoutStats.energy_level === 'low' ? 'Low' :
                        workoutStats.energy_level === 'moderate' ? 'Balanced' :
                        workoutStats.energy_level === 'high' ? 'Energetic' :
                        'Pumped'
                      }</span>
                    </div>
                  )}
                  
                  {workoutStats.sleep_quality && (
                    <div className="stat glass-stat daily-state-stat">
                      <span className="daily-state-icon">
                        {workoutStats.sleep_quality === 'poor' && '😵'}
                        {workoutStats.sleep_quality === 'fair' && '😪'}
                        {workoutStats.sleep_quality === 'good' && '😌'}
                        {workoutStats.sleep_quality === 'excellent' && '😴'}
                      </span>
                      <span>Sleep: {
                        workoutStats.sleep_quality === 'poor' ? 'Poor' :
                        workoutStats.sleep_quality === 'fair' ? 'Fair' :
                        workoutStats.sleep_quality === 'good' ? 'Good' :
                        'Excellent'
                      }</span>
                    </div>
                  )}
                  
                  {/* SPRINT 3: NEW Environment context stat */}
                  {workoutStats.location && workoutStats.location !== 'any' && (
                    <div className="stat glass-stat environment-stat">
                      <span className="environment-icon">
                        {workoutStats.location === 'home' && '🏠'}
                        {workoutStats.location === 'gym' && '🏋️'}
                        {workoutStats.location === 'outdoors' && '🌳'}
                        {workoutStats.location === 'travel' && '✈️'}
                      </span>
                      <span>{
                        workoutStats.location === 'home' ? 'Home' :
                        workoutStats.location === 'gym' ? 'Gym' :
                        workoutStats.location === 'outdoors' ? 'Outdoors' :
                        'Travel'
                      }</span>
                    </div>
                  )}
                  
                  {/* SPRINT 3: NEW Primary muscle focus stat */}
                  {workoutStats.primary_muscle_focus && (
                    <div className="stat glass-stat muscle-focus-stat">
                      <span className="muscle-focus-icon">🎯</span>
                      <span>Focus: {workoutStats.primary_muscle_focus}</span>
                    </div>
                  )}
                  
                  {/* SPRINT 3: NEW Custom notes indicator */}
                  {workoutStats.custom_notes && (
                    <div className="stat glass-stat custom-notes-stat">
                      <span className="notes-icon">📝</span>
                      <span>Custom Notes</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="header-actions">
              {/* Dual Modal System Buttons */}
              <div className="mode-switches">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenEnhancedView}
                  disabled={isTransitioning || isSaving || isDeleting}
                  className="mode-btn"
                  title="Open in Enhanced View Mode"
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenWorkoutEditor}
                  disabled={isTransitioning || isSaving || isDeleting}
                  className="mode-btn"
                  title="Open in Workout Editor"
                >
                  <Edit3 size={16} />
                  Edit
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="text"
                size="sm"
                onClick={handleClose}
                disabled={isSaving || isDeleting}
                className="close-btn"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {isLoading || isTransitioning || isLoadingComplete ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <Loader size={32} className="spinning" />
              </div>
              <p className="loading-text">
                {isTransitioning ? 'Switching modes...' : 
                 isLoadingComplete ? 'Loading complete workout data...' : 
                 'Loading workout...'}
              </p>
            </div>
          ) : (
            <div className="workout-content">
              {/* Workout Configuration Summary */}
              <div className="workout-configuration-section">
                {mode === 'edit' ? (
                  <>
                    <h3 className="section-title">Description</h3>
                    <textarea
                      className="workout-description-input"
                      value={currentWorkout.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your workout..."
                      rows={3}
                      disabled={isSaving}
                    />
                  </>
                ) : (
                  <>
                    <WorkoutSelectionSummary
                      duration={workoutStats?.workout?.duration}
                      difficulty={workoutStats?.workout?.difficulty}
                      equipment={workoutStats?.workout?.equipment}
                      goals={workoutStats?.workout?.goals}
                      sessionInputs={(workoutStats?.workout as any)?.sessionInputs}
                      workoutData={workoutStats?.workout}
                    />
                    
                    {/* Enhanced Workout Selections Summary Box */}
                    <div className="enhanced-workout-selections" style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🎯 Enhanced Workout Selections Summary
                      </h3>
                      <p style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.875rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        lineHeight: '1.4'
                      }}>
                        Complete data from WorkoutGeneratorGrid and profile context
                      </p>
                      
                      {workoutStats?.workout && (
                        <EnhancedSelectionSummary 
                          workout={workoutStats.workout}
                          className="enhanced-selections-content"
                        />
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Workout Details in Edit Mode */}
              {mode === 'edit' && (
                <div className="workout-details-section">
                  <h3 className="section-title">Workout Details</h3>
                  <div className="details-grid">
                    <div className="detail-field">
                      <label htmlFor="duration">Duration (minutes)</label>
                      <input
                        id="duration"
                        type="number"
                        min="1"
                        max="300"
                        value={currentWorkout.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                        disabled={isSaving}
                      />
                    </div>
                    <div className="detail-field">
                      <label htmlFor="difficulty">Difficulty</label>
                      <select
                        id="difficulty"
                        value={currentWorkout.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        disabled={isSaving}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Exercise Sections */}
              <div className="exercise-sections">
                {(currentWorkout.exercises && currentWorkout.exercises.length > 0) || 
                 (currentWorkout.sections && currentWorkout.sections.length > 0 && 
                  currentWorkout.sections.some(section => section.exercises && section.exercises.length > 0)) ? (
                  <>
                    {currentWorkout.exercises && currentWorkout.exercises.length > 0 ? (
                      // Direct exercises format
                      <>
                        {mode === 'edit' ? (
                          // Edit Mode - Use Editable Exercise Sections
                          <>
                            <EditableExerciseSection
                              title="Warm-up"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'warm-up' || 
                                (ex.section && ex.section.toLowerCase().includes('warm'))
                              ) || []}
                              sectionType="warm-up"
                              isExpanded={expandedSections.has('warm-up')}
                              onToggle={() => handleSectionToggle('warm-up')}
                              onExercisesChange={(exercises, sectionType) => {
                                handleExercisesChange(exercises, sectionType);
                              }}
                            />
                            <EditableExerciseSection
                              title="Main Workout"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'main' || 
                                ex.type === 'strength' ||
                                !ex.type ||
                                (ex.section && !ex.section.toLowerCase().includes('warm') && !ex.section.toLowerCase().includes('cool'))
                              ) || currentWorkout.exercises}
                              sectionType="main"
                              isExpanded={expandedSections.has('main')}
                              onToggle={() => handleSectionToggle('main')}
                              onExercisesChange={(exercises, sectionType) => {
                                handleExercisesChange(exercises, sectionType);
                              }}
                            />
                            <EditableExerciseSection
                              title="Cool-down"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'cool-down' || 
                                (ex.section && ex.section.toLowerCase().includes('cool'))
                              ) || []}
                              sectionType="cool-down"
                              isExpanded={expandedSections.has('cool-down')}
                              onToggle={() => handleSectionToggle('cool-down')}
                              onExercisesChange={(exercises, sectionType) => {
                                handleExercisesChange(exercises, sectionType);
                              }}
                            />
                          </>
                        ) : (
                          // View Mode - Use Regular Exercise Sections
                          <>
                            <ExerciseSection
                              title="Warm-up"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'warm-up' || 
                                (ex.section && ex.section.toLowerCase().includes('warm'))
                              ) || []}
                              isExpanded={expandedSections.has('warm-up')}
                              onToggle={() => handleSectionToggle('warm-up')}
                              mode={mode}
                            />
                            <ExerciseSection
                              title="Main Workout"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'main' || 
                                ex.type === 'strength' ||
                                !ex.type ||
                                (ex.section && !ex.section.toLowerCase().includes('warm') && !ex.section.toLowerCase().includes('cool'))
                              ) || currentWorkout.exercises}
                              isExpanded={expandedSections.has('main')}
                              onToggle={() => handleSectionToggle('main')}
                              mode={mode}
                            />
                            <ExerciseSection
                              title="Cool-down"
                              exercises={currentWorkout.exercises.filter(ex => 
                                ex.type === 'cool-down' || 
                                (ex.section && ex.section.toLowerCase().includes('cool'))
                              ) || []}
                              isExpanded={expandedSections.has('cool-down')}
                              onToggle={() => handleSectionToggle('cool-down')}
                              mode={mode}
                            />
                          </>
                        )}
                      </>
                    ) : currentWorkout.sections && currentWorkout.sections.length > 0 ? (
                      // Sections format - render sections directly
                      <>
                        {currentWorkout.sections.map((section: any, index: number) => (
                          <ExerciseSection
                            key={section.name || `section-${index}`}
                            title={section.name || `Section ${index + 1}`}
                            exercises={section.exercises || []}
                            duration={section.duration}
                            isExpanded={expandedSections.has(section.name || `section-${index}`)}
                            onToggle={() => handleSectionToggle(section.name || `section-${index}`)}
                            mode={mode}
                          />
                        ))}
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="no-exercises">
                    <p>⚠️ No exercises found in this workout.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
                      This may indicate a data loading issue. The workout might have exercises stored in a different format.
                    </p>
                    
                    {/* Check if exercises exist in sections format */}
                    {currentWorkout.sections && currentWorkout.sections.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: '#22c55e', marginBottom: '0.5rem' }}>
                          ✅ Found {currentWorkout.sections.length} workout section(s) with exercises:
                        </p>
                        {currentWorkout.sections.map((section: any, index: number) => (
                          <div key={index} style={{ 
                            background: 'rgba(255,255,255,0.02)', 
                            padding: '0.75rem', 
                            borderRadius: '4px', 
                            marginBottom: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            <h4 style={{ 
                              margin: '0 0 0.5rem 0', 
                              color: '#ffffff', 
                              fontSize: '0.875rem',
                              fontWeight: '600' 
                            }}>
                              {section.name || `Section ${index + 1}`}
                              {section.duration && ` (${section.duration} min)`}
                            </h4>
                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                              {section.exercises && section.exercises.length > 0 ? (
                                <ul style={{ margin: '0', paddingLeft: '1rem' }}>
                                  {section.exercises.slice(0, 3).map((exercise: any, exerciseIndex: number) => (
                                    <li key={exerciseIndex} style={{ marginBottom: '0.25rem' }}>
                                      {exercise.name || `Exercise ${exerciseIndex + 1}`}
                                      {exercise.sets && exercise.reps && ` - ${exercise.sets} sets × ${exercise.reps} reps`}
                                      {exercise.duration && ` - ${exercise.duration}`}
                                    </li>
                                  ))}
                                  {section.exercises.length > 3 && (
                                    <li style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                      +{section.exercises.length - 3} more exercises
                                    </li>
                                  )}
                                </ul>
                              ) : (
                                <span style={{ color: '#ef4444' }}>No exercises in this section</span>
                              )}
                            </div>
                          </div>
                        ))}
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', fontStyle: 'italic' }}>
                          Try closing and reopening this modal to reload the exercise data properly.
                        </p>
                      </div>
                    )}
                    
                    {/* Debug info for technical troubleshooting */}
                    {process.env.NODE_ENV === 'development' && (
                      <details style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
                        <summary style={{ cursor: 'pointer', opacity: 0.7 }}>Debug: Show raw data</summary>
                        <pre style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                          {JSON.stringify(currentWorkout, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-actions">
            {mode === 'view' ? (
              // View Mode Actions
              <div className="view-actions">
                <div className="primary-actions">
                  {onStart && (
                    <Button
                      variant="gradient"
                      onClick={handleStart}
                      disabled={isLoading}
                    >
                      <Play size={16} />
                      Start Workout
                    </Button>
                  )}
                </div>
                <div className="secondary-actions">
                  {onDuplicate && (
                    <Button
                      variant="outline"
                      onClick={handleDuplicate}
                      disabled={isLoading}
                    >
                      <Copy size={16} />
                      Duplicate
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      disabled={isLoading}
                      isLoading={isDeleting}
                      className="delete-btn"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              // Edit Mode Actions
              <div className="edit-actions">
                <div className="primary-actions">
                  <Button
                    variant="gradient"
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    isLoading={isSaving}
                  >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
                <div className="secondary-actions">
                  <Button
                    variant="outline"
                    onClick={() => handleModeSwitch('view')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Changes Indicator */}
          {mode === 'edit' && hasChanges && (
            <div className="changes-indicator">
              <span className="changes-dot"></span>
              <span className="changes-text">You have unsaved changes</span>
            </div>
          )}
        </div>
      </div>

      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="transition-overlay">
          <div className="transition-spinner">
            <Loader size={24} className="spinning" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedWorkoutModal; 