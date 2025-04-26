# Dark Theme

The FitCopilot design system includes a complete dark theme implementation that provides users with an alternative visual experience, reduces eye strain in low-light environments, and enhances the modern feel of the application.

## Implementation Approach

The dark theme is implemented using CSS custom properties (CSS variables) with a class-based toggle approach:

1. Base variables are defined in the root scope (`:root`) for light theme
2. Dark theme variables are defined in a `.dark-theme` class scope
3. The `ThemeToggle` component adds/removes the `.dark-theme` class on the document body

## Dark Theme Palette

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
}
```

## ThemeToggle Component

The `ThemeToggle` component controls theme switching by:

1. Persisting user preference in localStorage
2. Detecting system preference via `prefers-color-scheme` media query
3. Providing an accessible toggle UI

```tsx
import React, { useEffect, useState } from 'react';
import './styles.scss';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Check for saved theme preference or default to system preference
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to document
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <button
      className={`theme-toggle ${isDarkTheme ? 'theme-toggle--dark' : ''} ${className}`}
      onClick={toggleTheme}
      aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className="theme-toggle__icon">
        {isDarkTheme ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 7a5 5 0 100 10 5 5 0 000-10zM12 4V2M12 22v-2M4.22 6.22L2.81 4.81M21.19 19.19l-1.41-1.41M4.22 17.78l-1.41 1.41M21.19 4.81l-1.41 1.41M17 12h2M5 12h2" />
          </svg>
        )}
      </span>
      <span className="theme-toggle__text">
        {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
```

## Dark Theme Styles

### Component-Specific Overrides

Components use the parent class selector to apply dark theme styling:

```scss
.card {
  background: var(--color-surface);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .dark-theme & {
    background: var(--color-dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}
```

### Form Elements in Dark Theme

```scss
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--text-primary);
  
  .dark-theme & {
    background: var(--color-dark-surface);
    border-color: var(--color-dark-border);
    color: var(--color-dark-text);
    
    &:focus {
      border-color: var(--color-dark-primary);
      box-shadow: 0 0 0 2px rgba(0, 192, 192, 0.2);
    }
  }
}
```

## Integration with Form Steps

Each form step component has specialized dark theme styling:

### InputStep Dark Theme

- Dark form fields with brighter focus states
- Custom select dropdowns with dark backgrounds
- Enhanced contrast for labels and field groups

### PreviewStep Dark Theme

- Deep background with vibrant section headers
- Card elevation with subtle shadows
- Highlighted action buttons

### GeneratingStep Dark Theme

- Enhanced loading animation against dark background
- Improved visibility of progress indicators

### ResultStep Dark Theme

- Segmented workout sections with proper spacing
- Increased contrast for important information
- Readable typography against dark surface

## Accessibility Considerations

The dark theme implementation follows these accessibility principles:

1. **Contrast Ratios**: All color combinations meet WCAG 2.1 AA standards
2. **Focus Indicators**: Enhanced focus states with higher visibility in dark theme
3. **Text Readability**: Proper color choices to ensure text remains readable
4. **Toggle Experience**: Clear visual and semantic indication of current theme

## Usage Guidelines

1. **Always Use Variables**:
   - Use CSS variables for all color properties
   - Example: `color: var(--text-primary);` not `color: #333;`

2. **Test Both Themes**:
   - Test all components in both light and dark themes
   - Verify contrast and readability in both modes

3. **Component Development**:
   - Implement dark theme styles alongside light theme
   - Use the `.dark-theme &` parent selector pattern

4. **ThemeToggle Integration**:
   - Place the ThemeToggle in the application header or settings area
   - Example: `<ThemeToggle className="app-header__theme-toggle" />`

5. **Images and Media**:
   - Use SVGs with `currentColor` when possible
   - For raster images, consider providing dark alternatives

## System Preference Detection

The theme system detects and respects the user's system preference:

```js
// On initial load, check system preference
const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Apply system preference if no saved preference exists
if (!localStorage.getItem('theme')) {
  if (prefersDarkTheme) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
}
``` 