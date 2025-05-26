/**
 * Dashboard Components Index
 * 
 * Export all dashboard components
 */

export { default as RegistrationSteps } from './RegistrationSteps';
export { default as ApiUsage } from './ApiUsage';
export { default as RecentWorkouts } from './RecentWorkouts';
export { default as UserProfile } from './UserProfile';

// Tab System exports
export * from './TabSystem';

// Individual component exports from subdirectories
export { default as ProfileSummary } from './ProfileTab/ProfileSummary';
export { default as WorkoutGrid } from './SavedWorkoutsTab/WorkoutGrid';
export { default as WorkoutCard } from './SavedWorkoutsTab/WorkoutCard';
export { default as WorkoutFilters } from './SavedWorkoutsTab/WorkoutFilters';
export { default as WorkoutSearch } from './SavedWorkoutsTab/WorkoutSearch'; 