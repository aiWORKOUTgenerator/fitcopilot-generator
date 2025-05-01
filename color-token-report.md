# Color Token Validation Report

Generated: 2025-04-30T23:24:13.663Z

## Summary

- Total files scanned: 20
- Files with issues: 4
- Total hardcoded values: 31
  - Hex color values: 22
  - RGB/RGBA values: 9
- Valid token usages found: 123

- Token adoption rate: 79.87%

## Issues by File

### src/common/components/UI/Button/Button.scss

13 issues found (4 valid tokens)

| Type | Value | Suggestion |
|------|-------|------------|
| hex | `#8cd867` | Use appropriate color token |
| hex | `#78c241` | Use appropriate color token |
| hex | `#1a1f2b` | Use appropriate color token |
| hex | `#78c241` | Use appropriate color token |
| hex | `#8cd867` | Use appropriate color token |
| hex | `#8cd867` | Use appropriate color token |
| hex | `#8cd867` | Use appropriate color token |
| hex | `#1a1f2b` | Use appropriate color token |
| hex | `#8cd867` | Use appropriate color token |
| rgb | `rgba(140, 216, 103, 0.05)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(140, 216, 103, 0.3)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(26, 31, 43, 0.2)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(140, 216, 103, 0.2)` | Use appropriate color token with opacity/alpha |

### src/common/components/UI/Button/ButtonDemo.tsx

3 issues found (0 valid tokens)

| Type | Value | Suggestion |
|------|-------|------------|
| hex | `#1a1f2b` | Use appropriate color token |
| hex | `#2a303c` | Use appropriate color token |
| hex | `#2a303c` | Use appropriate color token |

### src/common/components/UI/Button/ButtonTest.tsx

4 issues found (0 valid tokens)

| Type | Value | Suggestion |
|------|-------|------------|
| hex | `#666` | Use appropriate color token |
| hex | `#eee` | Use appropriate color token |
| hex | `#1a1a1a` | Use appropriate color token |
| hex | `#666` | Use appropriate color token |

### src/common/components/UI/ProgressBar/ProgressBar.scss

11 issues found (0 valid tokens)

| Type | Value | Suggestion |
|------|-------|------------|
| hex | `#1e293b` | Use appropriate color token |
| hex | `#60a5fa` | Use appropriate color token |
| hex | `#7dd3fc` | Use appropriate color token |
| hex | `#0f172a` | Use appropriate color token |
| hex | `#3b82f6` | color('info') |
| hex | `#0f172a` | Use appropriate color token |
| rgb | `rgba(0, 0, 0, 0.2)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(255, 255, 255, 0.15)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(255, 255, 255, 0.15)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(255, 255, 255, 0.15)` | Use appropriate color token with opacity/alpha |
| rgb | `rgba(0, 0, 0, 0.1)` | Use appropriate color token with opacity/alpha |

## Recommendations

1. Replace hardcoded hex values with semantic color tokens using the `color()` function
2. Use CSS variables with fallbacks for inline styles in React components
3. For gradients, use the `gradient()` function
4. For feature-specific colors, use the appropriate feature color tokens

Refer to the token mapping documentation for more information on available tokens.
