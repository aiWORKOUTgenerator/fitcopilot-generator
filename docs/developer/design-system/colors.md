# Color System

The FitCopilot color system is built to provide consistent, accessible colors that support both light and dark themes.

## Core Color Palette

### Brand Colors

- **Primary**: `$primary-color` - Teal (#00a0a0)
  - Brand identity color, used for primary actions and key UI elements
  - Dark variant: `$primary-color-dark` (#008080)

- **Secondary**: `$secondary-color` - Gold (#ffc107)
  - Accent/CTA elements, used for highlighting and secondary actions
  - Dark variant: `$secondary-color-dark` (#e6ae00)

- **Tertiary**: `$tertiary-color` - Deep purple (#6a3ca5)
  - Supporting accent color, used for tertiary actions and visual interest
  - Dark variant: `$tertiary-color-dark` (#5a3295)

### Neutral Colors

- **Background Neutrals**:
  ```scss
  $neutral-50: #fafafa;
  $neutral-100: #f5f7fa;
  $neutral-200: #e5e9f0;
  $neutral-300: #d8dee9;
  $neutral-400: #c0c5ce;
  ```

- **Text Neutrals**:
  ```scss
  $neutral-500: #8892a0;
  $neutral-600: #666666;
  $neutral-700: #444444;
  $neutral-800: #333333;
  $neutral-900: #1a1a1a;
  ```

## Semantic Colors

Colors that convey specific meanings:

- **Success**: `$success-color` (#4caf50)
  - Used for success messages, completed actions
  - Dark variant: `$success-color-dark` (#3d9140)

- **Warning**: `$warning-color` (#ff9800)
  - Used for warnings, important notices
  - Dark variant: `$warning-color-dark` (#e68a00)

- **Error**: `$error-color` (#f44336)
  - Used for error messages, destructive actions
  - Dark variant: `$error-color-dark` (#d32f2f)

- **Info**: `$info-color` (#2196f3)
  - Used for informational messages
  - Dark variant: `$info-color-dark` (#1976d2)

## Theme Variables

CSS custom properties that change based on the current theme:

### Light Theme

```scss
:root {
  // Background
  --background-primary: #ffffff;
  --background-secondary: #f5f7fa;
  --background-tertiary: #e5e9f0;
  
  // Surface
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-border: #e5e9f0;
  
  // Text
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #8892a0;
  --text-disabled: #c0c5ce;
  
  // Brand
  --color-primary: #00a0a0;
  --color-secondary: #ffc107;
  --color-tertiary: #6a3ca5;
}
```

### Dark Theme

```scss
.dark-theme {
  // Background
  --background-primary: #121212;
  --background-secondary: #1e1e1e;
  --background-tertiary: #252525;
  
  // Surface
  --color-surface: #1e1e1e;
  --color-surface-elevated: #2d2d2d;
  --color-border: #404040;
  
  // Text
  --text-primary: #f5f5f5;
  --text-secondary: #b0b0b0;
  --text-tertiary: #8892a0;
  --text-disabled: #666666;
  
  // Brand - brightened for dark background
  --color-primary: #00c0c0;
  --color-secondary: #ffd54f;
  --color-tertiary: #9575cd;
  
  // Dark theme specific
  --color-dark-primary: #00c0c0;
  --color-dark-secondary: #ffd54f;
  --color-dark-border: #404040;
  --color-dark-surface: #1e1e1e;
  --color-dark-surface-elevated: #2d2d2d;
  --color-dark-text: #f5f5f5;
}
```

## Accessibility

All color combinations in the FitCopilot design system meet WCAG 2.1 AA standards for contrast:

- Text on backgrounds maintains at least 4.5:1 contrast ratio
- Large text maintains at least 3:1 contrast ratio
- UI elements and visual information maintain at least 3:1 contrast ratio

## Usage Guidelines

1. **Theme-Sensitive Properties**: 
   - Always use CSS variables for theme-sensitive properties
   - Example: `color: var(--text-primary);` instead of `color: #333333;`

2. **Semantic Usage**:
   - Use colors according to their semantic meaning
   - Example: Use `$success-color` for success messages, not just for green elements

3. **Accessibility First**:
   - Test all color combinations for sufficient contrast
   - Avoid using color as the only means of conveying information

4. **Component Consistency**:
   - Use consistent colors for the same actions/elements across components
   - Example: Primary buttons should use the same color across the application 