/**
 * Error Recovery Services Index
 * 
 * Centralized exports for all error recovery services
 * for consistent usage throughout the application.
 * 
 * Week 3 Day 3: Error Recovery & User Feedback Systems
 */

// Core error recovery services
export { ErrorRecoveryManager, errorRecoveryManager } from './ErrorRecoveryManager';

// Re-export types for convenience
export type {
  ErrorCategory,
  RecoveryStrategy,
  RecoveryResult
} from '../../types/authentication';

// Service instances for immediate use
export const errorRecoveryServices = {
  manager: errorRecoveryManager
};

/**
 * Quick error recovery utility
 */
export const quickErrorRecovery = async (error: Error | string): Promise<{
  success: boolean;
  message: string;
  userAction?: string;
}> => {
  try {
    const result = await errorRecoveryManager.attemptRecovery(error);
    return {
      success: result.success,
      message: result.message,
      userAction: result.userAction
    };
  } catch (recoveryError) {
    return {
      success: false,
      message: 'Error recovery system failed',
      userAction: 'Please refresh the page and try again'
    };
  }
}; 