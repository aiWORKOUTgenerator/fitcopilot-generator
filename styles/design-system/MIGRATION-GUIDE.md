# Migration Guide: Enhanced Color System & Section Component

This guide helps you migrate existing components to use the new standardized color system and Section component.

## Overview of Changes

1. **Enhanced Color System**
   - Replaced direct color values with semantic CSS variables
   - Added theme variant support through data-theme attributes
   - Created utilities for background patterns and gradients

2. **Section Component**
   - Standardized section structure across the app
   - Consistent spacing, container widths, and theming
   - Support for seamless connections between sections

3. **GlobalBackground Component**
   - Adds a theme-aware consistent background for the whole application

## Step 1: Migrating Basic Sections

**BEFORE:**
```jsx
<section className="my-section bg-gray-900 py-16">
  <div className="container mx-auto px-4">
    <h2 className="text-white text-3xl font-bold">Section Title</h2>
    <p className="text-gray-300">Section content goes here</p>
  </div>
</section>
```

**AFTER:**
```jsx
import { Section } from 'components/shared';

<Section 
  className="my-section"
  backgroundColor="primary"
  spacing="md"
  containerSize="xl"
>
  <h2 className="text-3xl font-bold">Section Title</h2>
  <p className="text-text-secondary">Section content goes here</p>
</Section>
```

## Step 2: Update Color References

**BEFORE:**
```jsx
<div className="bg-gray-800 text-white border border-gray-700">
  Content goes here
</div>
```

**AFTER:**
```jsx
<div className="bg-surface-primary text-text-primary border border-border-light">
  Content goes here
</div>
```

## Step 3: Add Theme Support

**BEFORE:**
```jsx
// No theme support
<div className="my-component bg-[#10132B]">
  Hardcoded color values
</div>
```

**AFTER:**
```jsx
// Using variant prop
<Section variant="gym" backgroundColor="primary">
  Theme-aware colors
</Section>

// Or using data-theme attribute
<div className="my-component" data-theme="gym">
  Theme-aware colors
</div>

// Or using Tailwind utility
<div className="my-component theme-gym">
  Theme-aware colors
</div>
```

## Step 4: Using Background Patterns

**BEFORE:**
```jsx
<section className="relative">
  {/* Custom grid pattern implementation */}
  <div className="absolute inset-0 bg-grid z-0 opacity-5"></div>
  <div className="relative z-10">Content</div>
</section>
```

**AFTER:**
```jsx
<Section backgroundVariant="grid">
  Content automatically gets proper z-index
</Section>
```

## Step 5: Implementing Seamless Sections

**BEFORE:**
```jsx
<section className="bg-gray-900 pb-32">
  First section
</section>
<section className="bg-gray-900 mt-[-64px] pt-0">
  Second section with manual negative margin
</section>
```

**AFTER:**
```jsx
<Section backgroundColor="primary" spacing="lg">
  First section
</Section>
<Section backgroundColor="primary" spacing="lg" seamless>
  Second section (automatically connected)
</Section>
```

## Step 6: Using GlobalBackground

**BEFORE:**
```jsx
// Manual background definition in multiple places
<div className="app-container">
  <div className="global-background"></div>
  {/* App content */}
</div>
```

**AFTER:**
```jsx
import { GlobalBackground } from 'components/shared';

// In your app root
<div className="app-container">
  <GlobalBackground variant="sports" pattern="grid" />
  {/* App content */}
</div>
```

## Component-Specific Migration Notes

### Features Component

```jsx
// Before
<section className="features-section py-20 bg-gray-900">
  {/* ... */}
</section>

// After
<Section 
  backgroundColor="primary"
  backgroundVariant="grid"
  spacing="lg"
  className="features-section"
>
  {/* ... */}
</Section>
```

### Journey Component

```jsx
// Before
<section className="journey-section py-24 bg-[#0B1121]">
  {/* ... */}
</section>

// After
<Section
  backgroundColor="secondary"
  backgroundVariant="grid"
  spacing="lg"
  seamless={true}
  className="journey-section"
>
  {/* ... */}
</Section>
```

### Pricing Component

```jsx
// Before
<section className="pricing-section py-24 bg-[#070D1A]">
  {/* ... */}
</section>

// After
<Section
  backgroundColor="primary"
  spacing="lg"
  className="pricing-section"
>
  {/* ... */}
</Section>
```

## Best Practices

1. **Always use semantic color tokens** - Never use raw color values
2. **Leverage the Section component** - Don't create manual section containers
3. **Test all theme variants** - Ensure your components look good with all themes
4. **Use the right background variant** - Choose the appropriate visual style
5. **Follow container sizing** - Use the right container width for your content
6. **Maintain proper spacing** - Use standard spacing options

## Common Issues

### Theme Not Applying Correctly

Make sure:
- You're using semantic color variables (not raw colors)
- The data-theme attribute is on the correct element
- The component inherits theme variables properly

### Section Spacing Issues

If you see incorrect spacing:
- Check if seamless={true} is applied
- Verify the spacing prop value
- Look for conflicting margin/padding

### Background Patterns Missing

If background patterns aren't visible:
- Verify backgroundVariant is set correctly
- Check the z-index of your content is not too low
- Ensure the pattern opacity isn't being overridden

## Need Help?

Consult:
- [Section Component Docs](../../components/shared/README.md)
- [Color System Documentation](./COLOR-SYSTEM.md)
- [Design System README](./README.md)

## Gradient Token System

### Overview

A new multi-layered gradient token system has been implemented to improve maintainability, consistency, and theme switching capabilities. This system replaces hard-coded gradient values with a token-based approach that integrates with the color system.

### Token Architecture

The gradient token system consists of three layers:

1. **Base Gradient Primitives** - Raw color combinations defined as SCSS maps with start/end colors
2. **Component-Specific Semantic Tokens** - Contextual application of gradients for specific components
3. **Utility Functions/Mixins** - Helper functions to retrieve and apply gradients consistently

### Example Usage

**Before:**
```scss
.my-button {
  background: linear-gradient(90deg, rgba(132, 204, 22, 1) 0%, rgba(16, 185, 129, 1) 100%);
  box-shadow: 0 0 20px 0 rgba(204, 255, 0, 0.3);
  
  &:hover {
    background: linear-gradient(90deg, rgba(163, 230, 53, 1) 0%, rgba(20, 184, 166, 1) 100%);
    box-shadow: 0 0 25px 0 rgba(204, 255, 0, 0.4);
  }
}
```

**After:**
```scss
.my-button {
  @include gradient-button('journey', 'default');
}
```

### Implementation Steps

1. Import gradient tokens:
   ```scss
   @import "../../styles/design-system/index.scss";
   ```

2. Use the gradient mixin for your components:
   ```scss
   .my-element {
     @include gradient-button('component-name', 'variant');
   }
   ```

3. For opacity variants of colors, use the new utility mixin:
   ```scss
   @include create-accent-color-variants('color-lime-500', 'my-accent-lime');
   ```

### Advantages

- **Semantic Naming**: Gradients are now named by their purpose, not just colors
- **Theme Integration**: Gradients automatically adapt to theme variants
- **Consistency**: Ensures the same gradient values are used across components
- **Maintainability**: Change a gradient once, update everywhere
- **Performance**: Reduces CSS duplication 