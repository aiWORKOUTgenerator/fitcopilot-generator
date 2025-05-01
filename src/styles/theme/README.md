# FitCopilot Color System

This directory contains the FitCopilot theme color system, which provides a standardized approach to colors across the application.

## File Structure

- `_colors.scss` - Core color definitions and CSS variables
- `_color-functions.scss` - Function-based access to color tokens
- `_compatibility.scss` - Compatibility layer for legacy code
- `_index.scss` - Entry point that exports all theme files
- `test-colors.scss` - Test file to validate color functions

## Usage Guide

### Basic Usage

```scss
@import 'styles/theme/index';

.my-component {
  // Using color functions
  color: color('text');
  background-color: color('background');
  border: 1px solid color('border');
  
  // Using feature-specific colors
  &.virtual-training {
    background-color: feature-color('virtual', 'bg');
    border-color: feature-color('virtual', 'accent');
  }
  
  // Using gradients
  &.gradient-button {
    background: gradient('lime');
  }
}
```

### Available Functions

#### `color($category, $variant)`

Access semantic color tokens:

```scss
// Primary colors
color('primary');        // $primary (lime-300)
color('primary', 'dark'); // $primary-dark (lime-500)
color('primary', 'light'); // $primary-light (lime-200)

// Secondary colors
color('secondary');       // $secondary (emerald-400)
color('secondary', 'dark'); // $secondary-dark (emerald-600)
color('secondary', 'light'); // $secondary-light (emerald-200)

// Background colors
color('background');      // $background (gray-900)
color('background', 'light'); // $background-light (gray-800)
color('background', 'dark'); // $background-dark (gray-950)
color('background', 'card'); // $background-card (card-bg)

// Text colors
color('text');           // $text (white)
color('text', 'muted');   // $text-muted (gray-400)
color('text', 'light');   // $text-light (gray-300)
color('text', 'dark');    // $text-dark (gray-600)

// Border colors
color('border');         // $border (gray-700)
color('border', 'light'); // $border-light (gray-600)
color('border', 'dark');  // $border-dark (gray-800)

// Status colors
color('success');        // $success (emerald-500)
color('error');          // $error (ef4444)
color('warning');        // $warning (amber-500)
color('info');           // $info (blue-500)
```

#### `feature-color($feature, $property)`

Access feature-specific colors:

```scss
// Virtual Training feature
feature-color('virtual', 'bg');    // $feature-virtual-bg
feature-color('virtual', 'accent'); // $feature-virtual-accent

// Scheduling feature
feature-color('schedule', 'bg');    // $feature-schedule-bg
feature-color('schedule', 'accent'); // $feature-schedule-accent

// Progress feature
feature-color('progress', 'bg');    // $feature-progress-bg
feature-color('progress', 'accent'); // $feature-progress-accent

// Support feature
feature-color('support', 'bg');    // $feature-support-bg
feature-color('support', 'accent'); // $feature-support-accent
```

#### `gradient($type)`

Access predefined gradients:

```scss
gradient('lime');    // $gradient-lime
gradient('cyan');    // $gradient-cyan
gradient('violet');  // $gradient-violet
gradient('amber');   // $gradient-amber
```

#### `color-alpha($category, $variant, $opacity)`

Create a transparent version of any color:

```scss
color-alpha('primary', 'base', 0.2);  // rgba version of primary color at 20% opacity
color-alpha('text', 'muted', 0.5);     // rgba version of muted text at 50% opacity
```

#### `overlay($type, $custom-opacity)`

Access overlay colors:

```scss
overlay('dark');           // $overlay-dark (rgba of gray-900 at 70% opacity)
overlay('light');          // $overlay-light (rgba of white at 10% opacity)
overlay('dark', 0.9);      // Custom dark overlay at 90% opacity
```

#### `palette($palette, $shade)`

Access specific color from a palette:

```scss
palette('lime', 300);      // $lime-300
palette('emerald', 500);    // $emerald-500
```

### Using CSS Variables

For JavaScript and inline styles, use CSS variables:

```jsx
// In React component
<div 
  style={{
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)'
  }}
>
  Content
</div>

// For opacity with RGB variables
<div 
  style={{
    backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)'
  }}
>
  Content with opacity
</div>
```

## Extending the System

When adding new colors or functions, follow these guidelines:

1. Add base color definitions to `_colors.scss`
2. Add semantic mappings to `_colors.scss`
3. Export as CSS variables in `:root` in `_colors.scss`
4. Add appropriate function access in `_color-functions.scss`
5. Add backward compatibility mappings in `_compatibility.scss` if needed
6. Document the new additions

## Best Practices

1. Always use the function-based approach rather than direct variable references
2. Use semantic color names (`color('primary')`) instead of specific color names (`$lime-300`)
3. For opacity/transparency, use the RGB CSS variables or the `color-alpha()` function
4. For gradients, use the `gradient()` function instead of hardcoding values
5. Run the token validator regularly to ensure no hardcoded values are introduced 