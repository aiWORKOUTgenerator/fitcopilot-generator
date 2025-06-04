/**
 * Edit Workout Modal Component
 * 
 * Provides a seamless edit workflow for opening saved workouts in the editor
 * with integration to the workout context for real-time updates.
 */
import React, { useState, useEffect } from 'react';
import { X, Edit3, Save, Loader } from 'lucide-react';
import Button from '../../../../components/ui/Button/Button';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { GeneratedWorkout } from '../../types/workout';

interface EditWorkoutModalProps {
  /** The workout to edit */
  workout: GeneratedWorkout | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when edit is completed */
  onEditComplete?: (updatedWorkout: GeneratedWorkout) => void;
}

/**
 * EditWorkoutModal provides edit workflow for saved workouts
 */
export const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({
  workout,
  isOpen,
  onClose,
  onEditComplete
}) => {
  const { updateWorkoutAndRefresh } = useWorkoutContext();
  const [editedWorkout, setEditedWorkout] = useState<GeneratedWorkout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize edited workout when modal opens
  useEffect(() => {
    if (isOpen && workout) {
      setEditedWorkout({ ...workout });
      setHasChanges(false);
    }
  }, [isOpen, workout]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isSaving]);

  const handleClose = () => {
    if (hasChanges && !isSaving) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    
    setEditedWorkout(null);
    setHasChanges(false);
    onClose();
  };

  const handleInputChange = (field: keyof GeneratedWorkout, value: any) => {
    if (!editedWorkout) return;

    setEditedWorkout(prev => ({
      ...prev!,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedWorkout || isSaving) return;

    setIsSaving(true);
    try {
      // CRITICAL FIX: Ensure the workout has proper ID for updating
      // Map post_id to id if needed for consistency
      const workoutToSave = {
        ...editedWorkout,
        // Ensure id is set from either id or post_id
        id: editedWorkout.id || (editedWorkout as any).post_id,
        updated_at: new Date().toISOString()
      };

      console.log('[EditWorkoutModal] Saving workout with ID mapping:', {
        'original_id': editedWorkout.id,
        'original_post_id': (editedWorkout as any).post_id,
        'resolved_id': workoutToSave.id,
        'title': workoutToSave.title,
        'version': workoutToSave.version
      });

      const savedWorkout = await updateWorkoutAndRefresh(workoutToSave);
      
      setHasChanges(false);
      onEditComplete?.(savedWorkout);
      onClose();
    } catch (error) {
      console.error('Failed to save workout:', error);
      // Error feedback is handled by the context
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      handleClose();
    }
  };

  if (!isOpen || !editedWorkout) return null;

  return (
    <div 
      className="edit-workout-modal-overlay"
      onClick={handleBackdropClick}
    >
      <div className="edit-workout-modal">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-info">
            <div className="header-icon">
              <Edit3 size={24} />
            </div>
            <div className="header-text">
              <h2 className="modal-title">Edit Workout</h2>
              <p className="modal-subtitle">
                Make changes to "{editedWorkout.title}"
              </p>
            </div>
          </div>
          
          <button
            className="close-btn"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-field">
                <label htmlFor="workout-title" className="field-label">
                  Workout Title
                </label>
                <input
                  id="workout-title"
                  type="text"
                  className="field-input"
                  value={editedWorkout.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter workout title"
                  disabled={isSaving}
                />
              </div>

              <div className="form-field">
                <label htmlFor="workout-description" className="field-label">
                  Description
                </label>
                <textarea
                  id="workout-description"
                  className="field-textarea"
                  value={editedWorkout.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your workout"
                  rows={3}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Workout Details */}
            <div className="form-section">
              <h3 className="section-title">Workout Details</h3>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="workout-duration" className="field-label">
                    Duration (minutes)
                  </label>
                  <input
                    id="workout-duration"
                    type="number"
                    className="field-input"
                    value={editedWorkout.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    min="1"
                    max="300"
                    disabled={isSaving}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="workout-difficulty" className="field-label">
                    Difficulty Level
                  </label>
                  <select
                    id="workout-difficulty"
                    className="field-select"
                    value={editedWorkout.difficulty}
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

            {/* Exercise Summary */}
            <div className="form-section">
              <h3 className="section-title">Exercise Summary</h3>
              <div className="exercise-summary">
                <div className="summary-item">
                  <span className="summary-label">Total Exercises:</span>
                  <span className="summary-value">
                    {editedWorkout.exercises?.length || 0}
                  </span>
                </div>
                <div className="summary-note">
                  <small>
                    To modify exercises, please use the main workout generator
                  </small>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-actions">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              isLoading={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader size={16} className="spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
          
          {hasChanges && (
            <div className="changes-indicator">
              <span className="changes-dot"></span>
              <span className="changes-text">You have unsaved changes</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditWorkoutModal; 