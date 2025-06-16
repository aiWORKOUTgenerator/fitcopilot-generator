/**
 * Hooks exports for the Workout Generator feature
 */

// API and authentication hooks
export { useApiRequest } from './useApiRequest';
export { useAuthNonce } from './useAuthNonce';
export { useAbortController, type AbortReason } from './useAbortController';

// Error handling
export { useErrorHandler } from './useErrorHandler';

// Form-related hooks
export { useFormPersistence } from './useFormPersistence';
export { useFormValidation } from './useFormValidation';
export { useWorkoutForm } from './useWorkoutForm';
export { useFormValidationManager } from './useFormValidationManager';

// Session input management
export { useSessionInputs } from './useSessionInputs';

// Profile integration hooks
export { useProfileIntegration } from './useProfileIntegration';

// API mapping hooks
export { useApiMapping } from './useApiMapping';

// Muscle selection hooks - Simplified and clean
export { useMuscleSelection } from './useMuscleSelection';
export { useWorkoutGridCompletion } from './useWorkoutGridCompletion';

// Performance optimization
export { usePerformanceCache } from './usePerformanceCache';

// Workout generation and management
export { useWorkoutGenerator } from './useWorkoutGenerator';
export { useWorkoutHistory } from './useWorkoutHistory';
export { useWorkoutList } from './useWorkoutList';

// User and subscription features
export { useOpenAILogs } from './useOpenAILogs';
export { useProfileStatus } from './useProfileStatus';
export { useSubscriptionAccess } from './useSubscriptionAccess';

// Analytics and focus tracking
export { useWorkoutFocusAnalytics } from './useWorkoutFocusAnalytics';

// Modular card hooks (correct paths and names)
export { useFocusSelection } from '../components/Form/cards/WorkoutFocusCard/useFocusSelection';
export { useIntensitySelection } from '../components/Form/cards/IntensityCard/useIntensitySelection';
export { useDurationSelection } from '../components/Form/cards/DurationCard/useDurationSelection';
export { useEquipmentSelection } from '../components/Form/cards/EquipmentCard/useEquipmentSelection';
export { useRestrictionsSelection } from '../components/Form/cards/RestrictionsCard/useRestrictionsSelection';
export { useLocationSelection } from '../components/Form/cards/LocationCard/useLocationSelection';
export { useWorkoutCustomizationSelection } from '../components/Form/cards/WorkoutCustomizationCard/useWorkoutCustomizationSelection';

// Profile integration hooks (external)
export { useProfile } from '../../profile/context';

// Types
export type { WorkoutFormParams, SessionSpecificInputs } from '../types/workout'; 