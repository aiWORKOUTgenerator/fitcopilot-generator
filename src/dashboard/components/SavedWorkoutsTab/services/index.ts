/**
 * SavedWorkoutsTab Services Index
 * 
 * Centralized exports for all business logic services.
 * Services extracted from components during Week 1 refactoring.
 */

// ===========================================
// WORKOUT DATA SERVICES - ACTIVE
// ===========================================
// ✅ Extracted and implemented services

// Data transformation services
export { WorkoutTransformer } from './workoutData/WorkoutTransformer';
export { WorkoutValidator } from './workoutData/WorkoutValidator';
export { WorkoutCache } from './workoutData/WorkoutCache';

// ===========================================
// FILTERING SERVICES - ACTIVE
// ===========================================
// ✅ Extracted and implemented services

export { FilterEngine } from './filtering/FilterEngine';

// ===========================================
// UTILITIES - ACTIVE
// ===========================================
// ✅ Utility services for display formatting

export { WorkoutFormatters } from '../utils/ui/formatters';

// ===========================================
// CONSTANTS - ACTIVE
// ===========================================
// ✅ Centralized constants and configuration

export * from '../constants/workoutConstants';

// ===========================================
// AUTHENTICATION SERVICES - PLANNED
// ===========================================
// Will be populated during authentication sprint (Week 3)

// export { AuthenticationManager } from './authentication/AuthenticationManager';
// export { AuthenticationResolver } from './authentication/AuthenticationResolver';
// export { AuthenticationValidator } from './authentication/AuthenticationValidator';
// export { AuthenticationHealthMonitor } from './authentication/AuthenticationHealthMonitor';

// ===========================================
// ERROR RECOVERY SERVICES - PLANNED
// ===========================================
// Will be populated during error recovery implementation (Week 3)

// export { ErrorRecoveryManager } from './errorRecovery/ErrorRecoveryManager';
// export { WorkoutRecoveryService } from './errorRecovery/WorkoutRecoveryService';
// export { ErrorCategorizor } from './errorRecovery/ErrorCategorizor';
// export { RecoveryStrategies } from './errorRecovery/RecoveryStrategies';

// ===========================================
// API SERVICES - PLANNED
// ===========================================
// Will be populated during API enhancement (Day 2-3)

// export { WorkoutApiClient } from './api/WorkoutApiClient';
// export { ApiErrorHandler } from './api/ApiErrorHandler';
// export { ApiRetryManager } from './api/ApiRetryManager';

// ===========================================
// SERVICE TYPES
// ===========================================
// Export types from active services

// Workout data types
export type { DisplayWorkout } from './workoutData/WorkoutTransformer';

// Filtering types  
export type { WorkoutFilters, FilterResult } from './filtering/FilterEngine';

// Constants types
export type { 
  DifficultyLevel, 
  WorkoutType, 
  EquipmentType, 
  SortOption, 
  SortOrder,
  CompletionStatus,
  ViewMode 
} from '../constants/workoutConstants';

// ===========================================
// MIGRATION STATUS: Week 1 Day 1 COMPLETE
// ===========================================
/**
 * ✅ COMPLETED:
 * - WorkoutTransformer service extracted and exported
 * - FilterEngine service extracted and exported
 * - WorkoutValidator service available
 * - WorkoutCache service for performance optimization
 * - WorkoutFormatters utility for display formatting
 * - Complete constants centralization
 * - Type exports from services
 * 
 * 🔄 IN PROGRESS:
 * - Removing legacy function shims from WorkoutGrid.tsx
 * - Updating imports to use centralized services
 * 
 * 📋 NEXT STEPS:
 * - Update WorkoutGrid imports to use centralized services
 * - Remove deprecated function wrappers
 * - Validation testing to ensure no regressions
 */ 