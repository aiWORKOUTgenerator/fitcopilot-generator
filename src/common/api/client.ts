/**
 * Central API client for making requests to the WordPress REST API
 */

import { ApiResponse } from '../types/api';

/**
 * Default fetch timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * API client utilities
 */

/**
 * API error types
 */
export enum ApiErrorType {
  VALIDATION = 'validation',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * API error class
 */
export class ApiError extends Error {
  /**
   * Error type
   */
  type: ApiErrorType;

  /**
   * HTTP status code if available
   */
  status?: number;

  /**
   * Original error if wrapped
   */
  originalError?: Error;

  /**
   * Constructor
   */
  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN,
    status?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.status = status;
    this.originalError = originalError;
  }

  /**
   * Create an error from a response
   */
  static fromResponse(response: Response, data?: any): ApiError {
    const message = data?.message || 'An error occurred';
    let type: ApiErrorType;

    switch (response.status) {
      case 400:
        type = ApiErrorType.VALIDATION;
        break;
      case 401:
      case 403:
        type = ApiErrorType.UNAUTHORIZED;
        break;
      case 404:
        type = ApiErrorType.NOT_FOUND;
        break;
      case 408:
        type = ApiErrorType.TIMEOUT;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ApiErrorType.SERVER;
        break;
      default:
        type = ApiErrorType.UNKNOWN;
    }

    return new ApiError(message, type, response.status);
  }

  /**
   * Create a network error
   */
  static network(error: Error): ApiError {
    return new ApiError(
      'Network error. Please check your connection and try again.',
      ApiErrorType.NETWORK,
      undefined,
      error
    );
  }

  /**
   * Create a timeout error
   */
  static timeout(): ApiError {
    return new ApiError(
      'Request timed out. Please try again.',
      ApiErrorType.TIMEOUT
    );
  }
}

/**
 * Fetch options with timeout
 */
interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout
 * 
 * @param url The URL to fetch
 * @param options Fetch options, including timeout
 * @returns Promise that resolves with the fetch response or rejects with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeout}ms`, ApiErrorType.TIMEOUT);
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      ApiErrorType.NETWORK
    );
  }
}

/**
 * Central fetch client for making requests to the WordPress REST API
 * 
 * @param endpoint The API endpoint to call
 * @param options Fetch options
 * @returns Promise that resolves with the API response data
 * @throws ApiError if the request fails
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T> {
  // Get API base and nonce from the global window object
  const apiBase = (window as any).fitcopilotData?.apiBase || '';
  const nonce = (window as any).fitcopilotData?.nonce || '';
  
  const url = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
  
  try {
    // Set up headers with nonce for WP REST API authentication
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-WP-Nonce': nonce,
      ...options.headers,
    });
    
    // Make the request with timeout
    const response = await fetchWithTimeout(url, {
      ...options,
      headers,
    });
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorType = getErrorTypeFromStatus(response.status);
      throw new ApiError(
        `HTTP error ${response.status}`,
        errorType,
        response.status
      );
    }
    
    // Parse the response as JSON
    const jsonResponse = await response.json() as ApiResponse<T>;
    
    // Check for API-level errors
    if (!jsonResponse.success) {
      const errorType = jsonResponse.code 
        ? getErrorTypeFromCode(jsonResponse.code) 
        : ApiErrorType.UNKNOWN;
      
      throw new ApiError(
        jsonResponse.message || 'Unknown API error',
        errorType
      );
    }
    
    // Return the data payload
    return jsonResponse.data as T;
  } catch (error) {
    // Rethrow ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      ApiErrorType.UNKNOWN
    );
  }
}

/**
 * Map HTTP status codes to error types
 * 
 * @param status HTTP status code
 * @returns Mapped error type
 */
function getErrorTypeFromStatus(status: number): ApiErrorType {
  switch (true) {
    case status === 401 || status === 403:
      return ApiErrorType.UNAUTHORIZED;
    case status === 400:
      return ApiErrorType.VALIDATION;
    case status >= 500:
      return ApiErrorType.SERVER;
    default:
      return ApiErrorType.UNKNOWN;
  }
}

/**
 * Map API error codes to error types
 * 
 * @param code API error code
 * @returns Mapped error type
 */
function getErrorTypeFromCode(code: string): ApiErrorType {
  switch (code) {
    case 'validation_error':
      return ApiErrorType.VALIDATION;
    case 'unauthorized':
      return ApiErrorType.UNAUTHORIZED;
    case 'server_error':
      return ApiErrorType.SERVER;
    default:
      return ApiErrorType.UNKNOWN;
  }
} 