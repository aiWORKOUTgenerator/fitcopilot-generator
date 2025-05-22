/**
 * Workout Editor Container
 * 
 * Container component that handles the navigation and data loading for the workout editor.
 * This component manages the state and decides whether to render the editor as a modal
 * or full page based on the navigation context.
 */
import React, { useEffect, useState } from 'react';
import { useNavigation } from '../navigation/NavigationContext';
import WorkoutEditorModal from '../components/WorkoutEditor/WorkoutEditorModal';
import { GeneratedWorkout } from '../types/workout';
import { getWorkout, saveWorkout } from '../services/workoutService';
import { useWorkoutGenerator } from '../context';

/**
 * Container for the workout editor that handles navigation and data
 */
const WorkoutEditorContainer: React.FC = () => {
  // Get navigation state
  const { isEditorOpen, currentWorkoutId, closeEditor } = useNavigation();
  
  // Get workout generator context to access the generated workout
  const { state } = useWorkoutGenerator();
  const generatedWorkout = state.domain.generatedWorkout;
  
  // Local state for workout data
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Handle workout save
  const handleSave = async (updatedWorkout: GeneratedWorkout) => {
    try {
      setLoading(true);
      const savedWorkout = await saveWorkout(updatedWorkout);
      setWorkout(savedWorkout);
      return savedWorkout;
    } catch (err) {
      console.error('Failed to save workout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Don't render anything if the editor is not open
  // This ensures the modal only opens when explicitly triggered by the "View Full Workout" button
  if (!isEditorOpen) {
    return null;
  }
  
  // Show loading state
  if (loading && !workout) {
    return <div className="workout-editor-loading">Loading workout...</div>;
  }
  
  // Show error state
  if (error) {
    return <div className="workout-editor-error">{error}</div>;
  }
  
  // Ensure we have a workout to edit
  if (!workout) {
    return null;
  }
  
  // For now, always render as modal
  // In the future, this could conditionally render full page editor
  return (
    <WorkoutEditorModal
      workout={workout}
      postId={workout.id ? Number(workout.id) : undefined}
      onSave={handleSave}
    />
  );
};

export default WorkoutEditorContainer; 