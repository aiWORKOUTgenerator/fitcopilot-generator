/**
 * Authentication nonce hook
 * 
 * Provides the WordPress nonce with caching and expiry handling
 */
import { useState, useEffect } from 'react';

// Cache duration in milliseconds (30 minutes)
const NONCE_CACHE_DURATION = 30 * 60 * 1000;

// Type for the window with fitcopilot data
interface FitcopilotWindow extends Window {
  fitcopilotData?: {
    nonce: string;
    [key: string]: unknown;
  };
}

// Cache structure
interface NonceCache {
  value: string;
  expiresAt: number;
}

// In-memory nonce cache
let nonceCache: NonceCache | null = null;

/**
 * Hook to get the authentication nonce with caching
 * 
 * @returns Object containing the nonce and a refresh function
 */
export function useAuthNonce() {
  const [nonce, setNonce] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get the nonce from the window object
   * 
   * @returns The nonce value
   */
  const getNonceFromWindow = (): string => {
    return (window as FitcopilotWindow).fitcopilotData?.nonce || '';
  };

  /**
   * Check if the nonce cache is valid
   * 
   * @returns True if the cache is valid, false otherwise
   */
  const isNonceCacheValid = (): boolean => {
    return Boolean(
      nonceCache && 
      nonceCache.value &&
      Date.now() < nonceCache.expiresAt
    );
  };

  /**
   * Refresh the nonce value
   * 
   * This will get a fresh nonce from the window object and update the cache
   */
  const refreshNonce = (): void => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the nonce from the window object
      const freshNonce = getNonceFromWindow();
      
      if (!freshNonce) {
        throw new Error('Failed to get authentication nonce');
      }

      // Update the cache
      nonceCache = {
        value: freshNonce,
        expiresAt: Date.now() + NONCE_CACHE_DURATION
      };

      // Update the state
      setNonce(freshNonce);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown authentication error'));
      setIsLoading(false);
    }
  };

  // Initialize or get the nonce on mount
  useEffect(() => {
    if (isNonceCacheValid()) {
      // Use the cached nonce
      setNonce(nonceCache!.value);
      setIsLoading(false);
    } else {
      // Refresh the nonce
      refreshNonce();
    }
  }, []);

  return {
    nonce,
    refreshNonce,
    isLoading,
    error
  };
} 