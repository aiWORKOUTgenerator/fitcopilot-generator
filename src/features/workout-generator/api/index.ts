/**
 * API Module Exports
 * 
 * Centralized exports for all API utilities, helpers, and client functions.
 * This provides a clean, organized way to import API functionality throughout the application.
 */

// Core API client
export { 
  apiFetch, 
  createAbortableRequest, 
  getNonce,
  type ApiRequestOptions,
  type ApiResponse 
} from './client';

// API helper functions
export {
  // Configuration
  API_CONFIG,
  API_ENDPOINTS,
  HTTP_METHODS,
  CONTENT_TYPES,
  
  // URL building and parameters
  buildApiUrl,
  buildUrlWithParams,
  
  // Authentication
  getWordPressNonce,
  
  // Request preparation
  prepareHeaders,
  prepareRequestOptions,
  prepareGetRequest,
  preparePostRequest,
  preparePutRequest,
  prepareDeleteRequest,
  
  // Response handling
  isValidApiResponse,
  extractErrorMessage,
  
  // Error type checking
  isNetworkError,
  isAuthError,
  isValidationError,
  
  // Utility functions
  createPaginationParams,
  createCacheKey,
  
  // Advanced utilities
  withRetry,
  withTimeout,
  debounce,
  batchRequests,
} from './helpers';

// Re-export commonly used types for convenience
export type { GeneratedWorkout } from '../types/workout'; 