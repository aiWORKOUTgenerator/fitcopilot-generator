/**
 * Analytics API client module
 */
import { apiFetch } from './client';
import { AnalyticsEventType } from '../../features/analytics/types';

/**
 * Track an analytics event through the REST API
 * 
 * @param eventType - The type of event to track
 * @param eventData - Additional data for the event
 * @returns Promise resolving when the event is tracked
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  eventData: Record<string, unknown> = {}
): Promise<void> {
  return apiFetch(
    '/analytics',
    {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData
      })
    }
  );
} 