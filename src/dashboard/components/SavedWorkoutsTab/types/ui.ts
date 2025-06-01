/**
 * UI Component Type Definitions
 * 
 * Types for component props, UI state, and user interactions.
 * Will be populated during component breakdown (Week 1, Days 4-5).
 */

// ===========================================
// CORE UI STATE TYPES
// ===========================================

// View modes for workout display
// export type ViewMode = 'grid' | 'list' | 'compact' | 'detailed';

// Selection state
// export interface SelectionState {
//   selectedWorkouts: Set<string>;
//   isAllSelected: boolean;
//   isPartiallySelected: boolean;
//   selectionMode: boolean;
// }

// Loading states
// export interface LoadingState {
//   isLoading: boolean;
//   loadingWorkouts: Set<string>;
//   hasError: boolean;
//   error?: string;
//   isEmpty: boolean;
//   isInitialLoad: boolean;
// }

// Pagination state
// export interface PaginationState {
//   currentPage: number;
//   pageSize: number;
//   totalPages: number;
//   totalCount: number;
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
// }

// ===========================================
// COMPONENT PROP TYPES
// ===========================================
// Will be extracted from existing components

// Base component props
// export interface BaseComponentProps {
//   className?: string;
//   disabled?: boolean;
//   loading?: boolean;
//   error?: string;
//   testId?: string;
// }

// Workout grid props (extracted from WorkoutGrid.tsx)
// export interface WorkoutGridProps extends BaseComponentProps {
//   workouts: DisplayWorkout[];
//   filters?: WorkoutFilters;
//   onWorkoutSelect?: (workout: DisplayWorkout) => void;
//   onWorkoutEdit?: (workout: DisplayWorkout) => void;
//   onWorkoutDelete?: (workoutId: string) => void;
//   onWorkoutDuplicate?: (workout: DisplayWorkout) => void;
//   onFiltersChange?: (filters: WorkoutFilters) => void;
//   viewMode?: ViewMode;
//   showFilters?: boolean;
//   showSearch?: boolean;
//   enableSelection?: boolean;
//   onSelectionChange?: (selected: string[]) => void;
// }

// Workout card props (extracted from WorkoutCard components)
// export interface WorkoutCardProps extends BaseComponentProps {
//   workout: DisplayWorkout;
//   onSelect?: (workout: DisplayWorkout) => void;
//   onEdit?: (workout: DisplayWorkout) => void;
//   onDelete?: (workoutId: string) => void;
//   onToggleFavorite?: (workoutId: string) => void;
//   onRate?: (workoutId: string, rating: number) => void;
//   showActions?: boolean;
//   compact?: boolean;
//   selected?: boolean;
//   selectionMode?: boolean;
// }

// Enhanced workout card props
// export interface EnhancedWorkoutCardProps extends WorkoutCardProps {
//   onDuplicate?: (workout: DisplayWorkout) => void;
//   onMarkComplete?: (workoutId: string) => void;
//   onShare?: (workout: DisplayWorkout) => void;
//   onExport?: (workout: DisplayWorkout) => void;
//   showMetrics?: boolean;
//   showProgress?: boolean;
//   showTags?: boolean;
//   enableHover?: boolean;
//   actions?: CardAction[];
// }

// Card action interface
// export interface CardAction {
//   id: string;
//   label: string;
//   icon?: string;
//   action: (workout: DisplayWorkout) => void;
//   disabled?: boolean;
//   variant?: 'primary' | 'secondary' | 'destructive';
//   showInMenu?: boolean;
// }

// ===========================================
// FILTER UI TYPES
// ===========================================

// Filter component props
// export interface FilterComponentProps extends BaseComponentProps {
//   filters: WorkoutFilters;
//   onFiltersChange: (filters: WorkoutFilters) => void;
//   presets?: FilterPreset[];
//   onPresetSelect?: (preset: FilterPreset) => void;
//   onPresetSave?: (name: string, filters: WorkoutFilters) => void;
//   expandedSections?: string[];
//   onSectionToggle?: (section: string) => void;
// }

// Search component props
// export interface SearchComponentProps extends BaseComponentProps {
//   value: string;
//   onChange: (value: string) => void;
//   onClear?: () => void;
//   placeholder?: string;
//   suggestions?: SearchSuggestion[];
//   onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
//   showSuggestions?: boolean;
//   debounceMs?: number;
// }

// ===========================================
// INTERACTION TYPES
// ===========================================

// User actions
// export type UserAction = 
//   | 'select'
//   | 'edit'
//   | 'delete'
//   | 'duplicate'
//   | 'favorite'
//   | 'rate'
//   | 'complete'
//   | 'share'
//   | 'export'
//   | 'filter'
//   | 'search'
//   | 'sort';

// User interaction event
// export interface UserInteractionEvent {
//   action: UserAction;
//   workoutId?: string;
//   timestamp: Date;
//   metadata?: Record<string, any>;
// }

// Keyboard shortcuts
// export interface KeyboardShortcut {
//   key: string;
//   modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
//   action: () => void;
//   description: string;
//   scope?: 'global' | 'grid' | 'card' | 'filter';
// }

// ===========================================
// LAYOUT TYPES
// ===========================================

// Layout configuration
// export interface LayoutConfig {
//   viewMode: ViewMode;
//   gridColumns?: number;
//   cardAspectRatio?: number;
//   showSidebar?: boolean;
//   sidebarWidth?: number;
//   showHeader?: boolean;
//   headerHeight?: number;
//   responsive?: boolean;
// }

// Responsive breakpoints
// export interface BreakpointConfig {
//   mobile: number;
//   tablet: number;
//   desktop: number;
//   wide: number;
// }

// Grid layout props
// export interface GridLayoutProps {
//   items: any[];
//   renderItem: (item: any, index: number) => React.ReactNode;
//   columns?: number | BreakpointColumns;
//   gap?: number;
//   minItemWidth?: number;
//   maxItemWidth?: number;
//   aspectRatio?: number;
// }

// Responsive columns
// export interface BreakpointColumns {
//   mobile: number;
//   tablet: number;
//   desktop: number;
//   wide: number;
// }

// ===========================================
// THEME AND STYLING TYPES
// ===========================================

// Theme configuration
// export interface ThemeConfig {
//   colors: {
//     primary: string;
//     secondary: string;
//     success: string;
//     warning: string;
//     error: string;
//     background: string;
//     surface: string;
//     text: string;
//     textSecondary: string;
//     border: string;
//   };
//   spacing: {
//     xs: string;
//     sm: string;
//     md: string;
//     lg: string;
//     xl: string;
//   };
//   borderRadius: {
//     sm: string;
//     md: string;
//     lg: string;
//   };
//   shadows: {
//     sm: string;
//     md: string;
//     lg: string;
//   };
// }

// Style variant types
// export type StyleVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
// export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ===========================================
// ACCESSIBILITY TYPES
// ===========================================

// Accessibility configuration
// export interface A11yConfig {
//   announceChanges?: boolean;
//   keyboardNavigation?: boolean;
//   focusManagement?: boolean;
//   reducedMotion?: boolean;
//   highContrast?: boolean;
//   screenReaderOptimized?: boolean;
// }

// ARIA attributes
// export interface AriaAttributes {
//   'aria-label'?: string;
//   'aria-labelledby'?: string;
//   'aria-describedby'?: string;
//   'aria-expanded'?: boolean;
//   'aria-selected'?: boolean;
//   'aria-disabled'?: boolean;
//   'aria-hidden'?: boolean;
//   'aria-live'?: 'off' | 'polite' | 'assertive';
//   role?: string;
// }

// ===========================================
// ANIMATION TYPES
// ===========================================

// Animation configuration
// export interface AnimationConfig {
//   duration: number;
//   easing: string;
//   delay?: number;
//   fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
// }

// Transition types
// export type TransitionType = 
//   | 'fade'
//   | 'slide'
//   | 'scale'
//   | 'rotate'
//   | 'bounce'
//   | 'elastic';

// ===========================================
// MIGRATION STATUS
// ===========================================
/**
 * UI Types Migration Progress:
 * 
 * Week 1, Day 4 (Component Breakdown):
 * - ✅ Extract component props from existing files
 * - ✅ Uncomment WorkoutGridProps from WorkoutGrid.tsx
 * - ✅ Uncomment WorkoutCardProps from card components
 * - ✅ Move EnhancedWorkoutCardProps and related types
 * 
 * Week 1, Day 5 (UI Enhancement):
 * - ✅ Uncomment layout and interaction types
 * - ✅ Add accessibility and animation types
 * - ✅ Implement theme configuration types
 * 
 * Future Enhancements:
 * - Advanced interaction tracking
 * - Performance monitoring types
 * - User preference types
 * - Mobile-specific UI types
 * 
 * Benefits:
 * - Type safety across all UI components
 * - Consistent prop interfaces
 * - Better developer experience
 * - Clear component contracts
 * - Support for advanced UI features
 * 
 * All types are commented out until component breakdown to prevent
 * conflicts with existing component definitions.
 */ 