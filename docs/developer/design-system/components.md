# Component Library

The FitCopilot component library provides a set of consistently styled UI elements that follow the design system guidelines. These components have been designed for accessibility, usability, and visual consistency across the application.

## Buttons

Buttons provide clear calls to action and control interactive elements.

### Button Variants

```scss
// Primary Button
.btn-primary {
  background: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-md);
  padding: var(--space-sm) var(--space-lg);
  transition: background-color var(--transition-normal) var(--ease-out);
  
  &:hover {
    background: darken(var(--color-primary), 10%);
  }
  
  .dark-theme & {
    background: var(--color-dark-primary);
    
    &:hover {
      background: lighten(var(--color-dark-primary), 10%);
    }
  }
}

// Secondary Button
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--border-radius-md);
  padding: var(--space-sm) var(--space-lg);
  
  &:hover {
    background: rgba(0, 160, 160, 0.1);
  }
  
  .dark-theme & {
    color: var(--color-dark-primary);
    border-color: var(--color-dark-primary);
    
    &:hover {
      background: rgba(0, 192, 192, 0.15);
    }
  }
}

// Text Button
.btn-text {
  background: transparent;
  color: var(--color-primary);
  padding: var(--space-sm) var(--space-sm);
  
  &:hover {
    text-decoration: underline;
  }
}

// Icon Button
.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  
  &:hover {
    background: var(--background-tertiary);
  }
  
  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
}
```

### Button Sizes

```scss
.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-xs);
}

.btn-md {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-sm);
}

.btn-lg {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-base);
}
```

## Cards

Cards container related content and actions.

### Card Variants

```scss
// Default Card
.card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--space-lg);
  
  .dark-theme & {
    background: var(--color-dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

// Feature Card
.feature-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--space-lg);
  border-left: 4px solid var(--color-primary);
  
  .dark-theme & {
    background: var(--color-dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    border-left-color: var(--color-dark-primary);
  }
}

// Interactive Card
.interactive-card {
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--space-lg);
  transition: transform var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .dark-theme & {
    background: var(--color-dark-surface);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }
}
```

## Form Elements

### Text Inputs

```scss
.input {
  display: block;
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-base);
  color: var(--text-primary);
  transition: border-color var(--transition-normal) var(--ease-out),
              box-shadow var(--transition-normal) var(--ease-out);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 160, 160, 0.2);
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  .dark-theme & {
    background: var(--color-dark-surface);
    border-color: var(--color-dark-border);
    color: var(--color-dark-text);
    
    &:focus {
      border-color: var(--color-dark-primary);
      box-shadow: 0 0 0 2px rgba(0, 192, 192, 0.2);
    }
    
    &::placeholder {
      color: var(--text-tertiary);
    }
  }
}
```

### Select Dropdowns

```scss
.select {
  display: block;
  width: 100%;
  padding: var(--space-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-base);
  color: var(--text-primary);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right var(--space-sm) center;
  background-size: 16px;
  padding-right: var(--space-xl);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 160, 160, 0.2);
  }
  
  .dark-theme & {
    background-color: var(--color-dark-surface);
    border-color: var(--color-dark-border);
    color: var(--color-dark-text);
    
    &:focus {
      border-color: var(--color-dark-primary);
      box-shadow: 0 0 0 2px rgba(0, 192, 192, 0.2);
    }
  }
}
```

### Checkboxes

```scss
.checkbox {
  position: relative;
  display: flex;
  align-items: center;
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    
    & + label {
      position: relative;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }
    
    & + label:before {
      content: '';
      margin-right: var(--space-sm);
      display: inline-block;
      width: 20px;
      height: 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-sm);
      transition: all var(--transition-normal) var(--ease-out);
    }
    
    &:checked + label:before {
      background: var(--color-primary);
      border-color: var(--color-primary);
    }
    
    &:checked + label:after {
      content: '';
      position: absolute;
      left: 6px;
      top: 10px;
      width: 8px;
      height: 4px;
      border: 2px solid white;
      border-top: none;
      border-right: none;
      background: transparent;
      transform: rotate(-45deg);
    }
    
    .dark-theme & {
      & + label:before {
        background: var(--color-dark-surface);
        border-color: var(--color-dark-border);
      }
      
      &:checked + label:before {
        background: var(--color-dark-primary);
        border-color: var(--color-dark-primary);
      }
    }
  }
}
```

## ThemeToggle Component

```scss
.theme-toggle {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--color-text);
  
  &:hover {
    background-color: rgba(0, 180, 216, 0.08);
    border-color: var(--color-primary);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 180, 216, 0.3);
  }
  
  &--dark {
    background-color: var(--color-dark-surface);
    border-color: var(--color-dark-border);
    color: var(--color-dark-text);
    
    &:hover {
      background-color: rgba(0, 180, 216, 0.15);
      border-color: var(--color-dark-primary);
    }
  }
  
  &__icon {
    width: 20px;
    height: 20px;
    fill: currentColor;
    margin-right: 0.5rem;
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }
  
  &:hover &__icon {
    transform: rotate(15deg);
  }
  
  &__text {
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    
    &__text {
      display: none;
    }
    
    &__icon {
      margin-right: 0;
    }
  }
}
```

## Notification Components

### Alert

```scss
.alert {
  display: flex;
  align-items: flex-start;
  padding: var(--space-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--space-md);
  
  &__icon {
    margin-right: var(--space-sm);
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
  }
  
  &__title {
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--space-xs);
  }
  
  &__message {
    color: var(--text-secondary);
  }
  
  &--info {
    background-color: rgba(33, 150, 243, 0.1);
    border-left: 4px solid var(--info-color);
    
    .alert__icon {
      color: var(--info-color);
    }
  }
  
  &--success {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 4px solid var(--success-color);
    
    .alert__icon {
      color: var(--success-color);
    }
  }
  
  &--warning {
    background-color: rgba(255, 152, 0, 0.1);
    border-left: 4px solid var(--warning-color);
    
    .alert__icon {
      color: var(--warning-color);
    }
  }
  
  &--error {
    background-color: rgba(244, 67, 54, 0.1);
    border-left: 4px solid var(--error-color);
    
    .alert__icon {
      color: var(--error-color);
    }
  }
  
  .dark-theme & {
    &--info {
      background-color: rgba(33, 150, 243, 0.15);
    }
    
    &--success {
      background-color: rgba(76, 175, 80, 0.15);
    }
    
    &--warning {
      background-color: rgba(255, 152, 0, 0.15);
    }
    
    &--error {
      background-color: rgba(244, 67, 54, 0.15);
    }
  }
}
```

## Usage Examples

### Button Usage

```tsx
<Button 
  variant="gradient" 
  size="md" 
  onClick={handleAction}
  disabled={isLoading}
>
  {isLoading ? 'Generating...' : 'Generate Workout'}
</Button>
```

### Card Usage

```tsx
<Card className="feature-card">
  <h3 className="h3">Workout Summary</h3>
  <p className="body">A high-intensity workout targeting major muscle groups.</p>
  <div className="card-actions">
    <Button variant="gradient">View Details</Button>
  </div>
</Card>
```

### Form Input Usage

```tsx
<div className="form-group">
  <label className="label" htmlFor="duration">Workout Duration (minutes)</label>
  <input
    type="number"
    id="duration"
    className="input"
    value={duration}
    onChange={(e) => setDuration(e.target.value)}
    min="5"
    max="120"
  />
</div>
```

### ThemeToggle Usage

```tsx
<ThemeToggle className="workout-form__theme-toggle" />
``` 