# Design System

The FitCopilot Generator Design System implements a modern, responsive interface with theme support (light/dark modes) and consistent styling across all components. The system follows a feature-first approach with strongly typed components and adheres to accessibility standards.

## Overview

This documentation provides comprehensive information about the FitCopilot design system, including:

- [Color System](./colors.md) - Color palette and theme variables
- [Typography](./typography.md) - Font families, scale, and text styles
- [Spacing](./spacing.md) - Whitespace and layout guidelines
- [Components](./components.md) - Component library styling
- [Animations](./animations.md) - Motion design patterns
- [Responsive Design](./responsive.md) - Breakpoints and adaptation guidelines
- [Dark Theme](./dark-theme.md) - Dark mode implementation

## Core Principles

The FitCopilot design system is built on the following principles:

1. **Consistency** - Unified visual language across all user interfaces
2. **Accessibility** - WCAG 2.1 AA compliant throughout the application
3. **Flexibility** - Theme support and responsive layouts for all devices
4. **Performance** - Optimized assets and minimal CSS footprint
5. **Developer Experience** - Well-documented, reusable patterns

## Implementation

The design system is implemented using Sass with a modular architecture. Variables are defined as CSS custom properties (CSS variables) to facilitate theming and dynamic updates.

## Getting Started

To implement components following the design system:

1. Import the design system styles:
   ```scss
   @use 'src/styles/design-system' as *;
   ```

2. Use the provided variables and mixins:
   ```scss
   .my-component {
     color: var(--text-primary);
     padding: var(--space-md);
     transition: all var(--transition-normal) var(--ease-in-out);
   }
   ```

3. Follow the [Components](./components.md) documentation for specific component implementation guidelines.

## Further Reading

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [MDN Web Docs: CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Sass Documentation](https://sass-lang.com/documentation/) 