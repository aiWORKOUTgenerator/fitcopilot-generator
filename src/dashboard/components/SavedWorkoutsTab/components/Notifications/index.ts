/**
 * Notifications Components Index
 * 
 * Centralized exports for all notification-related components
 * for consistent usage throughout the application.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

// Core notification components
export { NotificationDisplay } from './NotificationDisplay';

// Component groups for convenient imports
export const NotificationComponents = {
  Display: NotificationDisplay
};

// Legacy aliases for backward compatibility
export const NotificationToast = NotificationDisplay; 