# FitCopilot Design System Token Documentation

This directory contains comprehensive documentation on the FitCopilot design system's color token architecture and usage guidelines.

## Documentation Index

1. **[Token Map](./token-map.md)** - Comprehensive mapping of all color tokens with usage examples
2. **[Component Mapping](./component-mapping.md)** - Classification of UI components by priority and color usage patterns

## Implementation Resources

In the `/scripts` directory at the project root:

1. **Token Validator** - Scans codebase for hardcoded color values (`token-validator.js`)
2. **Git Hooks** - Pre-commit validation of color token usage (`git-hooks/pre-commit`)
3. **Hook Installer** - Installation script for Git hooks (`install-hooks.js`)

## CI/CD Integration

In the `/.github/workflows` directory:

1. **Token Validation Workflow** - GitHub Actions workflow that runs on pull requests (`token-validation.yml`)

## Usage Guidelines

### For Developers

When implementing or modifying components:

1. **Check Token Documentation** - Use the [Token Map](./token-map.md) to identify the appropriate token for your use case
2. **Component Classification** - Reference the [Component Mapping](./component-mapping.md) to understand your component's color pattern
3. **Run Local Validation** - Use `node scripts/token-validator.js --report` to check for hardcoded values
4. **Fix Issues** - Replace hardcoded values with appropriate token references
5. **Commit Changes** - The pre-commit hook will validate your changes before committing

### For Designers

When creating or updating designs:

1. **Reference Design System** - Use the token documentation to ensure designs align with the color system
2. **Provide Token References** - When handing off designs, specify the token names rather than hex values
3. **Maintain Consistency** - Follow established patterns for similar components
4. **Consult Component Mapping** - Reference the component classification to understand existing patterns

## Implementation Plan

Phase 1 (current) establishes the foundation for design system compliance:

- Token documentation and mapping
- Validation tooling
- Component classification
- CI/CD integration

Future phases will implement the changes across the codebase:

- Phase 2: Core UI Component Refactoring
- Phase 3: Workout Generator Component Refactoring
- Phase 4: Animation and Visual Effects Standardization
- Phase 5: Admin Interface and Utilities Refactoring 