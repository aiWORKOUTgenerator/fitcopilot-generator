# Token Validator Script

This tool validates the usage of color tokens throughout the codebase to ensure design system compliance.

## Purpose

The token validator helps maintain consistency by:
- Identifying hardcoded color values that should use design tokens instead
- Verifying that all colors come from the token system
- Generating reports to track compliance
- Providing suggestions for replacing non-compliant colors

## Usage

### Basic Validation

Run a basic validation of all CSS/SCSS files:

```bash
npm run validate-tokens
```

### Verbose Mode

Get detailed information about each issue found:

```bash
npm run validate-tokens:verbose
```

### Component-Specific Validation

Validate a specific component:

```bash
npm run validate-tokens:component Card
```

### Feature-Specific Validation

Validate a specific feature:

```bash
npm run validate-tokens:feature workout-generator
```

## Understanding Results

The validator outputs:
- Summary of compliant/non-compliant files
- Breakdown of issues by type (hex, rgb, rgba, hsl, hsla)
- Locations of non-compliant color usage
- Suggestions for replacing hardcoded values with tokens

## Fixing Issues

1. Identify the token that matches the intended design purpose
2. Replace hardcoded values with the appropriate token variable
3. Re-run validation to confirm fixes

## Allowed Exceptions

Some colors are allowed as hardcoded values:
- Transparent: `transparent`
- Black/White: `#000`, `#fff`, `rgb(0,0,0)`, `rgb(255,255,255)`
- Standard alpha variations where needed

## Integration with CI/CD

This validator can be integrated into your CI/CD pipeline to automatically check PRs for token compliance. 