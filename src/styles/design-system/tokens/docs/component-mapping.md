# FitCopilot Component Color Usage Mapping

This document categorizes UI components by their color usage patterns and refactoring priority.

## Component Classification

Components are classified based on their visibility, reuse frequency, and color token complexity:

- **Tier 1**: Core UI components used throughout the application
- **Tier 2**: Feature-specific components with moderate visibility
- **Tier 3**: Admin-only or low-visibility components
- **Tier 4**: Utility or helper components with minimal styling

## Implementation Priorities

| Priority | Component Group | Files | Impact |
|----------|----------------|-------|--------|
| 1 | Button & Form Controls | 12 | High visibility, consistent interaction patterns |
| 2 | Card & Container Components | 9 | Structural elements with background/border colors |
| 3 | Workout Generator UI | 15 | Feature-specific components with unique color scheme |
| 4 | Dashboard Elements | 8 | Admin-facing components with status indicators |
| 5 | Utility Components | 6 | Layout helpers, loaders, and utility classes |

## Component Path Mapping

### Tier 1: Core UI Components

| Component | Path | Color Usage | Priority |
|-----------|------|-------------|----------|
| Button | `/src/common/components/UI/Button` | Primary/accent/state colors | 1 |
| Input | `/src/common/components/UI/Input` | Border/focus/error states | 1 |
| Select | `/src/common/components/UI/Select` | Border/focus/dropdown colors | 1 |
| Checkbox | `/src/common/components/UI/Checkbox` | Check/border/focus states | 1 |
| Radio | `/src/common/components/UI/Radio` | Selection/border/focus states | 1 |
| Card | `/src/common/components/UI/Card` | Background/border/shadow colors | 2 |
| ProgressBar | `/src/common/components/UI/ProgressBar` | Progress/background/indicator colors | 2 |
| Alert | `/src/common/components/UI/Alert` | Status/background/border colors | 2 |
| Modal | `/src/common/components/UI/Modal` | Overlay/background/close colors | 2 |
| Badge | `/src/common/components/UI/Badge` | Status/text color combinations | 3 |

### Tier 2: Feature Components - Workout Generator

| Component | Path | Color Usage | Priority |
|-----------|------|-------------|----------|
| WorkoutRequestForm | `/src/features/workout-generator/components/Form` | Form container styling | 2 |
| InputStep | `/src/features/workout-generator/components/Form/Steps` | Input field styling | 1 |
| WorkoutCard | `/src/features/workout-generator/components/Workout` | Results display | 2 |
| ExerciseList | `/src/features/workout-generator/components/Exercise` | Exercise items | 2 |
| ResultsView | `/src/features/workout-generator/components/Results` | Results container | 3 |
| FilterControls | `/src/features/workout-generator/components/Filters` | Filter UI elements | 3 |

### Tier 3: Admin & Dashboard Components

| Component | Path | Color Usage | Priority |
|-----------|------|-------------|----------|
| DashboardCard | `/src/dashboard/components/Card` | Stats display | 3 |
| AdminNav | `/src/dashboard/components/Navigation` | Navigation elements | 3 |
| StatsGraph | `/src/dashboard/components/Stats` | Data visualization | 4 |
| SettingsPanel | `/src/dashboard/components/Settings` | Admin controls | 4 |

### Tier 4: Utility Components

| Component | Path | Color Usage | Priority |
|-----------|------|-------------|----------|
| Loader | `/src/common/components/UI/Loader` | Animation colors | 3 |
| Spinner | `/src/common/components/UI/Spinner` | Progress indicator | 3 |
| Tooltip | `/src/common/components/UI/Tooltip` | Information display | 4 |
| Divider | `/src/common/components/UI/Divider` | Separator styling | 4 |

## Color Usage Patterns

This section outlines common color usage patterns found across components.

### Interactive Elements Pattern

Common in buttons, form controls, and navigation elements:

```scss
// CURRENT IMPLEMENTATION
.interactive-element {
  background-color: #2563EB;
  color: #FFFFFF;
  
  &:hover {
    background-color: #1D4ED8;
  }
  
  &:focus {
    outline: 2px solid rgba(37, 99, 235, 0.5);
  }
  
  &:disabled {
    background-color: #9CA3AF;
    color: #F3F4F6;
  }
}

// REFACTORED IMPLEMENTATION
.interactive-element {
  background-color: wg-color('primary');
  color: color('surface');
  
  &:hover {
    background-color: wg-color('primary', 'hover');
  }
  
  &:focus {
    outline: 2px solid rgba(var(--color-wg-primary-rgb), 0.5);
  }
  
  &:disabled {
    background-color: color('text', 'muted');
    color: color('surface', 'accent');
  }
}
```

### Container Elements Pattern

Common in cards, panels, and modal dialogs:

```scss
// CURRENT IMPLEMENTATION
.container-element {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
  
  .container-header {
    border-bottom: 1px solid #F3F4F6;
    color: #111827;
  }
  
  .container-content {
    color: #374151;
  }
}

// REFACTORED IMPLEMENTATION
.container-element {
  background-color: color('surface');
  border: 1px solid color('border');
  box-shadow: var(--shadow-sm);
  
  .container-header {
    border-bottom: 1px solid color('border', 'light');
    color: color('text');
  }
  
  .container-content {
    color: color('text', 'base');
  }
}
```

### Status Indicators Pattern

Common in alerts, badges, and feedback messages:

```scss
// CURRENT IMPLEMENTATION
.status-indicator {
  &.success {
    background-color: #D1FAE5;
    color: #065F46;
    border-color: #A7F3D0;
  }
  
  &.error {
    background-color: #FEE2E2;
    color: #B91C1C;
    border-color: #FECACA;
  }
  
  &.warning {
    background-color: #FEF3C7;
    color: #92400E;
    border-color: #FDE68A;
  }
}

// REFACTORED IMPLEMENTATION
.status-indicator {
  &.success {
    background-color: color('success', 'bg');
    color: color('success', 'text');
    border-color: color('success', 'border');
  }
  
  &.error {
    background-color: color('error', 'bg');
    color: color('error', 'text');
    border-color: color('error', 'border');
  }
  
  &.warning {
    background-color: color('warning', 'bg');
    color: color('warning', 'text');
    border-color: color('warning', 'border');
  }
}
```

## Refactoring Approach

When refactoring components, follow these steps:

1. Identify the component's tier and priority
2. Analyze its color usage pattern
3. Map hardcoded values to appropriate semantic tokens
4. Replace direct color references with token functions or CSS variables
5. Test in both light and dark themes
6. Validate with token-validator.js

Start with Tier 1, Priority 1 components to establish patterns, then move to feature-specific components. 