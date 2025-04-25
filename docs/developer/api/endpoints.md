# REST API Endpoints

This document provides detailed information about all FitCopilot REST API endpoints, including request parameters, response formats, and examples.

All endpoints are accessible via the WordPress REST API under the namespace `/wp-json/fitcopilot/v1`.

## Table of Contents

- [Generate Workout](#generate-workout)
- [Get Workouts List](#get-workouts-list)
- [Get Single Workout](#get-single-workout)
- [Update Workout](#update-workout)
- [Complete Workout](#complete-workout)

---

## Generate Workout

Generate a new AI-powered workout plan based on user preferences.

**Endpoint:** `POST /wp-json/fitcopilot/v1/generate`

### Request Parameters

```json
{
  "duration": 30,
  "difficulty": "intermediate",
  "equipment": ["dumbbells", "resistance-bands"],
  "goals": "build-muscle",
  "restrictions": "low impact only",
  "specific_request": "Create an intermediate level workout for 30 minutes focusing on building muscle."
}
```

#### Required Fields

- `specific_request`: String describing the workout request

#### Optional Fields

- `duration`: Number (minutes) - default: 30
- `difficulty`: String ("beginner", "intermediate", "advanced") - default: "intermediate"
- `equipment`: Array of strings - default: []
- `goals`: String - default: "general fitness"
- `restrictions`: String - default: ""

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "workout": {
      "title": "30-Minute Intermediate Muscle Building Workout",
      "description": "This workout targets major muscle groups with moderate weights and controlled movements.",
      "warmup": [
        {
          "name": "Arm circles",
          "duration": "30 seconds",
          "description": "Rotate arms in circular motion"
        },
        {
          "name": "Bodyweight squats",
          "reps": 10,
          "description": "Perform squats with bodyweight only"
        }
      ],
      "exercises": [
        {
          "name": "Dumbbell bench press",
          "sets": 3,
          "reps": 12,
          "rest": "45 seconds",
          "description": "Lie on bench, press dumbbells upward"
        },
        {
          "name": "Resistance band rows",
          "sets": 3,
          "reps": 15,
          "rest": "45 seconds",
          "description": "Pull resistance band toward torso"
        }
      ],
      "cooldown": [
        {
          "name": "Chest stretch",
          "duration": "30 seconds",
          "description": "Stretch chest muscles"
        },
        {
          "name": "Back stretch",
          "duration": "30 seconds",
          "description": "Stretch back muscles"
        }
      ]
    },
    "post_id": 123
  },
  "message": "Workout generated successfully."
}
```

### Error Responses

**Missing API Key (400)**
```json
{
  "success": false,
  "message": "OpenAI API key not configured. Please set it in the FitCopilot settings.",
  "code": "missing_api_key"
}
```

**Invalid Parameters (400)**
```json
{
  "success": false,
  "message": "Missing required parameters.",
  "code": "invalid_params"
}
```

**API Error (500)**
```json
{
  "success": false,
  "message": "Error connecting to OpenAI API.",
  "code": "generation_error"
}
```

### Code Example

```javascript
// Example using fetch API
async function generateWorkout() {
  const response = await fetch('/wp-json/fitcopilot/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': wpApiSettings.nonce
    },
    body: JSON.stringify({
      duration: 30,
      difficulty: 'intermediate',
      equipment: ['dumbbells', 'resistance-bands'],
      goals: 'build-muscle',
      restrictions: 'low impact only',
      specific_request: 'Create an intermediate level workout for 30 minutes focusing on building muscle.'
    })
  });
  
  const data = await response.json();
  return data;
}
```

---

## Get Workouts List

Retrieve a list of workouts for the current user.

**Endpoint:** `GET /wp-json/fitcopilot/v1/workouts`

### Query Parameters

None required

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "30-Minute Intermediate Muscle Building Workout",
      "date": "2023-07-15T14:30:00",
      "difficulty": "intermediate",
      "duration": 30,
      "equipment": ["dumbbells", "resistance-bands"],
      "goals": "build-muscle"
    },
    {
      "id": 124,
      "title": "15-Minute HIIT Cardio Workout",
      "date": "2023-07-10T09:15:00",
      "difficulty": "advanced",
      "duration": 15,
      "equipment": ["none"],
      "goals": "improve-endurance"
    }
  ]
}
```

### Error Response (401)

```json
{
  "code": "rest_forbidden",
  "message": "You are not currently logged in.",
  "data": {
    "status": 401
  }
}
```

### Code Example

```javascript
// Example using fetch API
async function getWorkouts() {
  const response = await fetch('/wp-json/fitcopilot/v1/workouts', {
    method: 'GET',
    headers: {
      'X-WP-Nonce': wpApiSettings.nonce
    }
  });
  
  const data = await response.json();
  return data;
}
```

---

## Get Single Workout

Retrieve details for a specific workout.

**Endpoint:** `GET /wp-json/fitcopilot/v1/workouts/{id}`

### Path Parameters

- `id`: Workout post ID (integer)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "30-Minute Intermediate Muscle Building Workout",
    "content": "<p>Complete workout details with exercises...</p>",
    "date": "2023-07-15T14:30:00",
    "difficulty": "intermediate",
    "duration": 30,
    "equipment": ["dumbbells", "resistance-bands"],
    "goals": "build-muscle",
    "restrictions": "low impact only",
    "completion_status": "not_started",
    "completion_date": null,
    "raw_response": "Original AI response JSON data"
  }
}
```

### Error Responses

**Not Found (404)**
```json
{
  "success": false,
  "message": "Workout not found.",
  "code": "not_found"
}
```

**Unauthorized (403)**
```json
{
  "code": "rest_forbidden",
  "message": "You don't have permission to access this workout.",
  "data": {
    "status": 403
  }
}
```

### Code Example

```javascript
// Example using fetch API
async function getWorkout(id) {
  const response = await fetch(`/wp-json/fitcopilot/v1/workouts/${id}`, {
    method: 'GET',
    headers: {
      'X-WP-Nonce': wpApiSettings.nonce
    }
  });
  
  const data = await response.json();
  return data;
}
```

---

## Update Workout

Update metadata for an existing workout.

**Endpoint:** `PUT /wp-json/fitcopilot/v1/workouts/{id}`

### Path Parameters

- `id`: Workout post ID (integer)

### Request Parameters

```json
{
  "title": "Updated Workout Title",
  "notes": "Personal notes about this workout",
  "completion_status": "completed"
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Updated Workout Title",
    "notes": "Personal notes about this workout",
    "completion_status": "completed"
  },
  "message": "Workout updated successfully."
}
```

### Error Responses

**Not Found (404)**
```json
{
  "success": false,
  "message": "Workout not found.",
  "code": "not_found"
}
```

**Invalid Parameters (400)**
```json
{
  "success": false,
  "message": "Invalid parameters.",
  "code": "invalid_params"
}
```

### Code Example

```javascript
// Example using fetch API
async function updateWorkout(id, data) {
  const response = await fetch(`/wp-json/fitcopilot/v1/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': wpApiSettings.nonce
    },
    body: JSON.stringify(data)
  });
  
  const responseData = await response.json();
  return responseData;
}
```

---

## Complete Workout

Log completion of a workout.

**Endpoint:** `POST /wp-json/fitcopilot/v1/workouts/{id}/complete`

### Path Parameters

- `id`: Workout post ID (integer)

### Request Parameters

```json
{
  "rating": 4,
  "feedback": "Great workout! Felt challenging but doable.",
  "duration_actual": 35
}
```

#### Required Fields

None

#### Optional Fields

- `rating`: Integer (1-5)
- `feedback`: String
- `duration_actual`: Integer (minutes)

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "completion_status": "completed",
    "completion_date": "2023-07-15T15:05:00",
    "rating": 4,
    "feedback": "Great workout! Felt challenging but doable.",
    "duration_actual": 35
  },
  "message": "Workout marked as completed."
}
```

### Error Responses

**Not Found (404)**
```json
{
  "success": false,
  "message": "Workout not found.",
  "code": "not_found"
}
```

**Already Completed (400)**
```json
{
  "success": false,
  "message": "Workout already completed.",
  "code": "already_completed"
}
```

### Code Example

```javascript
// Example using fetch API
async function completeWorkout(id, data) {
  const response = await fetch(`/wp-json/fitcopilot/v1/workouts/${id}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': wpApiSettings.nonce
    },
    body: JSON.stringify(data)
  });
  
  const responseData = await response.json();
  return responseData;
}
```

## Implementation Details

The API endpoints are implemented in the [`WorkoutEndpoints.php`](../../src/php/API/WorkoutEndpoints.php) file. The class uses WordPress REST API functions to register endpoints and handle requests.

## See Also

- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md)
- [OpenAPI Specification](./openapi-spec.md) 