/**
 * Workout API Client
 * 
 * A specialized API client for workout generation that provides:
 * - Proper AbortSignal handling for request cancellation
 * - Timeout management with clean cancellation
 * - Progress simulation for long-running requests
 * - Automatic retry for recoverable errors
 * - Standardized error handling and classification
 * 
 * This client is designed to work with the FormFlowContext and useAbortController
 * hook to ensure reliable API requests during form transitions.
 */
import { AbortReason } from '../hooks/useAbortController';

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  signal: AbortSignal;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * Standardized API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

/**
 * Workout generation API client
 */
export class WorkoutApiClient {
  private readonly baseUrl = '/wp-json/fitcopilot/v1';
  private readonly defaultTimeout = 45000; // 45 seconds
  private readonly maxRetries = 2;
  
  /**
   * Generate a workout with proper signal handling and progress reporting
   * 
   * @param workoutParams - The workout generation parameters
   * @param options - Request options including signal and timeout
   * @param onProgress - Optional callback for progress updates
   * @returns API response with workout data or error
   */
  async generateWorkout(
    workoutParams: any, 
    options: ApiRequestOptions,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<any>> {
    const { signal, timeout = this.defaultTimeout, retries = this.maxRetries } = options;
    
    // Create timeout controller for this request
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort('timeout');
    }, timeout);
    
    // Combine the user signal and timeout signal
    const combinedSignal = this.combineSignals([signal, timeoutController.signal]);
    
    try {
      // Start progress simulation if callback provided
      this.simulateProgress(onProgress, combinedSignal);
      
      // Get WP nonce for authentication
      const nonce = this.getNonce();
      
      // Make request with retry capability
      const result = await this.requestWithRetry(
        `${this.baseUrl}/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          body: JSON.stringify(workoutParams),
          signal: combinedSignal
        },
        retries
      );
      
      return result;
    } catch (error) {
      return this.handleApiError(error);
    } finally {
      // Always clean up the timeout
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * Make an API request with automatic retry for recoverable errors
   * 
   * @param url - The API endpoint URL
   * @param options - Fetch request options
   * @param retriesLeft - Number of retries remaining
   * @returns API response
   */
  private async requestWithRetry(
    url: string, 
    options: RequestInit, 
    retriesLeft: number
  ): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          success: false, 
          message: `HTTP error ${response.status}` 
        }));
        
        // Only retry on server errors (5xx) or specific recoverable codes
        if ((response.status >= 500 || this.isRecoverableError(errorData)) && retriesLeft > 0) {
          // Exponential backoff
          const delay = Math.pow(2, this.maxRetries - retriesLeft) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.requestWithRetry(url, options, retriesLeft - 1);
        }
        
        return errorData;
      }
      
      // Parse and return successful response
      const data = await response.json();
      return data;
    } catch (error: unknown) {
      // For abort errors, don't retry, just propagate
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      
      // For network errors, retry with backoff if attempts remain
      if (retriesLeft > 0) {
        const delay = Math.pow(2, this.maxRetries - retriesLeft) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry(url, options, retriesLeft - 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Handles API errors and converts them to a standardized format
   * 
   * @param error - The caught error
   * @returns Standardized API error response
   */
  private handleApiError(error: unknown): ApiResponse<any> {
    // Extract reason from abort errors for better messaging
    if (error instanceof Error && error.name === 'AbortError') {
      const reasonMatch = error.message?.match(/AbortError: (.+)/);
      const reason = reasonMatch ? reasonMatch[1] : 'unknown';
      
      // Different messages based on abort reason
      if (reason === 'timeout') {
        return {
          success: false,
          message: 'The workout generation request timed out. Please try again.',
          code: 'abort_timeout'
        };
      } else if (reason === 'user_cancelled') {
        return {
          success: false,
          message: 'Workout generation was cancelled.',
          code: 'abort_user_cancelled'
        };
      } else if (reason === 'step_transition') {
        return {
          success: false,
          message: 'Workout generation was cancelled due to navigation.',
          code: 'abort_step_transition'
        };
      } else {
        return {
          success: false,
          message: 'Workout generation was cancelled.',
          code: `abort_${reason}`
        };
      }
    }
    
    // Network error handling
    if (error instanceof Error && error.message?.includes('network')) {
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
        code: 'network_error'
      };
    }
    
    // Generic error
    return {
      success: false,
      message: 'Failed to generate workout. Please try again.',
      code: 'api_error'
    };
  }
  
  /**
   * Check if an error is recoverable and worth retrying
   * 
   * @param errorData - The error response from the API
   * @returns Whether the error is recoverable
   */
  private isRecoverableError(errorData: any): boolean {
    // List of error codes that are worth retrying
    const recoverableCodes = [
      'temporary_unavailable',
      'rate_limit_exceeded',
      'openai_timeout'
    ];
    
    return recoverableCodes.includes(errorData?.code);
  }
  
  /**
   * Get WordPress authentication nonce
   * 
   * @returns The nonce value
   */
  private getNonce(): string {
    return (window as any).wpApiSettings?.nonce || '';
  }
  
  /**
   * Combine multiple abort signals into one
   * 
   * @param signals - Array of signals to combine
   * @returns A single signal that aborts when any input signal aborts
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    signals.forEach(signal => {
      // When any signal aborts, abort the combined controller
      const onAbort = () => {
        try {
          // Safely extract reason with browser compatibility
          let reason: string | undefined;
          try {
            if ('reason' in signal) {
              reason = (signal as any).reason;
            }
          } catch (e) {
            console.debug('Error accessing signal reason:', e);
          }
          
          // Try to abort with reason, fall back to basic abort if not supported
          try {
            controller.abort(reason);
          } catch (e) {
            controller.abort();
          }
        } catch (e) {
          console.debug('Error during abort in combineSignals:', e);
        }
        
        // Clean up listeners from other signals
        signals.forEach(s => {
          if (s !== signal) {
            s.removeEventListener('abort', onAbort);
          }
        });
      };
      
      // If signal is already aborted, abort immediately
      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
      }
    });
    
    return controller.signal;
  }
  
  /**
   * Simulate progress for long-running requests
   * 
   * @param onProgress - Progress callback
   * @param signal - Signal to abort progress simulation
   */
  private simulateProgress(
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): void {
    if (!onProgress) return;
    
    const intervals: NodeJS.Timeout[] = [];
    let progress = 0;
    
    // Start with fast progress
    onProgress(5);
    progress = 5;
    
    // Phase 1: Fast initial progress (5% to 30%)
    const initialInterval = setInterval(() => {
      progress += 5;
      onProgress(progress);
      
      if (progress >= 30) {
        clearInterval(initialInterval);
        startMediumPhase();
      }
    }, 500);
    
    intervals.push(initialInterval);
    
    // Phase 2: Medium progress (30% to 70%)
    const startMediumPhase = () => {
      const mediumInterval = setInterval(() => {
        progress += 2;
        onProgress(progress);
        
        if (progress >= 70) {
          clearInterval(mediumInterval);
          startSlowPhase();
        }
      }, 1000);
      
      intervals.push(mediumInterval);
    };
    
    // Phase 3: Slow progress with diminishing returns (70% to 95%)
    const startSlowPhase = () => {
      const slowInterval = setInterval(() => {
        const increment = Math.max(0.5, (95 - progress) / 30);
        progress += increment;
        onProgress(Math.min(95, progress));
        
        if (progress >= 95) {
          clearInterval(slowInterval);
        }
      }, 1500);
      
      intervals.push(slowInterval);
    };
    
    // Clean up intervals when signal aborts
    signal?.addEventListener('abort', () => {
      intervals.forEach(clearInterval);
    });
  }
}

/**
 * Singleton instance of the workout API client
 */
export const workoutApiClient = new WorkoutApiClient(); 