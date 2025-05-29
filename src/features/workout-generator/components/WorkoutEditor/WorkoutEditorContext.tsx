/**
 * Workout Editor Context
 * 
 * Provides state management for the workout editor with comprehensive
 * tracking of loading states, error handling, and optimistic updates.
 */
import React, { createContext, useReducer, useContext, useCallback } from 'react';
import { 
  WorkoutEditorData, 
  WorkoutEditorState,
  ValidationErrors 
} from '../../types/editor';
import { WorkoutDifficulty } from '../../types/workout';

/**
 * Action types for the editor reducer
 */
type WorkoutEditorAction = 
  | { type: 'SET_WORKOUT'; payload: WorkoutEditorData }
  | { type: 'UPDATE_TITLE'; payload: string }
  | { type: 'UPDATE_DIFFICULTY'; payload: WorkoutDifficulty }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'UPDATE_EQUIPMENT'; payload: string[] }
  | { type: 'UPDATE_GOALS'; payload: string[] }
  | { type: 'ADD_EXERCISE'; payload: { name: string; sets: number; reps: string } }
  | { type: 'UPDATE_EXERCISE'; payload: { id: string; field: string; value: any } }
  | { type: 'REMOVE_EXERCISE'; payload: string }
  | { type: 'REORDER_EXERCISES'; payload: string[] }
  | { type: 'UPDATE_NOTES'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_VALIDATION_ERRORS'; payload: ValidationErrors }
  | { type: 'CLEAR_VALIDATION_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_VALIDATION_ERRORS' }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; message: string } }
  | { type: 'OPTIMISTIC_UPDATE'; payload: Partial<WorkoutEditorData> }
  | { type: 'RESET_EDITOR' };

/**
 * Context type definition
 */
interface WorkoutEditorContextType {
  state: WorkoutEditorState;
  dispatch: React.Dispatch<WorkoutEditorAction>;
  // Helper functions for common operations
  updateExercise: (id: string, field: string, value: any) => void;
  addExercise: (exercise?: Partial<{ name: string; sets: number; reps: string }>) => void;
  removeExercise: (id: string) => void;
  reorderExercises: (exerciseIds: string[]) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  resetEditor: () => void;
}

/**
 * Create the context with undefined default value
 */
const WorkoutEditorContext = createContext<WorkoutEditorContextType | undefined>(undefined);

/**
 * Initial state for the editor
 */
const initialState: WorkoutEditorState = {
  workout: {
    title: '',
    difficulty: 'intermediate',
    duration: 30,
    equipment: [],
    goals: [],
    exercises: []
  },
  isDirty: false,
  isSaving: false,
  isLoading: false,
  validationErrors: {}
};

/**
 * Reducer function for editor state management
 */
function editorReducer(state: WorkoutEditorState, action: WorkoutEditorAction): WorkoutEditorState {
  switch (action.type) {
    case 'SET_WORKOUT':
      return {
        ...state,
        workout: action.payload,
        originalWorkout: action.payload,
        isDirty: false,
        validationErrors: {},
        isLoading: false
      };

    case 'UPDATE_TITLE':
      return {
        ...state,
        workout: {
          ...state.workout,
          title: action.payload
        },
        isDirty: true,
        // Clear any validation error for this field
        validationErrors: (() => {
          const { title, ...rest } = state.validationErrors;
          return rest;
        })()
      };

    case 'UPDATE_DIFFICULTY':
      return {
        ...state,
        workout: {
          ...state.workout,
          difficulty: action.payload
        },
        isDirty: true
      };

    case 'UPDATE_DURATION':
      return {
        ...state,
        workout: {
          ...state.workout,
          duration: action.payload
        },
        isDirty: true,
        // Clear any validation error for this field
        validationErrors: (() => {
          const { duration, ...rest } = state.validationErrors;
          return rest;
        })()
      };

    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        workout: {
          ...state.workout,
          equipment: action.payload
        },
        isDirty: true
      };

    case 'UPDATE_GOALS':
      return {
        ...state,
        workout: {
          ...state.workout,
          goals: action.payload
        },
        isDirty: true
      };

    case 'ADD_EXERCISE': {
      const newExercise = {
        id: `exercise-${Date.now()}`,
        name: action.payload.name || 'New Exercise',
        sets: action.payload.sets || 3,
        reps: action.payload.reps || '10-12',
        notes: ''
      };

      return {
        ...state,
        workout: {
          ...state.workout,
          exercises: [...state.workout.exercises, newExercise]
        },
        isDirty: true,
        // Clear any validation error for exercises
        validationErrors: (() => {
          const { exercises, ...rest } = state.validationErrors;
          return rest;
        })()
      };
    }

    case 'UPDATE_EXERCISE': {
      const { id, field, value } = action.payload;
      const updatedExercises = state.workout.exercises.map(exercise => {
        if (exercise.id === id) {
          return {
            ...exercise,
            [field]: value
          };
        }
        return exercise;
      });

      return {
        ...state,
        workout: {
          ...state.workout,
          exercises: updatedExercises
        },
        isDirty: true
      };
    }

    case 'REMOVE_EXERCISE': {
      const filteredExercises = state.workout.exercises.filter(
        exercise => exercise.id !== action.payload
      );

      return {
        ...state,
        workout: {
          ...state.workout,
          exercises: filteredExercises
        },
        isDirty: true
      };
    }

    case 'REORDER_EXERCISES': {
      const orderMap = action.payload.reduce((map, id, index) => {
        map[id] = index;
        return map;
      }, {} as Record<string, number>);

      const reorderedExercises = [...state.workout.exercises].sort((a, b) => {
        return (orderMap[a.id] || 0) - (orderMap[b.id] || 0);
      });

      return {
        ...state,
        workout: {
          ...state.workout,
          exercises: reorderedExercises
        },
        isDirty: true
      };
    }

    case 'UPDATE_NOTES':
      return {
        ...state,
        workout: {
          ...state.workout,
          notes: action.payload
        },
        isDirty: true
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: action.payload
      };
      
    case 'CLEAR_VALIDATION_ERROR':
      const { [action.payload]: _, ...remainingErrors } = state.validationErrors;
      return {
        ...state,
        validationErrors: remainingErrors
      };
      
    case 'CLEAR_ALL_VALIDATION_ERRORS':
      return {
        ...state,
        validationErrors: {}
      };
      
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          [action.payload.field]: action.payload.message
        }
      };
      
    case 'OPTIMISTIC_UPDATE':
      return {
        ...state,
        workout: {
          ...state.workout,
          ...action.payload,
          // Preserve exercises array if not included in the payload
          exercises: action.payload.exercises || state.workout.exercises
        }
      };

    case 'RESET_EDITOR':
      return {
        ...state,
        workout: state.originalWorkout || initialState.workout,
        isDirty: false,
        validationErrors: {}
      };

    default:
      return state;
  }
}

/**
 * Provider component for the Workout Editor context
 */
interface WorkoutEditorProviderProps {
  children: React.ReactNode;
  initialWorkout?: WorkoutEditorData;
}

export const WorkoutEditorProvider: React.FC<WorkoutEditorProviderProps> = ({
  children,
  initialWorkout
}) => {
  // Initialize with provided workout or default
  const [state, dispatch] = useReducer(
    editorReducer,
    {
      ...initialState,
      workout: initialWorkout || initialState.workout,
      originalWorkout: initialWorkout
    }
  );
  
  // Helper functions to simplify common operations
  const updateExercise = useCallback((id: string, field: string, value: any) => {
    console.log('🔄 WorkoutEditorContext updateExercise called:', {
      id,
      field, 
      value,
      currentExercises: state.workout.exercises.length
    });
    dispatch({ type: 'UPDATE_EXERCISE', payload: { id, field, value } });
    console.log('✅ UPDATE_EXERCISE action dispatched');
  }, []);
  
  const addExercise = useCallback((exercise?: Partial<{ name: string; sets: number; reps: string }>) => {
    dispatch({ 
      type: 'ADD_EXERCISE', 
      payload: { 
        name: exercise?.name || 'New Exercise', 
        sets: exercise?.sets || 3, 
        reps: exercise?.reps || '10-12' 
      } 
    });
  }, []);
  
  const removeExercise = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: id });
  }, []);
  
  const reorderExercises = useCallback((exerciseIds: string[]) => {
    dispatch({ type: 'REORDER_EXERCISES', payload: exerciseIds });
  }, []);
  
  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_VALIDATION_ERROR', payload: field });
  }, []);
  
  const clearAllErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_VALIDATION_ERRORS' });
  }, []);
  
  const resetEditor = useCallback(() => {
    dispatch({ type: 'RESET_EDITOR' });
  }, []);

  // Value object with state and helper functions
  const value = {
    state,
    dispatch,
    updateExercise,
    addExercise,
    removeExercise,
    reorderExercises,
    clearError,
    clearAllErrors,
    resetEditor
  };

  return (
    <WorkoutEditorContext.Provider value={value}>
      {children}
    </WorkoutEditorContext.Provider>
  );
};

/**
 * Custom hook to use the workout editor context
 * @returns {WorkoutEditorContextType} The workout editor context
 * @throws {Error} If used outside of a WorkoutEditorProvider
 */
export const useWorkoutEditor = (): WorkoutEditorContextType => {
  const context = useContext(WorkoutEditorContext);
  if (context === undefined) {
    throw new Error('useWorkoutEditor must be used within a WorkoutEditorProvider');
  }
  return context;
};

export default WorkoutEditorContext; 