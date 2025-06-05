/**
 * Authentication Feedback Component
 * 
 * Provides comprehensive UI feedback for authentication states, errors, and recovery actions.
 * Integrates with the existing ErrorRecoveryManager and authentication systems.
 */
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';
import Button from '../../../components/ui/Button/Button';
import Card from '../../../components/ui/Card/Card';
import './AuthenticationFeedback.scss';

export type AuthenticationState = 
  | 'authenticated' 
  | 'unauthenticated' 
  | 'checking' 
  | 'expired' 
  | 'error'
  | 'refreshing';

export interface AuthenticationFeedbackProps {
  // Authentication state
  state: AuthenticationState;
  
  // User information
  userName?: string;
  userEmail?: string;
  
  // Error information
  error?: string | null;
  errorCode?: string;
  
  // Recovery actions
  onRefresh?: () => Promise<void>;
  onRelogin?: () => void;
  onDismiss?: () => void;
  
  // UI configuration
  showUserInfo?: boolean;
  showRecoveryActions?: boolean;
  autoHideSuccess?: boolean;
  className?: string;
}

export const AuthenticationFeedback: React.FC<AuthenticationFeedbackProps> = ({
  state,
  userName,
  userEmail,
  error,
  errorCode,
  onRefresh,
  onRelogin,
  onDismiss,
  showUserInfo = true,
  showRecoveryActions = true,
  autoHideSuccess = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-hide success states
  useEffect(() => {
    if (autoHideSuccess && state === 'authenticated') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state, autoHideSuccess]);

  // Handle refresh action
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Don't render if not visible or checking silently
  if (!isVisible || state === 'checking') {
    return null;
  }

  // Get state-specific configuration
  const getStateConfig = () => {
    switch (state) {
      case 'authenticated':
        return {
          icon: <CheckCircle className="auth-icon auth-icon--success" size={20} />,
          title: 'Authenticated',
          message: userName ? `Welcome back, ${userName}!` : 'You are successfully logged in.',
          variant: 'success' as const,
          showActions: false
        };
        
      case 'unauthenticated':
        return {
          icon: <Shield className="auth-icon auth-icon--warning" size={20} />,
          title: 'Authentication Required',
          message: 'Please log in to access this feature.',
          variant: 'warning' as const,
          showActions: true
        };
        
      case 'expired':
        return {
          icon: <Clock className="auth-icon auth-icon--warning" size={20} />,
          title: 'Session Expired',
          message: 'Your session has expired. Please refresh to continue.',
          variant: 'warning' as const,
          showActions: true
        };
        
      case 'error':
        return {
          icon: <AlertCircle className="auth-icon auth-icon--error" size={20} />,
          title: 'Authentication Error',
          message: error || 'An authentication error occurred.',
          variant: 'error' as const,
          showActions: true
        };
        
      case 'refreshing':
        return {
          icon: <RefreshCw className="auth-icon auth-icon--info spin" size={20} />,
          title: 'Refreshing Authentication',
          message: 'Please wait while we refresh your session...',
          variant: 'info' as const,
          showActions: false
        };
        
      default:
        return {
          icon: <Shield className="auth-icon" size={20} />,
          title: 'Authentication Status',
          message: 'Checking authentication status...',
          variant: 'info' as const,
          showActions: false
        };
    }
  };

  const config = getStateConfig();

  return (
    <Card className={`authentication-feedback authentication-feedback--${config.variant} ${className}`}>
      <div className="auth-feedback-header">
        <div className="auth-feedback-title">
          {config.icon}
          <h3>{config.title}</h3>
        </div>
        
        {onDismiss && (
          <button 
            className="auth-feedback-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="auth-feedback-content">
        <p className="auth-feedback-message">{config.message}</p>
        
        {/* User Information */}
        {showUserInfo && state === 'authenticated' && (userName || userEmail) && (
          <div className="auth-user-info">
            {userName && <div className="user-name">{userName}</div>}
            {userEmail && <div className="user-email">{userEmail}</div>}
          </div>
        )}
        
        {/* Error Details */}
        {state === 'error' && errorCode && (
          <div className="auth-error-details">
            <small>Error Code: {errorCode}</small>
          </div>
        )}
      </div>
      
      {/* Recovery Actions */}
      {showRecoveryActions && config.showActions && (
        <div className="auth-feedback-actions">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="auth-action-btn"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="spin" size={14} />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw size={14} />
                  Refresh
                </>
              )}
            </Button>
          )}
          
          {onRelogin && (
            <Button
              variant="primary"
              size="sm"
              onClick={onRelogin}
              className="auth-action-btn"
            >
              <Shield size={14} />
              Log In
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * Hook for managing authentication feedback state
 */
export const useAuthenticationFeedback = () => {
  const [authState, setAuthState] = useState<AuthenticationState>('checking');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | undefined>();

  // Check authentication status
  const checkAuthentication = async (): Promise<boolean> => {
    setAuthState('checking');
    
    try {
      // Check if fitcopilotData is available
      const authData = (window as any)?.fitcopilotData;
      
      if (!authData) {
        setAuthState('unauthenticated');
        setError('Authentication data not available');
        return false;
      }
      
      if (!authData.isLoggedIn) {
        setAuthState('unauthenticated');
        setError(null);
        return false;
      }
      
      // Test API access with a simple request
      const response = await fetch(`${authData.apiBase}/profile`, {
        method: 'GET',
        headers: {
          'X-WP-Nonce': authData.nonce
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        setAuthState('authenticated');
        setError(null);
        return true;
      } else if (response.status === 401 || response.status === 403) {
        setAuthState('expired');
        setError('Session expired');
        setErrorCode(`HTTP ${response.status}`);
        return false;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState('error');
      setError(error instanceof Error ? error.message : 'Unknown error');
      setErrorCode('NETWORK_ERROR');
      return false;
    }
  };

  // Refresh authentication
  const refreshAuthentication = async (): Promise<boolean> => {
    setAuthState('refreshing');
    
    try {
      // Wait a moment to show refreshing state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-check authentication
      return await checkAuthentication();
      
    } catch (error) {
      console.error('Authentication refresh failed:', error);
      setAuthState('error');
      setError(error instanceof Error ? error.message : 'Refresh failed');
      return false;
    }
  };

  // Trigger re-login (reload page)
  const triggerRelogin = () => {
    window.location.reload();
  };

  return {
    authState,
    error,
    errorCode,
    checkAuthentication,
    refreshAuthentication,
    triggerRelogin,
    setAuthState,
    setError
  };
}; 