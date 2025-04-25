# API Authentication

The FitCopilot Workout Generator API requires authentication for all endpoints. This document outlines the authentication methods supported and how to implement them in your applications.

## Authentication Methods

### Cookie Authentication

For browser-based applications running within WordPress, cookie-based authentication is used. This is the default authentication method when using the API from within a WordPress page or admin area.

#### Requirements:

- User must be logged in to WordPress
- Nonce verification is required for CSRF protection

#### Implementation:

```javascript
// Example using fetch API with cookie authentication
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `/wp-json/fitcopilot/v1/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'X-WP-Nonce': wpApiSettings.nonce,
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin' // Important for including cookies
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  return response.json();
}
```

### Application Password Authentication

For external applications or services that need to access the API, WordPress Application Passwords provide a secure authentication method without sharing the main account password.

#### Requirements:

- WordPress 5.6 or higher
- Application password generated for the user

#### How to Generate Application Password:

1. Go to WordPress admin → Users → Profile
2. Scroll down to "Application Passwords" section
3. Enter a name for the application (e.g., "FitCopilot API Client")
4. Click "Add New Application Password"
5. Copy the generated password (shown only once)

#### Implementation:

```javascript
// Example using fetch API with application password
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `https://example.com/wp-json/fitcopilot/v1/${endpoint}`;
  
  // Basic auth credentials
  const username = 'your_username';
  const appPassword = 'xxxx xxxx xxxx xxxx xxxx xxxx'; // Space-separated format
  const credentials = btoa(`${username}:${appPassword}`);
  
  const options = {
    method,
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  return response.json();
}
```

## Authorization and Permissions

By default, all API endpoints require the user to be authenticated (logged in). Some endpoints may have additional permission requirements.

### Default Permission Callback

The API uses a permission callback that checks if the user is logged in:

```php
/**
 * Check if the current user has necessary permissions
 *
 * @return bool Whether the user has permission
 */
public function user_permissions_check() {
    return is_user_logged_in();
}
```

### Custom Permissions

For certain operations like viewing or updating workouts, additional checks ensure users can only access their own workouts.

## Error Responses

If authentication fails, the API will return one of the following responses:

### Not Logged In (401)
```json
{
  "code": "rest_forbidden",
  "message": "You are not currently logged in.",
  "data": {
    "status": 401
  }
}
```

### Invalid or Expired Nonce (403)
```json
{
  "code": "rest_cookie_invalid_nonce",
  "message": "Cookie nonce is invalid",
  "data": {
    "status": 403
  }
}
```

### Invalid Credentials (401)
```json
{
  "code": "rest_authentication_error",
  "message": "Invalid credentials.",
  "data": {
    "status": 401
  }
}
```

## Implementation in Front-End Code

The FitCopilot front-end automatically handles authentication using WordPress's built-in `wp-api-fetch` library, which is configured with the correct nonce during plugin initialization:

```javascript
wp.apiFetch.use(wp.apiFetch.createNonceMiddleware(fitcopilotData.nonce));
wp.apiFetch.use(wp.apiFetch.createRootURLMiddleware(fitcopilotData.apiBase));
```

This allows React components to make authenticated API calls without handling the nonce directly.

## Security Best Practices

1. **Always use HTTPS** for API communication to prevent credential interception
2. **Regenerate application passwords** if you suspect they've been compromised
3. **Set appropriate permissions** for user roles accessing the API
4. **Use nonces** for all form submissions and AJAX requests
5. **Implement rate limiting** for API requests to prevent abuse

## Related Documentation

- [WordPress Authentication Documentation](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)
- [Application Passwords Documentation](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/)
- [Error Handling](./error-handling.md) 