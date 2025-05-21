# API Reference

The FitCopilot Workout Generator provides a RESTful API for generating and managing workout plans. This section documents the available endpoints, authentication methods, request/response formats, and error handling.

## Contents

- [API Design Guidelines](./api-design-guidelines.md) - Standards and best practices for API development
- [REST API Endpoints](./endpoints.md) - Detailed documentation of all available endpoints
- [Authentication](./authentication.md) - Information about authentication methods
- [Error Handling](./error-handling.md) - Standard error responses and codes
- [OpenAPI Specification](./openapi-spec.md) - Complete OpenAPI/Swagger specification

## API Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/fitcopilot/v1/generate` | POST | Generate a new workout |
| `/fitcopilot/v1/workouts` | GET | Get list of workouts |
| `/fitcopilot/v1/workouts/{id}` | GET | Get a specific workout |
| `/fitcopilot/v1/workouts/{id}` | PUT | Update a workout |
| `/fitcopilot/v1/workouts/{id}/complete` | POST | Mark workout as completed |
| `/fitcopilot/v1/profile` | GET | Get current user's profile |
| `/fitcopilot/v1/profile` | PUT | Update current user's profile |

## Integration Examples

For code examples showing how to integrate with the FitCopilot API, see the [Integration Examples](./integration-examples.md) page.

## Related Documentation

- [OpenAI Integration](../architecture/openai-integration.md)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/) 