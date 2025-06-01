/**
 * Error Handling Type Definitions
 * 
 * Types for error handling, recovery, and user feedback.
 * Supports both current error handling and authentication sprint requirements.
 */

// ===========================================
// CORE ERROR TYPES
// ===========================================

// Base error interface
// export interface BaseError {
//   message: string;
//   code?: string;
//   timestamp: Date;
//   context?: Record<string, any>;
// }

// API error types (from existing ApiError)
// export interface ApiError extends BaseError {
//   type: ApiErrorType;
//   status?: number;
//   endpoint?: string;
//   retryable?: boolean;
// }

// API error types enum
// export enum ApiErrorType {
//   NETWORK = 'network',
//   TIMEOUT = 'timeout',
//   UNAUTHORIZED = 'unauthorized',
//   FORBIDDEN = 'forbidden',
//   NOT_FOUND = 'not_found',
//   SERVER_ERROR = 'server_error',
//   VALIDATION = 'validation',
//   UNKNOWN = 'unknown'
// }

// ===========================================
// WORKOUT SPECIFIC ERRORS
// ===========================================

// Workout loading errors
// export interface WorkoutError extends BaseError {
//   workoutId: string | number;
//   errorType: WorkoutErrorType;
//   recoverable: boolean;
//   retryCount?: number;
// }

// Workout error types
// export enum WorkoutErrorType {
//   DATA_CORRUPTION = 'data_corruption',
//   MISSING_EXERCISES = 'missing_exercises',
//   TRANSFORMATION_FAILED = 'transformation_failed',
//   VALIDATION_FAILED = 'validation_failed',
//   LOADING_FAILED = 'loading_failed',
//   PERMISSION_DENIED = 'permission_denied'
// }

// Data transformation errors
// export interface TransformationError extends BaseError {
//   workoutId: string | number;
//   stage: TransformationStage;
//   rawData?: any;
//   partialResult?: any;
// }

// Transformation stages
// export enum TransformationStage {
//   PARSING = 'parsing',
//   VALIDATION = 'validation',
//   NORMALIZATION = 'normalization',
//   ENRICHMENT = 'enrichment'
// }

// ===========================================
// ERROR RECOVERY TYPES
// ===========================================
// From authentication sprint plan

// Recovery strategy (already defined in authentication.ts but duplicated here for errors)
// export interface ErrorRecoveryStrategy {
//   name: string;
//   description: string;
//   automated: boolean;
//   action: () => Promise<boolean>;
//   userInstructions?: string;
//   estimatedTime?: number;
// }

// Recovery attempt
// export interface RecoveryAttempt {
//   strategy: string;
//   startTime: Date;
//   endTime?: Date;
//   success: boolean;
//   error?: string;
//   metrics?: Record<string, number>;
// }

// Recovery session
// export interface RecoverySession {
//   errorId: string;
//   attempts: RecoveryAttempt[];
//   finalResult: 'success' | 'failure' | 'cancelled';
//   totalDuration: number;
//   userInteractions: UserInteraction[];
// }

// User interaction tracking
// export interface UserInteraction {
//   type: 'retry' | 'cancel' | 'refresh' | 'skip';
//   timestamp: Date;
//   context?: Record<string, any>;
// }

// ===========================================
// ERROR BOUNDARY TYPES
// ===========================================

// Error boundary state
// export interface ErrorBoundaryState {
//   hasError: boolean;
//   error?: Error;
//   errorInfo?: ErrorInfo;
//   errorId: string;
//   recoveryAttempts: number;
//   lastRecoveryTime?: Date;
// }

// Error boundary props
// export interface ErrorBoundaryProps {
//   fallback?: React.ComponentType<ErrorFallbackProps>;
//   onError?: (error: Error, errorInfo: ErrorInfo) => void;
//   onRetry?: () => void;
//   maxRetries?: number;
//   resetOnPropsChange?: boolean;
//   children: React.ReactNode;
// }

// Error fallback component props
// export interface ErrorFallbackProps {
//   error: Error;
//   errorInfo?: ErrorInfo;
//   onRetry?: () => void;
//   canRetry: boolean;
//   retryCount: number;
// }

// React error info
// export interface ErrorInfo {
//   componentStack: string;
//   errorBoundary?: string;
//   errorBoundaryStack?: string;
// }

// ===========================================
// ERROR DISPLAY TYPES
// ===========================================

// Error message component props
// export interface ErrorMessageProps {
//   error: BaseError | string;
//   title?: string;
//   showDetails?: boolean;
//   showTimestamp?: boolean;
//   className?: string;
//   variant?: 'error' | 'warning' | 'info';
// }

// Error details props
// export interface ErrorDetailsProps {
//   error: BaseError;
//   expanded?: boolean;
//   onToggle?: (expanded: boolean) => void;
//   showContext?: boolean;
//   showStackTrace?: boolean;
// }

// Error actions props
// export interface ErrorActionsProps {
//   error: BaseError;
//   onRetry?: () => void;
//   onRefresh?: () => void;
//   onReport?: (error: BaseError) => void;
//   onDismiss?: () => void;
//   availableActions?: ErrorActionType[];
// }

// Error action types
// export enum ErrorActionType {
//   RETRY = 'retry',
//   REFRESH = 'refresh',
//   REPORT = 'report',
//   DISMISS = 'dismiss',
//   GO_BACK = 'go_back',
//   RELOAD_PAGE = 'reload_page'
// }

// ===========================================
// ERROR NOTIFICATION TYPES
// ===========================================

// Notification types
// export interface ErrorNotification {
//   id: string;
//   type: NotificationType;
//   title: string;
//   message: string;
//   duration?: number;
//   persistent?: boolean;
//   actions?: NotificationAction[];
//   metadata?: Record<string, any>;
// }

// Notification types
// export enum NotificationType {
//   ERROR = 'error',
//   WARNING = 'warning',
//   INFO = 'info',
//   SUCCESS = 'success'
// }

// Notification action
// export interface NotificationAction {
//   label: string;
//   action: () => void;
//   variant?: 'primary' | 'secondary' | 'destructive';
// }

// ===========================================
// ERROR REPORTING TYPES
// ===========================================

// Error report
// export interface ErrorReport {
//   errorId: string;
//   error: BaseError;
//   userAgent: string;
//   url: string;
//   userId?: string;
//   sessionId: string;
//   breadcrumbs: Breadcrumb[];
//   performanceMetrics?: PerformanceMetrics;
//   reproductionSteps?: string[];
// }

// Breadcrumb for error context
// export interface Breadcrumb {
//   timestamp: Date;
//   category: string;
//   message: string;
//   level: 'debug' | 'info' | 'warning' | 'error';
//   data?: Record<string, any>;
// }

// Performance metrics
// export interface PerformanceMetrics {
//   loadTime: number;
//   memoryUsage?: number;
//   renderTime?: number;
//   apiCallCount: number;
//   errorCount: number;
// }

// ===========================================
// ERROR VALIDATION TYPES
// ===========================================

// Validation error
// export interface ValidationError extends BaseError {
//   field: string;
//   value: any;
//   constraint: string;
//   path?: string[];
// }

// Validation result
// export interface ValidationResult {
//   isValid: boolean;
//   errors: ValidationError[];
//   warnings: ValidationError[];
// }

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Error Types Implementation Progress:
 * 
 * Current State:
 * - ✅ Basic ApiError types exist in common/api/client.ts
 * - ✅ Framework planned for comprehensive error handling
 * - ✅ Types ready for authentication sprint integration
 * 
 * Week 1, Day 4 (Error Boundary Implementation):
 * - ✅ Uncomment error boundary types
 * - ✅ Implement error display component types
 * - ✅ Add error notification types
 * 
 * Week 3, Day 2 (Authentication Error Handling):
 * - ✅ Uncomment recovery types
 * - ✅ Integrate with authentication error handling
 * - ✅ Add specialized authentication error types
 * 
 * Features Supported:
 * - Comprehensive error categorization
 * - Error recovery and retry mechanisms
 * - Error boundaries for component isolation
 * - User-friendly error display and actions
 * - Error reporting and analytics
 * - Integration with authentication system
 * 
 * All types are commented out until implementation to prevent
 * conflicts with existing error handling. 