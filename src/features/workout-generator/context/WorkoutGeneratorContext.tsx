/**
 * Workout Generator Context
 * 
 * Provides state management for the workout generator feature
 */

import React, { createContext, useReducer, useContext, ReactNode, useCallback, useMemo } from 'react';
import { GeneratedWorkout, WorkoutFormParams } from '../types/workout';
import { ValidationErrors } from '../domain/validators';
import { apiFetch, ApiResponse } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { useProfile } from '../../profile/context';
import { mapProfileToWorkoutContext } from '../utils/profileMapping';
import { 
  WorkoutGeneratorAction, 
  WorkoutActionType,
  updateForm,
  setFormErrors,
  startGeneration,
  setGenerationProcessing,
  setGenerationSuccess,
  setGenerationError,
  resetGenerator,
  setResult,
  setStep
} from './actions';

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
  debugMode: boolean;
  logs: any[];
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
    debugMode: false,
    logs: []
  },
  domain: {
    formValues: {
      difficulty: 'intermediate',
      equipment: [],
      goals: '',
      restrictions: '',
      sessionInputs: {
        availableTime: undefined,
        energyLevel: undefined,
        focusArea: [],
        currentSoreness: [],
        moodLevel: undefined,
        sleepQuality: undefined,
        environment: undefined,
      },
    },
    generatedWorkout: null,
  },
};

/**
 * Reducer for the workout generator
 */
function workoutGeneratorReducer(
  state: WorkoutGeneratorState,
  action: WorkoutGeneratorAction
): WorkoutGeneratorState {
  switch (action.type) {
    case WorkoutActionType.UPDATE_FORM:
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
      
    case WorkoutActionType.SET_FORM_ERRORS:
      return {
        ...state,
        ui: {
          ...state.ui,
          formErrors: action.payload,
        },
      };
      
    case WorkoutActionType.GENERATION_START:
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'submitting',
          loading: true,
          errorMessage: null,
        },
      };
      
    case WorkoutActionType.GENERATION_PROCESSING:
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'generating',
        },
      };
      
    case WorkoutActionType.GENERATION_SUCCESS:
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
      
    case WorkoutActionType.GENERATION_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          status: 'error',
          loading: false,
          errorMessage: action.payload,
        },
      };
      
    case WorkoutActionType.RESET_GENERATOR:
      return {
        ...initialState,
        domain: {
          ...initialState.domain,
          formValues: { ...state.domain.formValues },
        },
      };
      
    case WorkoutActionType.SET_RESULT:
      return {
        ...state,
        domain: {
          ...state.domain,
          generatedWorkout: action.payload,
        },
      };
      
    case WorkoutActionType.SET_STEP:
      return {
        ...state,
        ui: {
          ...state.ui,
          status: action.payload,
          loading: action.payload === 'submitting' || action.payload === 'generating',
        },
      };
      
    case WorkoutActionType.TOGGLE_DEBUG_MODE:
      return {
        ...state,
        ui: {
          ...state.ui,
          debugMode: action.payload,
        },
      };
      
    case WorkoutActionType.SET_LOGS:
      return {
        ...state,
        ui: {
          ...state.ui,
          logs: action.payload,
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
  updateFormValues: (values: Partial<WorkoutFormParams>) => void;
  resetForm: () => void;
  setStep: (step: GenerationStatus) => void;
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
  
  // Get profile context for enhanced prompt building
  const { state: profileState } = useProfile();
  const { profile } = profileState;
  
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
    dispatch(startGeneration());
    
    try {
      // After a short delay, update UI to show we're processing
      setTimeout(() => {
        dispatch(setGenerationProcessing());
      }, 500);
      
      // Enhanced prompt building with profile integration
      const profileMapping = profile ? mapProfileToWorkoutContext(profile) : null;
      
      // Build enhanced specific request that includes both daily focus and profile context
      let specificRequest = `A ${formData.difficulty} level ${formData.duration}-minute workout with today's focus on ${formData.goals}.`;
      
      // Add profile goals context if available
      if (profileMapping && profileMapping.displayData.goals.length > 0) {
        const profileGoalsText = profileMapping.displayData.goals.map(g => g.display).join(', ');
        specificRequest += ` User's long-term fitness goals include: ${profileGoalsText}. Prioritize today's focus while supporting overall fitness goals.`;
      }
      
      // Add restrictions if any
      if (formData.restrictions) {
        specificRequest += ` Important restrictions: ${formData.restrictions}`;
      }
      
      // Prepare request payload with enhanced prompt
      const requestBody = {
        specific_request: specificRequest,
        duration: formData.duration,
        difficulty: formData.difficulty,
        goals: formData.goals,
        equipment: formData.equipment || [],
        restrictions: formData.restrictions || '',
        intensity: formData.intensity || 3,
        session_inputs: formData.sessionInputs || {},
        // Include profile context for backend processing
        profile_goals: profileMapping?.goals || [],
        daily_focus: formData.goals
      };
      
      // Make API request to generate workout
      const response = await apiFetch<ApiResponse<GeneratedWorkout>>(
        API_ENDPOINTS.GENERATE,
        {
          method: 'POST',
          body: JSON.stringify({ workout: requestBody })  // Wrap in workout key as expected by API
        }
      );
      
      // If the response includes data, dispatch success
      if (response.success && response.data) {
        try {
          const rawWorkoutData = response.data as any; // Raw response may have post_id
          
          // CRITICAL FIX: Transform the response to map post_id to id
          // This ensures the frontend recognizes the workout as already saved
          const workoutData: GeneratedWorkout = {
            ...rawWorkoutData,
            // Map post_id from backend to id expected by frontend
            id: rawWorkoutData.post_id || rawWorkoutData.id,
            // Ensure version is properly set
            version: rawWorkoutData.version || 1,
            // Ensure created_at and updated_at are set
            created_at: rawWorkoutData.created_at || new Date().toISOString(),
            updated_at: rawWorkoutData.updated_at || new Date().toISOString()
          };
          
          console.log('[WorkoutGeneratorContext] Generated workout transformed:', {
            originalPostId: rawWorkoutData.post_id,
            mappedId: workoutData.id,
            version: workoutData.version,
            hasId: !!workoutData.id,
            title: workoutData.title,
            exerciseCount: workoutData.exercises?.length || 0
          });
          
          dispatch(setGenerationSuccess(workoutData));
          return workoutData;
        } catch (parseError) {
          console.error('Failed to parse workout data', parseError);
          
          dispatch(setGenerationError('Failed to parse workout data'));
          throw new Error('Failed to parse workout data');
        }
      } else {
        // API returned success: false or no data
        const errorMsg = response.message || 'Server returned success but no workout data';
        console.error('API Error:', errorMsg);
        
        dispatch(setGenerationError(errorMsg));
        throw new Error(errorMsg);
      }
    } catch (error) {
      // Handle any other errors
      console.error('Error generating workout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating workout';
      
      dispatch(setGenerationError(errorMessage));
      throw error;
    }
  }, [profile]);
  
  // Helper functions for common actions
  const updateFormValues = useCallback((values: Partial<WorkoutFormParams>) => {
    dispatch(updateForm(values));
  }, []);

  const resetForm = useCallback(() => {
    dispatch(resetGenerator());
  }, []);

  const setStepValue = useCallback((step: GenerationStatus) => {
    dispatch(setStep(step));
  }, []);

  // Create context value object with memoization
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    generateWorkout,
    updateFormValues,
    resetForm,
    setStep: setStepValue,
  }), [state, generateWorkout, updateFormValues, resetForm, setStepValue]);
  
  return (
    <WorkoutGeneratorContext.Provider value={contextValue}>
      {children}
    </WorkoutGeneratorContext.Provider>
  );
}

/**
 * Custom hook for accessing the workout generator context
 * @throws {Error} If used outside of WorkoutGeneratorProvider
 */
export function useWorkoutGenerator() {
  const context = useContext(WorkoutGeneratorContext);
  
  if (context === undefined) {
    throw new Error('useWorkoutGenerator must be used within a WorkoutGeneratorProvider');
  }
  
  return context;
} 