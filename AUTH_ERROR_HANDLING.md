# Authentication Error Handling Documentation

## Overview
The authentication system implements comprehensive error handling to provide a robust user experience even when network or server issues occur.

## Error Handling Features

### 1. **Automatic Token Refresh**
- When a 401 (Unauthorized) error occurs, the system automatically attempts to refresh the access token using the refresh token
- If refresh succeeds, the original request is retried transparently
- If refresh fails, user is redirected to login page

### 2. **Retry Logic with Exponential Backoff**
- Server errors (5xx) and network errors trigger automatic retries
- Uses exponential backoff: 1s → 2s → 4s (max 10s)
- Maximum 3 retry attempts before giving up
- User session is preserved during retries

### 3. **Network Error Handling**
- Detects offline/network issues
- Keeps authentication tokens to allow retry when connection restored
- User can continue working with cached data (if applicable)

### 4. **Granular Error Classification**

#### Authentication Errors (401, 403)
- **401 Unauthorized**: Token expired or invalid → Attempt refresh
- **403 Forbidden**: Insufficient permissions → Clear session

#### Client Errors (4xx)
- **404 Not Found**: User deleted → Clear session
- **422 Validation**: Invalid data → Show validation error
- **429 Rate Limit**: Too many requests → Show retry message

#### Server Errors (5xx)
- **500 Internal Server Error**: Retry with backoff
- **502 Bad Gateway**: Retry with backoff
- **503 Service Unavailable**: Retry with backoff
- **504 Gateway Timeout**: Retry with backoff

#### Network Errors
- **ERR_NETWORK**: No internet connection → Keep session for retry
- **ECONNABORTED**: Request timeout → Retry with backoff

## Implementation Details

### AuthContext Error Handling
Located in: `frontend/src/lib/context/AuthContext.tsx`

**Key Features:**
- Logs all authentication events with context
- Differentiates between retryable and non-retryable errors
- Preserves session on transient failures
- Clears session only when necessary

**Example Log Output:**
```
[AUTH] Initializing authentication...
[AUTH] Valid token found, fetching user profile...
[AUTH] User profile fetched successfully: { id: '...', email: '...', firstName: '...' }
```

### API Client Error Handling
Located in: `frontend/src/lib/api/client.ts`

**Key Features:**
- Logs all API requests and responses
- Automatic token refresh on 401 errors
- 30-second request timeout
- Detailed error logging with context

**Example Log Output:**
```
[API] GET /v1/auth/me (authenticated)
[API] 200 GET /v1/auth/me
```

### Error Utility Functions
Located in: `frontend/src/lib/utils/error.ts`

**Functions:**
- `getErrorMessage(error)`: Extracts user-friendly error message
- `isRetryableError(error)`: Determines if error should be retried
- `isAuthError(error)`: Checks if error is authentication-related
- `logError(context, error, info)`: Logs error with context

## Error Scenarios and Responses

| Scenario | System Response | User Impact |
|----------|----------------|-------------|
| Token expired | Auto-refresh token | Seamless, no action needed |
| Refresh token expired | Redirect to login | Must log in again |
| Server down (5xx) | Retry 3x with backoff | Brief delay, then error message |
| Network offline | Keep session, allow retry | Can retry when online |
| User deleted (404) | Clear session, redirect | Must contact support |
| Invalid permissions (403) | Clear session, show error | Access denied message |
| Rate limited (429) | Show retry message | Wait and retry |

## Usage Examples

### 1. Manual User Profile Refresh
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { refreshUserProfile } = useAuth();
  
  const handleRefresh = async () => {
    try {
      await refreshUserProfile();
      toast({ title: 'Profile refreshed' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: getErrorMessage(error),
        variant: 'destructive'
      });
    }
  };
}
```

### 2. Custom Error Handling
```typescript
import { getErrorMessage, isRetryableError } from '@/lib/utils/error';

try {
  await someApiCall();
} catch (error) {
  if (isRetryableError(error)) {
    // Show retry UI
    setShowRetryButton(true);
  } else {
    // Show error message
    toast({ 
      title: 'Error',
      description: getErrorMessage(error),
      variant: 'destructive'
    });
  }
}
```

## Debugging

### Enable Detailed Logging
All authentication and API operations log to the browser console with prefixes:
- `[AUTH]`: Authentication context events
- `[API]`: API client requests/responses
- `[ERROR]`: Error details with context

### Check Authentication State
Open browser DevTools console and look for:
```javascript
// Check tokens
localStorage.getItem('access_token')
document.cookie

// Check current state
// In React DevTools, find AuthContext
```

### Common Issues

**Issue**: User logged out after refresh
**Debug**: Check console for `[AUTH]` logs, look for 401 or network errors

**Issue**: Infinite retry loop
**Debug**: Check for 5xx errors in `[API]` logs, verify retry count

**Issue**: Token refresh fails
**Debug**: Check `[API] Token refresh failed` log, verify refresh token validity

## Best Practices

1. **Always use error utilities**: Use `getErrorMessage()` for user-facing errors
2. **Don't show technical errors**: Display user-friendly messages
3. **Preserve user session**: Only clear tokens when absolutely necessary
4. **Log everything**: Helps with debugging production issues
5. **Handle edge cases**: Account for offline mode, slow networks, etc.

## Configuration

### Timeout Settings
- API request timeout: 30 seconds (`apiClient` configuration)
- Retry delays: 1s, 2s, 4s (exponential backoff)
- Max retry attempts: 3

### Token Expiration
- Access token: 1 hour (backend configuration)
- Refresh token: 7 days (backend configuration)
- Token storage: Cookies + localStorage for redundancy

## Future Enhancements

1. **Offline mode**: Queue requests when offline, sync when online
2. **Toast notifications**: Show user-friendly error toasts automatically
3. **Retry UI**: Show retry button for failed requests
4. **Health check**: Ping API before critical operations
5. **Error analytics**: Track error rates and types
