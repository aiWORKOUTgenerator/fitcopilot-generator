/**
 * Enhanced Workout Editor Container
 * 
 * Container component that handles the navigation and data loading for both
 * the view modal (EnhancedWorkoutModal) and edit modal (WorkoutEditorModal).
 * This component manages the dual modal state and provides smooth transitions.
 */
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../navigation/NavigationContext';
import { EnhancedWorkoutModal } from '../components/WorkoutEditor/EnhancedWorkoutModal';
import WorkoutEditorModal from '../components/WorkoutEditor/WorkoutEditorModal';
import { GeneratedWorkout } from '../types/workout';
import { getWorkout, saveWorkout } from '../services/workoutService';
import { useWorkoutGenerator } from '../context';

/**
 * Enhanced container for the workout editor that handles dual modal navigation and data
 */
const WorkoutEditorContainer: React.FC = () => {
  // Get enhanced navigation state with dual modal support
  const { 
    isEditorOpen, 
    isEditModalOpen, 
    currentWorkoutId, 
    modalMode,
    isTransitioning,
    closeEditor,
    transitionToEdit,
    transitionToView 
  } = useNavigation();
  
  // Get workout generator context to access the generated workout
  const { state } = useWorkoutGenerator();
  const generatedWorkout = state.domain.generatedWorkout;
  
  // Local state for workout data
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load workout data based on the navigation context and available data
  useEffect(() => {
    // Reset states when the editor closes
    if (!isEditorOpen) {
      return;
    }
    
    // If we have a current workout ID of 'new', use the generated workout
    if (currentWorkoutId === 'new' && generatedWorkout) {
      setWorkout(generatedWorkout);
      return;
    }
    
    // If we have a workout ID but no workout data, fetch it
    if (currentWorkoutId && currentWorkoutId !== 'new') {
      const fetchWorkout = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const fetchedWorkout = await getWorkout(currentWorkoutId);
          setWorkout(fetchedWorkout);
        } catch (err) {
          console.error('Failed to load workout:', err);
          setError('Failed to load workout. Please try again.');
          closeEditor();
        } finally {
          setLoading(false);
        }
      };
      
      fetchWorkout();
    }
  }, [isEditorOpen, currentWorkoutId, generatedWorkout, closeEditor]);
  
  // Handle workout save from view modal
  const handleSave = async () => {
    if (!workout) return;
    
    try {
      setIsSaving(true);
      const savedWorkout = await saveWorkout(workout);
      setWorkout(savedWorkout);
      // TODO: Show success toast
      console.log('Workout saved successfully');
    } catch (err) {
      console.error('Failed to save workout:', err);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  // Handle workout edit - transition to edit modal
  const handleEdit = () => {
    transitionToEdit();
  };
  
  // Handle workout save from edit modal
  const handleSaveFromEdit = async (updatedWorkout: GeneratedWorkout) => {
    try {
      setIsSaving(true);
      const savedWorkout = await saveWorkout(updatedWorkout);
      setWorkout(savedWorkout);
      
      // Transition back to view modal after successful save
      transitionToView();
      
      // TODO: Show success toast
      console.log('Workout updated successfully');
    } catch (err) {
      console.error('Failed to update workout:', err);
      // TODO: Show error toast
      throw err; // Re-throw to let the edit modal handle the error
    } finally {
      setIsSaving(false);
    }
  };
  
  // Don't render anything if no modals are open
  if (!isEditorOpen && !isEditModalOpen) {
    return null;
  }
  
  // Show loading state
  if (loading && !workout) {
    return (
      <div className="workout-editor-loading">
        <div className="loading-spinner"></div>
        <span>Loading workout...</span>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="workout-editor-error">
        <div className="error-message">{error}</div>
        <button onClick={closeEditor} className="error-close-button">
          Close
        </button>
      </div>
    );
  }
  
  // Ensure we have a workout to display/edit
  if (!workout) {
    return null;
  }
  
  // Render the dual modal system
  return (
    <>
      {/* Enhanced Workout Modal - View Mode */}
      <EnhancedWorkoutModal
        workout={workout}
        isOpen={isEditorOpen && modalMode === 'view' && !isTransitioning}
        onClose={closeEditor}
        onSave={handleSave}
        onEdit={handleEdit}
        isSaving={isSaving}
        isTransitioning={isTransitioning}
        postId={workout.id ? Number(workout.id) : undefined}
      />
      
      {/* Workout Editor Modal - Edit Mode */}
      {isEditModalOpen && (
        <WorkoutEditorModal
          workout={workout}
          isOpen={isEditModalOpen && modalMode === 'edit' && !isTransitioning}
          onSave={handleSaveFromEdit}
          postId={workout.id ? Number(workout.id) : undefined}
        />
      )}
      
      {/* Transition Loading State */}
      {isTransitioning && (
        <div className="modal-transition-overlay">
          <div className="transition-spinner"></div>
        </div>
      )}
    </>
  );
};

export default WorkoutEditorContainer; 