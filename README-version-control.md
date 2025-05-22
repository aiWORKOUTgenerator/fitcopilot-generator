# FitCopilot Workout Version Control

This document describes the workout version control implementation in the FitCopilot WordPress plugin.

## Overview

The version control system provides a robust mechanism for tracking changes to workouts, preventing conflicts when multiple clients try to update the same workout, and enabling future features like workout history and version comparison.

## Core Components

### 1. VersioningService

The `VersioningService` class is located in `src/php/Service/Versioning/VersioningService.php` and provides core functionality:

- Creating version records for workouts
- Tracking metadata changes
- Validating versions
- Managing database transactions
- Determining types of changes
- Generating change summaries

### 2. VersioningUtils

The `VersioningUtils` class is located in `src/php/Service/Versioning/VersioningUtils.php` and provides utility functions:

- Getting version metadata
- Validating client versions
- Managing transactions
- Getting workout states
- Creating version records

### 3. APIUtils Extensions

The `APIUtils` class has been extended with methods to standardize version handling:

- `add_version_metadata_to_response`: Consistently adds version metadata to API responses
- `set_etag_header`: Sets the ETag header for conditional requests
- `check_if_match`: Validates the client's ETag against the current version
- `create_precondition_failed`: Creates standardized error responses for version conflicts
- `is_modified`: Checks if a resource has been modified since the client's last request
- `create_not_modified_response`: Creates standardized 304 Not Modified responses

## API Endpoint Implementation

All workout endpoints have been updated to include version metadata in responses and handle version conflicts:

### Generate Endpoint

- Creates new workouts with initial version 1
- Includes version metadata in the response

### Retrieval Endpoint

- Supports conditional GET with ETag headers
- Returns 304 Not Modified when the client has the current version
- Includes version metadata in all responses

### Update Endpoint

- Validates client version against server version
- Prevents conflicts by checking ETags and version numbers
- Creates new version records when workouts are updated
- Returns version metadata and change information

### Completion Endpoint

- Updates workout completion data with version tracking
- Creates version records for completions
- Returns version metadata in responses

## Version Metadata Structure

All API responses now include consistent version metadata:

```json
{
  "id": 123,
  "title": "Workout Title",
  // other workout data...
  "version": 3,
  "last_modified": "2023-08-15 14:32:45",
  "modified_by": 1,
  "change_type": "metadata",
  "change_summary": "difficulty updated, duration updated"
}
```

## Optimistic Concurrency Control

The system implements optimistic concurrency control through:

1. **ETag Headers**: Clients can send the `If-Match` header with their saved version, and the server will reject the request if the version doesn't match.

2. **Version Numbers**: Clients can include a `version` field in their update requests, and the server will validate it against the current version.

3. **Transaction Support**: All update operations use database transactions to ensure atomic updates.

## Conflict Handling

When a version conflict is detected, the server returns a detailed error response:

```json
{
  "success": false,
  "message": "Version conflict: Client version 2 does not match server version 3.",
  "code": "version_conflict",
  "data": {
    "id": 123,
    "current_version": 3,
    "client_version": 2
  }
}
```

The client application can use this information to:
1. Reload the latest version of the workout
2. Show a merge UI to the user
3. Attempt to automatically merge changes
4. Notify the user of the conflict

## Usage Example

### Client-Side Implementation

```javascript
// Get workout
async function getWorkout(id) {
  const response = await fetch(`/wp-json/fitcopilot/v1/workouts/${id}`, {
    headers: {
      'If-None-Match': localStorage.getItem(`workout_${id}_etag`) || ''
    }
  });
  
  // If not modified, use cached version
  if (response.status === 304) {
    return JSON.parse(localStorage.getItem(`workout_${id}`));
  }
  
  const data = await response.json();
  
  // Save the ETag for future requests
  const etag = response.headers.get('ETag');
  if (etag) {
    localStorage.setItem(`workout_${id}_etag`, etag);
    localStorage.setItem(`workout_${id}`, JSON.stringify(data));
  }
  
  return data;
}

// Update workout
async function updateWorkout(id, workout) {
  const response = await fetch(`/wp-json/fitcopilot/v1/workouts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'If-Match': localStorage.getItem(`workout_${id}_etag`) || ''
    },
    body: JSON.stringify({
      ...workout,
      version: workout.version
    })
  });
  
  const data = await response.json();
  
  if (!data.success && data.code === 'version_conflict') {
    // Handle conflict
    console.error('Version conflict detected!');
    // Reload the latest version and show merge UI
    return handleVersionConflict(id, workout, data.data.current_version);
  }
  
  // Update stored ETag
  const etag = response.headers.get('ETag');
  if (etag) {
    localStorage.setItem(`workout_${id}_etag`, etag);
    localStorage.setItem(`workout_${id}`, JSON.stringify(data));
  }
  
  return data;
}
```

## Future Enhancements

1. **Workout History UI**: Allow users to view the change history of a workout
2. **Version Comparison**: Compare different versions of a workout
3. **Branching and Merging**: Create workout variations based on existing workouts
4. **Collaborative Editing**: Enable real-time collaborative editing of workouts
5. **Autosave and Recovery**: Implement autosave functionality with version tracking 