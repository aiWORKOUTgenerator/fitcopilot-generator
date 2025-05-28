# FitCopilot Design System

This directory contains the core design system components, tokens, and utilities for the FitCopilot theme.

## Enhanced Color System

### Overview

The enhanced color system provides a standardized approach to colors throughout the application with:

1. **Semantic naming:** Colors are named by their purpose, not their appearance
2. **Theme variant support:** Colors automatically adapt to theme changes
3. **Consistent application:** Standardized utilities for applying colors
4. **Hierarchical structure:** Base colors → semantic colors → component-specific colors

### Usage

#### CSS Variables

The color system is built on CSS custom properties (variables):

```scss
// Base color reference
.my-component {
  background-color: var(--color-background-primary);
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}
```

#### Tailwind Classes

Utility classes are available for common color uses:

```html
<div class="bg-background-primary text-text-primary border-border-light">
  <!-- Content -->
</div>
```

#### Theme Variants

Themes can be applied at the body level:

```html
<!-- Default theme -->
<body>...</body>

<!-- Gym theme -->
<body data-theme="gym">...</body>

<!-- Sports theme -->
<body data-theme="sports">...</body>

<!-- Wellness theme -->
<body data-theme="wellness">...</body>
```

Or at the component level:

```html
<section class="section-component" data-theme="gym">
  <!-- Content with gym theme colors -->
</section>
```

### Available Color Tokens

#### Background Colors

| Token | Purpose |
|-------|---------|
| `--color-background-primary` | Main background (darkest) |
| `--color-background-secondary` | Secondary background (medium) |
| `--color-background-tertiary` | Tertiary background (lightest) |

#### Surface Colors

| Token | Purpose |
|-------|---------|
| `--color-surface-primary` | Card and element backgrounds |
| `--color-surface-secondary` | Alternative surface with transparency |

#### Text Colors

| Token | Purpose |
|-------|---------|
| `--color-text-primary` | Main text color |
| `--color-text-secondary` | Secondary/supporting text |
| `--color-text-accent` | Accent/highlighted text |

#### Border Colors

| Token | Purpose |
|-------|---------|
| `--color-border-light` | Light borders (subtle) |
| `--color-border-medium` | Medium borders (more visible) |

#### Overlay Colors

| Token | Purpose |
|-------|---------|
| `--color-overlay-light` | Light overlays (subtle darkening) |
| `--color-overlay-medium` | Medium overlays (moderate darkening) |
| `--color-overlay-dark` | Dark overlays (significant darkening) |

#### Special Purpose

| Token | Purpose |
|-------|---------|
| `--color-grid-pattern` | Color for grid patterns |

## Section Component

The Section component provides a standardized way to create page sections with consistent styling, spacing, and theme support.

### Basic Usage

```tsx
import { Section } from 'components/shared';

<Section 
  id="features"
  backgroundColor="primary"
  backgroundVariant="grid"
  spacing="lg"
  variant="gym"
>
  <h2>Section Content</h2>
  {/* ... */}
</Section>
```

See [Section Component Documentation](../../components/shared/README.md) for complete details.

## GlobalBackground Component

The GlobalBackground component provides a consistent, theme-aware background for the entire application.

### Basic Usage

```tsx
import { GlobalBackground } from 'components/shared';

// In your app's root component
<div className="app">
  <GlobalBackground variant="sports" pattern="grid" />
  {/* App content */}
</div>
```

## Design Principles

1. **Consistency First:** Use the standard components and tokens for consistent UI
2. **Theme Adaptability:** All visual elements should adapt to theme changes
3. **Semantic Naming:** Name by purpose, not appearance
4. **Composition Over Inheritance:** Combine small, focused components
5. **Responsive By Default:** All components should work across device sizes

## Contribution Guidelines

1. Never use raw color values - always reference tokens
2. Extend the system with new tokens when needed - don't create one-offs
3. Test new components with all theme variants
4. Ensure all components are responsive
5. Document new additions to the design system

## References

- [Color System Architecture](./COLOR-SYSTEM.md)
- [Component Tokens](./component-tokens.scss)
- [Spacing System](./spacing.md)

## Token Usage Guidelines

This document outlines the design token system for the FitCopilot theme, including naming conventions, usage patterns, and best practices.

## Token Categories

Our design tokens are organized into the following categories:

### 1. Colors (`_colors.scss`)
```scss
// Base colors
--color-primary: #8b5cf6;
--color-primary-light: #c4b5fd;
--color-primary-dark: #6d28d9;

// Text colors
--color-text: #f9fafb;
--color-text-inverse: #ffffff;
--color-text-muted: #9ca3af;

// Background colors
--color-background: #111827;
--color-background-light: #1f2937;
--color-background-dark: #0f172a;
```

### 2. Typography (`_typography.scss`)
```scss
// Font families
--font-family-sans: 'Inter', system-ui, sans-serif;

// Font sizes
--type-small: 0.875rem;
--type-base: 1rem;
--type-lg: 1.125rem;
--type-h1: clamp(2.5rem, 5vw, 3.5rem);

// Line heights
--line-height-tight: 1.2;
--line-height-normal: 1.6;
```

### 3. Shadows (`_shadows.scss`)
```scss
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 15px 35px rgba(0, 0, 0, 0.2);
--shadow-focus-ring: 0 0 0 2px #fff, 0 0 0 4px var(--color-primary);
```

### 4. Transitions (`_transitions.scss`)
```scss
--transition-fast: 150ms ease;
--transition-standard: all 0.2s ease;
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 5. Component-Specific (`_component-tokens.scss`)
```scss
// Tooltip
--size-tooltip-arrow: 12px;

// Button
--size-btn-sm: 36px;
--size-btn-md: 44px;
--size-btn-lg: 52px;

// Hero
--size-hero-min-height: 80vh;
--size-hero-content-width: 50%;
--size-hero-image-width: 45%;
--size-hero-grid-pattern: 20px;
--duration-hero-float-base: 6s;
--shadow-hero-button-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
```

## New Hero Component Tokens

We have implemented a comprehensive set of design tokens for the Hero component, achieving high compliance with our design system. These tokens are organized into logical categories:

### Hero Sizing & Layout
```scss
--size-hero-min-height: 80vh;
--size-hero-content-width: 50%;
--size-content-max-sm: 600px;
--size-hero-image-width: 45%;
--size-hero-image-max-width: 700px;
--size-hero-image-max-width-mobile: 500px;
--size-hero-grid-pattern: 20px;
--size-hero-tooltip-width: 260px;
--size-hero-button-min-width: 210px;
--size-hero-tooltip-margin-right: 8px;
--size-hero-tooltip-margin-top: 2px;
--size-hero-gap-buttons: 1.5rem;
--size-hero-margin-buttons: 2rem;
--size-hero-margin-feature-pills: 2.5rem;
--size-hero-button-padding: 1rem 2rem;
--size-hero-tooltip-transform-y: 10px;
--size-hero-breakpoint-mobile: 992px;
--size-hero-border-width-primary: 1px;
--size-hero-border-width-secondary: 2px;
--size-hero-backdrop-blur: 10px;
--size-hero-image-center-translate: -50%;
--pos-hero-bg-x: center;
--pos-hero-bg-y: center;
--size-hero-gradient-x: 200%;
--size-hero-gradient-y: 200%;
```

### Hero Animations & Transitions
```scss
--duration-hero-float-base: 6s;
--duration-hero-float-odd: 8s;
--duration-hero-float-even: 10s;
--duration-hero-gradient: 8s;
--duration-hero-button-transition: 0.3s;
--duration-hero-pulse: 3s;
--duration-hero-animation-delay: 1s;
--ease-hero-gradient: ease;
--scale-hero-icon-hover: 1.1;
--scale-hero-button-hover-y: -4px;
--angle-hero-gradient: 90deg;
--angle-hero-float-rotate: 5deg;
--pos-hero-gradient-start: 0% 50%;
--pos-hero-gradient-mid: 100% 50%;
--pos-hero-gradient-end: 0% 50%;
```

### Hero Colors & Opacity
```scss
--color-hero-button-primary-text: #0f172a;
--color-hero-signin-text: rgba(255, 255, 255, 0.6);
--color-hero-feature-pill-bg: rgba(15, 23, 42, 0.5);
--color-hero-feature-pill-border: rgba(31, 41, 55, 0.5);
--color-hero-tooltip-title: #a3e635;
--color-hero-button-secondary-bg: rgba(15, 23, 42, 0.8);
--color-hero-button-secondary-border: rgba(163, 230, 53, 0.3);
--color-hero-button-secondary-hover-bg: rgba(163, 230, 53, 0.1);
--opacity-hero-floating-icon: 0.5;
--opacity-hero-tooltip-border: 0.3;
--opacity-hero-icon: 0.6;
--opacity-hero-citron-pulse-min: 0.8;
--opacity-hero-tooltip-hidden: 0;
--opacity-hero-tooltip-visible: 1;
--opacity-hero-icon-hover: 1;
```

### Hero Typography
```scss
--type-hero-tooltip-title: 14px;
--type-hero-signin: 0.875rem;
--weight-hero-button: 700;
--weight-hero-tooltip-title: 500;
--weight-hero-citron-text: 600;
```

### Hero Shadows
```scss
--shadow-hero-button-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
--shadow-hero-secondary-button-hover: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
--shadow-hero-optimized: 0 10px 15px -5px rgba(0, 0, 0, 0.3);
--shadow-hero-optimized-hover: 0 20px 30px -10px rgba(0, 0, 0, 0.4);
--shadow-hero-citron-text: 0 0 6px rgba(163, 230, 53, 0.4);
--shadow-hero-no-shadow: 0 0 0 rgba(var(--color-lime-rgb), 0);
```

## Usage Guidelines

### Do's and Don'ts

✅ **DO**:
- Use token variables for all colors, spacing, shadows, and typography
- Follow the established naming pattern: `--category-name-variant`
- Group related tokens together in component-specific sections
- Document any new tokens added to the system

❌ **DON'T**:
- Use hardcoded values for colors, spacing, typography, or shadows
- Create one-off variables for specific use cases
- Duplicate existing token values with new names

### Using Tokens in SCSS

```scss
.component {
  // Use color tokens
  color: var(--color-text);
  background-color: var(--color-background);
  
  // Use spacing tokens
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-8);
  
  // Use typography tokens
  font-size: var(--type-base);
  line-height: var(--line-height-normal);
  
  // Use shadow tokens
  box-shadow: var(--shadow-md);
  
  // Use transition tokens
  transition: var(--transition-standard);
}
```

## Adding New Tokens

When adding new tokens:

1. Follow the naming convention: `--category-name-variant`
2. Place tokens in the appropriate file based on category
3. Document the new token in this README
4. Use comment blocks to group related tokens

## Enforcement

We use Stylelint to enforce token usage throughout the codebase. The linter will flag any hardcoded values that should be replaced with tokens.

See `.stylelintrc.json` for the specific rules.

## Component Examples

### Button
```scss
.button {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--type-base);
  border-radius: var(--radius-md);
  transition: var(--transition-standard);
  
  &:hover {
    background-color: var(--color-primary-dark);
    box-shadow: var(--shadow-md);
  }
}
```

### Tooltip
```scss
.tooltip {
  background-color: var(--color-tooltip-bg);
  color: var(--color-text-inverse);
  padding: var(--spacing-2);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  
  &::before {
    border-width: var(--size-tooltip-arrow);
  }
}
```

## Gradient System

The FitCopilot design system includes a comprehensive gradient token system that helps maintain consistent gradients across the application while supporting theme variants.

### Gradient Structure

Our gradient system follows a multi-layered approach:

```
src/styles/design-system/
├── tokens/
│   ├── _gradients.scss   # Base gradient tokens & component-specific mappings
```

### Base Gradient Primitives

Base gradient tokens define the raw color combinations:

```scss
$gradient-map: (
  'lime-primary': (
    start: var(--color-lime-500),
    end: var(--color-emerald-500),
    start-rgb: var(--color-lime-500-rgb),
    end-rgb: var(--color-emerald-500-rgb)
  ),
  // Other gradient primitives...
);
```

### Component-Specific Gradients

Component tokens map semantic meanings to gradient primitives:

```scss
$component-gradients: (
  'journey': (
    'default': (
      'primary': map-get($gradient-map, 'lime-primary'),
      'hover': map-get($gradient-map, 'lime-hover'),
      'glow-color': var(--color-lime-500)
    ),
    // Other variants...
  )
);
```

### Usage

Apply gradients using the `gradient-button` mixin:

```scss
.my-component {
  @include gradient-button('component-name', 'variant-name');
}
```

For opacity variants of colors:

```scss
@include create-accent-color-variants('color-name', 'css-variable-prefix');
```

### Helper Functions

- `get-gradient-token($component, $variant, $type)`: Retrieves a gradient token for a specific component/variant
- `get-gradient-color($gradient-token, $position)`: Gets the start/end color from a gradient token

See the [Migration Guide](./MIGRATION-GUIDE.md) for more details on migrating to the gradient token system. 