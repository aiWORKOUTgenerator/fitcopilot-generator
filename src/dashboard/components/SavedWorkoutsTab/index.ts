/**
 * SavedWorkoutsTab Main Export
 * 
 * Maintains backward compatibility with existing imports while
 * providing access to new modular architecture.
 */

// ===========================================
// LEGACY EXPORTS (Backward Compatibility)
// ===========================================
// Keep existing imports working during migration

// Main grid component exports
export { default as EnhancedWorkoutGrid } from './WorkoutGrid';
export { WorkoutGrid } from './WorkoutGrid'; // Backward compatibility
export { default as AdvancedWorkoutFilters } from './AdvancedWorkoutFilters';
export { default as EnhancedWorkoutCard } from './EnhancedWorkoutCard';
export { default as WorkoutCard } from './WorkoutCard';
export { default as WorkoutSearch } from './WorkoutSearch';

// Legacy type exports
export type {
  DisplayWorkout,
  WorkoutFilters,
  EnhancedWorkoutGridProps
} from './WorkoutGrid';

export type {
  FilterPreset,
  FilterPresetType,
  AdvancedWorkoutFiltersProps
} from './AdvancedWorkoutFilters';

export type {
  EnhancedWorkoutCardProps,
  ViewMode,
  CardAction
} from './EnhancedWorkoutCard';

// ===========================================
// NEW MODULAR EXPORTS (Future Use)
// ===========================================
// These will be populated as we migrate components

// Components (placeholder exports for future use)
// export * from './components';

// Services (placeholder exports for future use)  
// export * from './services';

// Hooks (placeholder exports for future use)
// export * from './hooks';

// Types (placeholder exports for future use)
// export * from './types';

// Utils (placeholder exports for future use)
// export * from './utils';

// Constants (placeholder exports for future use)
// export * from './constants';

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Migration Progress:
 * - ✅ Directory structure created
 * - 🔄 Service extraction (Week 1, Days 2-3)
 * - 🔄 Component breakdown (Week 1, Days 4-5)
 * - 🔄 Authentication integration (Week 3)
 * 
 * Uncomment modular exports as components are migrated. 