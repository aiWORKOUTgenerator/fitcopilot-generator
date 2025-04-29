# Color Token Migration

## Overview

This document outlines the completion of Phase 2.2 of our design system migration plan, which focused on updating color references throughout the codebase to use our new token system.

## What Changed

We've migrated our high-usage components from using direct color variables or hardcoded color values to using the new CSS variable-based token system. This includes:

1. **Button Components**: Updated `background-color`, `color`, and `border-color` properties to use `var(--color-*)` tokens
2. **Form Components**: Updated input fields, labels, and validation states to use semantic color tokens
3. **Card Components**: Updated background colors, text colors, and borders to use the token system

## Benefits of the New Token System

- **Consistent theming**: All components now pull from the same token system, ensuring visual consistency
- **Simplified theme switching**: Dark theme support is now built into the token system
- **Better organization**: Colors are organized into semantic categories (primary, accent, feedback, etc.)
- **Easier maintenance**: Changing a color value in one place updates it everywhere

## How to Use the New Token System

### CSS Variables

Instead of using SCSS variables like `$primary-color`, use CSS variables:

```scss
// Old approach
background-color: $wg-primary-color;

// New approach
background-color: var(--color-wg-primary);
```

### Color Categories

Our token system organizes colors into several categories:

#### Primary Colors
- `--color-primary`: Main brand color
- `--color-primary-dark`: Darker variant for hover states
- `--color-primary-light`: Lighter variant for backgrounds

#### Feature-Specific Colors
- `--color-wg-primary`: Workout Generator primary color
- `--color-wg-secondary`: Workout Generator secondary color

#### Semantic Colors
- `--color-surface`: Background surfaces
- `--color-border`: Border colors
- `--color-text`: Primary text color
- `--color-text-muted`: Secondary text color

#### Feedback Colors
- `--color-success`: Success states
- `--color-error`: Error states
- `--color-warning`: Warning states
- `--color-info`: Information states

#### Dark Theme Variants
Each color has a dark theme variant prefixed with `dark-`:
- `--color-dark-primary`
- `--color-dark-surface`
- `--color-dark-text`

### Working with Dark Theme

You don't need to manually set different colors for dark theme. Instead, use this pattern:

```scss
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text);
  
  .dark-theme & {
    // No need to specify colors again - the CSS variables will automatically switch
    // when the .dark-theme class is applied to a parent element
  }
}
```

If you need specific dark theme overrides:

```scss
.my-component {
  background-color: var(--color-surface);
  
  .dark-theme & {
    // Only if you need specific overrides
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
}
```

## Testing the Migration

A test page has been created at `src/features/workout-generator/tests/color-tokens-test.html` which demonstrates:

- Side-by-side comparisons of old and new styling
- Primary color swatches
- Feedback color swatches
- Dark theme toggle button

## Next Steps

With Phase 2.2 complete, we will move on to Phase 2.3: Typography & Spacing Token Migration. 