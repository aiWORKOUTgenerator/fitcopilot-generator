# Color Token System

This directory contains the color token system for the FitCopilot design system. The token system is designed to provide a consistent, maintainable, and accessible color palette for the entire application.

## Architecture

The color token system is organized in layers:

1. **Core Tokens** - The foundational color values
2. **Semantic Tokens** - Contextual meaning applied to core tokens
3. **Component Tokens** - Component-specific color applications

## Directory Structure

```
tokens/
├── core/                  # Core foundational tokens
│   ├── _colors.scss       # Base color palette
│   ├── _typography.scss   # Typography tokens
│   └── _spacing.scss      # Spacing tokens
├── semantic/              # Semantic meaning tokens
│   ├── _feedback.scss     # Success, error, warning, info
│   └── _surfaces.scss     # Surfaces, cards, panels
├── components/            # Component-specific tokens
│   ├── _button-tokens.scss
│   ├── _input-tokens.scss
│   └── ...
├── _color-variables.scss  # CSS custom properties
├── _color-maps.scss       # Color access maps and functions
├── _color-mixins.scss     # Color application patterns
└── index.scss             # Main entry point
```

## Color Scale System

Our color system uses a consistent numbering scheme:

- **50-100**: Lightest shades, typically used for backgrounds
- **200-400**: Light to mid-range shades
- **500**: Base color (default)
- **600-700**: Slightly darker shades, often for hover/active states
- **800-900**: Darkest shades, typically for text

For example, `$color-primary-500` is our main primary color, while `$color-primary-50` is the lightest shade of primary, suitable for subtle backgrounds.

## Usage Guidelines

### Using Color Tokens

#### SCSS Variables

```scss
// Core colors
.my-element {
  color: $color-primary-500;
  background-color: $color-gray-100;
}

// Semantic colors (recommended)
.my-element {
  color: $color-text;
  background-color: $color-surface-accent;
}
```

#### CSS Custom Properties

```scss
.my-element {
  color: var(--color-primary);
  background-color: var(--color-surface-accent);
}
```

### Using Color Functions

```scss
// Get a color from the palette
.my-element {
  color: color('primary', '600');
  background-color: color('gray', '50');
}

// Get a specific primary shade
.my-element {
  color: primary('600');
  background-color: primary('50');
}

// Get a semantic color
.my-element {
  color: semantic-color('text');
  background-color: semantic-color('surface');
}
```

### Using Color Mixins

```scss
.my-element {
  @include text-primary('600');
  @include bg-gray('50');
}

// For feedback elements
.alert-success {
  @include alert-variant('success');
}

// For buttons
.button-primary {
  @include button-color-variant('primary');
}

.button-outline {
  @include button-color-variant('primary', true);
}
```

## Accessibility

All color combinations in the system have been tested for accessibility according to WCAG 2.1 AA standards:

- Text on backgrounds should have a minimum contrast ratio of 4.5:1
- Large text (18pt+) on backgrounds should have a minimum contrast ratio of 3:1
- UI elements and graphical objects should have a minimum contrast ratio of 3:1

Run the color analyzer (`scripts/color-analyzer.js`) to get an accessibility report.

## Adding New Colors

When adding new colors to the system:

1. Add the base color scale to `core/_colors.scss`
2. Add semantic tokens in the appropriate semantic file
3. Add CSS variables in `_color-variables.scss`
4. Update color maps in `_color-maps.scss`
5. Run the color analyzer to check for duplicates and accessibility issues

## Best Practices

1. **Always use tokens** - Never use raw color values
2. **Prefer semantic tokens** - Use semantic tokens instead of core tokens when possible
3. **Keep a limited palette** - Avoid introducing unnecessary new colors
4. **Document purpose** - Comment the intended usage of any new color tokens
5. **Test accessibility** - Verify color combinations meet contrast requirements

## Theme Support

The color system supports both light and dark themes:

```scss
// Light theme (default)
.element {
  color: var(--color-text);
  background-color: var(--color-surface);
}

// Dark theme
.dark-theme .element {
  color: var(--color-dark-text);
  background-color: var(--color-dark-surface);
}
```

## Tools

- `scripts/color-analyzer.js` - Analyzes color usage and identifies issues
- `scripts/generate-color-docs.js` - Generates color documentation

## Migration

When migrating from the old color system:

1. Use the compatibility layer in `_compatibility.scss`
2. Replace old token references with new tokens
3. Use the color analyzer to identify direct color usage 