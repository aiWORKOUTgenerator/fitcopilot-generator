/**
 * Hook for tracking user events
 */
import { useCallback } from 'react';
import { trackEvent as trackEventApi } from '../../../common/api/analyticsApi';
import { AnalyticsEventType } from '../types';

/**
 * Custom hook for tracking user events
 * 
 * @returns {Object} Methods for tracking events
 */
export const useAnalytics = () => {
  /**
   * Track an analytics event
   * 
   * @param {AnalyticsEventType} eventType - Type of event to track
   * @param {Record<string, unknown>} eventData - Additional event data
   */
  const trackEvent = useCallback((
    eventType: AnalyticsEventType,
    eventData: Record<string, unknown> = {}
  ) => {
    // Create the event object with timestamp
    const eventWithTimestamp = {
      ...eventData,
      timestamp: Date.now(),
    };

    // Log the event to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', { type: eventType, data: eventWithTimestamp });
    }

    // During development, we can just log events without sending to server
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // In production, send event to the REST API endpoint
    try {
      trackEventApi(eventType, eventWithTimestamp).catch(error => {
        // Silently fail analytics in production
        if (process.env.NODE_ENV === 'development') {
          console.error('Analytics tracking error:', error);
        }
      });
    } catch (error) {
      // Silently fail analytics
      if (process.env.NODE_ENV === 'development') {
        console.error('Analytics tracking error:', error);
      }
    }
  }, []);

  return {
    trackEvent,
  };
}; 