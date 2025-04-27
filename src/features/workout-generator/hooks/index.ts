/**
 * Hooks exports for the Workout Generator feature
 */

// API and authentication hooks
export { default as useApiRequest } from './useApiRequest';
export { default as useAuthNonce } from './useAuthNonce';

// Error handling
export { default as useErrorHandler } from './useErrorHandler';

// Form-related hooks
export { default as useFormPersistence } from './useFormPersistence';
export { default as useFormValidation } from './useFormValidation';
export { default as useWorkoutForm } from './useWorkoutForm';

// Performance optimization
export { default as usePerformanceCache } from './usePerformanceCache';
export { default as useProgressEstimator } from './useProgressEstimator';

// Workout generation and management
export { default as useWorkoutGeneration } from './useWorkoutGeneration';
export { default as useWorkoutGenerator } from './useWorkoutGenerator';
export { default as useDirectWorkoutGenerator } from './useDirectWorkoutGenerator';
export { default as useWorkoutHistory } from './useWorkoutHistory';

// User and subscription features
export { default as useOpenAILogs } from './useOpenAILogs';
export { default as useProfileStatus } from './useProfileStatus';
export { default as useSubscriptionAccess } from './useSubscriptionAccess'; 