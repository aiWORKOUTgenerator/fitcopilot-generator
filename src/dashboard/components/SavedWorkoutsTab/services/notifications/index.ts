/**
 * Notifications Services Index
 * 
 * Centralized exports for all notification services
 * for consistent usage throughout the application.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

// Core notification services
export { NotificationManager, notificationManager } from './NotificationManager';

// Re-export types for convenience
export type {
  Notification,
  NotificationAction,
  NotificationType,
  NotificationPriority
} from './NotificationManager';

// Service instances for immediate use
export const notificationServices = {
  manager: notificationManager
};

/**
 * Quick notification utilities
 */
export const quickNotify = {
  success: (message: string) => notificationManager.success('Success', message),
  error: (message: string) => notificationManager.error('Error', message),
  warning: (message: string) => notificationManager.warning('Warning', message),
  info: (message: string) => notificationManager.info('Info', message),
  loading: (message: string) => notificationManager.loading('Loading', message)
}; 