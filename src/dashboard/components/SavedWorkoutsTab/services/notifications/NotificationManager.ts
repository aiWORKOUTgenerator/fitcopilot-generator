/**
 * Notification Manager Service
 * 
 * Centralized notification system with queue management and priorities
 * for user feedback during authentication and error recovery operations.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

/**
 * Notification types and priorities
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
  timestamp: Date;
  actions?: NotificationAction[];
  persistent?: boolean; // If true, won't be auto-dismissed
  context?: Record<string, any>; // Additional context data
}

/**
 * Notification action interface
 */
export interface NotificationAction {
  label: string;
  action: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger';
}

/**
 * Notification Manager - Central hub for user feedback
 */
export class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private subscribers: Set<(notifications: Notification[]) => void> = new Set();
  private dismissTimers: Map<string, NodeJS.Timeout> = new Map();
  private maxNotifications = 5;
  private defaultDurations: Record<NotificationType, number> = {
    success: 4000,
    error: 0, // No auto-dismiss for errors
    warning: 6000,
    info: 3000,
    loading: 0 // No auto-dismiss for loading
  };

  constructor() {
    console.log('📢 NotificationManager initialized');
  }

  /**
   * Show a notification with automatic queuing and prioritization
   */
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? this.defaultDurations[notification.type]
    };

    console.log(`📢 Showing ${notification.type} notification:`, notification.title);

    // Add to notifications map
    this.notifications.set(id, fullNotification);

    // Manage queue size
    this.enforceMaxNotifications();

    // Set up auto-dismiss if duration is specified
    if (fullNotification.duration && fullNotification.duration > 0 && !fullNotification.persistent) {
      this.scheduleAutoDismiss(id, fullNotification.duration);
    }

    // Notify subscribers
    this.notifySubscribers();

    return id;
  }

  /**
   * Convenient methods for specific notification types
   */
  success(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'success',
      title,
      message,
      priority: 'normal',
      actions
    });
  }

  error(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'error',
      title,
      message,
      priority: 'high',
      actions,
      persistent: true
    });
  }

  warning(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'warning',
      title,
      message,
      priority: 'normal',
      actions
    });
  }

  info(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'info',
      title,
      message,
      priority: 'low',
      actions
    });
  }

  loading(title: string, message: string): string {
    return this.show({
      type: 'loading',
      title,
      message,
      priority: 'normal',
      persistent: true
    });
  }

  /**
   * Update an existing notification
   */
  update(id: string, updates: Partial<Omit<Notification, 'id' | 'timestamp'>>): boolean {
    const notification = this.notifications.get(id);
    if (!notification) {
      console.warn('⚠️ Attempted to update non-existent notification:', id);
      return false;
    }

    // Clear existing auto-dismiss timer
    this.clearAutoDismissTimer(id);

    // Update notification
    const updatedNotification: Notification = {
      ...notification,
      ...updates,
      duration: updates.duration ?? (updates.type ? this.defaultDurations[updates.type] : notification.duration)
    };

    this.notifications.set(id, updatedNotification);

    // Set up new auto-dismiss if needed
    if (updatedNotification.duration && updatedNotification.duration > 0 && !updatedNotification.persistent) {
      this.scheduleAutoDismiss(id, updatedNotification.duration);
    }

    console.log(`📢 Updated notification ${id}:`, updates);
    this.notifySubscribers();
    return true;
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(id: string): boolean {
    const notification = this.notifications.get(id);
    if (!notification) {
      return false;
    }

    console.log(`📢 Dismissing notification ${id}:`, notification.title);

    // Clear auto-dismiss timer
    this.clearAutoDismissTimer(id);

    // Remove notification
    this.notifications.delete(id);

    // Notify subscribers
    this.notifySubscribers();
    return true;
  }

  /**
   * Dismiss all notifications of a specific type
   */
  dismissByType(type: NotificationType): number {
    let dismissed = 0;
    
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.type === type) {
        this.dismiss(id);
        dismissed++;
      }
    }

    console.log(`📢 Dismissed ${dismissed} notifications of type: ${type}`);
    return dismissed;
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    console.log(`📢 Clearing all ${this.notifications.size} notifications`);

    // Clear all auto-dismiss timers
    for (const timer of this.dismissTimers.values()) {
      clearTimeout(timer);
    }
    this.dismissTimers.clear();

    // Clear notifications
    this.notifications.clear();

    // Notify subscribers
    this.notifySubscribers();
  }

  /**
   * Get all current notifications, sorted by priority and timestamp
   */
  getAll(): Notification[] {
    const notifications = Array.from(this.notifications.values());
    
    // Sort by priority (urgent > high > normal > low) then by timestamp (newest first)
    const priorityOrder: Record<NotificationPriority, number> = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1
    };

    return notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  /**
   * Get notification by ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Send current notifications immediately
    callback(this.getAll());

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Show authentication-related notifications
   */
  authSuccess(message: string = 'Authentication restored successfully'): string {
    return this.success('Authentication Success', message);
  }

  authError(message: string, onRefresh?: () => void): string {
    const actions: NotificationAction[] = [];
    
    if (onRefresh) {
      actions.push({
        label: 'Refresh Page',
        action: onRefresh,
        style: 'primary'
      });
    }

    return this.error('Authentication Required', message, actions);
  }

  authWarning(message: string): string {
    return this.warning('Authentication Warning', message);
  }

  /**
   * Show recovery-related notifications
   */
  recoveryStarted(operation: string): string {
    return this.loading('Recovery in Progress', `Attempting to recover from ${operation}...`);
  }

  recoverySuccess(operation: string): string {
    return this.success('Recovery Successful', `Successfully recovered from ${operation}`);
  }

  recoveryFailed(operation: string, userAction?: string, onRetry?: () => void): string {
    const actions: NotificationAction[] = [];
    
    if (onRetry) {
      actions.push({
        label: 'Try Again',
        action: onRetry,
        style: 'primary'
      });
    }

    return this.error(
      'Recovery Failed', 
      userAction || `Failed to recover from ${operation}. Please try again or refresh the page.`,
      actions
    );
  }

  /**
   * Show workout-related notifications
   */
  workoutLoadError(workoutId?: string, onRetry?: () => void): string {
    const message = workoutId 
      ? `Failed to load workout ${workoutId}` 
      : 'Failed to load workouts';

    const actions: NotificationAction[] = [];
    
    if (onRetry) {
      actions.push({
        label: 'Retry',
        action: onRetry,
        style: 'primary'
      });
    }

    return this.error('Workout Loading Error', message, actions);
  }

  workoutLoadSuccess(count: number): string {
    return this.success('Workouts Loaded', `Successfully loaded ${count} workout${count !== 1 ? 's' : ''}`);
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleAutoDismiss(id: string, duration: number): void {
    const timer = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    this.dismissTimers.set(id, timer);
  }

  private clearAutoDismissTimer(id: string): void {
    const timer = this.dismissTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.dismissTimers.delete(id);
    }
  }

  private enforceMaxNotifications(): void {
    const notifications = this.getAll();
    
    while (notifications.length > this.maxNotifications) {
      // Remove oldest, lowest priority notification that's not persistent
      const toRemove = notifications
        .filter(n => !n.persistent)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .find(n => n.priority === 'low') || notifications[notifications.length - 1];

      if (toRemove) {
        this.dismiss(toRemove.id);
        break;
      } else {
        break; // All notifications are persistent
      }
    }
  }

  private notifySubscribers(): void {
    const notifications = this.getAll();
    for (const callback of this.subscribers) {
      try {
        callback(notifications);
      } catch (error) {
        console.error('Error notifying notification subscriber:', error);
      }
    }
  }

  /**
   * Configure notification manager settings
   */
  configure(settings: {
    maxNotifications?: number;
    defaultDurations?: Partial<Record<NotificationType, number>>;
  }): void {
    if (settings.maxNotifications !== undefined) {
      this.maxNotifications = Math.max(1, Math.min(20, settings.maxNotifications));
    }

    if (settings.defaultDurations) {
      this.defaultDurations = { ...this.defaultDurations, ...settings.defaultDurations };
    }

    console.log('⚙️ Notification manager configured:', {
      maxNotifications: this.maxNotifications,
      defaultDurations: this.defaultDurations
    });
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    total: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    persistent: number;
    withTimers: number;
  } {
    const notifications = Array.from(this.notifications.values());
    
    const byType: Record<NotificationType, number> = {
      success: 0, error: 0, warning: 0, info: 0, loading: 0
    };
    
    const byPriority: Record<NotificationPriority, number> = {
      low: 0, normal: 0, high: 0, urgent: 0
    };

    let persistent = 0;

    for (const notification of notifications) {
      byType[notification.type]++;
      byPriority[notification.priority]++;
      if (notification.persistent) persistent++;
    }

    return {
      total: notifications.length,
      byType,
      byPriority,
      persistent,
      withTimers: this.dismissTimers.size
    };
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();

// Export for use in other modules
export default NotificationManager; 