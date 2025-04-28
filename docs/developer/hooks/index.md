# Hooks Reference

This section provides documentation for all custom hooks in the FitCopilot Generator plugin.

## API and Network Hooks

- [useAbortController](./useAbortController.md) - Enhanced AbortController with reason tracking for reliable API requests
- [WorkoutApiClient](./workoutApiClient.md) - Form-aware API client for reliable workout generation requests
- useApiRequest - Standardized API request handling with loading and error states
- useAuthNonce - WordPress authentication nonce management

## Form Flow Hooks

- useFormPersistence - Persist form state between sessions
- useFormValidation - Form validation with customizable rules
- useWorkoutForm - Complete workout form state management

## User and Subscription Hooks

- useOpenAILogs - Access and manage OpenAI API usage logs
- useProfileStatus - User profile status management
- useSubscriptionAccess - Subscription and access control management

## Workout Hooks

- useWorkoutGenerator - Generate AI-powered workout plans
- useWorkoutHistory - Retrieve and manage user workout history

## Implementation Guidelines

When creating new hooks for the FitCopilot Generator, follow these implementation guidelines:

1. **Single Responsibility Principle**: Each hook should have a clear, focused purpose
2. **Exception Handling**: Implement robust error handling within the hook
3. **Testing**: Create comprehensive tests for all hook functionality
4. **Documentation**: Document the hook's purpose, parameters, and return values
5. **Performance**: Consider memoization and dependency optimization
6. **Cleanup**: Ensure proper cleanup in useEffect return functions
7. **AbortController**: For API requests, always integrate with useAbortController 