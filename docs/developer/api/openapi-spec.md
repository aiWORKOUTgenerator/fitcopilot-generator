# OpenAPI Specification

This document contains the complete OpenAPI 3.0 specification for the FitCopilot Workout Generator API. This specification can be imported into API tools like Postman, Swagger UI, or other OpenAPI-compatible tools for testing and integration.

## FitCopilot API OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: FitCopilot Workout Generator API
  version: 1.0.0
  description: API for generating and managing AI-powered workout plans

servers:
  - url: https://example.com/wp-json/fitcopilot/v1
    description: WordPress REST API endpoint

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: wordpress_logged_in
    basicAuth:
      type: http
      scheme: basic

  schemas:
    WorkoutRequest:
      type: object
      required:
        - specific_request
      properties:
        duration:
          type: integer
          example: 30
          description: Workout duration in minutes
        difficulty:
          type: string
          enum: [beginner, intermediate, advanced]
          example: intermediate
          description: Workout difficulty level
        equipment:
          type: array
          items:
            type: string
          example: [dumbbells, resistance-bands]
          description: Available equipment for the workout
        goals:
          type: string
          example: build-muscle
          description: Primary fitness goal
        restrictions:
          type: string
          example: low impact only
          description: Any physical restrictions to consider
        specific_request:
          type: string
          example: Create an intermediate level workout for 30 minutes focusing on building muscle.
          description: Specific instructions for the workout

    WorkoutExercise:
      type: object
      properties:
        name:
          type: string
          example: Dumbbell bench press
        sets:
          type: integer
          example: 3
        reps:
          type: integer
          example: 12
        rest:
          type: string
          example: 45 seconds
        description:
          type: string
          example: Lie on bench, press dumbbells upward

    WorkoutWarmupCooldown:
      type: object
      properties:
        name:
          type: string
          example: Arm circles
        duration:
          type: string
          example: 30 seconds
        description:
          type: string
          example: Rotate arms in circular motion

    WorkoutContent:
      type: object
      properties:
        title:
          type: string
          example: 30-Minute Intermediate Muscle Building Workout
        description:
          type: string
          example: This workout targets major muscle groups with moderate weights and controlled movements.
        warmup:
          type: array
          items:
            $ref: '#/components/schemas/WorkoutWarmupCooldown'
        exercises:
          type: array
          items:
            $ref: '#/components/schemas/WorkoutExercise'
        cooldown:
          type: array
          items:
            $ref: '#/components/schemas/WorkoutWarmupCooldown'

    Workout:
      type: object
      properties:
        id:
          type: integer
          example: 123
        title:
          type: string
          example: 30-Minute Intermediate Muscle Building Workout
        date:
          type: string
          format: date-time
        difficulty:
          type: string
        duration:
          type: integer
        equipment:
          type: array
          items:
            type: string
        goals:
          type: string
        completion_status:
          type: string
          enum: [not_started, in_progress, completed]

    WorkoutList:
      type: array
      items:
        $ref: '#/components/schemas/Workout'

    WorkoutDetail:
      allOf:
        - $ref: '#/components/schemas/Workout'
        - type: object
          properties:
            content:
              type: string
              description: HTML content of the workout
            restrictions:
              type: string
            completion_date:
              type: string
              format: date-time
              nullable: true
            raw_response:
              type: string
              description: Original AI response JSON data

    WorkoutUpdateRequest:
      type: object
      properties:
        title:
          type: string
          example: Updated Workout Title
        notes:
          type: string
          example: Personal notes about this workout
        completion_status:
          type: string
          enum: [not_started, in_progress, completed]
          example: completed

    WorkoutCompleteRequest:
      type: object
      properties:
        rating:
          type: integer
          minimum: 1
          maximum: 5
          example: 4
          description: User rating of the workout (1-5)
        feedback:
          type: string
          example: Great workout! Felt challenging but doable.
          description: User feedback about the workout
        duration_actual:
          type: integer
          example: 35
          description: Actual time spent on the workout in minutes

    ApiResponse:
      type: object
      properties:
        success:
          type: boolean
          example: true
        data:
          type: object
        message:
          type: string
          example: Operation completed successfully.

    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: An error occurred.
        code:
          type: string
          example: error_code
        data:
          type: object

paths:
  /generate:
    post:
      summary: Generate a new workout
      description: Creates a new AI-generated workout based on user preferences
      security:
        - cookieAuth: []
        - basicAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkoutRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          workout:
                            $ref: '#/components/schemas/WorkoutContent'
                          post_id:
                            type: integer
                      message:
                        example: Workout generated successfully.
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /workouts:
    get:
      summary: Get a list of workouts
      description: Retrieves a list of workouts for the current user
      security:
        - cookieAuth: []
        - basicAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/WorkoutList'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /workouts/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
        description: The workout ID
    get:
      summary: Get a single workout
      description: Retrieves details for a specific workout
      security:
        - cookieAuth: []
        - basicAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        $ref: '#/components/schemas/WorkoutDetail'
        '404':
          description: Not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
    
    put:
      summary: Update a workout
      description: Updates metadata for an existing workout
      security:
        - cookieAuth: []
        - basicAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkoutUpdateRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          id:
                            type: integer
                          title:
                            type: string
                          notes:
                            type: string
                          completion_status:
                            type: string
                      message:
                        example: Workout updated successfully.
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /workouts/{id}/complete:
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
        description: The workout ID
    post:
      summary: Mark a workout as completed
      description: Logs completion of a workout with optional feedback
      security:
        - cookieAuth: []
        - basicAuth: []
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WorkoutCompleteRequest'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          id:
                            type: integer
                          completion_status:
                            type: string
                            example: completed
                          completion_date:
                            type: string
                            format: date-time
                          rating:
                            type: integer
                          feedback:
                            type: string
                          duration_actual:
                            type: integer
                      message:
                        example: Workout marked as completed.
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

## Usage Examples

### Importing into Postman

1. Open Postman
2. Click "Import" in the top left
3. Select "Raw text" and paste the YAML specification
4. Click "Import"
5. A new collection will be created with all the API endpoints

### Using with Swagger UI

You can use this specification with Swagger UI for interactive API documentation:

1. Copy the YAML specification
2. Go to the [Swagger Editor](https://editor.swagger.io/)
3. Paste the YAML specification
4. The right panel will display an interactive UI for testing the API

### Converting to JSON

Some tools prefer JSON format. You can convert this YAML to JSON using online converters or programmatically:

```javascript
// Example using js-yaml library
const yaml = require('js-yaml');
const fs = require('fs');

// Load the YAML
const yamlSpec = fs.readFileSync('openapi-spec.yaml', 'utf8');
// Convert to JSON
const jsonSpec = JSON.stringify(yaml.load(yamlSpec), null, 2);
// Save as JSON
fs.writeFileSync('openapi-spec.json', jsonSpec);
```

## Related Documentation

- [API Endpoints](./endpoints.md)
- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md) 