/**
 * Context actions for workout generator
 * 
 * This file contains the action definitions for the workout generator context.
 */
import { GeneratedWorkout, WorkoutFormParams } from '../types/workout';
import { ValidationErrors } from '../domain/validators';
import { GenerationStatus } from './WorkoutGeneratorContext';

/**
 * Action types for the workout generator
 */
export enum WorkoutActionType {
  UPDATE_FORM = 'UPDATE_FORM',
  SET_FORM_ERRORS = 'SET_FORM_ERRORS',
  GENERATION_START = 'GENERATION_START',
  GENERATION_PROCESSING = 'GENERATION_PROCESSING',
  GENERATION_SUCCESS = 'GENERATION_SUCCESS',
  GENERATION_ERROR = 'GENERATION_ERROR',
  RESET_GENERATOR = 'RESET_GENERATOR',
  SET_RESULT = 'SET_RESULT',
  SET_STEP = 'SET_STEP',
  TOGGLE_DEBUG_MODE = 'TOGGLE_DEBUG_MODE',
  SET_LOGS = 'SET_LOGS'
}

/**
 * Action type interfaces
 */
export interface UpdateFormAction {
  type: WorkoutActionType.UPDATE_FORM;
  payload: Partial<WorkoutFormParams>;
}

export interface SetFormErrorsAction {
  type: WorkoutActionType.SET_FORM_ERRORS;
  payload: ValidationErrors | null;
}

export interface GenerationStartAction {
  type: WorkoutActionType.GENERATION_START;
}

export interface GenerationProcessingAction {
  type: WorkoutActionType.GENERATION_PROCESSING;
}

export interface GenerationSuccessAction {
  type: WorkoutActionType.GENERATION_SUCCESS;
  payload: GeneratedWorkout;
}

export interface GenerationErrorAction {
  type: WorkoutActionType.GENERATION_ERROR;
  payload: string;
}

export interface ResetGeneratorAction {
  type: WorkoutActionType.RESET_GENERATOR;
}

export interface SetResultAction {
  type: WorkoutActionType.SET_RESULT;
  payload: GeneratedWorkout;
}

export interface SetStepAction {
  type: WorkoutActionType.SET_STEP;
  payload: GenerationStatus;
}

export interface ToggleDebugModeAction {
  type: WorkoutActionType.TOGGLE_DEBUG_MODE;
  payload: boolean;
}

export interface SetLogsAction {
  type: WorkoutActionType.SET_LOGS;
  payload: any[];
}

/**
 * Union type of all possible actions
 */
export type WorkoutGeneratorAction =
  | UpdateFormAction
  | SetFormErrorsAction
  | GenerationStartAction
  | GenerationProcessingAction
  | GenerationSuccessAction
  | GenerationErrorAction
  | ResetGeneratorAction
  | SetResultAction
  | SetStepAction
  | ToggleDebugModeAction
  | SetLogsAction;

/**
 * Action creators
 */
export const updateForm = (formValues: Partial<WorkoutFormParams>): UpdateFormAction => ({
  type: WorkoutActionType.UPDATE_FORM,
  payload: formValues
});

export const setFormErrors = (errors: ValidationErrors | null): SetFormErrorsAction => ({
  type: WorkoutActionType.SET_FORM_ERRORS,
  payload: errors
});

export const startGeneration = (): GenerationStartAction => ({
  type: WorkoutActionType.GENERATION_START
});

export const setGenerationProcessing = (): GenerationProcessingAction => ({
  type: WorkoutActionType.GENERATION_PROCESSING
});

export const setGenerationSuccess = (workout: GeneratedWorkout): GenerationSuccessAction => ({
  type: WorkoutActionType.GENERATION_SUCCESS,
  payload: workout
});

export const setGenerationError = (message: string): GenerationErrorAction => ({
  type: WorkoutActionType.GENERATION_ERROR,
  payload: message
});

export const resetGenerator = (): ResetGeneratorAction => ({
  type: WorkoutActionType.RESET_GENERATOR
});

export const setResult = (workout: GeneratedWorkout): SetResultAction => ({
  type: WorkoutActionType.SET_RESULT,
  payload: workout
});

export const setStep = (status: GenerationStatus): SetStepAction => ({
  type: WorkoutActionType.SET_STEP,
  payload: status
});

export const toggleDebugMode = (isEnabled: boolean): ToggleDebugModeAction => ({
  type: WorkoutActionType.TOGGLE_DEBUG_MODE,
  payload: isEnabled
});

export const setLogs = (logs: any[]): SetLogsAction => ({
  type: WorkoutActionType.SET_LOGS,
  payload: logs
}); 