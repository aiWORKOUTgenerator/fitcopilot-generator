# Color System Migration Guide

## Overview

We've implemented a consolidated color token system to improve consistency, reduce redundancy, and establish a clear inheritance model for colors across the application. This document provides guidelines for migrating components to use the new system.

## Migration Steps

### 1. Update Import Statements

**Old approach:**
```scss
@import '../../../styles/design-system/_colors';
```

**New approach:**
```scss
@import '../../../styles/design-system/tokens/index';
```

### 2. Replace Direct Variable References

**Old approach:**
```scss
color: var(--color-primary);
background-color: rgba(var(--color-primary-rgb), 0.1);
```

**New approach (preferred):**
```scss
color: color('primary');
background-color: rgba(var(--color-primary-rgb), 0.1);
```

### 3. Use Context-Specific Helper Functions

**For global components:**
```scss
color: color('primary', 'dark');
color: color('feedback', 'success');
```

**For dark theme contexts:**
```scss
color: dark-color('primary');
color: dark-color('feedback', 'success');
```

**For Workout Generator components:**
```scss
color: wg-color('primary');
color: wg-color('secondary', 'hover');
```

**For Workout Generator form components:**
```scss
border-color: wg-form-color('border', 'focus');
color: wg-form-color('text', 'label');
```

**For Workout Generator result components:**
```scss
background-color: wg-result-color('background', 'highlight');
border: 1px solid wg-result-color('exercise', 'border');
```

## Token Architecture

The new system follows a 4-tier hierarchical approach:

1. **Core Color Tokens** - Raw RGB color values (`_color-core.scss`)
2. **Semantic Color Tokens** - Mapping core colors to semantic roles (`_color-semantic.scss`)
3. **CSS Variables** - Exporting semantic tokens as CSS variables (`_color-variables.scss`)
4. **Component-Specific Tokens** - Feature and component specific color applications

## Benefits of the New System

- **Reduced Redundancy**: ~25% reduction in color token definitions
- **Clear Inheritance Path**: Changes to core colors automatically propagate
- **Error Checking**: Helper functions provide validation and error messages
- **Consistent Formatting**: All colors use standardized RGB format
- **Dark Theme Support**: Parallel structure for light and dark modes

## Example: Before and After

**Before:**
```scss
.my-component {
  color: var(--color-primary);
  background-color: #f5f5f5;
  border: 1px solid var(--color-border);
  
  &:hover {
    background-color: rgba(31, 173, 159, 0.1);
  }
  
  .dark-theme & {
    color: var(--color-dark-primary);
    background-color: #333;
    border-color: var(--color-dark-border);
    
    &:hover {
      background-color: rgba(0, 180, 216, 0.1);
    }
  }
}
```

**After:**
```scss
.my-component {
  color: color('primary');
  background-color: var(--color-surface-accent);
  border: 1px solid color('border');
  
  &:hover {
    background-color: rgba(var(--color-primary-rgb), 0.1);
  }
  
  .dark-theme & {
    color: dark-color('primary');
    background-color: var(--color-dark-surface);
    border-color: dark-color('border');
    
    &:hover {
      background-color: rgba(var(--color-dark-primary-rgb), 0.1);
    }
  }
}
```

## Backward Compatibility

The new system maintains backward compatibility with existing variable references (`var(--color-*)`) while providing a more robust approach through helper functions. This allows for gradual migration of components without breaking existing functionality.

## Questions and Support

For questions or assistance with migration, please contact the UI team or reference the detailed documentation in `src/styles/design-system/tokens/README.md`. 