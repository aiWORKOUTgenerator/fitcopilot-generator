# Component Documentation

This directory contains documentation for key components in the FitCopilot Generator plugin.

## Component Categories

- [Form Components](./form.md): Components related to user input forms
- [Workout Display Components](./workout-display.md): Components for visualizing and displaying workout data
- [UI Components](./ui.md): Reusable UI components used throughout the application

## Component Guidelines

When developing new components for the FitCopilot Generator, follow these guidelines:

1. **Feature-First Approach**: Organize components by feature, not by type
2. **Component Classification**:
   - **Feature Components**: Encapsulate application logic specific to the plugin feature
   - **UI Components**: Reusable, purely presentational components without embedded logic
3. **Documentation**: All components should include JSDoc documentation with clear descriptions and examples
4. **Accessibility**: Follow WCAG 2.1 AA guidelines
5. **Testing**: Include unit tests for component functionality

See the [Architecture Principles](../architecture/index.md) for more details on the component architecture. 