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

  // Create abort controller for timeout if one wasn't provided
  let timeoutController: AbortController | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  
  // If a signal was already provided in the options
  if (mergedOptions.signal) {
    // ENHANCEMENT: Add a listener to clean up timeout when external signal aborts
    mergedOptions.signal.addEventListener('abort', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }, { once: true });
    
    // ENHANCEMENT: Set timeout that doesn't abort but notifies via event
    // This prevents conflicts between timeout and user-initiated aborts
    timeoutId = setTimeout(() => {
      // Only fire timeout event if request hasn't been aborted already
      if (!mergedOptions.signal?.aborted) {
        // Create a custom event to notify about timeout
        const timeoutEvent = new CustomEvent('fitcopilot_request_timeout', {
          detail: { url, timeout }
        });
        window.dispatchEvent(timeoutEvent);
        
        // Log timeout for debugging
        console.warn(`Request to ${url} timed out after ${timeout}ms`);
      }
    }, timeout);
  } else {
    // ENHANCEMENT: Create a timeout controller only if no signal was provided
    // This ensures we have exactly one source of abort signal
    timeoutController = new AbortController();
    
    // ENHANCEMENT: Add explicit reason for timeout abort
    // This fixes the "signal is aborted without reason" error
    timeoutId = setTimeout(() => {
      if (timeoutController) {
        timeoutController.abort('timeout');
      }
    }, timeout);
    
    // Use the timeout controller's signal
    mergedOptions.signal = timeoutController.signal;
  }

  let lastError: Error | null = null;
  let attempt = 0;

  try {
    while (attempt < retries + 1) {
      try {
        const response = await fetch(url, mergedOptions);
        
        // Clean up timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // Clear controller reference
        if (timeoutController) {
          timeoutController = null;
        }

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
        
        // ENHANCEMENT: Enhanced abort error handling with reason extraction
        if (lastError.name === 'AbortError') {
          // Safely extract abort reason with browser compatibility
          let reason = 'unknown';
          try {
            // Try to extract reason from signal if available
            const signal = mergedOptions.signal;
            if (signal && 'reason' in signal) {
              reason = (signal as any).reason || 'unknown';
            }
            // Also try to extract from error message as fallback
            const reasonMatch = lastError.message.match(/abort(?:ed)?\s*(?:with reason:?\s*)?['"]?([^'"]+)['"]?/i);
            if (reasonMatch && reasonMatch[1]) {
              reason = reasonMatch[1].trim();
            }
          } catch (e) {
            // Ignore any errors accessing reason
            console.debug('Error accessing signal reason:', e);
          }
          
          // Create a more descriptive error with the reason
          const enhancedError = new Error(`Request aborted: ${reason}`);
          enhancedError.name = 'AbortError';
          
          // Add custom properties to the error for better error handling
          (enhancedError as any).abortReason = reason;
          (enhancedError as any).originalError = lastError;
          
          // Log for debugging
          console.debug(`Request to ${url} was aborted with reason: ${reason}`);
          
          // Don't retry aborted requests - immediately throw with enhanced info
          throw enhancedError;
        }
        
        // Don't retry if we're out of retries
        if (attempt >= retries) {
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
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Throw the last error
    throw lastError || new Error('Request failed');
  } finally {
    // Clean up resources in finally block to ensure they're always cleaned up
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
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
    // ENHANCEMENT: Allow passing a reason to abort
    // This ensures abort always has context about why it was triggered
    abort: (reason = 'user_cancelled') => controller.abort(reason),
  };
} 