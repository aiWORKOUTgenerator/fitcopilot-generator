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
  Loader
} from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import { useWorkoutContext } from '../../../features/workout-generator/context/WorkoutContext';
import { GeneratedWorkout } from '../../../features/workout-generator/types/workout';
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
  
  // Local state management
  const [editedWorkout, setEditedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['warm-up', 'main', 'cool-down']));
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize edited workout when switching to edit mode
  useEffect(() => {
    if (mode === 'edit' && workout) {
      setEditedWorkout({ ...workout });
      setHasChanges(false);
    }
  }, [mode, workout]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving && !isDeleting) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving, isDeleting]);

  // Memoized workout statistics
  const workoutStats = useMemo(() => {
    if (!workout) return null;
    
    const totalExercises = workout.exercises?.length || 0;
    const estimatedDuration = workout.duration || 30;
    const difficulty = workout.difficulty || 'intermediate';
    
    return {
      totalExercises,
      estimatedDuration,
      difficulty
    };
  }, [workout]);

  // Section toggle handler
  const handleSectionToggle = useCallback((sectionKey: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionKey)) {
        newSet.delete(sectionKey);
      } else {
        newSet.add(sectionKey);
      }
      return newSet;
    });
  }, []);

  // Mode switch with transition
  const handleModeSwitch = useCallback(async (newMode: ModalMode) => {
    if (mode === newMode || isTransitioning) return;

    // Check for unsaved changes when switching from edit to view
    if (mode === 'edit' && hasChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes. Are you sure you want to switch to view mode without saving?'
      );
      if (!confirmSwitch) return;
    }

    setIsTransitioning(true);
    
    // Brief transition delay for smooth UX
    setTimeout(() => {
      onModeChange(newMode);
      setIsTransitioning(false);
      
      // Reset changes when switching away from edit mode
      if (newMode !== 'edit') {
        setHasChanges(false);
        setEditedWorkout(null);
      }
    }, 150);
  }, [mode, hasChanges, onModeChange, isTransitioning]);

  // Close handler with unsaved changes check
  const handleClose = useCallback(() => {
    if (mode === 'edit' && hasChanges && !isSaving) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    
    setEditedWorkout(null);
    setHasChanges(false);
    onClose();
  }, [mode, hasChanges, isSaving, onClose]);

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
      const updatedWorkout = {
        ...editedWorkout,
        updated_at: new Date().toISOString()
      };

      await onSave(updatedWorkout);
      setHasChanges(false);
      
      // Auto-switch to view mode after saving
      setTimeout(() => {
        handleModeSwitch('view');
      }, 500);
    } catch (error) {
      console.error('Failed to save workout:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editedWorkout, isSaving, mode, onSave, handleModeSwitch]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!workout || isDeleting) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${workout.title}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(workout.id);
      } else {
        await deleteWorkoutAndRefresh(workout.id);
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

  const currentWorkout = mode === 'edit' ? editedWorkout : workout;
  if (!currentWorkout) return null;

  return (
    <div 
      className={`unified-workout-modal-overlay ${isOpen ? 'visible' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`unified-workout-modal ${isTransitioning ? 'transitioning' : ''}`}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="workout-info">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="workout-title-input"
                  value={currentWorkout.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={isSaving}
                  placeholder="Enter workout title"
                />
              ) : (
                <h2 className="workout-title">{currentWorkout.title}</h2>
              )}
              
              {workoutStats && (
                <div className="workout-stats">
                  <div className="stat">
                    <Target size={16} />
                    <span>{workoutStats.totalExercises} exercises</span>
                  </div>
                  <div className="stat">
                    <Clock size={16} />
                    <span>{workoutStats.estimatedDuration} min</span>
                  </div>
                  <div className="stat">
                    <Zap size={16} />
                    <span className={`difficulty difficulty-${workoutStats.difficulty}`}>
                      {workoutStats.difficulty}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="header-actions">
              {/* Mode Switch Buttons */}
              <div className="mode-switches">
                <Button
                  variant={mode === 'view' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleModeSwitch('view')}
                  disabled={isTransitioning || isSaving || isDeleting}
                  className="mode-btn"
                >
                  <Eye size={16} />
                  View
                </Button>
                <Button
                  variant={mode === 'edit' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleModeSwitch('edit')}
                  disabled={isTransitioning || isSaving || isDeleting}
                  className="mode-btn"
                >
                  <Edit3 size={16} />
                  Edit
                </Button>
              </div>

              {/* Close Button */}
              <Button
                variant="ghost"
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
          {isLoading || isTransitioning ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <Loader size={32} className="spinning" />
              </div>
              <p className="loading-text">
                {isTransitioning ? 'Switching modes...' : 'Loading workout...'}
              </p>
            </div>
          ) : (
            <div className="workout-content">
              {/* Workout Description */}
              <div className="workout-description-section">
                <h3 className="section-title">Description</h3>
                {mode === 'edit' ? (
                  <textarea
                    className="workout-description-input"
                    value={currentWorkout.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your workout..."
                    rows={3}
                    disabled={isSaving}
                  />
                ) : (
                  <p className="workout-description">
                    {currentWorkout.description || 'No description provided.'}
                  </p>
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
                {currentWorkout.exercises && currentWorkout.exercises.length > 0 ? (
                  <>
                    {/* Group exercises by type/section */}
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
                ) : (
                  <div className="no-exercises">
                    <p>⚠️ No exercises found in this workout.</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.7 }}>
                      This may indicate a data loading issue. Try refreshing the page or contact support if the problem persists.
                    </p>
                    {currentWorkout.sections && currentWorkout.sections.length > 0 && (
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