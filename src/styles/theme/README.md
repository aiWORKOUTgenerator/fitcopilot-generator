# FitCopilot Standardized Color System

This document outlines the standardized color token system implemented in Phase 1. The system provides a consistent, maintainable, and accessible approach to managing colors across the application.

## Directory Structure

```
src/styles/theme/
├── _colors.scss         (Core color variables)
├── _color-maps.scss     (Structured color maps)
├── _color-functions.scss (Color access functions)
├── _dark-theme.scss     (Dark theme implementation)
├── index.scss           (Main entry point)
├── README.md            (This documentation)
```

## Core Concepts

### 1. Map-Based Architecture

All color tokens are organized in structured maps for consistent access:

```scss
$color-categories: (
  'primary': (
    'base': $primary,
    'dark': $primary-dark,
    'light': $primary-light
  ),
  // Additional categories
);
```

### 2. Standardized Access Functions

Colors should always be accessed through these functions, never directly:

```scss
// Primary function for accessing colors
@function color($category, $variant: 'base') {
  // Implementation details
}

// For dark theme colors
@function dark-color($category, $variant: 'base') {
  // Implementation details
}

// For feature-specific colors
@function feature-color($feature, $property: 'accent') {
  // Implementation details
}
```

### 3. RGB Variables for Transparency

All colors have corresponding RGB variables for use with opacity:

```scss
// In CSS files
--color-primary: #1FAD9F;
--color-primary-rgb: 31, 173, 159;

// Usage with opacity
background-color: rgba(var(--color-primary-rgb), 0.2);
```

## Usage Examples

### Basic Color Access

```scss
// SCSS usage
.element {
  color: color('text');
  background-color: color('primary', 'light');
  border: 1px solid color('border');
}

// CSS variables usage
.element {
  color: var(--color-text);
  background-color: var(--color-primary-light);
  border: 1px solid var(--color-border);
}
```

### With Opacity

```scss
// SCSS usage
.element-with-opacity {
  background-color: color-alpha('primary', 'base', 0.2);
  border: 1px solid color-alpha('border', 'base', 0.5);
}

// CSS variables usage
.element-with-opacity {
  background-color: rgba(var(--color-primary-rgb), 0.2);
  border: 1px solid rgba(var(--color-border-rgb), 0.5);
}
```

### Dark Theme

```scss
// SCSS usage
.element {
  color: color('text');
  background-color: color('background');
  
  .dark-theme & {
    color: dark-color('text');
    background-color: dark-color('background');
  }
}

// CSS variables usage (automatic with .dark-theme class)
.element {
  color: var(--color-text);
  background-color: var(--color-background);
}
```

### Feature-Specific Colors

```scss
// SCSS usage
.feature-element {
  background-color: feature-color('virtual', 'bg');
  border-color: feature-color('virtual', 'accent');
}

// CSS variables usage
.feature-element {
  background-color: var(--color-feature-virtual-bg);
  border-color: var(--color-feature-virtual-accent);
}
```

## Available Color Categories

### Semantic Colors

| Category | Variants | Description |
|----------|----------|-------------|
| `primary` | `base`, `dark`, `light` | Primary brand colors |
| `secondary` | `base`, `dark`, `light` | Secondary brand colors |
| `background` | `base`, `dark`, `light`, `card` | Background colors |
| `text` | `base`, `muted`, `light`, `dark` | Text colors |
| `border` | `base`, `light`, `dark` | Border colors |
| `success` | `base` | Success indicator |
| `error` | `base` | Error indicator |
| `warning` | `base` | Warning indicator |
| `info` | `base` | Information indicator |

### Feature-Specific Colors

| Feature | Properties | Description |
|---------|------------|-------------|
| `virtual` | `bg`, `accent` | Virtual training feature |
| `schedule` | `bg`, `accent` | Scheduling feature |
| `progress` | `bg`, `accent` | Progress tracking feature |
| `support` | `bg`, `accent` | Support feature |

## Helper Functions

| Function | Description | Example |
|----------|-------------|---------|
| `color($category, $variant)` | Access semantic colors | `color('primary', 'dark')` |
| `feature-color($feature, $property)` | Access feature colors | `feature-color('virtual', 'bg')` |
| `dark-color($category, $variant)` | Access dark theme colors | `dark-color('text')` |
| `color-alpha($category, $variant, $opacity)` | Get color with transparency | `color-alpha('primary', 'base', 0.2)` |
| `dark-color-alpha($category, $variant, $opacity)` | Get dark color with transparency | `dark-color-alpha('primary', 'base', 0.2)` |
| `gradient($type)` | Get predefined gradient | `gradient('lime')` |
| `overlay($type, $custom-opacity)` | Get overlay color | `overlay('dark', 0.8)` |
| `palette($palette, $shade)` | Access palette color directly | `palette('lime', '300')` |
| `primary($variant)` | Shorthand for primary colors | `primary('light')` |
| `secondary($variant)` | Shorthand for secondary colors | `secondary('dark')` |

## CSS Variables

All colors are exported as CSS custom properties for use in styles:

```scss
:root {
  --color-primary: #1FAD9F;
  --color-primary-dark: #007A91;
  --color-primary-light: #33B1C9;
  --color-primary-rgb: 31, 173, 159;
  // Additional variables
}
```

## Best Practices

1. **Always use functions**: Never use direct color values or variables
2. **Use with opacity**: Use `color-alpha()` or RGB variables for transparency
3. **Consider dark theme**: Always provide dark theme alternatives
4. **Use semantic tokens**: Choose tokens based on purpose, not appearance
5. **Maintain consistency**: Use the same token for the same purpose across components

## Common Patterns

### Button Styles

```scss
.button {
  background-color: color('primary');
  color: color('text-light');
  
  &:hover {
    background-color: color('primary', 'dark');
  }
  
  .dark-theme & {
    background-color: dark-color('primary');
    color: dark-color('text');
  }
}
```

### Card Styles

```scss
.card {
  background-color: color('background', 'card');
  border: 1px solid color('border');
  color: color('text');
  
  .dark-theme & {
    background-color: dark-color('background', 'card');
    border-color: dark-color('border');
    color: dark-color('text');
  }
}
```

### Form Elements

```scss
.input {
  background-color: color('background');
  border: 1px solid color('border');
  color: color('text');
  
  &:focus {
    border-color: color('primary');
    box-shadow: 0 0 0 3px color-alpha('primary', 'base', 0.3);
  }
  
  .dark-theme & {
    background-color: dark-color('background');
    border-color: dark-color('border');
    color: dark-color('text');
    
    &:focus {
      border-color: dark-color('primary');
      box-shadow: 0 0 0 3px dark-color-alpha('primary', 'base', 0.3);
    }
  }
}
``` 