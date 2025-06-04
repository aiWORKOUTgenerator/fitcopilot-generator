/**
 * SavedWorkoutsTab Components Index
 * 
 * Centralized exports for all modular components.
 * Updated during Week 2 Component Migration.
 */

// ===========================================
// MODULAR COMPONENTS - ACTIVE
// ===========================================

// Card Components (Week 2 - Active) ✅ IMPLEMENTED
export * from './Cards';

// ===========================================
// PLANNED COMPONENTS - READY FOR IMPLEMENTATION
// ===========================================

// Grid Components (Week 2 - Next)
// export * from './Grid';

// Filter Components (Week 2 - Next)  
// export * from './Filters';

// Search Components (Week 2 - Next)
// export * from './Search';

// Authentication Components (Week 3 - Ready)
// export * from './Authentication';

// Error Handling Components (Week 3 - Ready)
// export * from './ErrorHandling';

// Notification Components (Week 3 - Ready)
// export * from './Notifications';

// ===========================================
// LEGACY COMPONENT STRUCTURE (For Reference)
// ===========================================
// These are the planned components that will be uncommented
// as they are migrated during Week 2

// Basic Workout Card ✅ MIGRATED TO ./Cards/WorkoutCard
// export { default as WorkoutCard } from './Cards/WorkoutCard';
// export type { WorkoutCardProps } from './Cards/WorkoutCard';

// Enhanced Workout Card with advanced features
// export { default as EnhancedWorkoutCard } from './Cards/EnhancedWorkoutCard';
// export type { EnhancedWorkoutCardProps } from './Cards/EnhancedWorkoutCard';

// Shared card components
// export { default as CardSkeleton } from './Cards/shared/CardSkeleton';
// export { default as CardErrorBoundary } from './Cards/shared/CardErrorBoundary';
// export { default as CardMetrics } from './Cards/shared/CardMetrics';

// Main grid component
// export { default as WorkoutGrid } from './Grid/WorkoutGrid';
// export type { WorkoutGridProps } from './Grid/WorkoutGrid';

// Grid layouts
// export { default as GridView } from './Grid/GridLayouts/GridView';
// export { default as ListView } from './Grid/GridLayouts/ListView';
// export { default as CompactView } from './Grid/GridLayouts/CompactView';

// Grid controls
// export { default as ViewModeToggle } from './Grid/GridControls/ViewModeToggle';
// export { default as BulkSelectionControls } from './Grid/GridControls/BulkSelectionControls';
// export { default as SortControls } from './Grid/GridControls/SortControls';

// Advanced filters
// export { default as AdvancedFilters } from './Filters/AdvancedFilters';
// export type { AdvancedFiltersProps } from './Filters/AdvancedFilters';

// Basic filter components
// export { default as DifficultyFilter } from './Filters/BasicFilters/DifficultyFilter';
// export { default as EquipmentFilter } from './Filters/BasicFilters/EquipmentFilter';
// export { default as DurationFilter } from './Filters/BasicFilters/DurationFilter';
// export { default as StatusFilter } from './Filters/BasicFilters/StatusFilter';

// Reusable filter components
// export { default as MultiSelect } from './Filters/FilterComponents/MultiSelect';
// export { default as RangeSlider } from './Filters/FilterComponents/RangeSlider';
// export { default as DateRangePicker } from './Filters/FilterComponents/DateRangePicker';

// Search Components
// export { default as WorkoutSearch } from './Search/WorkoutSearch';
// export { default as SearchSuggestions } from './Search/SearchSuggestions';
// export { default as SearchResults } from './Search/SearchResults';

// Authentication Components (Week 3)
// export { default as AuthenticationStatus } from './Authentication/AuthenticationStatus';
// export { default as AuthenticationError } from './Authentication/AuthenticationError';
// export { default as ReconnectionPrompt } from './Authentication/ReconnectionPrompt';
// export { default as AuthDebugPanel } from './Authentication/AuthDebugPanel';

// Error Handling Components (Week 3)
// export { default as WorkoutGridErrorBoundary } from './ErrorHandling/ErrorBoundary/WorkoutGridErrorBoundary';
// export { default as WorkoutCardErrorBoundary } from './ErrorHandling/ErrorBoundary/WorkoutCardErrorBoundary';
// export { default as GlobalErrorBoundary } from './ErrorHandling/ErrorBoundary/GlobalErrorBoundary';
// export { default as ErrorMessage } from './ErrorHandling/ErrorDisplay/ErrorMessage';
// export { default as ErrorActions } from './ErrorHandling/ErrorDisplay/ErrorActions';
// export { default as ErrorDetails } from './ErrorHandling/ErrorDisplay/ErrorDetails';
// export { default as RecoveryActions } from './ErrorHandling/Recovery/RecoveryActions';
// export { default as RetryButton } from './ErrorHandling/Recovery/RetryButton';
// export { default as RefreshPrompt } from './ErrorHandling/Recovery/RefreshPrompt';

// Notification Components (Week 3)
// export { default as NotificationCenter } from './Notifications/NotificationCenter';
// export { default as LoadingIndicators } from './Notifications/LoadingIndicators';
// export { default as SuccessMessages } from './Notifications/SuccessMessages'; 