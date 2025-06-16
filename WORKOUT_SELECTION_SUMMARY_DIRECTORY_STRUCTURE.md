# 📁 WorkoutSelectionSummary Component Directory Structure

## **Complete Directory Tree**

```
src/features/workout-generator/components/common/WorkoutSelectionSummary/
├── 📄 index.ts                                    # Barrel exports
├── 📄 WorkoutSelectionSummary.tsx                 # Main component (280 lines)
├── 📄 WorkoutSelectionSummary.scss                # Component styles (150 lines)
├── 📄 types.ts                                    # TypeScript definitions (80 lines)
├── 📄 formatters.ts                               # Data formatting functions (120 lines)
├── 📄 icons.ts                                    # Icon helper functions (60 lines)
├── 📄 constants.ts                                # Component constants (40 lines)
├── 📁 __tests__/                                  # Test directory
│   ├── 📄 WorkoutSelectionSummary.test.tsx        # Component tests
│   ├── 📄 formatters.test.ts                      # Formatter tests
│   ├── 📄 icons.test.ts                           # Icon helper tests
│   ├── 📄 types.test.ts                           # Type validation tests
│   └── 📄 __snapshots__/                          # Jest snapshots
│       └── 📄 WorkoutSelectionSummary.test.tsx.snap
├── 📁 hooks/                                      # Component-specific hooks
│   ├── 📄 useSelectionCategories.ts               # Category management hook
│   ├── 📄 useSelectionFormatting.ts               # Formatting logic hook
│   └── 📄 index.ts                                # Hook exports
└── 📁 utils/                                      # Utility functions
    ├── 📄 categoryHelpers.ts                      # Category processing utilities
    ├── 📄 selectionValidators.ts                  # Selection validation utilities
    └── 📄 index.ts                                # Utility exports
```

## **File-by-File Breakdown**

### **📄 index.ts** (Barrel Exports)
```typescript
// Main component export
export { WorkoutSelectionSummary } from './WorkoutSelectionSummary';

// Type exports
export type {
  WorkoutSelectionSummaryProps,
  SelectionCategory,
  CategoryConfig,
  SelectionItem,
  CategorizedSelections,
  SelectionVariant
} from './types';

// Utility exports
export { FORMATTERS, SELECTION_ICONS, CATEGORY_CONFIGS } from './constants';
export * from './formatters';
export * from './icons';
export * from './hooks';
export * from './utils';
```

### **📄 WorkoutSelectionSummary.tsx** (Main Component)
```typescript
/**
 * WorkoutSelectionSummary Component
 * 
 * Reusable component for displaying user workout selections in a structured,
 * accessible format. Supports multiple variants and interactive features.
 * 
 * @example
 * <WorkoutSelectionSummary 
 *   workout={workoutData}
 *   variant="compact"
 *   categories={['workout-setup', 'daily-state']}
 * />
 */
import React, { useMemo } from 'react';
import { Settings, Target, Zap, MapPin } from 'lucide-react';
import { WorkoutSelectionSummaryProps } from './types';
import { useSelectionCategories, useSelectionFormatting } from './hooks';
import { CATEGORY_CONFIGS } from './constants';
import './WorkoutSelectionSummary.scss';

export const WorkoutSelectionSummary: React.FC<WorkoutSelectionSummaryProps> = ({
  // Component implementation
});
```

### **📄 types.ts** (TypeScript Definitions)
```typescript
import { GeneratedWorkout } from '../../types';

export interface WorkoutSelectionSummaryProps {
  workout: GeneratedWorkout;
  variant?: SelectionVariant;
  className?: string;
  title?: string;
  subtitle?: string;
  showAIContext?: boolean;
  categories?: SelectionCategory[];
  categoryConfig?: CategoryConfig;
  onSelectionClick?: (category: string, field: string, value: any) => void;
}

export type SelectionVariant = 'default' | 'compact' | 'minimal' | 'interactive';

export type SelectionCategory = 
  | 'workout-setup' 
  | 'fitness-level' 
  | 'daily-state' 
  | 'restrictions' 
  | 'environment';

// Additional type definitions...
```

### **📄 formatters.ts** (Data Formatting)
```typescript
/**
 * Formatting functions for workout selection display values
 * 
 * All formatters follow the pattern: (rawValue) => displayString
 * Handles edge cases, null values, and internationalization
 */

export const formatGoals = (goals: string | string[]): string => {
  // Implementation
};

export const formatIntensityLevel = (level: number): string => {
  // Implementation with 1-6 scale
};

// Centralized formatter registry
export const FORMATTERS = {
  goals: formatGoals,
  fitness_level: formatFitnessLevel,
  intensity_level: formatIntensityLevel,
  // ... other formatters
} as const;
```

### **📄 icons.ts** (Icon Helpers)
```typescript
/**
 * Icon helper functions and mappings for workout selections
 * 
 * Provides consistent iconography across all selection displays
 */
import { Clock, Target, Zap, MapPin } from 'lucide-react';

export const getStressIcon = (stress: string): string => {
  // Dynamic icon based on stress level
};

export const SELECTION_ICONS = {
  duration: Clock,
  goals: Target,
  intensity_level: '🔥',
  // ... other icons
} as const;
```

### **📄 constants.ts** (Component Constants)
```typescript
/**
 * Component constants and configuration objects
 */
import { CategoryConfig } from './types';

export const DEFAULT_CATEGORIES: SelectionCategory[] = [
  'workout-setup',
  'fitness-level', 
  'daily-state',
  'restrictions',
  'environment'
];

export const CATEGORY_CONFIGS: Record<SelectionCategory, CategoryConfig> = {
  'workout-setup': {
    title: 'Workout Setup',
    icon: Target,
    order: 1,
    fields: ['duration', 'goals', 'intensity_level']
  },
  // ... other category configs
};
```

### **📄 WorkoutSelectionSummary.scss** (Styling)
```scss
/**
 * WorkoutSelectionSummary Component Styles
 * 
 * Uses BEM methodology and design system tokens
 * Supports multiple variants and responsive design
 */
@import '../../../styles/design-system/tokens';
@import '../../../styles/design-system/mixins';

.workout-selection-summary {
  // Base component styles
  
  &__header {
    // Header styling
  }
  
  &__grid {
    // Grid layout with responsive breakpoints
  }
  
  &__category {
    // Category container styles
    
    &--workout-setup { /* Specific styles */ }
    &--fitness-level { /* Specific styles */ }
    &--daily-state { /* Specific styles */ }
    &--restrictions { /* Specific styles */ }
    &--environment { /* Specific styles */ }
  }
  
  // Variant styles
  &--compact { /* Compact variant */ }
  &--minimal { /* Minimal variant */ }
  &--interactive { /* Interactive variant */ }
}
```

## **Hook Directory Structure**

### **📁 hooks/**
```
hooks/
├── 📄 index.ts                        # Hook exports
├── 📄 useSelectionCategories.ts       # Category management logic
└── 📄 useSelectionFormatting.ts       # Formatting and display logic
```

### **📄 useSelectionCategories.ts**
```typescript
/**
 * Hook for managing selection categories and their configuration
 * 
 * Handles category filtering, ordering, and visibility logic
 */
export const useSelectionCategories = (
  workout: GeneratedWorkout,
  categories?: SelectionCategory[],
  categoryConfig?: CategoryConfig
) => {
  // Hook implementation
  return {
    visibleCategories,
    categorizedSelections,
    hasSelections
  };
};
```

### **📄 useSelectionFormatting.ts**
```typescript
/**
 * Hook for handling selection formatting and display logic
 * 
 * Centralizes all formatting operations and memoizes results
 */
export const useSelectionFormatting = (
  workout: GeneratedWorkout,
  variant: SelectionVariant
) => {
  // Hook implementation
  return {
    formatSelection,
    getSelectionIcon,
    getSelectionValue
  };
};
```

## **Utility Directory Structure**

### **📁 utils/**
```
utils/
├── 📄 index.ts                        # Utility exports
├── 📄 categoryHelpers.ts              # Category processing utilities
└── 📄 selectionValidators.ts          # Selection validation utilities
```

### **📄 categoryHelpers.ts**
```typescript
/**
 * Utility functions for category processing and organization
 */
export const categorizeSelections = (
  workout: GeneratedWorkout,
  categories: SelectionCategory[]
): CategorizedSelections => {
  // Implementation
};

export const filterVisibleCategories = (
  categories: SelectionCategory[],
  workout: GeneratedWorkout
): SelectionCategory[] => {
  // Implementation
};
```

## **Test Directory Structure**

### **📁 __tests__/**
```
__tests__/
├── 📄 WorkoutSelectionSummary.test.tsx    # Component integration tests
├── 📄 formatters.test.ts                  # Formatter unit tests
├── 📄 icons.test.ts                       # Icon helper tests
├── 📄 types.test.ts                       # Type validation tests
└── 📁 __snapshots__/                      # Jest snapshot files
    └── 📄 WorkoutSelectionSummary.test.tsx.snap
```

### **📄 WorkoutSelectionSummary.test.tsx**
```typescript
/**
 * Comprehensive component tests covering:
 * - Rendering with different props
 * - Variant behavior
 * - Interactive features
 * - Accessibility compliance
 * - Error handling
 */
describe('WorkoutSelectionSummary', () => {
  // Test suites
});
```

## **Integration Points**

### **Updated common/index.ts**
```typescript
// src/features/workout-generator/components/common/index.ts
export { TipsCard } from './TipsCard';
export { ErrorBoundary } from './ErrorBoundary';
export { WorkoutSelectionSummary } from './WorkoutSelectionSummary';  // NEW
```

### **Updated components/index.ts**
```typescript
// src/features/workout-generator/components/index.ts
export { WorkoutDisplay } from './WorkoutDisplay';
export { WorkoutEditor } from './WorkoutEditor';
export { WorkoutSelectionSummary } from './common';  // NEW
```

## **File Size Estimates**

| File | Estimated Lines | Purpose |
|------|----------------|---------|
| `WorkoutSelectionSummary.tsx` | ~280 | Main component logic |
| `WorkoutSelectionSummary.scss` | ~150 | Styling and variants |
| `types.ts` | ~80 | TypeScript definitions |
| `formatters.ts` | ~120 | Data formatting functions |
| `icons.ts` | ~60 | Icon helpers |
| `constants.ts` | ~40 | Configuration objects |
| `useSelectionCategories.ts` | ~70 | Category management hook |
| `useSelectionFormatting.ts` | ~50 | Formatting hook |
| `categoryHelpers.ts` | ~60 | Category utilities |
| `selectionValidators.ts` | ~40 | Validation utilities |
| **Total** | **~950 lines** | **Complete component** |

## **Benefits of This Structure**

### **🎯 Modularity**
- Clear separation of concerns
- Easy to test individual pieces
- Reusable utilities and hooks

### **📚 Maintainability**
- Well-organized file structure
- Comprehensive documentation
- Type safety throughout

### **🔧 Extensibility**
- Easy to add new formatters
- Simple to create new variants
- Hooks can be reused elsewhere

### **🧪 Testability**
- Isolated test files
- Comprehensive test coverage
- Snapshot testing for UI consistency

This directory structure follows React best practices and provides a solid foundation for a production-ready, reusable component that can grow with the application's needs. 