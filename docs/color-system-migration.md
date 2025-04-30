# Color System Migration

## Overview

The color system has been consolidated to improve maintainability and reduce duplication. All color tokens are now defined in a single location: `src/styles/design-system/tokens/core/_colors.scss`.

## Changes Made

1. **Consolidated Color Files**:
   - Merged all color token definitions from multiple files into a single file
   - Files consolidated and removed: `_color-core.scss`, `_color-semantic.scss`, `_color-variables.scss`, `_color-maps.scss`, and the root `_colors.scss`
   - Preserved all color values and relationships

2. **File Structure**:
   - Primary color token file: `src/styles/design-system/tokens/core/_colors.scss`
   - All imports have been updated to reference this file directly

## Usage Guidelines

### Accessing Color Tokens

There are multiple ways to access the color tokens:

1. **Direct SASS Variables**:
```scss
.example {
  color: $color-primary-500;
  background-color: $color-gray-100;
}
```

2. **Color Helper Functions**:
```scss
.example {
  color: color('primary', '500');
  background-color: color('gray', '100');
}
```

3. **CSS Variables**:
```scss
.example {
  color: var(--color-primary);
  background-color: var(--color-surface-accent);
}
```

## Benefits

1. **Simplified Maintenance**: All color tokens in one place
2. **Reduced Duplication**: No more redundant color declarations
3. **Better Organization**: Clear structure for core, semantic, and component-specific tokens
4. **Improved Performance**: Fewer imports and file dependencies

## Import Instructions

To access color tokens in your stylesheets, import directly from the core tokens:

**Correct approach:**
```scss
@import '../../../styles/design-system/tokens/core/colors';
```

Or import the complete token system if you need access to all tokens:

```scss
@import '../../../styles/design-system/tokens/index';
```

## Helper Functions

### Core Color Functions

**To access colors by name and shade:**
```scss
color: color('primary'); // Default shade (500)
background-color: color('primary', '100'); // Lighter shade
border-color: color('gray', '300');
```

### Themed Color Functions

**For dark theme contexts:**
```scss
color: dark-color('primary');
color: dark-color('feedback', 'success');
```

### Feature-Specific Color Functions

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

The color system follows a 4-tier hierarchical approach:

1. **Core Color Tokens** - Raw RGB color values
2. **Semantic Color Tokens** - Mapping core colors to semantic roles
3. **CSS Variables** - Exporting semantic tokens as CSS variables
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

## Questions and Support

For questions or assistance, please reference this documentation or check other files in the design system directory. 