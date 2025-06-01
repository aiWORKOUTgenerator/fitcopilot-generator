/**
 * Authentication Type Definitions
 * 
 * Types for authentication functionality from the authentication sprint plan.
 * Will be populated during Week 3 authentication implementation.
 */

// ===========================================
// AUTHENTICATION DATA TYPES
// ===========================================
// From Authentication Sprint Plan - Day 1

// Main authentication data interface
// export interface AuthenticationData {
//   nonce: string;
//   apiBase: string;
//   userId?: number;
// }

// Authentication status
// export interface AuthStatus {
//   isAuthenticated: boolean;
//   hasValidNonce: boolean;
//   message: string;
//   lastCheck: Date;
// }

// ===========================================
// AUTHENTICATION STRATEGY TYPES
// ===========================================
// From Multi-Strategy Authentication Resolver

// Authentication strategy interface
// export interface AuthStrategy {
//   name: string;
//   priority: number;
//   resolver: () => Promise<AuthenticationData>;
//   validator?: (data: AuthenticationData) => Promise<boolean>;
// }

// Strategy names
// export type AuthStrategyName = 
//   | 'fitcopilotData'
//   | 'apiHeaders' 
//   | 'wpApiFetch'
//   | 'metaTag'
//   | 'dynamicFetch';

// ===========================================
// ERROR RECOVERY TYPES
// ===========================================
// From Error Recovery Manager

// Recovery strategy interface
// export interface RecoveryStrategy {
//   name: string;
//   description: string;
//   automated: boolean;
//   action: () => Promise<boolean>;
//   userInstructions?: string;
// }

// Recovery result
// export interface RecoveryResult {
//   success: boolean;
//   errorType: string;
//   message: string;
//   userAction?: string;
//   manualAction?: () => Promise<boolean>;
// }

// Error categories
// export type ErrorCategory = 
//   | 'auth_expired'
//   | 'network_error'
//   | 'data_corruption'
//   | 'permission_denied'
//   | 'unknown';

// ===========================================
// AUTHENTICATION MONITORING TYPES
// ===========================================
// From Authentication Manager

// Authentication metrics
// export interface AuthMetrics {
//   authenticationAttempts: number;
//   authenticationSuccesses: number;
//   authenticationFailures: number;
//   fallbackUsage: number;
//   errorRecoveryAttempts: number;
//   errorRecoverySuccesses: number;
// }

// Alert thresholds
// export interface AlertThresholds {
//   authFailureRate: number;
//   fallbackUsageRate: number;
//   errorRecoveryFailureRate: number;
// }

// Metrics report
// export interface AuthMetricsReport {
//   timestamp: string;
//   authSuccessRate: number;
//   fallbackUsageRate: number;
//   errorRecoveryRate: number;
//   alertsTriggered: string[];
// }

// ===========================================
// UI COMPONENT TYPES
// ===========================================
// For authentication UI components

// Authentication status component props
// export interface AuthenticationStatusProps {
//   showDetails?: boolean;
//   onStatusChange?: (status: AuthStatus) => void;
//   className?: string;
// }

// Authentication error component props
// export interface AuthenticationErrorProps {
//   error: string;
//   recoveryResult?: RecoveryResult;
//   onRetry?: () => void;
//   onRefresh?: () => void;
// }

// Reconnection prompt props
// export interface ReconnectionPromptProps {
//   visible: boolean;
//   onReconnect?: () => void;
//   onDismiss?: () => void;
//   autoReconnect?: boolean;
// }

// ===========================================
// VALIDATION TYPES
// ===========================================

// Nonce validation result
// export interface NonceValidationResult {
//   isValid: boolean;
//   error?: string;
//   expiresAt?: Date;
// }

// Authentication validation options
// export interface AuthValidationOptions {
//   timeout?: number;
//   retries?: number;
//   validateNonce?: boolean;
//   testEndpoint?: string;
// }

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Authentication Types Implementation Schedule:
 * 
 * Week 3, Day 1 (Authentication Setup):
 * - ✅ Uncomment AuthenticationData interface
 * - ✅ Uncomment AuthStatus interface  
 * - ✅ Implement strategy types
 * 
 * Week 3, Day 2 (Error Handling):
 * - ✅ Uncomment recovery types
 * - ✅ Implement error categorization
 * - ✅ Add UI component prop types
 * 
 * Week 3, Day 3 (Monitoring):
 * - ✅ Uncomment metrics types
 * - ✅ Implement monitoring interfaces
 * - ✅ Add validation types
 * 
 * Usage Notes:
 * - All types are commented out to prevent conflicts
 * - Will be uncommented during authentication sprint
 * - Follows authentication sprint plan implementation order
 * - Provides type safety for all planned authentication features
 */ 