/**
 * Error types for the Workout Generator
 * Standardized error codes for consistent error handling
 */

// API Error Codes
export const API_ERROR_CODES = {
  // Authentication and Authorization Errors (1xx)
  INVALID_NONCE: 'WG_101',
  UNAUTHORIZED: 'WG_102',
  INSUFFICIENT_PERMISSIONS: 'WG_103',
  
  // Network Errors (2xx)
  NETWORK_ERROR: 'WG_201',
  REQUEST_TIMEOUT: 'WG_202',
  REQUEST_ABORTED: 'WG_203',
  
  // Server Errors (3xx)
  SERVER_ERROR: 'WG_301',
  MAINTENANCE_MODE: 'WG_302',
  RATE_LIMITED: 'WG_303',
  
  // AI Provider Errors (4xx)
  AI_PROVIDER_ERROR: 'WG_401',
  PROMPT_ERROR: 'WG_402',
  PARSING_ERROR: 'WG_403',
  CONTENT_MODERATION: 'WG_404',
  
  // Input Validation Errors (5xx)
  INVALID_INPUT: 'WG_501',
  MISSING_REQUIRED_FIELD: 'WG_502',
  INVALID_FORMAT: 'WG_503',
  
  // Data Storage Errors (6xx)
  STORAGE_ERROR: 'WG_601',
  WORKOUT_NOT_FOUND: 'WG_602',
  
  // Unknown or Unexpected Errors (9xx)
  UNKNOWN_ERROR: 'WG_901'
} as const;

// Error Categories
export enum ErrorCategory {
  AUTH = 'authentication',
  NETWORK = 'network',
  SERVER = 'server',
  AI_PROVIDER = 'ai_provider',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

// Maps error codes to categories
export const ERROR_CATEGORY_MAP: Record<string, ErrorCategory> = {
  [API_ERROR_CODES.INVALID_NONCE]: ErrorCategory.AUTH,
  [API_ERROR_CODES.UNAUTHORIZED]: ErrorCategory.AUTH,
  [API_ERROR_CODES.INSUFFICIENT_PERMISSIONS]: ErrorCategory.AUTH,
  
  [API_ERROR_CODES.NETWORK_ERROR]: ErrorCategory.NETWORK,
  [API_ERROR_CODES.REQUEST_TIMEOUT]: ErrorCategory.NETWORK,
  [API_ERROR_CODES.REQUEST_ABORTED]: ErrorCategory.NETWORK,
  
  [API_ERROR_CODES.SERVER_ERROR]: ErrorCategory.SERVER,
  [API_ERROR_CODES.MAINTENANCE_MODE]: ErrorCategory.SERVER,
  [API_ERROR_CODES.RATE_LIMITED]: ErrorCategory.SERVER,
  
  [API_ERROR_CODES.AI_PROVIDER_ERROR]: ErrorCategory.AI_PROVIDER,
  [API_ERROR_CODES.PROMPT_ERROR]: ErrorCategory.AI_PROVIDER,
  [API_ERROR_CODES.PARSING_ERROR]: ErrorCategory.AI_PROVIDER,
  [API_ERROR_CODES.CONTENT_MODERATION]: ErrorCategory.AI_PROVIDER,
  
  [API_ERROR_CODES.INVALID_INPUT]: ErrorCategory.VALIDATION,
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: ErrorCategory.VALIDATION,
  [API_ERROR_CODES.INVALID_FORMAT]: ErrorCategory.VALIDATION,
  
  [API_ERROR_CODES.STORAGE_ERROR]: ErrorCategory.STORAGE,
  [API_ERROR_CODES.WORKOUT_NOT_FOUND]: ErrorCategory.STORAGE,
  
  [API_ERROR_CODES.UNKNOWN_ERROR]: ErrorCategory.UNKNOWN
};

// Error type for standardized error objects
export interface WorkoutGeneratorError {
  code: string;
  message: string;
  category: ErrorCategory;
  details?: unknown;
  retry?: boolean;
}

// Maps HTTP status codes to error codes
export const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: API_ERROR_CODES.INVALID_INPUT,
  401: API_ERROR_CODES.UNAUTHORIZED,
  403: API_ERROR_CODES.INSUFFICIENT_PERMISSIONS,
  404: API_ERROR_CODES.WORKOUT_NOT_FOUND,
  408: API_ERROR_CODES.REQUEST_TIMEOUT,
  429: API_ERROR_CODES.RATE_LIMITED,
  500: API_ERROR_CODES.SERVER_ERROR,
  503: API_ERROR_CODES.MAINTENANCE_MODE
}; 