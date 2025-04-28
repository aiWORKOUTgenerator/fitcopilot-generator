# TypeScript Color Token Validator

This tool validates the usage of color tokens in TypeScript/TSX files to ensure design system compliance in CSS-in-JS implementations.

## Purpose

The TypeScript color validator helps maintain design consistency by:
- Identifying hardcoded color values in CSS-in-JS objects
- Finding instances where JavaScript style objects use literal color values instead of design tokens
- Generating detailed reports about compliance issues
- Providing token suggestions for non-compliant colors

## Usage

### Basic Validation

Run a basic validation of all TypeScript files:

```bash
npm run test-ts-colors
```

### Verbose Mode

Get detailed information about each issue found:

```bash
npm run test-ts-colors:verbose
```

### Generate HTML Report

Generate a detailed HTML report for review:

```bash
npm run test-ts-colors:report
```

### Component-Specific Validation

Validate a specific component:

```bash
npm run test-ts-colors:component ComponentName
```

For example:
```bash
npm run test-ts-colors:component EndpointStatsTable
```

### Feature-Specific Validation

Validate a specific feature:

```bash
npm run test-ts-colors:feature feature-name
```

For example:
```bash
npm run test-ts-colors:feature api-tracker
```

## Understanding Results

The validator outputs:
- Summary of scanned files and compliance issues
- Breakdown of issues by color format type (hex, rgb, rgba, etc.)
- Locations of non-compliant color usage in CSS-in-JS objects
- Suggestions for replacing hardcoded values with design tokens

## Fixing Issues

1. Identify the token that matches the intended design purpose
2. Replace hardcoded values with CSS variables:

```typescript
// Instead of:
const styles = {
  container: {
    backgroundColor: '#1fad9f', // Non-compliant
    color: 'rgb(51, 51, 51)'    // Non-compliant
  }
};

// Use:
const styles = {
  container: {
    backgroundColor: 'var(--color-primary)',     // Design token
    color: 'var(--color-text)'                   // Design token
  }
};
```

## Detection Patterns

The validator looks for CSS-in-JS patterns such as:

```typescript
// Object property assignments with color values
const styles = {
  propertyName: '#hexValue',
  anotherProperty: 'rgb(0, 0, 0)',
  yetAnother: 'rgba(255, 255, 255, 0.5)'
};

// Inline styles
<div style={{ color: '#ff0000', backgroundColor: 'blue' }} />
```

## Integration with CI/CD

This validator can be integrated into your CI/CD pipeline to automatically verify token compliance in pull requests and prevent design inconsistencies from being merged. 