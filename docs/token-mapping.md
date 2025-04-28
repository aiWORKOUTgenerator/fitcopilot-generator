# Color Token Usage Map

This document provides a comprehensive listing of all color tokens available in the design system, along with their corresponding hardcoded values and proper usage guidance.

## Available Tokens

### Primary Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Primary | `var(--color-primary)` | `color('primary', 'base')` | `#1fad9f` (Teal) | Main brand color, primary buttons, key UI elements |
| Primary Dark | `var(--color-primary-dark)` | `color('primary', 'dark')` | `#007a91` | Hover states for primary elements |
| Primary Light | `var(--color-primary-light)` | `color('primary', 'light')` | `#33b1c9` | Subtle backgrounds, highlights |

### Accent Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Accent | `var(--color-accent)` | `color('accent', 'base')` | `#d4a017` (Gold) | Secondary brand color, accents, highlights |
| Accent Dark | `var(--color-accent-dark)` | `color('accent', 'dark')` | `#e6b022` | Hover states for accent elements |
| Accent Light | `var(--color-accent-light)` | `color('accent', 'light')` | `#ffe19f` | Subtle backgrounds, highlights |

### Surface Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Background | `var(--color-bg)` | N/A | `#f5f7fa` | Main application background |
| Surface | `var(--color-surface)` | `color('surface', 'base')` | `#ffffff` | Cards, modals, elevated elements |
| Surface Accent | `var(--color-surface-accent)` | `color('surface', 'accent')` | `#f0f0f0` | Secondary surfaces, alternative backgrounds |
| Border | `var(--color-border)` | `color('border')` | `#dee2e6` | General borders, dividers |

### Text Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Text | `var(--color-text)` | `color('text', 'base')` | `#333333` | Main text color |
| Text Muted | `var(--color-text-muted)` | `color('text', 'muted')` | `#6c757d` | Secondary text, captions, labels |

### Feedback Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Success | `var(--color-success)` | `color('feedback', 'success')` | `#2bae66` | Success messages, positive indicators |
| Error | `var(--color-error)` | `color('feedback', 'error')` | `#d94e4e` | Error messages, negative indicators |
| Warning | `var(--color-warning)` | `color('feedback', 'warning')` | `#f0ad4e` | Warning messages, cautionary indicators |
| Info | `var(--color-info)` | `color('feedback', 'info')` | `#4dabf5` | Information messages, general indicators |

### Dark Theme Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Dark Background | `var(--color-dark-bg)` | `dark-color('bg')` | `#121212` | Main dark mode background |
| Dark Surface | `var(--color-dark-surface)` | `dark-color('surface')` | `#1e1e1e` | Cards, modals in dark mode |
| Dark Card | `var(--color-dark-card)` | `dark-color('card')` | `#1e1e1e` | Card backgrounds in dark mode |
| Dark Border | `var(--color-dark-border)` | `dark-color('border')` | `#333333` | Borders in dark mode |
| Dark Highlight | `var(--color-dark-highlight)` | `dark-color('highlight')` | `#333333` | Subtle highlights in dark mode |
| Dark Text | `var(--color-dark-text)` | `dark-color('text')` | `#f5f7fa` | Main text in dark mode |
| Dark Text Muted | `var(--color-dark-text-muted)` | `dark-color('text-muted')` | `#adb5bd` | Secondary text in dark mode |

### Dark Theme Accent Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| Dark Primary | `var(--color-dark-primary)` | `dark-color('primary')` | `#00b4d8` | Primary elements in dark mode |
| Dark Accent | `var(--color-dark-accent)` | `dark-color('accent')` | `#d4ff50` | Accent elements in dark mode |
| Dark Success | `var(--color-dark-success)` | `dark-color('feedback', 'success')` | `#06d6a0` | Success indicators in dark mode |
| Dark Error | `var(--color-dark-error)` | `dark-color('feedback', 'error')` | `#ef4444` | Error indicators in dark mode |
| Dark Warning | `var(--color-dark-warning)` | `dark-color('feedback', 'warning')` | `#fbbf24` | Warning indicators in dark mode |
| Dark Info | `var(--color-dark-info)` | `dark-color('feedback', 'info')` | `#0ea5e9` | Information indicators in dark mode |

### Workout Generator Specific Colors
| Token | CSS Variable | SCSS Function | Hardcoded Equivalent | Usage |
|-------|-------------|--------------|---------------------|-------|
| WG Primary | `var(--color-wg-primary)` | `wg-color('primary', 'base')` | `#2563eb` | Primary elements in Workout Generator |
| WG Primary Hover | `var(--color-wg-primary-hover)` | `wg-color('primary', 'hover')` | `#1d4ed8` | Hover states in Workout Generator |
| WG Secondary | `var(--color-wg-secondary)` | `wg-color('secondary', 'base')` | `#6c757d` | Secondary elements in Workout Generator |
| WG Secondary Hover | `var(--color-wg-secondary-hover)` | `wg-color('secondary', 'hover')` | `#495057` | Hover states for secondary elements |
| WG Success | `var(--color-wg-success)` | `wg-color('feedback', 'success')` | `#2bae66` | Success indicators in Workout Generator |
| WG Error | `var(--color-wg-error)` | `wg-color('feedback', 'error')` | `#d94e4e` | Error indicators in Workout Generator |

## Common Hardcoded Colors and Their Token Equivalents

| Hardcoded Value | Token Equivalent | Component Usage |
|-----------------|------------------|----------------|
| `#f5f5f5` | `var(--color-surface-accent)` | Light backgrounds, hover states |
| `#1f2937` | `var(--color-text)` | Main text |
| `#4b5563` | `var(--color-text-muted)` | Secondary text |
| `#d1d5db` | `var(--color-border)` | Borders, dividers |
| `#e5e7eb` | `var(--color-border)` (lighter) | Subtle borders |
| `#121212` | `var(--color-dark-bg)` | Dark mode background |
| `#1e1e1e` | `var(--color-dark-surface)` | Dark mode surfaces |
| `#333333` | `var(--color-dark-border)` | Dark mode borders |
| `#dedede` | `var(--color-dark-text)` | Dark mode text |
| `#ff6b6b` | `var(--color-error)` | Error states |
| `#84cc16` | `var(--color-wg-primary)` (alt) | Alternative primary |
| `#22d3ee` | `var(--color-wg-secondary)` (alt) | Alternative secondary |

## Token Access Patterns

### SCSS Pattern
```scss
// Using semantic color tokens in SCSS
.element {
  color: color('text', 'base');
  background-color: color('surface', 'base');
  border: 1px solid color('border');
  
  // For feature-specific tokens
  .workout-button {
    background-color: wg-color('primary', 'base');
    
    &:hover {
      background-color: wg-color('primary', 'hover');
    }
  }
  
  // Dark mode tokens
  .dark-theme & {
    color: dark-color('text');
    background-color: dark-color('surface');
    border-color: dark-color('border');
  }
}
```

### CSS Pattern (with fallbacks)
```css
.element {
  color: var(--color-text, #333333);
  background-color: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #dee2e6);
}

.dark-theme .element {
  color: var(--color-dark-text, #f5f7fa);
  background-color: var(--color-dark-surface, #1e1e1e);
  border-color: var(--color-dark-border, #333333);
}
```

### React Inline Style Pattern
```tsx
<div 
  style={{ 
    color: 'var(--color-text, #333333)',
    backgroundColor: 'var(--color-surface, #ffffff)', 
    border: '1px solid var(--color-border, #dee2e6)'
  }}
>
  Content
</div>
```

## Naming Conventions

1. **Color Token Structure**: `--color-[theme]-[role]-[variant]`
   - `theme`: Optional. Empty for light theme, 'dark' for dark theme, 'wg' for Workout Generator.
   - `role`: Functional role like 'primary', 'surface', 'text', etc.
   - `variant`: Optional. 'base' (implied if missing), 'light', 'dark', 'hover', etc.

2. **RGB Variables**: Always end with `-rgb` suffix (`--color-primary-rgb`)

3. **SCSS Function Arguments**:
   - `color('[role]', '[variant]')` - For base theme
   - `dark-color('[role]', '[variant]')` - For dark theme
   - `wg-color('[role]', '[variant]')` - For Workout Generator 