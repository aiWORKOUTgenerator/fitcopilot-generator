# Typography

The FitCopilot typography system provides a consistent hierarchy and readable text across all interfaces.

## Font Family

### Primary Font
- **Family**: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif
- **Usage**: Primary text content, UI elements, form fields
- **Variants**: Regular, Medium, Bold

### Secondary Font
- **Family**: 'Poppins', sans-serif
- **Usage**: Headings, display text, emphasized UI elements
- **Variants**: Medium, Bold

## Font Scale

The typography system uses a modular scale with a 1.25 ratio (major third), providing a harmonious progression of sizes:

```scss
:root {
  --font-xs: 0.8rem;    // 12.8px
  --font-sm: 0.9rem;    // 14.4px
  --font-base: 1rem;    // 16px
  --font-md: 1.25rem;   // 20px
  --font-lg: 1.563rem;  // 25px
  --font-xl: 1.953rem;  // 31.25px
  --font-xxl: 2.441rem; // 39.06px
}
```

## Font Weights

```scss
:root {
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

## Text Styles

### Headings

```scss
h1, .h1 {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-xxl);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}

h2, .h2 {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-xl);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

h3, .h3 {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-lg);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  margin-bottom: var(--space-md);
  color: var(--text-primary);
}

h4, .h4 {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-md);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  margin-bottom: var(--space-sm);
  color: var(--text-primary);
}
```

### Body Text

```scss
.body-large {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-md);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  color: var(--text-primary);
}

.body {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-base);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  color: var(--text-primary);
}

.body-small {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-sm);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  color: var(--text-secondary);
}

.caption {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-xs);
  font-weight: var(--font-weight-regular);
  line-height: 1.5;
  color: var(--text-tertiary);
}
```

### UI Text

```scss
.label {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.button-text {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.error-text {
  font-family: 'Roboto', sans-serif;
  font-size: var(--font-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  color: var(--error-color);
}
```

## Line Height

Line heights are designed to provide optimal readability:

- **Headings**: 1.2 - 1.4 (tighter)
- **Body Text**: 1.5 (comfortable reading)
- **Small Text**: 1.5 (easier readability at small sizes)

## Accessibility

Typography follows these accessibility guidelines:

- Minimum font size of 12px (0.75rem) for any readable text
- Line heights of at least 1.5 for body text to improve readability
- No all-caps text for long-form content
- Sufficient color contrast between text and background (see [Color System](./colors.md))

## Responsive Behavior

Text sizes adjust on smaller screens to maintain readability:

```scss
@media (max-width: 768px) {
  :root {
    --font-xxl: 2rem;      // 32px
    --font-xl: 1.75rem;    // 28px 
    --font-lg: 1.375rem;   // 22px
  }
}

@media (max-width: 480px) {
  :root {
    --font-xxl: 1.75rem;   // 28px
    --font-xl: 1.5rem;     // 24px
    --font-lg: 1.25rem;    // 20px
  }
}
```

## Usage Examples

### Heading with Body Text

```html
<h2 class="h2">Workout Overview</h2>
<p class="body">This high-intensity workout is designed to build strength and improve cardiovascular endurance through a series of compound movements.</p>
```

### Form Label

```html
<label class="label" for="duration">Workout Duration</label>
<input id="duration" type="number" />
```

### Button with Proper Typography

```html
<button class="button button-primary">
  <span class="button-text">Generate Workout</span>
</button>
``` 