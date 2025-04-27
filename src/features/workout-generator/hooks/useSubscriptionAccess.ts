/**
 * Hook for subscription feature access
 * 
 * This hook provides functionality for checking user subscription status and feature access.
 */
import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

/**
 * Configuration for subscription features
 */
const SubscriptionConfig = {
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  PREMIUM_FEATURES: {
    CUSTOM_WORKOUTS: 'custom_workouts',
    WORKOUT_HISTORY: 'workout_history',
    EQUIPMENT_OPTIONS: 'equipment_options',
    AI_GENERATION: 'ai_generation'
  }
};

/**
 * Interface for subscription status data
 */
interface SubscriptionData {
  active: boolean;
  type: 'free' | 'basic' | 'premium' | 'none';
  features: string[];
  expires?: string;
}

/**
 * Hook for checking user access to subscription features
 * 
 * @param featureKey - Optional specific feature to check access for
 * @returns Information about subscription access
 */
export const useSubscriptionAccess = (featureKey?: string) => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    active: false,
    type: 'none',
    features: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Check if a feature requires premium subscription
   */
  const isPremiumFeature = useCallback((feature: string): boolean => {
    return Object.values(SubscriptionConfig.PREMIUM_FEATURES).includes(feature);
  }, []);
  
  /**
   * Check if user can access a specific feature
   */
  const canAccessFeature = useCallback((feature: string): boolean => {
    // In debug mode, grant access to everything
    if (SubscriptionConfig.DEBUG_MODE) return true;
    
    // If subscription is active and contains the feature, grant access
    return subscriptionData.active && subscriptionData.features.includes(feature);
  }, [subscriptionData]);
  
  /**
   * Load subscription data from the API
   */
  const loadSubscriptionData = useCallback(async () => {
    if (SubscriptionConfig.DEBUG_MODE) {
      // In debug mode, simulate full access
      setSubscriptionData({
        active: true,
        type: 'premium',
        features: Object.values(SubscriptionConfig.PREMIUM_FEATURES)
      });
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiFetch<{ success: boolean; data: SubscriptionData }>(
        API_ENDPOINTS.PROFILE,
        { method: 'GET' }
      );
      
      if (response && response.success && response.data) {
        setSubscriptionData(response.data);
      } else {
        throw new Error('Failed to load subscription data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error loading subscription data';
      setError(errorMessage);
      console.error('Error loading subscription data:', err);
      
      // Set default data on error
      setSubscriptionData({
        active: false,
        type: 'free',
        features: []
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load subscription data on mount
  useEffect(() => {
    loadSubscriptionData();
  }, [loadSubscriptionData]);
  
  // If a specific feature was requested, check access to it
  const hasAccess = featureKey 
    ? canAccessFeature(featureKey)
    : subscriptionData.active;
  
  return {
    hasAccess,
    isPremiumFeature,
    canAccessFeature,
    subscription: subscriptionData,
    loading,
    error,
    reload: loadSubscriptionData
  };
};

export default useSubscriptionAccess; 