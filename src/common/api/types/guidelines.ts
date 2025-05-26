/**
 * API Design Guidelines Type Definitions
 * 
 * These types enforce strict compliance with the FitCopilot API Design Guidelines.
 * All API interactions must use these types to ensure consistency.
 */

/**
 * Standard API Response Format
 * All API responses MUST follow this structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  code?: string; // Only present for error responses
}

/**
 * Standard Error Response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: ApiErrorCode;
  data?: {
    validation_errors?: Record<string, string>;
    [key: string]: any;
  };
}

/**
 * Standard Success Response  
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

/**
 * API Error Codes (from guidelines)
 */
export enum ApiErrorCode {
  INVALID_PARAMS = 'invalid_params',
  VALIDATION_ERROR = 'validation_error', 
  NOT_AUTHENTICATED = 'not_authenticated',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  RATE_LIMITED = 'rate_limited',
  SERVER_ERROR = 'server_error'
}

/**
 * HTTP Status Code to Error Code Mapping
 */
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, ApiErrorCode> = {
  400: ApiErrorCode.INVALID_PARAMS,
  401: ApiErrorCode.NOT_AUTHENTICATED,
  403: ApiErrorCode.FORBIDDEN,
  404: ApiErrorCode.NOT_FOUND,
  422: ApiErrorCode.VALIDATION_ERROR,
  429: ApiErrorCode.RATE_LIMITED,
  500: ApiErrorCode.SERVER_ERROR
};

/**
 * Wrapped Request Format
 * All POST/PUT/PATCH requests MUST use this format
 */
export type WrappedRequest<T, ResourceType extends string = string> = {
  [K in ResourceType]: T;
};

/**
 * Direct Request Format  
 * Only allowed for GET requests and specific endpoints
 */
export type DirectRequest<T> = T;

/**
 * Request Format Union
 */
export type ApiRequestData<T, ResourceType extends string = string> = 
  | WrappedRequest<T, ResourceType>
  | DirectRequest<T>;

/**
 * Field Naming Convention Types
 * Frontend uses camelCase, Backend uses snake_case
 */
export type CamelCase<T> = T;
export type SnakeCase<T> = T;

/**
 * Field Name Transformation Utility Types
 */
export type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

export type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

/**
 * API Request Options with Compliance
 */
export interface CompliantApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  validateRequest?: boolean;
  validateResponse?: boolean;
  transformFieldNames?: boolean;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Type Coercion Rules (from guidelines)
 */
export interface TypeCoercionRules {
  numericStrings: boolean; // "123" -> 123
  booleanStrings: boolean; // "true" -> true
  emptyStringToNull: boolean; // "" -> null
  arrayItemValidation: boolean; // Validate array item types
}

/**
 * API Client Configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  validateByDefault: boolean;
  transformFieldNamesByDefault: boolean;
  typeCoercionRules: TypeCoercionRules;
  errorMapping: Record<string, ApiErrorCode>;
}

/**
 * Resource Type Definitions for Wrapped Requests
 */
export enum ResourceType {
  WORKOUT = 'workout',
  PROFILE = 'profile', 
  COMPLETION = 'completion',
  USER = 'user'
}

/**
 * Workout-specific Types (Example Implementation)
 */
export interface WorkoutRequest {
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
  goals: string;
  restrictions?: string;
  preferences?: string;
}

export interface WorkoutResponse {
  id: number;
  title: string;
  date: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content?: string;
}

/**
 * Profile-specific Types (Example Implementation)
 */
export interface ProfileRequest {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutGoals: string[];
  equipmentAvailable: string;
  workoutFrequency: number;
  workoutDuration: number;
  preferences: {
    darkMode: boolean;
    metrics: 'imperial' | 'metric';
  };
}

export interface ProfileResponse {
  id: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutGoals: string[];
  equipmentAvailable: string;
  preferences: {
    darkMode: boolean;
    metrics: 'imperial' | 'metric';
  };
}

/**
 * Type Guards for Response Validation
 */
export function isApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    typeof response.message === 'string' &&
    (response.success === false || 'data' in response)
  );
}

export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return (
    isApiResponse(response) &&
    response.success === false &&
    typeof response.code === 'string'
  );
}

export function isApiSuccessResponse<T>(response: any): response is ApiSuccessResponse<T> {
  return (
    isApiResponse(response) &&
    response.success === true &&
    'data' in response
  );
}

/**
 * Endpoint Definition Interface
 */
export interface EndpointDefinition<TRequest = any, TResponse = any> {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiresAuth: boolean;
  requiresWrapping: boolean;
  resourceType?: ResourceType;
  requestSchema?: any; // JSON Schema for validation
  responseSchema?: any; // JSON Schema for validation
  transformFieldNames: boolean;
} 