/**
 * Filter and Search Type Definitions
 * 
 * Types for filtering, searching, and sorting workout data.
 * Will be populated during service extraction (Week 1, Days 2-3).
 */

// ===========================================
// FILTER TYPES
// ===========================================
// Will be migrated from AdvancedWorkoutFilters.tsx

// Main filter interface (current WorkoutFilters from grid)
// export interface WorkoutFilters {
//   search?: string;
//   difficulty?: string[];
//   equipment?: string[];
//   duration?: {
//     min: number;
//     max: number;
//   };
//   workoutType?: string[];
//   status?: 'all' | 'completed' | 'pending';
//   dateRange?: {
//     start: string;
//     end: string;
//   };
//   tags?: string[];
//   rating?: {
//     min: number;
//     max: number;
//   };
//   favorites?: boolean;
// }

// Filter preset types (from AdvancedWorkoutFilters.tsx)
// export interface FilterPreset {
//   id: string;
//   name: string;
//   description?: string;
//   filters: WorkoutFilters;
//   isDefault?: boolean;
//   isCustom?: boolean;
//   icon?: string;
// }

// export type FilterPresetType = 
//   | 'all'
//   | 'recent'
//   | 'favorites'
//   | 'completed'
//   | 'pending'
//   | 'quick'
//   | 'beginner'
//   | 'intermediate'
//   | 'advanced'
//   | 'cardio'
//   | 'strength'
//   | 'custom';

// ===========================================
// SEARCH TYPES
// ===========================================

// Search configuration
// export interface SearchConfig {
//   placeholder?: string;
//   debounceMs?: number;
//   minQueryLength?: number;
//   maxSuggestions?: number;
//   searchFields?: (keyof DisplayWorkout)[];
//   highlightMatches?: boolean;
// }

// Search result
// export interface SearchResult {
//   workout: DisplayWorkout;
//   matches: SearchMatch[];
//   score: number;
// }

// Search match (for highlighting)
// export interface SearchMatch {
//   field: string;
//   value: string;
//   indices: [number, number][];
// }

// Search suggestions
// export interface SearchSuggestion {
//   type: 'exercise' | 'title' | 'tag' | 'equipment';
//   value: string;
//   count: number;
// }

// ===========================================
// SORTING TYPES
// ===========================================

// Sort options
// export type SortField = 
//   | 'title'
//   | 'duration'
//   | 'difficulty'
//   | 'created_at'
//   | 'updated_at'
//   | 'rating'
//   | 'completedCount'
//   | 'exerciseCount';

// export type SortDirection = 'asc' | 'desc';

// export interface SortConfig {
//   field: SortField;
//   direction: SortDirection;
//   label?: string;
// }

// ===========================================
// FILTER ENGINE TYPES
// ===========================================
// For FilterEngine service

// Filter operation types
// export type FilterOperation = 
//   | 'equals'
//   | 'contains'
//   | 'startsWith'
//   | 'endsWith'
//   | 'range'
//   | 'in'
//   | 'exists'
//   | 'regex';

// Filter rule
// export interface FilterRule {
//   field: string;
//   operation: FilterOperation;
//   value: any;
//   caseSensitive?: boolean;
// }

// Filter group (for complex filtering)
// export interface FilterGroup {
//   operator: 'AND' | 'OR';
//   rules: (FilterRule | FilterGroup)[];
// }

// Filter result
// export interface FilterResult {
//   filteredWorkouts: DisplayWorkout[];
//   totalCount: number;
//   appliedFilters: WorkoutFilters;
//   performanceMs?: number;
// }

// ===========================================
// FILTER PERSISTENCE TYPES
// ===========================================

// Saved filter state
// export interface SavedFilterState {
//   id: string;
//   name: string;
//   filters: WorkoutFilters;
//   sortConfig?: SortConfig;
//   createdAt: string;
//   lastUsed: string;
//   usageCount: number;
// }

// Filter storage options
// export interface FilterStorageOptions {
//   storageKey: string;
//   maxSavedFilters: number;
//   enableAutoSave: boolean;
//   autoSaveDelayMs: number;
// }

// ===========================================
// UI COMPONENT TYPES
// ===========================================

// Filter component props
// export interface FilterComponentProps {
//   filters: WorkoutFilters;
//   onChange: (filters: WorkoutFilters) => void;
//   disabled?: boolean;
//   className?: string;
// }

// Multi-select props
// export interface MultiSelectProps {
//   options: SelectOption[];
//   values: string[];
//   onChange: (values: string[]) => void;
//   placeholder?: string;
//   disabled?: boolean;
//   maxHeight?: number;
// }

// Select option
// export interface SelectOption {
//   value: string;
//   label: string;
//   count?: number;
//   disabled?: boolean;
//   icon?: string;
// }

// Range slider props
// export interface RangeSliderProps {
//   min: number;
//   max: number;
//   value: [number, number];
//   onChange: (value: [number, number]) => void;
//   step?: number;
//   formatLabel?: (value: number) => string;
//   disabled?: boolean;
// }

// ===========================================
// VALIDATION TYPES
// ===========================================

// Filter validation result
// export interface FilterValidationResult {
//   isValid: boolean;
//   errors: string[];
//   warnings: string[];
// }

// Filter validation options
// export interface FilterValidationOptions {
//   allowEmptyFilters?: boolean;
//   validateRanges?: boolean;
//   validateDates?: boolean;
//   maxArrayLength?: number;
// }

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * Filter Types Migration Progress:
 * 
 * Week 1, Day 2 (Service Extraction):
 * - ✅ Extract WorkoutFilters from WorkoutGrid.tsx
 * - ✅ Move FilterPreset types from AdvancedWorkoutFilters.tsx
 * - ✅ Create FilterEngine service types
 * 
 * Week 1, Day 3 (Filter Enhancement):
 * - ✅ Uncomment all filter types
 * - ✅ Implement advanced search types
 * - ✅ Add filter persistence types
 * 
 * Week 1, Day 4 (Component Breakdown):
 * - ✅ Add UI component prop types
 * - ✅ Implement validation types
 * - ✅ Update component interfaces
 * 
 * Features Supported:
 * - Basic and advanced filtering
 * - Full-text search with highlighting
 * - Filter presets and persistence
 * - Sorting and pagination
 * - Performance monitoring
 * - Validation and error handling
 * 
 * All types are commented out until migration to prevent
 * conflicts with existing component definitions.
 */ 