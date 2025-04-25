/**
 * API request hook
 * 
 * Provides a flexible way to make API requests with retry logic, aborting, and standardized error handling
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiFetch, ApiRequestOptions, createAbortableRequest } from '../api/client';
import { useAuthNonce } from './useAuthNonce';
import { formatError } from '../utils/formatErrorMessage';
import { API_ERROR_CODES, WorkoutGeneratorError } from '../utils/errorTypes';

/**
 * State returned by the useApiRequest hook
 */
export interface ApiRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  abortController: AbortController | null;
}

/**
 * API request method parameters
 */
interface RequestParams {
  url: string;
  options?: ApiRequestOptions;
  handleUnauthorized?: boolean;
  retry?: number;
  retryDelay?: number;
}

// Standard API response interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

// Error interface
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Hook to make API requests with advanced functionality
 * 
 * @returns API request methods and state
 */
export function useApiRequest<T>() {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
    abortController: null
  });
  
  // Get the auth nonce
  const { nonce, refreshNonce } = useAuthNonce();
  
  // Flag to check if the component is mounted
  const isMounted = useRef(true);
  
  // Reset the mounted flag when the component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      
      // Abort any pending requests when unmounting
      if (state.abortController) {
        state.abortController.abort();
      }
    };
  }, [state.abortController]);
  
  /**
   * Reset the request state
   */
  const reset = useCallback(() => {
    if (isMounted.current) {
      setState({
        data: null,
        isLoading: false,
        error: null,
        abortController: null
      });
    }
  }, []);

  /**
   * Abort the current request
   */
  const abort = useCallback(() => {
    if (state.abortController) {
      state.abortController.abort();
      
      if (isMounted.current) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          abortController: null
        }));
      }
    }
  }, [state.abortController]);

  /**
   * Make an API request
   */
  const request = useCallback(
    async ({
      url,
      options = {},
      handleUnauthorized = false,
      retry = 1,
      retryDelay = 1000,
    }: RequestParams): Promise<T | null> => {
      // Abort any existing request
      if (state.abortController) {
        state.abortController.abort();
      }

      // Create new abort controller
      const controller = new AbortController();
      
      if (isMounted.current) {
        // Set loading state
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          abortController: controller
        }));
      }

      try {
        // Use the createAbortableRequest utility to handle request
        const abortableRequest = createAbortableRequest<ApiResponse<T>>();
        
        // Add nonce to headers
        const headers = new Headers(options.headers);
        if (nonce) {
          headers.set('X-WP-Nonce', nonce);
        }
        
        // Ensure content type for POST/PUT requests
        if ((options.method === 'POST' || options.method === 'PUT') && !headers.has('Content-Type')) {
          headers.set('Content-Type', 'application/json');
        }
        
        // Perform the request
        let attempts = 0;
        let lastError: Error | null = null;
        
        while (attempts <= retry) {
          try {
            const response = await abortableRequest.request(url, {
              ...options,
              headers,
              signal: controller.signal
            });
            
            // Update state if component is still mounted
            if (isMounted.current) {
              setState(prev => ({
                ...prev,
                data: response.data,
                isLoading: false,
                error: null,
                abortController: null
              }));
            }
            
            return response.data;
          } catch (error: any) {
            lastError = error;
            
            // Handle abort error
            if (error.name === 'AbortError') {
              if (isMounted.current) {
                setState(prev => ({
                  ...prev,
                  isLoading: false,
                  abortController: null
                }));
              }
              return null;
            }
            
            // Handle unauthorized error (401)
            if (error.status === 401 && handleUnauthorized) {
              await refreshNonce();
              attempts++;
              
              // If we still have retry attempts, wait and try again
              if (attempts <= retry) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                continue;
              }
            }
            
            // We've run out of retries or it's not an unauthorized error
            attempts++;
            if (attempts > retry) {
              break;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
        
        // If we exit the loop, we've failed all retries
        // Handle the error and update state
        if (lastError && isMounted.current) {
          const formattedError = formatError(lastError);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: formattedError,
            abortController: null
          }));
        }
        
        return null;
      } catch (error) {
        // Handle unexpected errors
        if (isMounted.current) {
          const formattedError = formatError(error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: formattedError,
            abortController: null
          }));
        }
        return null;
      }
    },
    [nonce, refreshNonce]
  );

  return {
    ...state,
    request,
    abort,
    reset
  };
} 