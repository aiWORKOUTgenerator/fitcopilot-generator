# FitCopilot Design System: Color Token Architecture

This document outlines the consolidated color token architecture implemented in the FitCopilot design system. The system is structured to provide a clear inheritance model, reduce redundancy, and ensure consistent application of colors across the application.

## Token Structure

The color system follows a 4-tier hierarchical approach:

1. **Core Color Tokens** - Raw RGB color values
2. **Semantic Color Tokens** - Mapping core colors to semantic roles
3. **CSS Variables** - Exporting semantic tokens as CSS variables
4. **Component-Specific Tokens** - Feature and component specific color applications

## Files Organization

- `_color-core.scss` - Core RGB values
- `_color-semantic.scss` - Maps core values to semantic purposes
- `_color-variables.scss` - Exports as CSS variables
- `_color-maps.scss` - Provides SCSS maps and helper functions
- `index.scss` - Aggregates all token files

## Usage Guidelines

### Accessing Colors

**Preferred Method: Helper Functions**
```scss
// In global components
color('primary');
color('primary', 'dark');
color('feedback', 'success');

// In dark theme contexts
dark-color('primary');
dark-color('feedback', 'success');

// In Workout Generator components
wg-color('primary');
wg-color('secondary', 'hover');
```

**Alternative Method: CSS Variables**
```scss
var(--color-primary)
var(--color-primary-dark)
var(--color-success)
```

### Feature-Specific Colors

When implementing feature-specific components, use the feature-specific helper functions:

```scss
// In form components
wg-form-color('border', 'focus');
wg-form-color('button', 'primary');

// In result display components
wg-result-color('background', 'highlight');
wg-result-color('exercise', 'border');
```

## Token Groups

### Base Colors

- `primary` - Main brand color
- `accent` - Secondary brand color
- `surface` - UI surface colors
- `text` - Typography colors
- `feedback` - Status and message colors

### State Colors

- `focus` - Focus state indicators
- `hover` - Hover state styling
- `active` - Active state styling
- `disabled` - Disabled state styling

### Feature-Specific Colors

- `wg-primary` - Workout Generator primary color
- `wg-secondary` - Workout Generator secondary color
- `wg-card-*` - Specialized card styling for Workout Generator

## Benefits of New System

1. **Reduced Redundancy** - Consolidated duplicate tokens
2. **Clear Inheritance** - Transparent relationships between tokens
3. **Consistent Format** - Standardized RGB format for all colors
4. **Error Checking** - Built-in validation via helper functions
5. **Dark Theme Support** - Parallel structure for dark theme tokens

## Migration Guide

When working with existing components:

1. Replace direct CSS variable references with helper functions
2. Use the most specific token function for your context
3. If backwards compatibility is needed, use the legacy variables in `_color-tokens.scss` 