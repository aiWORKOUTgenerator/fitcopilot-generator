/**
 * API utilities for making requests to the WordPress REST API
 */

/**
 * Interface for API responses
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data: T;
  /** Human-readable message */
  message?: string;
  /** Error code for failed requests */
  code?: string;
}

/**
 * Interface for API request options
 */
export interface ApiRequestOptions {
  /** API endpoint path */
  path: string;
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request data (for POST/PUT) */
  data?: unknown;
  /** Query parameters */
  params?: Record<string, string>;
}

/**
 * API fetch error class
 */
export class ApiFetchError extends Error {
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiFetchError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Makes a request to the WordPress REST API
 * 
 * @template T - The expected response data type
 * @param {ApiRequestOptions} options - Request options
 * @returns {Promise<T>} Response data
 * @throws {ApiFetchError} When the request fails
 */
export async function apiFetch<T>({
  path,
  method = 'GET',
  data,
  params,
}: ApiRequestOptions): Promise<T> {
  // Construct the URL with query parameters if provided
  let url = `/wp-json/fitcopilot/v1${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += `?${searchParams.toString()}`;
  }

  // Get nonce from multiple possible sources
  const getNonce = (): string => {
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
  };

  // Prepare the request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': getNonce(),
    },
    credentials: 'same-origin',
  };

  // Add request body for POST/PUT methods
  if (data && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(data);
  }

  try {
    // Make the request
    const response = await fetch(url, requestOptions);
    
    // Parse the JSON response
    const result = await response.json() as ApiResponse<T>;
    
    // Check if the request was successful
    if (!response.ok || !result.success) {
      throw new ApiFetchError(
        result.message || 'An unexpected error occurred',
        result.code || 'unknown_error',
        response.status
      );
    }
    
    // Return the data
    return result.data;
  } catch (error) {
    // Handle fetch or parsing errors
    if (error instanceof ApiFetchError) {
      throw error;
    }
    
    throw new ApiFetchError(
      error instanceof Error ? error.message : 'Failed to fetch from API',
      'network_error'
    );
  }
} 