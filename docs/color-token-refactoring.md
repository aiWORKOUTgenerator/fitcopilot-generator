# Color Token Refactoring Project

This document provides an overview of the color token refactoring initiative for the FitCopilot Generator plugin. The goal is to systematically replace hardcoded color values with semantic tokens from our design system.

## 🎯 Project Goals

1. **Design System Consistency**: Ensure all UI components use semantic color tokens
2. **Maintainability**: Make theme changes easier by centralizing color definitions
3. **Theming Support**: Improve light/dark theme support by consistent token usage
4. **Developer Experience**: Establish clear patterns for implementing color tokens

## 📊 Current Status

Our baseline token validation has identified:
- **376 total hardcoded color values** across 20 files
- **316 hex color values** and **60 rgba color values**
- Most issues concentrated in form components and shared style files

## 📚 Documentation

The following documents provide detailed information about the refactoring process:

1. [**Token Mapping**](./token-mapping.md): Complete reference of all available color tokens, their hardcoded equivalents, and usage patterns
2. [**Refactoring Priorities**](./token-refactoring-priorities.md): Prioritized list of components for refactoring based on impact and complexity
3. [**Validation Report**](../reports/token-validation-report.html): Generated report showing all hardcoded color values in the codebase

## 🛠️ Development Workflow

### Setup

The project includes tools for validating token usage:

```bash
# Install dependencies (if not already done)
npm install

# Run the token validator
node scripts/token-validator.js

# For detailed output
node scripts/token-validator.js --verbose

# Generate an HTML report
node scripts/token-validator.js --report

# Validate a specific component
node scripts/token-validator.js --component=Button

# Validate a specific feature
node scripts/token-validator.js --feature=workout-generator
```

### Refactoring Process

When refactoring a component:

1. **Identify tokens**: Use the [Token Mapping](./token-mapping.md) to identify the appropriate tokens for each hardcoded color
2. **Replace values**: Convert hardcoded values to semantic tokens following established patterns
3. **Test themes**: Verify the component works in both light and dark themes
4. **Run validation**: Use the token validator to confirm all hardcoded values have been replaced
5. **Document updates**: Note any insights or improvements to the token system

### Code Patterns

#### SCSS Files

```scss
// BEFORE
.element {
  color: #1f2937;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
}

// AFTER
.element {
  color: color('text', 'base');
  background-color: color('surface', 'base');
  border: 1px solid color('border');
}
```

#### CSS Variables with Fallbacks

```scss
.element {
  // When using CSS variables, include fallbacks as shown
  color: var(--color-text, #333333);
  
  // Dark theme handling
  .dark-theme & {
    color: var(--color-dark-text, #f5f7fa);
  }
}
```

#### React Components with Inline Styles

```tsx
// BEFORE
<div style={{ backgroundColor: '#f5f5f5', color: '#1f2937' }}>

// AFTER
<div style={{ 
  backgroundColor: 'var(--color-surface-accent, #f5f5f5)', 
  color: 'var(--color-text, #1f2937)' 
}}>
```

## 🔍 Validation

We use the following validation tools to maintain token usage standards:

1. **Token Validator Script**: Scans files for hardcoded color values
2. **Pre-commit Hook**: Validates token usage in staged files before commit
3. **Visual Tests**: Components should be validated in both light and dark themes

## 📅 Implementation Plan

The implementation follows a tiered approach:

1. **Tier 1**: Core UI components (Button, Card, ProgressBar)
2. **Tier 2**: Form components (InputStep, Checkbox, Select)
3. **Tier 3**: Shared style files (buttons, cards, forms)
4. **Tier 4**: Animations and visual effects
5. **Tier 5**: Feature-specific components

See [Refactoring Priorities](./token-refactoring-priorities.md) for detailed component breakdown.

## 🤝 Contributing

When contributing to the refactoring project:

1. Start with a component from the current priority tier
2. Create a focused PR that addresses one component at a time
3. Include before/after token validator metrics in your PR description
4. Update the documentation if you discover new patterns or issues

## 📈 Measuring Success

We will track the following metrics:

1. **Token Coverage**: Percentage of color properties using tokens
2. **Reduced Hardcoded Values**: Number of hardcoded values eliminated
3. **Component Completion**: Number of components fully refactored
4. **Dark Theme Support**: Verified components working in dark theme 