/**
 * API Client for workout generator
 * Handles authentication, retries, and request aborting
 */

// Type for the window with WordPress data
interface WordPressWindow extends Window {
  fitcopilotData?: {
    nonce: string;
    [key: string]: unknown;
  };
}

// API request options type
export interface ApiRequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

// Default request options
const DEFAULT_OPTIONS: ApiRequestOptions = {
  credentials: 'same-origin',
  retries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * Get the WordPress nonce from the global window object
 * @returns The nonce string or empty string if not found
 */
export function getNonce(): string {
  return (window as WordPressWindow).fitcopilotData?.nonce || '';
}

/**
 * Enhanced fetch function with retry logic, timeout and abort capabilities
 * 
 * @param url - The endpoint URL
 * @param options - Request options
 * @returns Promise resolving to the response data
 * @throws Error if the request fails after retries or is aborted
 */
export async function apiFetch<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const mergedOptions: ApiRequestOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': getNonce(),
      ...options.headers,
    },
  };
  
  const { retries = 3, retryDelay = 1000, timeout = 60000 } = mergedOptions;
  delete mergedOptions.retries;
  delete mergedOptions.retryDelay;
  delete mergedOptions.timeout;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Add the signal to the options
  mergedOptions.signal = controller.signal;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < retries + 1) {
    try {
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);

      // Parse the response as JSON
      const data = await response.json();
      
      // Check if the response is successful
      if (!response.ok || (data && data.success === false)) {
        throw new Error(
          data.message || data.code || `Request failed with status ${response.status}`
        );
      }
      
      // Return the response data
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if request was aborted or if we're out of retries
      if (
        lastError.name === 'AbortError' || 
        attempt >= retries
      ) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, retryDelay * Math.pow(2, attempt))
      );
      
      attempt++;
    }
  }

  // Clean up timeout if we exit the loop due to max retries
  clearTimeout(timeoutId);
  
  // Throw the last error
  throw lastError || new Error('Request failed');
}

/**
 * Create an abortable request
 * 
 * @returns Object with request function and abort method
 */
export function createAbortableRequest<T>() {
  const controller = new AbortController();
  
  return {
    request: (url: string, options: ApiRequestOptions = {}) => {
      return apiFetch<T>(url, {
        ...options,
        signal: controller.signal,
      });
    },
    abort: () => controller.abort('Request cancelled by user'),
  };
} 