# FitCopilot Color Token Map

This document provides a comprehensive mapping of all color tokens available in the FitCopilot design system, organized by semantic purpose and usage context.

## Core Color Tokens

These RGB-formatted tokens represent the foundational color palette. These should never be accessed directly in component styles.

| Token Name | RGB Value | Hex Equivalent | Usage |
|------------|-----------|----------------|-------|
| `$color-core-primary-rgb` | 31, 173, 159 | #1FAD9F | Brand primary teal |
| `$color-core-primary-dark-rgb` | 0, 122, 145 | #007A91 | Brand primary dark variant |
| `$color-core-primary-light-rgb` | 51, 177, 201 | #33B1C9 | Brand primary light variant |
| `$color-core-accent-rgb` | 212, 160, 23 | #D4A017 | Brand accent gold |
| `$color-core-wg-primary-rgb` | 37, 99, 235 | #2563EB | Workout Generator blue |
| `$color-core-gray-700-rgb` | 51, 51, 51 | #333333 | Dark text |
| `$color-core-success-rgb` | 43, 174, 102 | #2BAE66 | Success state |
| `$color-core-error-rgb` | 217, 78, 78 | #D94E4E | Error state |

## Semantic Color Tokens

These tokens map core colors to semantic purposes in the UI.

| Token Name | Based On | Purpose |
|------------|----------|---------|
| `$color-semantic-primary-rgb` | $color-core-primary-rgb | Main brand color |
| `$color-semantic-accent-rgb` | $color-core-accent-rgb | Complementary brand color |
| `$color-semantic-bg-rgb` | $color-core-gray-50-rgb | Page background |
| `$color-semantic-surface-rgb` | $color-core-white-rgb | Component background |
| `$color-semantic-text-rgb` | $color-core-gray-700-rgb | Main text color |
| `$color-semantic-success-rgb` | $color-core-success-rgb | Success indicators |
| `$color-semantic-error-rgb` | $color-core-error-rgb | Error indicators |
| `$color-semantic-wg-primary-rgb` | $color-core-wg-primary-rgb | Workout Generator primary |

## CSS Variables

These variables expose semantic tokens as CSS custom properties.

| CSS Variable | Based On | Example |
|--------------|----------|---------|
| `--color-primary` | $color-semantic-primary-rgb | `color: var(--color-primary)` |
| `--color-accent` | $color-semantic-accent-rgb | `background: var(--color-accent)` |
| `--color-surface` | $color-semantic-surface-rgb | `background: var(--color-surface)` |
| `--color-text` | $color-semantic-text-rgb | `color: var(--color-text)` |
| `--color-success` | $color-semantic-success-rgb | `color: var(--color-success)` |
| `--color-error` | $color-semantic-error-rgb | `color: var(--color-error)` |

## Helper Functions

These functions provide the recommended way to access color tokens.

| Function | Usage | Example |
|----------|-------|---------|
| `color('primary')` | Base primary color | `color: color('primary');` |
| `color('primary', 'dark')` | Dark variant | `border-color: color('primary', 'dark');` |
| `dark-color('primary')` | Dark theme variant | `color: dark-color('primary');` |
| `wg-color('primary')` | Workout Generator specific | `color: wg-color('primary');` |

## Common Pattern Mapping

This table maps common hardcoded values to their token equivalents.

| Hardcoded Value | Token Equivalent | Context |
|-----------------|------------------|---------|
| `#1FAD9F` | `color('primary')` | Brand primary |
| `#2563EB` | `wg-color('primary')` | Workout Generator blue |
| `#333333` | `color('text')` | Dark text |
| `#2BAE66` | `color('success')` | Success state |
| `#D94E4E` | `color('error')` | Error state |
| `rgba(31, 173, 159, 0.1)` | `rgba(var(--color-primary-rgb), 0.1)` | Primary with opacity |

## Usage Guidelines

### In SCSS Files

```scss
// RECOMMENDED
.element {
  color: color('primary');
  background-color: color('surface');
  border: 1px solid color('border');
  
  &:hover {
    background-color: color('primary', 'light');
  }
  
  .dark-theme & {
    color: dark-color('primary');
    background-color: dark-color('surface');
  }
}

// NOT RECOMMENDED
.element {
  color: #1FAD9F;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
}
```

### In React Components (CSS-in-JS)

```tsx
// RECOMMENDED
<div style={{ 
  color: 'var(--color-primary)', 
  backgroundColor: 'var(--color-surface)' 
}}>

// For opacity variants
<div style={{ 
  backgroundColor: 'rgba(var(--color-primary-rgb), 0.1)' 
}}>

// NOT RECOMMENDED
<div style={{ 
  color: '#1FAD9F', 
  backgroundColor: '#FFFFFF' 
}}>
```

### In Tailwind

```tsx
// RECOMMENDED
<div className="text-[var(--color-primary)] bg-[var(--color-surface)]">

// NOT RECOMMENDED
<div className="text-teal-500 bg-white">
```

## Feature-Specific Tokens

When working with the Workout Generator feature, use these specialized tokens:

```scss
// Feature-specific colors
.workout-generator-element {
  color: wg-color('primary');
  background-color: wg-color('card', 'goal-bg');
  border: 1px solid wg-color('border');
}
```

## Dark Theme Implementation

Dark theme colors are automatically applied when the `.dark-theme` class is present on an ancestor element.

```scss
// Automatic dark theme handling
.element {
  color: color('text');
  background-color: color('surface');
}

// Manual dark theme overrides (use sparingly)
.dark-theme .element {
  color: dark-color('text');
  background-color: dark-color('surface');
}
``` 