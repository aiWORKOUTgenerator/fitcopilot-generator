# Contribution Guidelines

Thank you for your interest in contributing to the FitCopilot Workout Generator! This section provides guidelines and best practices for contributing to the project.

## Sections

### [Code Standards](./code-standards/index.md)
- [PHP Coding Standards](./code-standards/php-standards.md)
- [JavaScript/TypeScript Standards](./code-standards/js-ts-standards.md)
- [CSS/Tailwind Standards](./code-standards/css-standards.md)
- [Documentation Standards](./code-standards/documentation-standards.md)

### [Development Workflow](./workflow/index.md)
- [Setting Up Development Environment](./workflow/setup.md)
- [Development Process](./workflow/process.md)
- [Testing Guidelines](./workflow/testing.md)
- [Debugging](./workflow/debugging.md)

### [Pull Request Process](./pull-requests/index.md)
- [Creating a Pull Request](./pull-requests/creating-pr.md)
- [PR Templates](./pull-requests/templates.md)
- [Code Review Process](./pull-requests/code-review.md)
- [Addressing Feedback](./pull-requests/addressing-feedback.md)

### [Release Process](./release-process/index.md)
- [Version Numbering](./release-process/versioning.md)
- [Release Checklist](./release-process/checklist.md)
- [Changelog Management](./release-process/changelog.md)
- [Deployment](./release-process/deployment.md)

## How to Contribute

### 1. Fork and Clone the Repository

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```
   git clone https://github.com/YOUR-USERNAME/fitcopilot-generator.git
   ```
3. Add the original repository as an upstream remote:
   ```
   git remote add upstream https://github.com/aiWORKOUTgenerator/fitcopilot-generator.git
   ```

### 2. Create a Branch

Create a branch for your contribution:

```
git checkout -b feature/your-feature-name
```

Use prefixes like `feature/`, `bugfix/`, `docs/`, or `improvement/` to categorize your contribution.

### 3. Make Changes

Make your changes following the [code standards](./code-standards/index.md). Be sure to:

- Write clean, readable, and maintainable code
- Add appropriate comments and documentation
- Write tests for new features or bug fixes
- Ensure all tests pass

### 4. Commit Changes

Follow the [conventional commits](https://www.conventionalcommits.org/) standard for commit messages:

```
feat: add new workout type filter
fix: resolve issue with workout generation for short durations
docs: update API documentation
refactor: improve workout generator form component
test: add tests for workout completion
```

### 5. Submit a Pull Request

1. Push your changes to your fork:
   ```
   git push origin feature/your-feature-name
   ```
2. Submit a pull request to the main repository.
3. Follow the [pull request process](./pull-requests/index.md).

## Code of Conduct

We expect all contributors to follow our Code of Conduct. Please be respectful and constructive in all interactions.

## Questions or Problems?

If you have questions or encounter any problems, please:

1. Check the [existing issues](https://github.com/aiWORKOUTgenerator/fitcopilot-generator/issues) to see if your question or problem has already been addressed.
2. If not, create a new issue clearly describing your question or problem.

## Related Resources

- [Developer Documentation](../developer/index.md)
- [API Reference](../developer/api/index.md) 