/**
 * useFormPersistence hook
 * 
 * Provides functionality to persist form data in sessionStorage
 */
import { useCallback, useEffect } from 'react';

/**
 * Hook for form persistence with sessionStorage
 * 
 * @param key - Storage key for the form data
 * @param initialData - Initial data if nothing is in storage
 * @returns Form persistence utilities
 */
export function useFormPersistence<T>(key: string, initialData?: T) {
  /**
   * Save data to sessionStorage
   * 
   * @param data - Data to save
   */
  const saveData = useCallback((data: T) => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn(`Failed to save data to sessionStorage with key "${key}":`, error);
    }
  }, [key]);

  /**
   * Load data from sessionStorage
   * 
   * @returns The loaded data or initialData if not found
   */
  const loadData = useCallback((): T | undefined => {
    if (typeof window === 'undefined') return initialData;

    try {
      const storedData = sessionStorage.getItem(key);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.warn(`Failed to load data from sessionStorage with key "${key}":`, error);
    }
    
    return initialData;
  }, [key, initialData]);

  /**
   * Clear data from sessionStorage
   */
  const clearData = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear data from sessionStorage with key "${key}":`, error);
    }
  }, [key]);

  /**
   * Check if data exists in sessionStorage
   * 
   * @returns Whether data exists
   */
  const hasStoredData = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.warn(`Failed to check if data exists in sessionStorage with key "${key}":`, error);
      return false;
    }
  }, [key]);

  return {
    saveData,
    loadData,
    clearData,
    hasStoredData
  };
} 