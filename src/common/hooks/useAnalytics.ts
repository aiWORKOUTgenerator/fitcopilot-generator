/**
 * Analytics hook for tracking user interactions
 */

import { useCallback } from 'react';

// Analytics event types
export type AnalyticsEventType = 
  | 'workout_generation_started'
  | 'workout_generation_completed' 
  | 'workout_generation_error'
  | 'workout_saved'
  | 'workout_completed'
  | 'profile_updated'
  | 'advanced_options_toggled';

// Analytics event properties
export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  /**
   * Track an analytics event
   * 
   * @param eventType The type of event to track
   * @param properties Properties associated with the event
   */
  const trackEvent = useCallback((
    eventType: AnalyticsEventType, 
    properties: AnalyticsEventProperties = {}
  ) => {
    // Add timestamp
    const eventWithMeta = {
      ...properties,
      timestamp: new Date().toISOString(),
    };
    
    // In development, log to console
    if (process.env.NODE_ENV !== 'production') {
      console.info(`Analytics Event: ${eventType}`, eventWithMeta);
    }
    
    // Send to WordPress via the DOM
    if (window.dispatchEvent) {
      const event = new CustomEvent('fitcopilot_analytics', {
        detail: {
          eventType,
          properties: eventWithMeta,
        },
      });
      window.dispatchEvent(event);
    }
    
    // In a real implementation, you might send to a service like Google Analytics, Mixpanel, etc.
    // Example for Google Analytics:
    // if (window.gtag) {
    //   window.gtag('event', eventType, eventWithMeta);
    // }
  }, []);
  
  return { trackEvent };
}

/**
 * Helper function to convert string values to numbers where appropriate
 * 
 * @param value The value to convert
 * @returns The converted value
 */
export function sanitizeAnalyticsValue(value: any): string | number | boolean | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'string') {
    // Try to convert numeric strings to numbers
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
      return num;
    }
    
    // Convert boolean strings
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    return value;
  }
  
  return value;
} 