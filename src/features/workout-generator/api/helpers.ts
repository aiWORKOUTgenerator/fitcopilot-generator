/**
 * API Helper Functions
 * 
 * Comprehensive collection of utility functions for API interactions.
 * These helpers provide standardized patterns for URL construction, 
 * request preparation, error handling, and response processing.
 */

import { ApiRequestOptions, ApiResponse } from './client';

/**
 * Base API configuration
 */
export const API_CONFIG = {
  BASE_PATH: '/wp-json/fitcopilot/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
  WORKOUTS: '/workouts',
  WORKOUT: (id: string) => `/workouts/${id}`,
  WORKOUT_COMPLETE: (id: string) => `/workouts/${id}/complete`,
  PROFILE: '/profile',
  GENERATE: '/generate',
  HEALTH_CHECK: '/health',
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
} as const;

/**
 * Build a complete API URL from a path
 * @param path - The API path (e.g., '/workouts' or '/workouts/123')
 * @param baseUrl - Optional base URL override
 * @returns Complete API URL
 */
export function buildApiUrl(path: string, baseUrl: string = API_CONFIG.BASE_PATH): string {
  // Remove leading slash from path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  // Ensure base URL doesn't end with slash
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Build URL with query parameters
 * @param baseUrl - The base URL
 * @param params - Query parameters object
 * @returns URL with query parameters appended
 */
export function buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      // Handle arrays by joining with commas
      if (Array.isArray(value)) {
        queryParams.append(key, value.join(','));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Get WordPress nonce from global window object
 * @returns The nonce string or empty string if not found
 */
export function getWordPressNonce(): string {
  if (typeof window === 'undefined') return '';
  
  // Try multiple possible global locations for the nonce
  const possibleNonces = [
    (window as any).fitcopilotData?.nonce,
    (window as any).workoutGenerator?.nonce,
    (window as any).wpApiSettings?.nonce,
    (window as any)._wpnonce,
  ];

  for (const nonce of possibleNonces) {
    if (nonce && typeof nonce === 'string') {
      return nonce;
    }
  }

  return '';
}

/**
 * Prepare standard headers for API requests
 * @param additionalHeaders - Additional headers to include
 * @param includeNonce - Whether to include WordPress nonce
 * @returns Headers object
 */
export function prepareHeaders(
  additionalHeaders: Record<string, string> = {},
  includeNonce: boolean = true
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': CONTENT_TYPES.JSON,
    ...additionalHeaders,
  };

  if (includeNonce) {
    const nonce = getWordPressNonce();
    if (nonce) {
      headers['X-WP-Nonce'] = nonce;
    }
  }

  return headers;
}

/**
 * Prepare request options with proper data serialization
 * @param method - HTTP method
 * @param data - Optional data to send (will be JSON stringified for POST/PUT/PATCH)
 * @param options - Additional request options
 * @returns Prepared request options
 */
export function prepareRequestOptions(
  method: string,
  data?: any,
  options: Partial<ApiRequestOptions> = {}
): ApiRequestOptions {
  const requestOptions: ApiRequestOptions = {
    method,
    headers: prepareHeaders(options.headers as Record<string, string>),
    credentials: 'same-origin',
    timeout: API_CONFIG.TIMEOUT,
    retries: API_CONFIG.RETRY_ATTEMPTS,
    retryDelay: API_CONFIG.RETRY_DELAY,
    ...options,
  };

  // Add body for methods that support it
  if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    requestOptions.body = JSON.stringify(data);
  }

  return requestOptions;
}

/**
 * Prepare GET request with query parameters
 * @param params - Query parameters
 * @param options - Additional request options
 * @returns Prepared GET request options
 */
export function prepareGetRequest(
  params?: Record<string, any>,
  options: Partial<ApiRequestOptions> = {}
): { url: string; options: ApiRequestOptions } {
  const baseUrl = buildApiUrl('');
  const url = params ? buildUrlWithParams(baseUrl, params) : baseUrl;
  const requestOptions = prepareRequestOptions(HTTP_METHODS.GET, undefined, options);
  
  return { url, options: requestOptions };
}

/**
 * Prepare POST request with data
 * @param data - Data to send in request body
 * @param options - Additional request options
 * @returns Prepared POST request options
 */
export function preparePostRequest(
  data: any,
  options: Partial<ApiRequestOptions> = {}
): ApiRequestOptions {
  return prepareRequestOptions(HTTP_METHODS.POST, data, options);
}

/**
 * Prepare PUT request with data
 * @param data - Data to send in request body
 * @param options - Additional request options
 * @returns Prepared PUT request options
 */
export function preparePutRequest(
  data: any,
  options: Partial<ApiRequestOptions> = {}
): ApiRequestOptions {
  return prepareRequestOptions(HTTP_METHODS.PUT, data, options);
}

/**
 * Prepare DELETE request
 * @param options - Additional request options
 * @returns Prepared DELETE request options
 */
export function prepareDeleteRequest(
  options: Partial<ApiRequestOptions> = {}
): ApiRequestOptions {
  return prepareRequestOptions(HTTP_METHODS.DELETE, undefined, options);
}

/**
 * Validate API response structure
 * @param response - The response to validate
 * @returns True if response has valid structure
 */
export function isValidApiResponse<T>(response: any): response is ApiResponse<T> {
  return (
    response &&
    typeof response === 'object' &&
    typeof response.success === 'boolean' &&
    (response.success === false || 'data' in response)
  );
}

/**
 * Extract error message from API response or error object
 * @param error - Error object or API response
 * @returns Human-readable error message
 */
export function extractErrorMessage(error: any): string {
  // If it's an API response with error details
  if (isValidApiResponse(error) && !error.success) {
    return error.message || 'An API error occurred';
  }

  // If it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // If it's an object with a message property
  if (error && typeof error === 'object' && error.message) {
    return String(error.message);
  }

  // If it's a string
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred';
}

/**
 * Check if error is a network-related error
 * @param error - Error to check
 * @returns True if it's a network error
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof Error) {
    const networkErrorNames = ['NetworkError', 'TypeError', 'AbortError'];
    return networkErrorNames.includes(error.name) ||
           error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch');
  }
  return false;
}

/**
 * Check if error is an authentication error
 * @param error - Error to check
 * @returns True if it's an auth error
 */
export function isAuthError(error: any): boolean {
  if (isValidApiResponse(error) && !error.success) {
    const authCodes = ['unauthorized', 'permission_denied', 'rest_forbidden'];
    return authCodes.includes(error.code || '');
  }
  return false;
}

/**
 * Check if error is a validation error
 * @param error - Error to check
 * @returns True if it's a validation error
 */
export function isValidationError(error: any): boolean {
  if (isValidApiResponse(error) && !error.success) {
    return error.code === 'validation_error' || error.code === 'invalid_params';
  }
  return false;
}

/**
 * Create standardized pagination parameters
 * @param page - Page number (1-based)
 * @param perPage - Items per page
 * @param additionalParams - Additional query parameters
 * @returns Pagination parameters object
 */
export function createPaginationParams(
  page: number = 1,
  perPage: number = 10,
  additionalParams: Record<string, any> = {}
): Record<string, any> {
  return {
    page: Math.max(1, page),
    per_page: Math.max(1, perPage),
    ...additionalParams,
  };
}

/**
 * Retry helper function with exponential backoff
 * @param fn - Function to retry
 * @param maxAttempts - Maximum number of attempts
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise that resolves with the function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.RETRY_ATTEMPTS,
  baseDelay: number = API_CONFIG.RETRY_DELAY
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on auth errors or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw lastError;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError!;
}

/**
 * Timeout helper function
 * @param promise - Promise to add timeout to
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects on timeout
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Debounce helper for API calls
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }) as T;
}

/**
 * Batch multiple API requests
 * @param requests - Array of request functions
 * @param concurrency - Maximum concurrent requests
 * @returns Promise that resolves with all results
 */
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  concurrency: number = 3
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(request => request()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Create a cache key for API requests
 * @param endpoint - API endpoint
 * @param params - Request parameters
 * @returns Cache key string
 */
export function createCacheKey(endpoint: string, params?: Record<string, any>): string {
  const baseKey = endpoint.replace(/[^a-zA-Z0-9]/g, '_');
  
  if (!params || Object.keys(params).length === 0) {
    return baseKey;
  }

  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join('&');
    
  return `${baseKey}_${btoa(paramString)}`;
} 