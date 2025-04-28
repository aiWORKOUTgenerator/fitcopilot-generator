/**
 * Form Flow Context
 * 
 * This context provides unified state management for the multi-step workout form flow.
 * It centralizes form state that was previously spread across multiple components,
 * improving reliability and consistency during form transitions.
 * 
 * The form flow follows this pattern:
 * 1. Input: User enters workout preferences
 * 2. Preview: User reviews settings before submitting
 * 3. Generating: API request is processing
 * 4. Completed: Generated workout is displayed
 * 
 * This context manages the transitions between these steps, making sure state
 * is preserved correctly and preventing invalid state transitions.
 */
import React, { createContext, useContext, useReducer, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { WorkoutFormParams, FormSteps } from '../types/workout';
import { ValidationErrors } from '../domain/validators';
import { GenerationStatus } from '../hooks/useWorkoutGenerator';
import { useFormPersistence } from '../hooks/useFormPersistence';

// Storage key for form values and state
const FORM_STORAGE_KEY = 'fitcopilot_form_flow';

/**
 * Form flow state interface
 */
export interface FormFlowState {
  // Current form step in the UI
  currentStep: FormSteps;
  
  // Whether preview mode is active
  isPreviewMode: boolean;
  
  // Progress indicator for generation step (0-100)
  progress: number;
  
  // Last valid API generation status from useWorkoutGenerator
  lastGenerationStatus: GenerationStatus;
  
  // Error message for display in UI 
  errorMessage: string | null;
  
  // Whether generation is currently processing
  isGenerating: boolean;
}

/**
 * Action types for form flow reducer
 */
export enum FormFlowActionType {
  SET_CURRENT_STEP = 'SET_CURRENT_STEP',
  SET_PREVIEW_MODE = 'SET_PREVIEW_MODE',
  SET_PROGRESS = 'SET_PROGRESS',
  SET_GENERATION_STATUS = 'SET_GENERATION_STATUS',
  SET_ERROR = 'SET_ERROR',
  RESET_FLOW = 'RESET_FLOW',
}

/**
 * Form flow action interfaces
 */
type FormFlowAction = 
  | { type: FormFlowActionType.SET_CURRENT_STEP; payload: FormSteps }
  | { type: FormFlowActionType.SET_PREVIEW_MODE; payload: boolean }
  | { type: FormFlowActionType.SET_PROGRESS; payload: number | ((prevProgress: number) => number) }
  | { type: FormFlowActionType.SET_GENERATION_STATUS; payload: GenerationStatus }
  | { type: FormFlowActionType.SET_ERROR; payload: string | null }
  | { type: FormFlowActionType.RESET_FLOW };

/**
 * Initial state for the form flow
 */
const initialState: FormFlowState = {
  currentStep: 'input',
  isPreviewMode: false,
  progress: 0,
  lastGenerationStatus: 'idle',
  errorMessage: null,
  isGenerating: false
};

/**
 * Map generation status to appropriate form step
 * 
 * @param status - Generation status from useWorkoutGenerator
 * @param isPreviewMode - Whether preview mode is active
 * @returns The appropriate form step
 */
export function mapStatusToStep(status: GenerationStatus, isPreviewMode: boolean): FormSteps {
  // Preview mode overrides the derived step
  if (isPreviewMode) return 'preview';
  
  switch (status) {
    case 'idle': 
      return 'input';
    case 'starting':
    case 'submitting':
    case 'generating':
      return 'generating';
    case 'completed':
      return 'completed';
    case 'error':
      return 'generating'; // Keep on generating step to show error
    default:
      return 'input';
  }
}

/**
 * Check if a step transition is allowed
 * 
 * @param currentStep - Current form step
 * @param targetStep - Desired target step
 * @param isGenerating - Whether generation is in progress
 * @returns Whether the transition is allowed
 */
export function canTransitionTo(
  currentStep: FormSteps,
  targetStep: FormSteps,
  isGenerating: boolean
): boolean {
  // Allow transitions to the same step
  if (currentStep === targetStep) {
    return true;
  }
  
  // Special case: allow direct transition to completed step if we're already generating
  // This handles the case when cached data is used and the generation completes quickly
  if (isGenerating && targetStep === 'completed') {
    return true;
  }
  
  // Block certain transitions during generation
  if (isGenerating && targetStep !== 'generating' && targetStep !== 'completed') {
    return false;
  }
  
  // Define valid step transitions
  const validTransitions: Record<FormSteps, FormSteps[]> = {
    'input': ['preview', 'generating'],
    'preview': ['input', 'generating'],
    'generating': ['input', 'completed'],
    'completed': ['input']
  };
  
  return validTransitions[currentStep].includes(targetStep);
}

/**
 * Reducer for form flow state
 */
function formFlowReducer(state: FormFlowState, action: FormFlowAction): FormFlowState {
  switch (action.type) {
    case FormFlowActionType.SET_CURRENT_STEP:
      // Only allow transitions that make sense
      if (!canTransitionTo(state.currentStep, action.payload, state.isGenerating)) {
        console.warn(`Invalid step transition blocked: ${state.currentStep} -> ${action.payload}`);
        return state;
      }
      return {
        ...state,
        currentStep: action.payload,
        // If moving to input or preview, ensure preview mode is set correctly
        isPreviewMode: action.payload === 'preview' ? true : (action.payload === 'input' ? false : state.isPreviewMode)
      };
      
    case FormFlowActionType.SET_PREVIEW_MODE:
      // If preview mode is already in the desired state, avoid unnecessary update
      if (state.isPreviewMode === action.payload) {
        return state;
      }
      
      return {
        ...state,
        isPreviewMode: action.payload,
        // Set current step based on preview mode
        currentStep: action.payload ? 'preview' : 'input'
      };
      
    case FormFlowActionType.SET_PROGRESS:
      return {
        ...state,
        progress: typeof action.payload === 'function' 
          ? action.payload(state.progress) 
          : action.payload,
      };
      
    case FormFlowActionType.SET_GENERATION_STATUS:
      // For certain statuses, we want to automatically update currentStep
      const nextStep = mapStatusToStep(action.payload, state.isPreviewMode);
      
      return {
        ...state,
        lastGenerationStatus: action.payload,
        isGenerating: ['starting', 'submitting', 'generating'].includes(action.payload),
        // Only change step if we're not in preview mode OR we're entering a definitive state
        currentStep: ['completed', 'generating'].includes(nextStep) ? nextStep : state.currentStep,
        // Exit preview mode if we're generating or completed
        isPreviewMode: ['generating', 'completed'].includes(nextStep) ? false : state.isPreviewMode,
        // If we completed, ensure progress is 100%
        progress: action.payload === 'completed' ? 100 : state.progress,
      };
      
    case FormFlowActionType.SET_ERROR:
      return {
        ...state,
        errorMessage: action.payload,
      };
      
    case FormFlowActionType.RESET_FLOW:
      return {
        ...initialState,
        // Keep the last error message for debugging purposes
        errorMessage: state.errorMessage,
      };
      
    default:
      return state;
  }
}

/**
 * Form flow context interface
 */
interface FormFlowContextValue {
  // State
  state: FormFlowState;
  
  // Actions
  setCurrentStep: (step: FormSteps) => void;
  setPreviewMode: (isPreview: boolean) => void;
  setProgress: (progress: number | ((prevProgress: number) => number)) => void;
  setGenerationStatus: (status: GenerationStatus) => void;
  setError: (error: string | null) => void;
  resetFlow: () => void;
  
  // Helper methods
  goToInputStep: () => void;
  goToPreviewStep: () => void;
  goToGeneratingStep: () => void;
  goToCompletedStep: () => void;
  
  // Computed values
  derivedStep: FormSteps; // Current step accounting for all state
}

/**
 * Create form flow context
 */
const FormFlowContext = createContext<FormFlowContextValue | undefined>(undefined);

/**
 * FormFlowProvider props
 */
interface FormFlowProviderProps {
  children: ReactNode;
  initialStep?: FormSteps;
}

/**
 * FormFlowProvider component
 */
export function FormFlowProvider({ children, initialStep = 'input' }: FormFlowProviderProps) {
  const [state, dispatch] = useReducer(formFlowReducer, {
    ...initialState,
    currentStep: initialStep
  });
  
  // Form persistence
  const persistence = useFormPersistence<Partial<FormFlowState>>(FORM_STORAGE_KEY, {
    currentStep: state.currentStep,
    isPreviewMode: state.isPreviewMode
  });
  
  // On mount, load form state from session storage only once
  useEffect(() => {
    const storedState = persistence.loadData();
    if (storedState) {
      // Only restore non-generating states and if they're different from current state
      if (storedState.currentStep && 
          ['input', 'preview', 'completed'].includes(storedState.currentStep) &&
          storedState.currentStep !== state.currentStep) {
        dispatch({ 
          type: FormFlowActionType.SET_CURRENT_STEP, 
          payload: storedState.currentStep as FormSteps 
        });
      }
      
      if (typeof storedState.isPreviewMode === 'boolean' &&
          storedState.isPreviewMode !== state.isPreviewMode) {
        dispatch({ 
          type: FormFlowActionType.SET_PREVIEW_MODE, 
          payload: storedState.isPreviewMode 
        });
      }
    }
  // Run only on mount by using empty dependency array
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Save current step and preview mode whenever they change
  useEffect(() => {
    persistence.saveData({
      currentStep: state.currentStep,
      isPreviewMode: state.isPreviewMode
    });
  }, [state.currentStep, state.isPreviewMode, persistence]);
  
  // Modified setCurrentStep with abort handling
  const setCurrentStep = useCallback((step: FormSteps) => {
    // Only abort if transitioning away from generating step
    if (state.currentStep === 'generating' && step === 'input') {
      // Reset any in-progress generation on direct back to input
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('cancel_workout_generation', {
          from_step: state.currentStep,
          to_step: step
        });
      }
      
      // Dispatch an event that will be captured by components using the WorkoutGeneratorContext
      const abortEvent = new CustomEvent('workout_generation_abort', {
        detail: { reason: 'step_transition', from: state.currentStep, to: step }
      });
      window.dispatchEvent(abortEvent);
    }
    
    dispatch({ type: FormFlowActionType.SET_CURRENT_STEP, payload: step });
  }, [state.currentStep]);
  
  const setPreviewMode = useCallback((isPreview: boolean) => {
    // Only dispatch if the preview mode is different from current state
    if (state.isPreviewMode !== isPreview) {
      dispatch({ type: FormFlowActionType.SET_PREVIEW_MODE, payload: isPreview });
    }
  }, [state.isPreviewMode]);
  
  const setProgress = useCallback((progress: number | ((prevProgress: number) => number)) => {
    dispatch({ type: FormFlowActionType.SET_PROGRESS, payload: progress });
  }, []);
  
  const setGenerationStatus = useCallback((status: GenerationStatus) => {
    dispatch({ type: FormFlowActionType.SET_GENERATION_STATUS, payload: status });
  }, []);
  
  const setError = useCallback((error: string | null) => {
    dispatch({ type: FormFlowActionType.SET_ERROR, payload: error });
  }, []);
  
  const resetFlow = useCallback(() => {
    dispatch({ type: FormFlowActionType.RESET_FLOW });
  }, []);
  
  // Helper actions for common transitions
  const goToInputStep = useCallback(() => {
    dispatch({ type: FormFlowActionType.SET_CURRENT_STEP, payload: 'input' });
  }, []);
  
  const goToPreviewStep = useCallback(() => {
    // Only dispatch if not already in preview mode
    if (!state.isPreviewMode) {
      dispatch({ type: FormFlowActionType.SET_PREVIEW_MODE, payload: true });
    }
  }, [state.isPreviewMode]);
  
  const goToGeneratingStep = useCallback(() => {
    dispatch({ type: FormFlowActionType.SET_CURRENT_STEP, payload: 'generating' });
  }, []);
  
  const goToCompletedStep = useCallback(() => {
    dispatch({ type: FormFlowActionType.SET_CURRENT_STEP, payload: 'completed' });
  }, []);
  
  // Compute the derived step from all form flow state
  const derivedStep = useMemo(() => {
    // Preview mode takes precedence over other states
    if (state.isPreviewMode) return 'preview';
    
    // Otherwise use the current step
    return state.currentStep;
  }, [state.isPreviewMode, state.currentStep]);
  
  // Create context value
  const contextValue = useMemo(() => ({
    state,
    setCurrentStep,
    setPreviewMode,
    setProgress,
    setGenerationStatus,
    setError,
    resetFlow,
    goToInputStep,
    goToPreviewStep,
    goToGeneratingStep,
    goToCompletedStep,
    derivedStep
  }), [
    state,
    setCurrentStep,
    setPreviewMode,
    setProgress,
    setGenerationStatus,
    setError,
    resetFlow,
    goToInputStep,
    goToPreviewStep,
    goToGeneratingStep,
    goToCompletedStep,
    derivedStep
  ]);
  
  return (
    <FormFlowContext.Provider value={contextValue}>
      {children}
    </FormFlowContext.Provider>
  );
}

/**
 * Hook to use the form flow context
 * 
 * @returns Form flow context value
 * @throws Error if used outside FormFlowProvider
 */
export function useFormFlow() {
  const context = useContext(FormFlowContext);
  
  if (context === undefined) {
    throw new Error('useFormFlow must be used within a FormFlowProvider');
  }
  
  return context;
} 