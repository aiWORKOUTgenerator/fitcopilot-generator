/**
 * Workout Context Provider
 * 
 * Manages workout operations and provides real-time updates across components.
 * Enables save operation integration and optimistic UI updates.
 */
import React, { createContext, useContext, useCallback, useState } from 'react';
import { useWorkoutList } from '../hooks/useWorkoutList';
import { saveWorkout, deleteWorkout } from '../services/workoutService';
import { GeneratedWorkout } from '../types/workout';

interface WorkoutContextValue {
  // Workout list state
  workouts: GeneratedWorkout[];
  isLoading: boolean;
  error: string | null;
  
  // Operations
  refreshWorkouts: () => Promise<void>;
  saveWorkoutAndRefresh: (workout: GeneratedWorkout) => Promise<GeneratedWorkout>;
  deleteWorkoutAndRefresh: (workoutId: string | number) => Promise<void>;
  updateWorkoutAndRefresh: (workout: GeneratedWorkout) => Promise<GeneratedWorkout>;
  
  // Optimistic updates
  addWorkoutOptimistic: (workout: GeneratedWorkout) => void;
  removeWorkoutOptimistic: (workoutId: string | number) => void;
  updateWorkoutOptimistic: (workout: GeneratedWorkout) => void;
  
  // UI feedback
  showSuccessMessage: (message: string) => void;
  showErrorMessage: (message: string) => void;
}

interface WorkoutMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
  timestamp: number;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export const useWorkoutContext = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkoutContext must be used within a WorkoutProvider');
  }
  return context;
};

interface WorkoutProviderProps {
  children: React.ReactNode;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({ children }) => {
  const {
    workouts,
    isLoading,
    error,
    refreshWorkouts,
    addWorkout,
    removeWorkout,
    updateWorkout
  } = useWorkoutList();

  const [messages, setMessages] = useState<WorkoutMessage[]>([]);

  // Message management
  const showSuccessMessage = useCallback((message: string) => {
    const newMessage: WorkoutMessage = {
      id: `success-${Date.now()}`,
      type: 'success',
      message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 5000);
  }, []);

  const showErrorMessage = useCallback((message: string) => {
    const newMessage: WorkoutMessage = {
      id: `error-${Date.now()}`,
      type: 'error',
      message,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Auto-remove after 8 seconds (longer for errors)
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }, 8000);
  }, []);

  // Enhanced operations with error handling and user feedback
  const saveWorkoutAndRefresh = useCallback(async (workout: GeneratedWorkout): Promise<GeneratedWorkout> => {
    try {
      // Optimistic update
      addWorkout(workout);
      showSuccessMessage('Saving workout...');

      // Perform save operation
      const savedWorkout = await saveWorkout(workout);
      
      // Refresh to get server state
      await refreshWorkouts();
      
      showSuccessMessage(`Workout "${savedWorkout.title}" saved successfully!`);
      return savedWorkout;
    } catch (error) {
      // Revert optimistic update on error
      removeWorkout(workout.id);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workout';
      showErrorMessage(`Save failed: ${errorMessage}`);
      throw error;
    }
  }, [addWorkout, removeWorkout, refreshWorkouts, showSuccessMessage, showErrorMessage]);

  const deleteWorkoutAndRefresh = useCallback(async (workoutId: string | number): Promise<void> => {
    try {
      // Find workout for optimistic update
      const workoutToDelete = workouts.find(w => w.id === workoutId);
      
      // Optimistic update
      removeWorkout(workoutId);
      showSuccessMessage('Deleting workout...');

      // Perform delete operation
      await deleteWorkout(workoutId.toString());
      
      // Refresh to sync with server
      await refreshWorkouts();
      
      showSuccessMessage(`Workout "${workoutToDelete?.title || 'Unknown'}" deleted successfully!`);
    } catch (error) {
      // Refresh to revert optimistic update
      await refreshWorkouts();
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workout';
      showErrorMessage(`Delete failed: ${errorMessage}`);
      throw error;
    }
  }, [workouts, removeWorkout, refreshWorkouts, showSuccessMessage, showErrorMessage]);

  const updateWorkoutAndRefresh = useCallback(async (workout: GeneratedWorkout): Promise<GeneratedWorkout> => {
    try {
      // Store original for rollback
      const originalWorkout = workouts.find(w => w.id === workout.id);
      
      // CRITICAL FIX: Ensure version is included for proper versioning
      const workoutWithVersion = {
        ...workout,
        // If version is missing or invalid, get it from the original or default to 1
        version: (workout.version !== undefined && workout.version !== null) 
          ? workout.version 
          : (originalWorkout?.version !== undefined && originalWorkout?.version !== null)
            ? originalWorkout.version 
            : 1
      };
      
      console.log('[WorkoutContext] Updating workout with version:', {
        id: workoutWithVersion.id,
        title: workoutWithVersion.title,
        version: workoutWithVersion.version,
        originalVersion: originalWorkout?.version,
        exerciseCount: workoutWithVersion.exercises?.length || 0
      });
      
      // Optimistic update
      updateWorkout(workoutWithVersion);
      showSuccessMessage('Updating workout...');

      // CRITICAL FIX: Use saveWorkout API function (not updateWorkout which doesn't exist)
      const updatedWorkout = await saveWorkout(workoutWithVersion);
      
      console.log('[WorkoutContext] Workout updated successfully:', {
        id: updatedWorkout.id,
        newVersion: updatedWorkout.version,
        title: updatedWorkout.title,
        exerciseCount: updatedWorkout.exercises?.length || 0
      });
      
      // Refresh to get server state
      await refreshWorkouts();
      
      showSuccessMessage(`Workout "${updatedWorkout.title}" updated successfully!`);
      return updatedWorkout;
    } catch (error) {
      // Revert optimistic update on error
      console.error('[WorkoutContext] Update failed, reverting:', error);
      if (originalWorkout) {
        updateWorkout(originalWorkout);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showErrorMessage(`Failed to update workout: ${errorMessage}`);
      throw error;
    }
  }, [workouts, updateWorkout, saveWorkout, refreshWorkouts, showSuccessMessage, showErrorMessage]);

  // Optimistic update functions (for immediate UI feedback)
  const addWorkoutOptimistic = useCallback((workout: GeneratedWorkout) => {
    addWorkout(workout);
  }, [addWorkout]);

  const removeWorkoutOptimistic = useCallback((workoutId: string | number) => {
    removeWorkout(workoutId);
  }, [removeWorkout]);

  const updateWorkoutOptimistic = useCallback((workout: GeneratedWorkout) => {
    updateWorkout(workout);
  }, [updateWorkout]);

  const contextValue: WorkoutContextValue = {
    // State
    workouts,
    isLoading,
    error,
    
    // Operations
    refreshWorkouts,
    saveWorkoutAndRefresh,
    deleteWorkoutAndRefresh,
    updateWorkoutAndRefresh,
    
    // Optimistic updates
    addWorkoutOptimistic,
    removeWorkoutOptimistic,
    updateWorkoutOptimistic,
    
    // UI feedback
    showSuccessMessage,
    showErrorMessage
  };

  return (
    <WorkoutContext.Provider value={contextValue}>
      {children}
      
      {/* Message Display Component */}
      <WorkoutMessageDisplay messages={messages} />
    </WorkoutContext.Provider>
  );
};

/**
 * Message Display Component for user feedback
 */
interface WorkoutMessageDisplayProps {
  messages: WorkoutMessage[];
}

const WorkoutMessageDisplay: React.FC<WorkoutMessageDisplayProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  return (
    <div className="workout-messages">
      {messages.map(message => (
        <div
          key={message.id}
          className={`workout-message ${message.type}`}
          style={{
            position: 'fixed',
            top: `${20 + (messages.indexOf(message) * 60)}px`,
            right: '20px',
            zIndex: 9999,
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <span className="message-icon">
            {message.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="message-text">{message.message}</span>
        </div>
      ))}
      
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .workout-message {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 300px;
          max-width: 400px;
        }
        
        .message-icon {
          flex-shrink: 0;
        }
        
        .message-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default WorkoutProvider; 