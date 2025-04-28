# Color System Documentation

## Overview

This document outlines the color token architecture used throughout the FitCopilot Generator plugin. We've implemented a consolidated color system that ensures consistency, accessibility, and scalable theming capabilities.

## Token Structure

Our color system has three tiers:

1. **Core Color Tokens**: Base RGB values for all colors in the system
2. **Semantic Color Tokens**: Purpose-based tokens that map to core colors
3. **Component-Specific Tokens**: Special case tokens for particular UI elements

## Core Color Palette

### Primary Colors

```scss
--color-primary-rgb: 31, 173, 159;        // Teal
--color-primary-dark-rgb: 0, 122, 145;    // Darker teal
--color-primary-light-rgb: 51, 177, 201;  // Lighter teal

--color-accent-rgb: 212, 160, 23;         // Gold
--color-accent-dark-rgb: 230, 176, 34;    // Darker gold
--color-accent-light-rgb: 255, 225, 159;  // Lighter gold
```

### Feedback Colors

```scss
--color-success-rgb: 43, 174, 102;        // Green
--color-error-rgb: 217, 78, 78;           // Red
--color-warning-rgb: 240, 173, 78;        // Orange
--color-info-rgb: 77, 171, 245;           // Blue
```

### Base UI Colors

```scss
--color-bg-rgb: 245, 247, 250;            // Light Background
--color-surface-rgb: 255, 255, 255;       // White Surface
--color-text-rgb: 51, 51, 51;             // Dark Text
--color-text-muted-rgb: 108, 117, 125;    // Muted Text
--color-border-rgb: 222, 226, 230;        // Light Border
```

### Dark Theme Colors

```scss
--color-dark-bg-rgb: 18, 18, 18;          // Deep dark background
--color-dark-surface-rgb: 30, 30, 30;     // Slightly lighter surface
--color-dark-primary-rgb: 0, 180, 216;    // Bright cyan
--color-dark-accent-rgb: 212, 255, 80;    // Vibrant lime
--color-dark-text-rgb: 243, 244, 246;     // Almost white text
```

## Workout Generator Specific Colors

The Workout Generator feature uses specific color tokens that are derived from the global system:

```scss
--color-wg-primary-rgb: 37, 99, 235;      // Blue
--color-wg-secondary-rgb: 107, 114, 128;  // Gray
--color-wg-success-rgb: 22, 163, 74;      // Green
```

## Using Color Tokens

### In SCSS Files (Legacy Approach)

```scss
// Using via SCSS variables (transitional)
.my-component {
  background-color: $wg-primary-color;
  color: $wg-secondary-color;
}
```

### Direct CSS Variables (Preferred Approach)

```scss
// Using CSS variables directly (preferred)
.my-component {
  background-color: var(--color-primary);
  color: var(--color-text);
}
```

### With Opacity/Alpha

```scss
// Using RGB values for opacity
.my-component {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.5);
}
```

## Dark Theme Support

Our color system automatically adapts to dark mode when the `.dark-theme` class is applied to a parent element:

```scss
.my-component {
  background-color: var(--color-surface);
  color: var(--color-text);
  
  .dark-theme & {
    // These will automatically use dark theme colors if available
  }
}
```

## Accessibility Guidelines

All color combinations should maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text to comply with WCAG AA standards.

## Migration Strategy

We are gradually transitioning from:
1. Hard-coded color values → SCSS variables
2. SCSS variables → CSS custom properties

During this transition, the `src/features/workout-generator/styles/_variables.scss` file maps SCSS variables to CSS custom properties to maintain backward compatibility. 