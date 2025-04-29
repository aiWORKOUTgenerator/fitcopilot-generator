# Design System Token Mapping

This document maps the old token system to the new design system tokens to help with the migration process.

## Color Tokens

### Primary Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$primary-color` | `$color-primary-500` | `#84cc16` |
| `$primary-color-light` | `$color-primary-400` | `#a3e635` |
| `$primary-color-lighter` | `$color-primary-300` | `#bef264` |
| `$primary-color-lightest` | `$color-primary-100` | `#ecfccb` |
| `$primary-color-dark` | `$color-primary-600` | `#65a30d` |
| `$primary-color-darker` | `$color-primary-700` | `#4d7c0f` |
| `$primary-color-darkest` | `$color-primary-900` | `#365314` |

### Secondary Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$secondary-color` | `$color-secondary-500` | `#06b6d4` |
| `$secondary-color-light` | `$color-secondary-400` | `#22d3ee` |
| `$secondary-color-lighter` | `$color-secondary-300` | `#67e8f9` |
| `$secondary-color-lightest` | `$color-secondary-100` | `#cffafe` |
| `$secondary-color-dark` | `$color-secondary-600` | `#0891b2` |
| `$secondary-color-darker` | `$color-secondary-700` | `#0e7490` |
| `$secondary-color-darkest` | `$color-secondary-900` | `#164e63` |

### Feedback Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$success-color` | `$color-success-500` | `#22c55e` |
| `$error-color` | `$color-error-500` | `#ef4444` |
| `$warning-color` | `$color-warning-500` | `#f59e0b` |
| `$info-color` | `$color-info-500` | `#3b82f6` |

### Text Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$text-color` | `$color-gray-800` | `#1e293b` |
| `$text-color-light` | `$color-gray-600` | `#475569` |
| `$text-color-lighter` | `$color-gray-500` | `#64748b` |
| `$text-color-lightest` | `$color-gray-400` | `#94a3b8` |
| `$text-color-dark` | `$color-gray-900` | `#0f172a` |

### Background Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$bg-color` | `$color-white` | `#ffffff` |
| `$bg-color-light` | `$color-gray-50` | `#f8fafc` |
| `$bg-color-dark` | `$color-gray-100` | `#f1f5f9` |
| `$bg-color-darker` | `$color-gray-200` | `#e2e8f0` |

### Border Colors

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$border-color` | `$color-gray-200` | `#e2e8f0` |
| `$border-color-light` | `$color-gray-100` | `#f1f5f9` |
| `$border-color-dark` | `$color-gray-300` | `#cbd5e1` |

## Typography Tokens

### Font Families

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$font-family` | `$font-family-sans` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` |
| `$font-family-mono` | `$font-family-mono` | `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace` |

### Font Sizes

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$font-size-xs` | `$font-size-xs` | `0.75rem` (12px) |
| `$font-size-sm` | `$font-size-sm` | `0.875rem` (14px) |
| `$font-size-base` | `$font-size-md` | `1rem` (16px) |
| `$font-size-md` | `$font-size-md` | `1rem` (16px) |
| `$font-size-lg` | `$font-size-lg` | `1.125rem` (18px) |
| `$font-size-xl` | `$font-size-xl` | `1.25rem` (20px) |
| `$font-size-2xl` | `$font-size-2xl` | `1.5rem` (24px) |
| `$font-size-3xl` | `$font-size-3xl` | `1.875rem` (30px) |
| `$font-size-4xl` | `$font-size-4xl` | `2.25rem` (36px) |

### Font Weights

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$font-weight-thin` | `$font-weight-thin` | `100` |
| `$font-weight-light` | `$font-weight-light` | `300` |
| `$font-weight-normal` | `$font-weight-normal` | `400` |
| `$font-weight-medium` | `$font-weight-medium` | `500` |
| `$font-weight-semibold` | `$font-weight-semibold` | `600` |
| `$font-weight-bold` | `$font-weight-bold` | `700` |
| `$font-weight-extrabold` | `$font-weight-extrabold` | `800` |
| `$font-weight-black` | `$font-weight-black` | `900` |

### Line Heights

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$line-height-none` | `$line-height-none` | `1` |
| `$line-height-tight` | `$line-height-tight` | `1.25` |
| `$line-height-normal` | `$line-height-normal` | `1.5` |
| `$line-height-relaxed` | `$line-height-relaxed` | `1.625` |
| `$line-height-loose` | `$line-height-loose` | `2` |

## Spacing Tokens

| Old Token | New Token | Value |
|-----------|-----------|-------|
| `$spacing-none` | `$spacing-0` | `0` |
| `$spacing-xs` | `$spacing-1` | `0.25rem` (4px) |
| `$spacing-sm` | `$spacing-2` | `0.5rem` (8px) |
| `$spacing-md` | `$spacing-4` | `1rem` (16px) |
| `$spacing-lg` | `$spacing-6` | `1.5rem` (24px) |
| `$spacing-xl` | `$spacing-8` | `2rem` (32px) |
| `$spacing-2xl` | `$spacing-10` | `2.5rem` (40px) |
| `$spacing-3xl` | `$spacing-12` | `3rem` (48px) |
| `$spacing-4xl` | `$spacing-16` | `4rem` (64px) |

## CSS Variables

| Old CSS Variable | New CSS Variable | Fallback Value |
|------------------|------------------|---------------|
| `--primary-color` | `--color-primary` | `#84cc16` |
| `--primary-color-light` | `--color-primary-light` | `#a3e635` |
| `--primary-color-dark` | `--color-primary-dark` | `#65a30d` |
| `--secondary-color` | `--color-secondary` | `#06b6d4` |
| `--text-color` | `--color-text` | `#1e293b` |
| `--text-color-light` | `--color-text-muted` | `#475569` |
| `--border-color` | `--color-border` | `#e2e8f0` |
| `--bg-color` | `--color-surface` | `#ffffff` |
| `--bg-color-light` | `--color-surface-accent` | `#f8fafc` |

## Migration Guide

### Sass Variables

When migrating from the old token system to the new one:

1. Replace direct color values with token variables:
   ```scss
   // Before
   .element {
     color: #84cc16;
   }
   
   // After
   .element {
     color: $color-primary-500;
   }
   ```

2. Replace old token variables with new ones:
   ```scss
   // Before
   .element {
     color: $primary-color;
   }
   
   // After
   .element {
     color: $color-primary-500;
   }
   ```

### CSS Variables

For components using CSS variables:

1. Replace old variable names with new ones:
   ```scss
   // Before
   .element {
     color: var(--primary-color);
   }
   
   // After
   .element {
     color: var(--color-primary);
   }
   ```

### Temporary Compatibility

During the migration period, both old and new token names will work due to the compatibility layer. However, we recommend using the new token names directly for new code. 