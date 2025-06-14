/**
 * Hooks exports for the Workout Generator feature
 */

// API and authentication hooks
export { default as useApiRequest } from './useApiRequest';
export { default as useAuthNonce } from './useAuthNonce';
export { useAbortController, type AbortReason } from './useAbortController';

// Error handling
export { default as useErrorHandler } from './useErrorHandler';

// Form-related hooks
export { default as useFormPersistence } from './useFormPersistence';
export { default as useFormValidation } from './useFormValidation';
export { default as useWorkoutForm } from './useWorkoutForm';

// Muscle selection hooks - Simplified and clean
export { useMuscleSelection } from './useMuscleSelection';
export { useWorkoutGridCompletion } from './useWorkoutGridCompletion';

// Performance optimization
export { default as usePerformanceCache } from './usePerformanceCache';

// Workout generation and management
export { useWorkoutGenerator } from './useWorkoutGenerator';
export { default as useWorkoutHistory } from './useWorkoutHistory';

// User and subscription features
export { default as useOpenAILogs } from './useOpenAILogs';
export { default as useProfileStatus } from './useProfileStatus';
export { default as useSubscriptionAccess } from './useSubscriptionAccess'; 