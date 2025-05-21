# REST API Endpoints

This document provides detailed information about all FitCopilot REST API endpoints, including request parameters, response formats, and examples.

All endpoints are accessible via the WordPress REST API under the namespace `/wp-json/fitcopilot/v1`.

## Table of Contents

- [Generate Workout](#generate-workout)
- [Get Workouts List](#get-workouts-list)
- [Get Single Workout](#get-single-workout)
- [Update Workout](#update-workout)
- [Complete Workout](#complete-workout)
- [Get User Profile](#get-user-profile)
- [Update User Profile](#update-user-profile)

---

## Workout Generator API

### Generate Workout

**Endpoint:** `POST /fitcopilot/v1/generate`

Generates a new AI workout based on the provided parameters.

**Request Parameters:**

This endpoint supports both direct and wrapped parameter formats:

**Direct Format:**
```json
{
  "duration": 30,
  "difficulty": "intermediate", 
  "goals": "strength",
  "equipment": ["dumbbells", "resistance bands"],
  "restrictions": "knee injury",
  "specific_request": "A full body workout focused on strength building"
}
```

**Wrapped Format:**
```json
{
  "workout": {
    "duration": 30,
    "difficulty": "intermediate", 
    "goals": "strength",
    "equipment": ["dumbbells", "resistance bands"],
    "restrictions": "knee injury",
    "specific_request": "A full body workout focused on strength building"
  }
}
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| duration | integer | Yes | Workout duration in minutes |
| difficulty | string | Yes | Workout difficulty level ("beginner", "intermediate", "advanced") |
| goals | string | Yes | Training goal(s) (e.g., "strength", "cardio", "weight loss") |
| equipment | array | No | Available equipment as an array of strings |
| restrictions | string | No | Any health restrictions or limitations |
| specific_request | string | Yes | Specific workout request or description |

**Response:**

```json
{
  "success": true,
  "message": "Workout created successfully",
  "data": {
    "title": "30-Minute Full Body Strength Workout",
    "description": "A challenging intermediate workout focusing on building strength with minimal equipment.",
    "duration": 30,
    "difficulty": "intermediate",
    "equipment_required": ["dumbbells", "resistance bands"],
    "sections": [
      {
        "name": "Warm-up",
        "duration": 5,
        "exercises": [
          {
            "name": "Dynamic Stretching",
            "duration": "5 minutes",
            "description": "Perform arm circles, leg swings, hip rotations, and light jogging in place."
          }
        ]
      },
      {
        "name": "Main Workout",
        "duration": 20,
        "exercises": [
          {
            "name": "Dumbbell Squat",
            "sets": 3,
            "reps": 12,
            "description": "Hold dumbbells at shoulders, squat down until thighs are parallel to floor, then push back up."
          },
          {
            "name": "Resistance Band Row",
            "sets": 3,
            "reps": 15,
            "description": "Secure band to a sturdy object, hold handles with arms extended, pull elbows back squeezing shoulder blades."
          }
        ]
      },
      {
        "name": "Cool Down",
        "duration": 5,
        "exercises": [
          {
            "name": "Static Stretching",
            "duration": "5 minutes",
            "description": "Hold each stretch for 30 seconds targeting major muscle groups worked."
          }
        ]
      }
    ],
    "post_id": 123
  }
}
```

**Error Responses:**

Missing API Key:
```json
{
  "success": false,
  "message": "OpenAI API key not configured. Please set it in the FitCopilot settings.",
  "code": "missing_api_key"
}
```

Missing Parameters:
```json
{
  "success": false,
  "message": "Missing parameter(s): duration, goals",
  "code": "validation_error",
  "data": {
    "validation_errors": {
      "duration": "Duration is required.",
      "goals": "Goals is required."
    }
  }
}
```

Generation Error:
```json
{
  "success": false,
  "message": "Error communicating with AI provider: Rate limit exceeded",
  "code": "generation_error"
}
```

### Required Parameters
- `specific_request` - The user's specific request for the workout

### Optional Parameters
- `duration` - Workout duration in minutes (default: 30)
- `difficulty` - Workout difficulty level (default: "intermediate")
- `equipment` - Array of available equipment (default: [])
- `goals` - Training goals (default: "general fitness")
- `restrictions` - Any physical restrictions or limitations (default: "")

### Notes
- The `post_id` field in the response is required for subsequent API calls to reference this workout
- Both direct and wrapped request formats are supported
- The AI generation process is synchronous and may take several seconds to complete

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
      equipment: ['dumbbells', 'bench'],
      goals: 'strength',
      restrictions: 'lower back pain',
      specific_request: 'A quick upper body workout focusing on shoulders'
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

---

## Get User Profile

Retrieve the current user's fitness profile.

**Endpoint:** `GET /wp-json/fitcopilot/v1/profile`

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 123,
    "fitnessLevel": "intermediate",
    "workoutGoals": ["strength", "endurance"],
    "equipmentAvailable": "minimal",
    "workoutFrequency": 3,
    "workoutDuration": 30,
    "medicalConditions": [],
    "preferences": {
      "darkMode": false,
      "notifications": true,
      "metrics": "imperial"
    },
    "createdAt": "2023-07-15T14:30:00",
    "updatedAt": "2023-07-15T14:30:00"
  },
  "message": "Profile retrieved successfully"
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
async function getProfile() {
  const response = await fetch('/wp-json/fitcopilot/v1/profile', {
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

## Update User Profile

Update the current user's fitness profile.

**Endpoint:** `PUT /wp-json/fitcopilot/v1/profile`

### Request Formats

Both formats are supported for backward compatibility, but the wrapped format is preferred according to our API Design Guidelines.

#### Preferred Format (Wrapped)

```json
{
  "profile": {
    "fitnessLevel": "advanced",
    "workoutGoals": ["muscle-building"],
    "equipmentAvailable": "full",
    "workoutFrequency": 4,
    "workoutDuration": 45,
    "medicalConditions": ["lower back pain"],
    "preferences": {
      "darkMode": true,
      "notifications": true,
      "metrics": "metric"
    }
  }
}
```

#### Legacy Format (Direct)

```json
{
  "fitnessLevel": "advanced",
  "workoutGoals": ["muscle-building"],
  "equipmentAvailable": "full",
  "workoutFrequency": 4,
  "workoutDuration": 45,
  "medicalConditions": ["lower back pain"],
  "preferences": {
    "darkMode": true,
    "notifications": true,
    "metrics": "metric"
  }
}
```

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 123,
    "fitnessLevel": "advanced",
    "workoutGoals": ["muscle-building"],
    "equipmentAvailable": "full",
    "workoutFrequency": 4,
    "workoutDuration": 45,
    "medicalConditions": ["lower back pain"],
    "preferences": {
      "darkMode": true,
      "notifications": true,
      "metrics": "metric"
    },
    "createdAt": "2023-07-15T14:30:00",
    "updatedAt": "2023-07-16T09:15:00"
  },
  "message": "Profile updated successfully"
}
```

### Error Responses

**Invalid Parameters (400)**
```json
{
  "success": false,
  "message": "Invalid parameters.",
  "code": "invalid_params"
}
```

**Unauthorized (401)**
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
// Example using fetch API with preferred wrapped format
async function updateProfile(profileData) {
  const response = await fetch('/wp-json/fitcopilot/v1/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': wpApiSettings.nonce
    },
    body: JSON.stringify({
      profile: profileData
    })
  });
  
  const data = await response.json();
  return data;
}
```

## Implementation Details

The API endpoints are implemented in the files:
- [`WorkoutEndpoints.php`](../../src/php/API/WorkoutEndpoints.php) - For workout-related endpoints
- [`ProfileEndpoints.php`](../../src/php/API/ProfileEndpoints.php) - For profile-related endpoints

These files use WordPress REST API functions to register endpoints and handle requests according to the [API Design Guidelines](./api-design-guidelines.md).

## See Also

- [API Design Guidelines](./api-design-guidelines.md)
- [Authentication](./authentication.md)
- [Error Handling](./error-handling.md)
- [OpenAPI Specification](./openapi-spec.md) 