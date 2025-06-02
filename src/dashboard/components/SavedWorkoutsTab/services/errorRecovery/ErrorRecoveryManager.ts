/**
 * Error Recovery Manager Service
 * 
 * Comprehensive error categorization and recovery strategy implementation
 * for authentication failures, network issues, and data corruption.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

import type {
  ErrorCategory,
  RecoveryStrategy,
  RecoveryResult
} from '../../types/authentication';
import { authManager } from '../authentication/AuthenticationManager';

/**
 * Error Recovery Manager - Central hub for error categorization and recovery
 */
export class ErrorRecoveryManager {
  private recoveryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelays = [1000, 3000, 8000]; // Exponential backoff in ms

  /**
   * Categorize error based on error message and context
   */
  categorizeError(error: Error | string): ErrorCategory {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const lowerMessage = errorMessage.toLowerCase();

    console.log('🔍 Categorizing error:', errorMessage);

    // Authentication errors
    if (lowerMessage.includes('unauthorized') || 
        lowerMessage.includes('401') ||
        lowerMessage.includes('nonce') ||
        lowerMessage.includes('expired') ||
        lowerMessage.includes('authentication')) {
      return 'auth_expired';
    }

    // Network errors
    if (lowerMessage.includes('network') ||
        lowerMessage.includes('fetch') ||
        lowerMessage.includes('timeout') ||
        lowerMessage.includes('connection') ||
        error instanceof TypeError && lowerMessage.includes('failed to fetch')) {
      return 'network_error';
    }

    // Permission errors
    if (lowerMessage.includes('forbidden') ||
        lowerMessage.includes('403') ||
        lowerMessage.includes('permission') ||
        lowerMessage.includes('access denied')) {
      return 'permission_denied';
    }

    // Data corruption errors
    if (lowerMessage.includes('json') ||
        lowerMessage.includes('parse') ||
        lowerMessage.includes('corrupt') ||
        lowerMessage.includes('invalid data') ||
        lowerMessage.includes('0 exercises')) {
      return 'data_corruption';
    }

    // Default to unknown for unrecognized errors
    console.warn('⚠️ Unknown error category for:', errorMessage);
    return 'unknown';
  }

  /**
   * Attempt automated recovery for categorized errors
   */
  async attemptRecovery(error: Error | string, context?: any): Promise<RecoveryResult> {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const category = this.categorizeError(error);
    const errorKey = `${category}_${errorMessage.substring(0, 50)}`;

    console.log(`🔄 Attempting recovery for ${category} error:`, errorMessage);

    // Check retry limits
    const attempts = this.recoveryAttempts.get(errorKey) || 0;
    if (attempts >= this.maxRetries) {
      return {
        success: false,
        errorType: category,
        message: `Maximum recovery attempts (${this.maxRetries}) exceeded`,
        userAction: 'Please refresh the page or contact support if the issue persists'
      };
    }

    // Update attempt counter
    this.recoveryAttempts.set(errorKey, attempts + 1);

    try {
      const result = await this.executeRecoveryStrategy(category, errorMessage, context);
      
      if (result.success) {
        // Clear attempt counter on success
        this.recoveryAttempts.delete(errorKey);
        console.log('✅ Recovery successful for:', category);
      } else {
        console.log(`❌ Recovery attempt ${attempts + 1} failed for:`, category);
      }

      return result;
    } catch (recoveryError) {
      console.error('🚨 Recovery attempt threw error:', recoveryError);
      
      return {
        success: false,
        errorType: category,
        message: `Recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`,
        userAction: 'Please try again or refresh the page'
      };
    }
  }

  /**
   * Execute specific recovery strategy based on error category
   */
  private async executeRecoveryStrategy(
    category: ErrorCategory, 
    errorMessage: string, 
    context?: any
  ): Promise<RecoveryResult> {
    
    switch (category) {
      case 'auth_expired':
        return this.recoverAuthenticationError(errorMessage, context);
      
      case 'network_error':
        return this.recoverNetworkError(errorMessage, context);
      
      case 'data_corruption':
        return this.recoverDataCorruption(errorMessage, context);
      
      case 'permission_denied':
        return this.recoverPermissionError(errorMessage, context);
      
      default:
        return this.recoverUnknownError(errorMessage, context);
    }
  }

  /**
   * Recovery strategy for authentication errors
   */
  private async recoverAuthenticationError(errorMessage: string, context?: any): Promise<RecoveryResult> {
    try {
      console.log('🔐 Attempting authentication recovery...');
      
      // First, try to refresh authentication status
      const authStatus = await authManager.checkAuthenticationStatus();
      
      if (authStatus.isAuthenticated) {
        return {
          success: true,
          errorType: 'auth_expired',
          message: 'Authentication restored successfully',
          userAction: 'You can continue using the application normally'
        };
      }

      // If still not authenticated, provide manual recovery
      return {
        success: false,
        errorType: 'auth_expired',
        message: 'Authentication issue detected',
        userAction: 'Please refresh the page to restore authentication',
        manualAction: async () => {
          await authManager.forceReauthentication();
          return true;
        }
      };

    } catch (error) {
      return {
        success: false,
        errorType: 'auth_expired',
        message: 'Failed to restore authentication',
        userAction: 'Please refresh the page to restore authentication'
      };
    }
  }

  /**
   * Recovery strategy for network errors
   */
  private async recoverNetworkError(errorMessage: string, context?: any): Promise<RecoveryResult> {
    try {
      console.log('🌐 Attempting network error recovery...');
      
      // Wait for exponential backoff delay
      const attempts = Array.from(this.recoveryAttempts.values()).reduce((max, val) => Math.max(max, val), 0);
      const delay = this.retryDelays[Math.min(attempts, this.retryDelays.length - 1)];
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Test network connectivity
      try {
        const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
          method: 'HEAD',
          headers: {
            'X-WP-Nonce': (window as any).fitcopilotData?.nonce || ''
          }
        });

        if (response.ok) {
          return {
            success: true,
            errorType: 'network_error',
            message: 'Network connection restored',
            userAction: 'You can continue using the application normally'
          };
        }
      } catch (testError) {
        // Network still failing
      }

      return {
        success: false,
        errorType: 'network_error',
        message: 'Network connection still unavailable',
        userAction: 'Please check your internet connection and try again',
        manualAction: async () => {
          // Manual retry action
          return false; // Will be handled by calling component
        }
      };

    } catch (error) {
      return {
        success: false,
        errorType: 'network_error',
        message: 'Network recovery failed',
        userAction: 'Please check your internet connection and refresh the page'
      };
    }
  }

  /**
   * Recovery strategy for data corruption errors
   */
  private async recoverDataCorruption(errorMessage: string, context?: any): Promise<RecoveryResult> {
    console.log('🔧 Attempting data corruption recovery...');
    
    // For data corruption, we typically can't auto-recover
    // Provide clear user guidance
    return {
      success: false,
      errorType: 'data_corruption',
      message: 'Data integrity issue detected',
      userAction: 'This workout may have corrupted data. Try refreshing or contact support.',
      manualAction: async () => {
        // Clear any cached data for this workout
        if (context?.workoutId) {
          localStorage.removeItem(`workout_cache_${context.workoutId}`);
        }
        return true;
      }
    };
  }

  /**
   * Recovery strategy for permission errors
   */
  private async recoverPermissionError(errorMessage: string, context?: any): Promise<RecoveryResult> {
    console.log('🚫 Handling permission error...');
    
    return {
      success: false,
      errorType: 'permission_denied',
      message: 'Access permission issue',
      userAction: 'You may not have permission to access this content. Please refresh or contact an administrator.'
    };
  }

  /**
   * Recovery strategy for unknown errors
   */
  private async recoverUnknownError(errorMessage: string, context?: any): Promise<RecoveryResult> {
    console.log('❓ Handling unknown error...');
    
    return {
      success: false,
      errorType: 'unknown',
      message: 'An unexpected error occurred',
      userAction: 'Please try refreshing the page. If the issue persists, contact support.',
      manualAction: async () => {
        // Generic recovery: clear caches and refresh
        localStorage.clear();
        window.location.reload();
        return true;
      }
    };
  }

  /**
   * Get available recovery strategies for an error
   */
  getRecoveryStrategies(error: Error | string): RecoveryStrategy[] {
    const category = this.categorizeError(error);
    const strategies: RecoveryStrategy[] = [];

    switch (category) {
      case 'auth_expired':
        strategies.push({
          name: 'refresh_auth',
          description: 'Refresh authentication status',
          automated: true,
          action: async () => {
            const result = await this.recoverAuthenticationError(typeof error === 'string' ? error : error.message);
            return result.success;
          }
        });
        strategies.push({
          name: 'reload_page',
          description: 'Reload page to restore authentication',
          automated: false,
          action: async () => {
            window.location.reload();
            return true;
          },
          userInstructions: 'Click "Refresh Page" to restore authentication'
        });
        break;

      case 'network_error':
        strategies.push({
          name: 'retry_request',
          description: 'Retry the failed request',
          automated: true,
          action: async () => {
            const result = await this.recoverNetworkError(typeof error === 'string' ? error : error.message);
            return result.success;
          }
        });
        break;

      case 'data_corruption':
        strategies.push({
          name: 'clear_cache',
          description: 'Clear cached data and retry',
          automated: false,
          action: async () => {
            localStorage.clear();
            return true;
          },
          userInstructions: 'Clear cached data and refresh the page'
        });
        break;

      default:
        strategies.push({
          name: 'generic_recovery',
          description: 'Generic error recovery',
          automated: false,
          action: async () => {
            window.location.reload();
            return true;
          },
          userInstructions: 'Refresh the page to resolve the issue'
        });
    }

    return strategies;
  }

  /**
   * Clear recovery attempt counters (useful for testing or manual reset)
   */
  clearRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
    console.log('🧹 Recovery attempt counters cleared');
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    totalAttempts: number;
    activeAttempts: number;
    categories: Record<ErrorCategory, number>;
  } {
    const totalAttempts = Array.from(this.recoveryAttempts.values()).reduce((sum, val) => sum + val, 0);
    const activeAttempts = this.recoveryAttempts.size;
    
    // Count attempts by category (simplified)
    const categories: Record<ErrorCategory, number> = {
      auth_expired: 0,
      network_error: 0,
      data_corruption: 0,
      permission_denied: 0,
      unknown: 0
    };

    return {
      totalAttempts,
      activeAttempts,
      categories
    };
  }
}

// Global error recovery manager instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// Export for use in other modules
export default ErrorRecoveryManager; 