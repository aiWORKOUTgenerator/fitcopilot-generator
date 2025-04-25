/**
 * Analytics types
 */

/**
 * Event types that can be tracked
 */
export type AnalyticsEventType =
  | 'view_form'
  | 'view_preview'
  | 'form_submit'
  | 'form_error'
  | 'workout_generated'
  | 'workout_saved'
  | 'workout_deleted'
  | 'workout_viewed'
  | 'workout_completed';

/**
 * Data structure for analytics events
 */
export interface AnalyticsEvent {
  /** Type of the event */
  event_type: AnalyticsEventType;
  /** Associated data for the event */
  event_data?: Record<string, unknown>;
  /** When the event occurred */
  timestamp?: number;
} 