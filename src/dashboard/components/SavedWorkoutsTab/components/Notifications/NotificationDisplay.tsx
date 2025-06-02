/**
 * Notification Display Component
 * 
 * React component that displays notifications from the NotificationManager
 * with toast-style UI and action button support.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

import React, { useState, useEffect } from 'react';
import { notificationManager, type Notification, type NotificationAction } from '../../services/notifications/NotificationManager';

/**
 * NotificationDisplay Props
 */
interface NotificationDisplayProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  className?: string;
}

/**
 * NotificationDisplay - Shows toast notifications from the notification manager
 */
export const NotificationDisplay: React.FC<NotificationDisplayProps> = ({
  position = 'top-right',
  maxVisible = 3,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notification changes
  useEffect(() => {
    console.log('📢 NotificationDisplay subscribing to notifications...');
    
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications.slice(0, maxVisible));
    });

    return () => {
      console.log('📢 NotificationDisplay unsubscribing from notifications...');
      unsubscribe();
    };
  }, [maxVisible]);

  // Handle notification action
  const handleAction = async (action: NotificationAction, notificationId: string) => {
    try {
      await action.action();
    } catch (error) {
      console.error('Notification action failed:', error);
      // Optionally show an error notification
      notificationManager.error('Action Failed', 'The requested action could not be completed.');
    }
  };

  // Handle notification dismiss
  const handleDismiss = (id: string) => {
    notificationManager.dismiss(id);
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'loading': return '🔄';
      default: return 'ℹ️';
    }
  };

  // Get notification style class
  const getNotificationClass = (type: Notification['type']): string => {
    return `notification notification--${type}`;
  };

  // Get action button style
  const getActionButtonClass = (style?: NotificationAction['style']): string => {
    switch (style) {
      case 'primary': return 'notification-action notification-action--primary';
      case 'danger': return 'notification-action notification-action--danger';
      case 'secondary':
      default: return 'notification-action notification-action--secondary';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className={`notification-container notification-container--${position} ${className}`}
      style={{
        position: 'fixed',
        zIndex: 10000,
        pointerEvents: 'none',
        ...getPositionStyles(position)
      }}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
          style={{
            pointerEvents: 'auto',
            margin: '8px 0',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            backgroundColor: getBackgroundColor(notification.type),
            border: `1px solid ${getBorderColor(notification.type)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {/* Notification Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                {getNotificationIcon(notification.type)}
              </span>
              <strong style={{ fontSize: '14px', fontWeight: '600' }}>
                {notification.title}
              </strong>
            </div>
            
            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
                opacity: 0.7,
                lineHeight: 1
              }}
              title="Dismiss notification"
            >
              ×
            </button>
          </div>

          {/* Notification Message */}
          <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#555' }}>
            {notification.message}
          </div>

          {/* Notification Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleAction(action, notification.id)}
                  className={getActionButtonClass(action.style)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: '1px solid',
                    ...getActionButtonStyles(action.style)
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Priority indicator for high/urgent notifications */}
          {(notification.priority === 'high' || notification.priority === 'urgent') && (
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '4px',
              height: '100%',
              backgroundColor: notification.priority === 'urgent' ? '#ff0000' : '#ff6600',
              borderRadius: '4px 0 0 4px'
            }} />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Helper functions for styling
 */
function getPositionStyles(position: NotificationDisplayProps['position']) {
  switch (position) {
    case 'top-right':
      return { top: '20px', right: '20px' };
    case 'top-left':
      return { top: '20px', left: '20px' };
    case 'bottom-right':
      return { bottom: '20px', right: '20px' };
    case 'bottom-left':
      return { bottom: '20px', left: '20px' };
    default:
      return { top: '20px', right: '20px' };
  }
}

function getBackgroundColor(type: Notification['type']): string {
  switch (type) {
    case 'success': return '#f0f9ff';
    case 'error': return '#fef2f2';
    case 'warning': return '#fffbeb';
    case 'info': return '#f8fafc';
    case 'loading': return '#f1f5f9';
    default: return '#f8fafc';
  }
}

function getBorderColor(type: Notification['type']): string {
  switch (type) {
    case 'success': return '#10b981';
    case 'error': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'info': return '#6b7280';
    case 'loading': return '#3b82f6';
    default: return '#6b7280';
  }
}

function getActionButtonStyles(style?: NotificationAction['style']) {
  switch (style) {
    case 'primary':
      return {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        color: '#ffffff'
      };
    case 'danger':
      return {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        color: '#ffffff'
      };
    case 'secondary':
    default:
      return {
        backgroundColor: '#ffffff',
        borderColor: '#d1d5db',
        color: '#374151'
      };
  }
}

// Export component
export default NotificationDisplay; 