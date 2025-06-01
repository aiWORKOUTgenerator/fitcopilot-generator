/**
 * SavedWorkoutsTab Type Definitions
 * 
 * Consolidated type exports for the entire SavedWorkoutsTab module.
 * Maintains type safety across all components and services.
 */

// ===========================================
// CORE TYPE EXPORTS
// ===========================================

// Workout-related types
export * from './workout';

// Authentication types (for upcoming sprint)
export * from './authentication';

// Error handling types
export * from './errors';

// Filter and search types
export * from './filters';

// UI component types
export * from './ui';

// API response types
export * from './api';

// ===========================================
// RE-EXPORTED LEGACY TYPES
// ===========================================
// Maintain compatibility with existing imports

// Re-export existing types from main components
// These will be gradually moved to proper type files

// From WorkoutGrid.tsx
export type {
  DisplayWorkout,
  WorkoutFilters,
  EnhancedWorkoutGridProps
} from '../WorkoutGrid';

// From AdvancedWorkoutFilters.tsx
export type {
  FilterPreset,
  FilterPresetType,
  AdvancedWorkoutFiltersProps
} from '../AdvancedWorkoutFilters';

// From EnhancedWorkoutCard.tsx
export type {
  EnhancedWorkoutCardProps,
  ViewMode,
  CardAction
} from '../EnhancedWorkoutCard';

// ===========================================
// TYPE ORGANIZATION STRATEGY
// ===========================================
/**
 * Type Migration Plan:
 * 
 * Phase 1: Create individual type files
 * - workout.ts: Core workout data structures
 * - filters.ts: Filtering and search types
 * - ui.ts: Component props and UI state types
 * - api.ts: API request/response types
 * - errors.ts: Error handling types
 * 
 * Phase 2: Extract types from existing components
 * - Move DisplayWorkout to workout.ts
 * - Move WorkoutFilters to filters.ts
 * - Move component props to ui.ts
 * 
 * Phase 3: Add new types for authentication sprint
 * - authentication.ts: Auth types from sprint plan
 * - Add error recovery types
 * - Add monitoring and metrics types
 * 
 * This approach ensures:
 * - No breaking changes during migration
 * - Clear type organization by domain
 * - Easy discovery of related types
 * - Support for upcoming sprint requirements
 */ 