# Card Component

A flexible, themeable card component for displaying content in a contained box with consistent styling.

## Features

- Multiple variants: basic, bordered, elevated
- Interactive options: hoverable, clickable
- Customizable padding: small, medium, large
- Full theming support including dark mode
- Consistent motion and transitions using design tokens

## Usage

```tsx
import { Card } from '../../components/ui';

// Basic usage
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// With options
<Card 
  elevated 
  hoverable 
  padding="large"
  onClick={() => console.log('Card clicked')}
>
  <h3>Interactive Card</h3>
  <p>This card has elevation, hover effects, and is clickable</p>
</Card>
```

## Color Tokens Used

The Card component uses the following color tokens from the design system:

- `color('surface')` - Background color
- `color('border')` - Border color (when bordered is true)
- `color('text')` - Text color
- `color('surface', 'hover')` - Hover state background

In dark mode, it uses:
- `dark-color('surface')` - Dark mode background
- `dark-color('border')` - Dark mode border
- `dark-color('text')` - Dark mode text color
- `dark-color('surface', 'hover')` - Dark mode hover background

## Motion Tokens Used

The Card component uses motion tokens to ensure consistent animations:

- `transition-preset('card')` - For the main card transitions
- Card shadows are applied using the `card-shadow()` mixins

## Testing Dark Mode

To test the Card component in dark mode, use the included `CardThemeTest` component:

```tsx
import { CardThemeTest } from '../../components/ui/Card';

// In your app or storybook
<CardThemeTest />
```

This will render a page with various Card variants in both light and dark themes, with a toggle to switch between them.

## Accessibility

The Card component includes proper semantic roles and tabIndex attributes:

- When making a card clickable (using the `onClick` prop), it automatically:
  - Adds `role="button"` for screen readers
  - Sets `tabIndex={0}` to make it keyboard focusable
  - Applies proper hover states for visual feedback 