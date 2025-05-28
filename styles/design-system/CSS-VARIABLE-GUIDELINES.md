# CSS Variable Guidelines

This document outlines the standardized approach for CSS variable implementation in the FitCopilot design system.

## Core Principles

1. **Maximum 2 Levels of Nesting**: Limit CSS variable references to at most 2 levels deep.
2. **Clear Naming Convention**: Use descriptive, consistent variable names.
3. **Fallback Values**: Always include fallbacks for critical properties.
4. **Theme Implementation**: Use data-theme attribute for theme variations.
5. **Flattened Inheritance**: Prefer flat structure over deeply nested references.

## Naming Convention

### Format: `--[scope]-[element]-[property]-[variant]`

- **scope**: Component or feature name (e.g., `button`, `hero`)
- **element**: Specific part of component (e.g., `icon`, `text`) - optional
- **property**: CSS property or purpose (e.g., `radius`, `padding-x`)
- **variant**: Specific variation (e.g., `primary`, `hover`) - optional

### Examples:
```scss
--button-radius: 0.5rem;
--hero-button-padding-x: 1.5rem;
--hero-button-primary-border: rgba(34, 197, 94, 0.45);
--hero-button-primary-border-hover: rgba(74, 222, 128, 0.6);
```

## Variable Structure Hierarchy

### 1. Base Design Tokens
```scss
/* In radii.scss */
:root {
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-full: 9999px;
}

/* In spacing.scss */
:root {
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  /* etc. */
}
```

### 2. Component Base Tokens
```scss
/* In component-tokens.scss */
:root {
  --button-padding-x: var(--spacing-md, 1rem);
  --button-padding-y: var(--spacing-sm, 0.75rem);
  --button-border-radius: var(--radius-md, 0.5rem);
}
```

### 3. Specialized Component Tokens
```scss
/* In component-tokens.scss */
:root {
  --hero-button-padding-x: var(--button-padding-x);
  --hero-button-padding-y: var(--button-padding-y);
  --hero-button-radius: var(--radius-full, 9999px);
}
```

## Theme Implementation

### Theme Variable Overrides

Use direct data-theme selectors with scoped variables:

```scss
/* In component stylesheet (e.g., HeroButton.scss) */
[data-theme="gym"] {
  .hero-button-primary {
    --hero-button-primary-border: rgba(168, 85, 247, 0.45);
    --hero-button-gradient-from: var(--color-violet-500, #8b5cf6);
  }
}
```

### Usage in Components

Apply themes using the data-theme attribute:

```jsx
<div data-theme="gym">
  <HeroButton variant="primary">Gym Theme Button</HeroButton>
</div>
```

## Variable Inheritance Guidelines

### ✅ Do This

```scss
/* Base tokens */
--button-padding-x: var(--spacing-md, 1rem);

/* Component tokens with single level inheritance */
--hero-button-padding-x: var(--button-padding-x);
```

### ❌ Avoid This

```scss
/* Too many levels of nesting */
--hero-button-padding-x: var(--button-padding-x, var(--spacing-md, var(--base-spacing, 1rem)));

/* Redefining without reference */
--hero-button-padding-x: 1.5rem; /* Loses connection to design system */
```

## Implementation Examples

### Good Implementation

```scss
/* In component-tokens.scss */
:root {
  /* Button base tokens */
  --button-radius: var(--radius-md, 0.375rem);
  
  /* Component-specific tokens */
  --hero-button-radius: var(--radius-full, 9999px);
  
  /* Theme-specific default tokens */
  --hero-button-primary-border: rgba(34, 197, 94, 0.45);
}

/* In component stylesheet */
.hero-button {
  border-radius: var(--hero-button-radius);
}

/* Theme overrides */
[data-theme="gym"] {
  .hero-button-primary {
    --hero-button-primary-border: rgba(168, 85, 247, 0.45);
  }
}
```

## Fallback Strategy

Always include fallbacks for critical properties:

```scss
/* In variables */
--hero-button-radius: var(--radius-full, 9999px);

/* In usage */
border-radius: var(--hero-button-radius, 9999px);
```

## Documentation Requirements

When creating or updating component CSS variables:

1. Document all variables in component-tokens.scss with comments
2. Create a variables map in component documentation
3. Include examples for theme overrides
4. Explain any complex inheritance patterns

Following these guidelines ensures a consistent, maintainable, and scalable CSS variable system across the FitCopilot design system. 