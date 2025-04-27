/**
 * useOpenAILogs Hook
 * 
 * Custom hook for accessing OpenAI logs for the workout generator
 */
import { useState, useCallback } from 'react';
import { useWorkoutGenerator } from '../context';
import { OpenAILogEntry } from '../types/api';
import { API_ENDPOINTS } from '../api/endpoints';
import { apiFetch } from '../api/client';
import { setLogs } from '../context/actions';

/**
 * Hook for fetching and managing OpenAI API logs
 * For debugging and monitoring purposes
 */
export const useOpenAILogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { state, dispatch } = useWorkoutGenerator();
  
  const logs = state.ui.logs || [];
  
  /**
   * Load logs from the API
   */
  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch logs from the API
      const response = await apiFetch<{ success: boolean; data: OpenAILogEntry[] }>(
        `${API_ENDPOINTS.GENERATE}/logs`,
        { method: 'GET' }
      );
      
      if (response && response.success && response.data) {
        dispatch(setLogs(response.data));
        return response.data;
      } else {
        throw new Error('Failed to fetch OpenAI logs');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching logs';
      setError(errorMessage);
      console.error('Error loading OpenAI logs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
  
  /**
   * Clear logs from state
   */
  const clearLogs = useCallback(() => {
    dispatch(setLogs([]));
  }, [dispatch]);
  
  return {
    logs,
    loading,
    error,
    loadLogs,
    clearLogs,
    showLogs: state.ui.debugMode
  };
};

export default useOpenAILogs; 