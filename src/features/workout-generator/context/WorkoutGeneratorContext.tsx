/**
 * Workout Generator Context
 * 
 * Provides state management for the workout generator feature
 */

import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { GeneratedWorkout, WorkoutFormParams } from '../types/workout';
import { ValidationErrors } from '../domain/validators';

/**
 * Status of the workout generation process
 */
export type GenerationStatus = 'idle' | 'submitting' | 'generating' | 'completed' | 'error';

/**
 * State interface for workout generator UI
 */
interface UIState {
  status: GenerationStatus;
  loading: boolean;
  formErrors: ValidationErrors | null;
  errorMessage: string | null;
}

/**
 * State interface for workout generator domain data
 */
interface DomainState {
  formValues: Partial<WorkoutFormParams>;
  generatedWorkout: GeneratedWorkout | null;
}

/**
 * Combined state interface
 */
interface WorkoutGeneratorState {
  ui: UIState;
  domain: DomainState;
}

/**
 * Initial state for the workout generator
 */
const initialState: WorkoutGeneratorState = {
  ui: {
    status: 'idle',
    loading: false,
    formErrors: null,
    errorMessage: null,
  },
  domain: {
    formValues: {
      duration: 30,
      difficulty: 'intermediate',
      equipment: [],
      goals: '',
      restrictions: '',
    },
    generatedWorkout: null,
  },
};

/**
 * Action types for the workout generator reducer
 */
type WorkoutGeneratorAction =
  | { type: 'UPDATE_FORM'; payload: Partial<WorkoutFormParams> }
  | { type: 'SET_FORM_ERRORS'; payload: ValidationErrors | null }
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_PROCESSING' }
  | { type: 'GENERATION_SUCCESS'; payload: GeneratedWorkout }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'RESET_GENERATOR' };

/**
 * Reducer for the workout generator
 */
function workoutGeneratorReducer(
  state: WorkoutGeneratorState,
  action: WorkoutGeneratorAction
): WorkoutGeneratorState {
  switch (action.type) {
    case 'UPDATE_FORM':
      return {
        ...state,
        domain: {
          ...state.domain,
          formValues: {
            ...state.domain.formValues,
            ...action.payload,
          },
        },
      };
      
    case 'SET_FORM_ERRORS':
      return {
        ...state,
        ui: {
          ...state.ui,
          formErrors: action.payload,
        },
      };
      
    case 'GENERATION_START':
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'submitting',
          loading: true,
          errorMessage: null,
        },
      };
      
    case 'GENERATION_PROCESSING':
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'generating',
        },
      };
      
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'completed',
          loading: false,
        },
        domain: {
          ...state.domain,
          generatedWorkout: action.payload,
        },
      };
      
    case 'GENERATION_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'error',
          loading: false,
          errorMessage: action.payload,
        },
      };
      
    case 'RESET_GENERATOR':
      return {
        ...initialState,
        domain: {
          ...initialState.domain,
          formValues: { ...state.domain.formValues },
        },
      };
      
    default:
      return state;
  }
}

/**
 * Context interface including state and dispatch
 */
interface WorkoutGeneratorContextValue {
  state: WorkoutGeneratorState;
  dispatch: React.Dispatch<WorkoutGeneratorAction>;
}

/**
 * Create the workout generator context
 */
const WorkoutGeneratorContext = createContext<WorkoutGeneratorContextValue | undefined>(undefined);

/**
 * Props for the workout generator provider
 */
interface WorkoutGeneratorProviderProps {
  children: ReactNode;
}

/**
 * Provider component for the workout generator context
 */
export function WorkoutGeneratorProvider({ children }: WorkoutGeneratorProviderProps) {
  const [state, dispatch] = useReducer(workoutGeneratorReducer, initialState);
  
  const value = { state, dispatch };
  
  return (
    <WorkoutGeneratorContext.Provider value={value}>
      {children}
    </WorkoutGeneratorContext.Provider>
  );
}

/**
 * Hook for using the workout generator context
 */
export function useWorkoutGenerator() {
  const context = useContext(WorkoutGeneratorContext);
  
  if (context === undefined) {
    throw new Error('useWorkoutGenerator must be used within a WorkoutGeneratorProvider');
  }
  
  return context;
} 