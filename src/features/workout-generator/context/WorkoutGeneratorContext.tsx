/**
 * Workout Generator Context
 * 
 * Provides state management for the workout generator feature
 */

import React, { createContext, useReducer, useContext, ReactNode, useCallback, useMemo } from 'react';
import { GeneratedWorkout, WorkoutFormParams } from '../types/workout';
import { ValidationErrors } from '../domain/validators';
import { apiFetch } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

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
  generateWorkout: (formData: WorkoutFormParams) => Promise<GeneratedWorkout>;
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
  
  /**
   * Log error with context information
   */
  const logError = useCallback((error: unknown, context: { 
    componentName?: string; 
    action?: string; 
    additionalData?: Record<string, unknown>; 
  } = {}) => {
    const { componentName, action, additionalData } = context;
    
    // Format error to standard Error object
    const formattedError = error instanceof Error 
      ? error 
      : new Error(typeof error === 'string' ? error : 'An unknown error occurred');
    
    // Format context for logging
    const contextStr = [
      componentName && `Component: ${componentName}`,
      action && `Action: ${action}`
    ].filter(Boolean).join(' | ');
    
    // Log to console in development
    console.error(
      `[FitCopilot]${contextStr ? ` ${contextStr} -` : ''} ${formattedError.message}`, 
      { error: formattedError, ...additionalData }
    );
    
    return formattedError;
  }, []);
  
  /**
   * Handle and log an error, optionally running a side effect
   */
  const handleError = useCallback((
    error: unknown, 
    context: { 
      componentName?: string; 
      action?: string; 
      additionalData?: Record<string, unknown>; 
    } = {}, 
    onError?: (formattedError: Error) => void
  ) => {
    const formattedError = logError(error, context);
    
    if (onError) {
      onError(formattedError);
    }
    
    return formattedError;
  }, [logError]);
  
  /**
   * Generate a workout using the API
   * 
   * @param formData - Form data to generate workout with
   */
  const generateWorkout = useCallback(async (formData: WorkoutFormParams) => {
    // Start the generation process
    dispatch({ type: 'GENERATION_START' });
    
    try {
      // After a short delay, update UI to show we're processing
      setTimeout(() => {
        dispatch({ type: 'GENERATION_PROCESSING' });
      }, 500);
      
      // CRITICAL: PHP endpoint requires 'specific_request'
      const requestBody = {
        specific_request: `A ${formData.difficulty} level ${formData.duration}-minute workout focusing on ${formData.goals}${formData.restrictions ? ` with restrictions: ${formData.restrictions}` : ''}`,
        duration: formData.duration,
        difficulty: formData.difficulty,
        goals: formData.goals,
        equipment: formData.equipment || [],
        restrictions: formData.restrictions || ''
      };
      
      // Direct API call with correct format
      const response = await apiFetch<{ 
        success: boolean; 
        data: any;  // Changed type to 'any' to handle various response formats
        message?: string;
      }>(
        API_ENDPOINTS.GENERATE,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );
      
      // Debug the response
      console.log('API Response:', JSON.stringify(response, null, 2));
      
      // Handle the response - normalize data structure
      if (response.success) {
        // Get the workout data - in our case, the data property itself is the workout
        const workoutData = response.data;
        
        if (workoutData) {
          console.log('Success! Workout data received');
          dispatch({ 
            type: 'GENERATION_SUCCESS', 
            payload: workoutData  // Use data directly as the workout
          });
          return workoutData;
        } else {
          const error = new Error('Server returned success but no workout data');
          logError(error, { 
            componentName: 'WorkoutGeneratorProvider', 
            action: 'generateWorkout',
            additionalData: { response }
          });
          
          dispatch({
            type: 'GENERATION_ERROR',
            payload: 'Server returned success but no workout data'
          });
          throw error;
        }
      } else {
        // Explicit failure from server
        const errorMsg = response.message || 'Failed to generate workout';
        const error = new Error(errorMsg);
        
        logError(error, {
          componentName: 'WorkoutGeneratorProvider',
          action: 'generateWorkout',
          additionalData: { response }
        });
        
        dispatch({
          type: 'GENERATION_ERROR',
          payload: errorMsg
        });
        throw error;
      }
    } catch (error) {
      // Handle error with centralized error handler
      const formattedError = handleError(error, {
        componentName: 'WorkoutGeneratorProvider',
        action: 'generateWorkout',
        additionalData: { formData }
      });
      
      const errorMessage = formattedError.message || 'Failed to generate workout. Please try again.';
      
      dispatch({ 
        type: 'GENERATION_ERROR', 
        payload: errorMessage 
      });
      
      throw formattedError;
    }
  }, [dispatch, handleError, logError]);
  
  // Create a stable value object for the context
  const value = useMemo(() => ({
    state,
    dispatch,
    generateWorkout
  }), [state, dispatch, generateWorkout]);
  
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