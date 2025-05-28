# FitCopilot Color System

## Color Scales

### Primary Blue
| Token | Hex | Usage |
|-------|-----|-------|
| --color-primary-50 | #ebf8ff | Very light backgrounds |
| --color-primary-100 | #bee3f8 | Light backgrounds, highlights |
| --color-primary-200 | #90cdf4 | Light elements |
| --color-primary-300 | #63b3ed | Secondary elements |
| --color-primary-400 | #4299e1 | Main UI elements |
| --color-primary-500 | #3498db | **Base color** - Primary CTAs |
| --color-primary-600 | #2980b9 | Hover states |
| --color-primary-700 | #2c5282 | Active states |
| --color-primary-800 | #2a4365 | Dark accents |
| --color-primary-900 | #1a365d | Very dark accents |

### Accent Lime (Default Theme)
| Token | Hex | Usage |
|-------|-----|-------|
| --color-accent-50 | #faffed | Very light backgrounds |
| --color-accent-100 | #f3ffcc | Light backgrounds, highlights |
| --color-accent-200 | #ebff99 | Light elements |
| --color-accent-300 | #e2ff66 | Secondary elements |
| --color-accent-400 | #ddff0e | **Base color** - Primary CTAs |
| --color-accent-500 | #b3cc0b | Hover states |
| --color-accent-600 | #849909 | Active states |
| --color-accent-700 | #566606 | Dark accents |
| --color-accent-800 | #293303 | Very dark accents |
| --color-accent-900 | #141a01 | Very dark accents |

### Grayscale
| Token | Hex | Usage |
|-------|-----|-------|
| --color-gray-50 | #f9fafb | Lightest text, backgrounds |
| --color-gray-100 | #f3f4f6 | Light backgrounds |
| --color-gray-200 | #e5e7eb | Light UI elements |
| --color-gray-300 | #d1d5db | Secondary text on dark bg |
| --color-gray-400 | #9ca3af | Muted text |
| --color-gray-500 | #6b7280 | Medium emphasis content |
| --color-gray-600 | #4b5563 | High emphasis content |
| --color-gray-700 | #374151 | UI borders on dark bg |
| --color-gray-800 | #1f2937 | Surface elements |
| --color-gray-900 | #111827 | Main background |

## Theme Variants

The color system supports multiple theme variants through CSS custom properties. Each theme overrides specific colors while inheriting the rest from the default theme.

### Gym Theme (Violet/Purple)
| Token | Hex | Usage |
|-------|-----|-------|
| --color-accent-400 | #8b5cf6 | **Base color** - Primary CTAs |
| --color-accent-500 | #7c3aed | Hover states |
| --color-accent-600 | #6d28d9 | Active states |

### Sports Theme (Blue/Cyan)
| Token | Hex | Usage |
|-------|-----|-------|
| --color-accent-400 | #38bdf8 | **Base color** - Primary CTAs |
| --color-accent-500 | #0ea5e9 | Hover states |
| --color-accent-600 | #0284c7 | Active states |

### Wellness Theme (Teal/Green)
| Token | Hex | Usage |
|-------|-----|-------|
| --color-accent-400 | #2dd4bf | **Base color** - Primary CTAs |
| --color-accent-500 | #14b8a6 | Hover states |
| --color-accent-600 | #0d9488 | Active states |

To apply a theme, add the corresponding data attribute to the HTML or body element:

```html
<!-- Default theme (no attribute needed) -->
<body>...</body>

<!-- Gym theme -->
<body data-theme="gym">...</body>

<!-- Sports theme -->
<body data-theme="sports">...</body>

<!-- Wellness theme -->
<body data-theme="wellness">...</body>
```

Themes can also be applied using Tailwind utility classes:

```html
<body class="theme-gym">...</body>
```

## Semantic Color Usage

Our semantic color system creates a layer of abstraction between the raw color values and their application in the UI:

### Brand Colors
| Token | Maps To | Purpose |
|-------|---------|---------|
| --color-brand-primary | --color-primary-500 | Main brand identity |
| --color-brand-accent | --color-accent-400 | Complementary brand color |

### UI Elements
| Token | Maps To | Purpose |
|-------|---------|---------|
| --color-ui-background | --color-gray-900 | Main app background |
| --color-ui-surface | --color-gray-800 | Card and element backgrounds |
| --color-ui-surface-alt | rgba(31, 41, 55, 0.8) | Alternative surface with transparency |
| --color-ui-border | --color-gray-700 | Borders and dividers |

### Text Colors
| Token | Maps To | Purpose |
|-------|---------|---------|
| --color-text-primary | --color-gray-50 | Main text color |
| --color-text-secondary | --color-gray-300 | Supporting text |
| --color-text-accent | --color-accent-400 | Highlighted text |
| --color-text-muted | --color-gray-400 | Less important text |
| --color-text-inverse | --color-gray-900 | Text on light backgrounds |

## Component-Specific Colors

Component-specific tokens map to our semantic system:

```scss
--color-hero-heading: var(--color-text-primary);
--color-hero-paragraph: var(--color-text-secondary);
--color-hero-highlight: var(--color-text-accent);
--color-hero-button-primary: var(--color-brand-accent);
--color-hero-button-primary-hover: var(--color-accent-500);
--color-hero-button-secondary-bg: var(--color-ui-surface-alt);
--color-hero-tooltip-bg: var(--color-ui-surface);
```

## Alpha Variants

For colors that need transparency, use the alpha variant tokens:

```scss
// Available alpha variants
--color-accent-400-alpha-10: rgba(var(--color-accent-400-rgb), 0.1);
--color-accent-400-alpha-30: rgba(var(--color-accent-400-rgb), 0.3);
--color-accent-400-alpha-50: rgba(var(--color-accent-400-rgb), 0.5);
--color-accent-400-alpha-70: rgba(var(--color-accent-400-rgb), 0.7);
```

## Tailwind Integration

The color system seamlessly integrates with Tailwind CSS:

### Using Color Tokens in Tailwind Classes

```html
<!-- Using semantic colors -->
<div class="bg-ui-surface text-text-primary border-ui-border">
  <h2 class="text-brand-accent">Heading</h2>
  <p class="text-text-secondary">Content</p>
</div>

<!-- Using color scales -->
<button class="bg-accent-400 hover:bg-accent-500 text-gray-900">
  Button
</button>

<!-- Using alpha variants -->
<div class="bg-accent-400-alpha-10 text-accent-400">
  Content with transparent background
</div>
```

### Theme Switching with Tailwind

```html
<!-- Apply the gym theme -->
<div class="theme-gym bg-ui-surface">
  <!-- All colors will automatically use the gym theme palette -->
  <button class="bg-accent-400">Purple Button</button>
</div>

<!-- Apply the wellness theme -->
<div class="theme-wellness bg-ui-surface">
  <!-- All colors will automatically use the wellness theme palette -->
  <button class="bg-accent-400">Teal Button</button>
</div>
```

## Usage Guidelines

### Do's and Don'ts

✅ **DO**:
- Use semantic color tokens whenever possible
- Use component-specific tokens for specialized needs
- Use alpha variants for transparency
- Use theme variants for different sections or components

❌ **DON'T**:
- Use raw hex values in component styles
- Create one-off colors outside the system
- Use opacity property when alpha variants are available
- Mix different theme colors in the same component

### Using Color Tokens in SCSS

```scss
.component {
  // Use semantic colors
  color: var(--color-text-primary);
  background-color: var(--color-ui-surface);
  
  // Use component-specific colors
  --component-heading: var(--color-hero-heading);
  
  // Use alpha variants for transparency
  background-color: var(--color-accent-400-alpha-10);
}
```

## Adding New Colors

When adding a new color to a component:

1. First check if an existing semantic color token fits your needs
2. If not, add component-specific tokens that map to the base system
3. Document the new token in the component's documentation
4. Never use direct hex values in component CSS

## Adding New Theme Variants

To add a new theme variant:

1. Define the theme's accent color palette in `_colors-next.scss`:
   ```scss
   [data-theme="new-theme"] {
     --color-accent-400: #your-accent-color;
     --color-accent-500: #your-hover-color;
     // ... other overrides
     
     --color-accent-400-rgb: r, g, b; // RGB values for your accent color
   }
   ```

2. Add the theme utility class to Tailwind:
   ```js
   // In tailwind.config.js
   const themeUtilities = {
     // ... existing themes
     '.theme-new-theme': { 'data-theme': 'new-theme' },
   };
   ```

3. Document the new theme in this documentation

## Color Accessibility

All color combinations in the system have been verified for WCAG 2.1 AA compliance:

- Text on backgrounds meets 4.5:1 contrast ratio minimum
- Large text (18pt+) meets 3:1 contrast ratio minimum
- UI elements and visual information meets 3:1 contrast ratio minimum

Use our contrast checking utilities to verify new combinations:

```scss
@if meets-wcag-aa($background, $text) {
  // Safe to use
} @else {
  @warn "This color combination does not meet WCAG AA standards";
}
``` 