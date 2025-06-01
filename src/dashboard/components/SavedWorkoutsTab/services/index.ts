/**
 * SavedWorkoutsTab Services Index
 * 
 * Centralized exports for all business logic services.
 * Services will be extracted from components during Week 1, Days 2-3.
 */

// ===========================================
// AUTHENTICATION SERVICES
// ===========================================
// Will be populated during authentication sprint (Week 3)

// export { default as AuthenticationManager } from './authentication/AuthenticationManager';
// export { default as AuthenticationResolver } from './authentication/AuthenticationResolver';
// export { default as AuthenticationValidator } from './authentication/AuthenticationValidator';
// export { default as AuthenticationFallbacks } from './authentication/AuthenticationFallbacks';

// ===========================================
// ERROR RECOVERY SERVICES
// ===========================================
// Will be populated during error recovery implementation

// export { default as ErrorRecoveryManager } from './errorRecovery/ErrorRecoveryManager';
// export { default as WorkoutRecoveryService } from './errorRecovery/WorkoutRecoveryService';
// export { default as ErrorCategorizor } from './errorRecovery/ErrorCategorizor';
// export { default as RecoveryStrategies } from './errorRecovery/RecoveryStrategies';

// ===========================================
// WORKOUT DATA SERVICES
// ===========================================
// Will be populated during service extraction (Week 1, Days 2-3)

// Data transformation
// export { default as WorkoutTransformer } from './workoutData/WorkoutTransformer';
// export { default as WorkoutValidator } from './workoutData/WorkoutValidator';
// export { default as WorkoutCache } from './workoutData/WorkoutCache';
// export { default as WorkoutNormalizer } from './workoutData/WorkoutNormalizer';

// ===========================================
// FILTERING SERVICES
// ===========================================
// Will be populated during service extraction (Week 1, Days 2-3)

// export { default as FilterEngine } from './filtering/FilterEngine';
// export { default as FilterPresets } from './filtering/FilterPresets';
// export { default as FilterPersistence } from './filtering/FilterPersistence';
// export { default as FilterValidation } from './filtering/FilterValidation';

// ===========================================
// API SERVICES
// ===========================================
// Will be populated during API enhancement

// export { default as WorkoutApiClient } from './api/WorkoutApiClient';
// export { default as ApiErrorHandler } from './api/ApiErrorHandler';
// export { default as ApiRetryManager } from './api/ApiRetryManager';

// ===========================================
// SERVICE TYPES
// ===========================================
// Core service interfaces and types

// Authentication service types
// export type { AuthenticationData, AuthStatus, AuthStrategy } from './authentication/types';

// Error recovery types
// export type { RecoveryStrategy, RecoveryResult, ErrorCategory } from './errorRecovery/types';

// Workout data types
// export type { TransformationOptions, ValidationResult, CacheEntry } from './workoutData/types';

// Filtering types
// export type { FilterConfig, FilterPreset, FilterResult } from './filtering/types';

// API types
// export type { ApiConfig, ApiResponse, ApiError } from './api/types';

// ===========================================
// MIGRATION SCHEDULE
// ===========================================
/**
 * Service Extraction Timeline:
 * 
 * Week 1, Day 2:
 * - ✅ Extract WorkoutTransformer from WorkoutGrid.tsx
 * - ✅ Create WorkoutValidator utility
 * - ✅ Setup data transformation pipeline
 * 
 * Week 1, Day 3:
 * - ✅ Extract FilterEngine from AdvancedWorkoutFilters.tsx
 * - ✅ Create FilterPresets service
 * - ✅ Setup filtering pipeline
 * 
 * Week 3 (Authentication Sprint):
 * - ✅ Create AuthenticationManager
 * - ✅ Implement multi-strategy authentication resolver
 * - ✅ Add error recovery services
 * 
 * Service Implementation Priority:
 * 1. Data transformation (immediate impact on "0 exercises" issue)
 * 2. Filtering logic (performance and maintainability)
 * 3. Authentication services (upcoming sprint requirements)
 * 4. Error recovery (user experience improvements)
 * 5. API enhancements (long-term reliability)
 */ 