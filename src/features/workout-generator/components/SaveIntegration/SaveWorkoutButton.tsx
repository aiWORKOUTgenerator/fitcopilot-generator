/**
 * Save Workout Button Component
 * 
 * Integrates with WorkoutContext to provide seamless save operation integration
 * and real-time updates when workouts are saved.
 */
import React, { useState } from 'react';
import Button from '../../../components/ui/Button/Button';
import { useWorkoutContext } from '../../context/WorkoutContext';
import { GeneratedWorkout } from '../../types/workout';

interface SaveWorkoutButtonProps {
  /** The workout to save */
  workout: GeneratedWorkout;
  /** Whether the workout is already saved (for update vs create) */
  isExisting?: boolean;
  /** Custom button text */
  buttonText?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Callback after successful save */
  onSaveSuccess?: (savedWorkout: GeneratedWorkout) => void;
  /** Callback after save error */
  onSaveError?: (error: Error) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show detailed save status */
  showStatus?: boolean;
}

/**
 * SaveWorkoutButton provides integrated save functionality with context management
 */
export const SaveWorkoutButton: React.FC<SaveWorkoutButtonProps> = ({
  workout,
  isExisting = false,
  buttonText,
  variant = 'gradient',
  size = 'md',
  onSaveSuccess,
  onSaveError,
  className = '',
  showStatus = true
}) => {
  const { saveWorkoutAndRefresh, updateWorkoutAndRefresh } = useWorkoutContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      let savedWorkout: GeneratedWorkout;
      
      if (isExisting) {
        // Update existing workout
        savedWorkout = await updateWorkoutAndRefresh(workout);
      } else {
        // Save new workout
        savedWorkout = await saveWorkoutAndRefresh(workout);
      }

      setSaveStatus('success');
      onSaveSuccess?.(savedWorkout);

      // Reset status after showing success
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);

    } catch (error) {
      setSaveStatus('error');
      const saveError = error instanceof Error ? error : new Error('Failed to save workout');
      onSaveError?.(saveError);

      // Reset status after showing error
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (saveStatus) {
      case 'saving':
        return isExisting ? 'Updating...' : 'Saving...';
      case 'success':
        return isExisting ? 'Updated!' : 'Saved!';
      case 'error':
        return 'Save Failed';
      default:
        return isExisting ? 'Update Workout' : 'Save Workout';
    }
  };

  // Determine button variant based on state
  const getButtonVariant = () => {
    switch (saveStatus) {
      case 'success':
        return 'primary' as const;
      case 'error':
        return 'outline' as const;
      default:
        return variant;
    }
  };

  // Determine if button should be disabled
  const isDisabled = isSaving || !workout || !workout.title?.trim();

  return (
    <div className={`save-workout-button ${className}`}>
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={handleSave}
        disabled={isDisabled}
        isLoading={isSaving}
        className={`save-btn ${saveStatus}`}
        aria-label={getButtonText()}
      >
        <span className="save-btn-icon">
          {saveStatus === 'saving' && '⏳'}
          {saveStatus === 'success' && '✅'}
          {saveStatus === 'error' && '❌'}
          {saveStatus === 'idle' && '💾'}
        </span>
        <span className="save-btn-text">{getButtonText()}</span>
      </Button>

      {showStatus && saveStatus !== 'idle' && (
        <div className={`save-status ${saveStatus}`}>
          {saveStatus === 'saving' && (
            <span className="status-text">
              {isExisting ? 'Updating your workout...' : 'Saving your workout...'}
            </span>
          )}
          {saveStatus === 'success' && (
            <span className="status-text">
              {isExisting 
                ? `"${workout.title}" updated successfully!` 
                : `"${workout.title}" saved successfully!`
              }
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="status-text">
              Failed to {isExisting ? 'update' : 'save'} workout. Please try again.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SaveWorkoutButton; 