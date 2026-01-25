import { AxiosError } from 'axios';

/**
 * Extract a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Check for backend error message
    const backendMessage = error.response?.data?.message;
    if (backendMessage && typeof backendMessage === 'string') {
      return backendMessage;
    }

    // Handle specific HTTP status codes
    switch (error.response?.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 422:
        return 'The data provided is invalid. Please check and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'A server error occurred. Please try again later.';
      case 502:
        return 'The server is temporarily unavailable. Please try again.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      case 504:
        return 'The request timed out. Please try again.';
      default:
        break;
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }

    // Generic axios error
    return error.message || 'An unexpected error occurred.';
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Determine if an error is retryable (network/server errors)
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  // Network errors are retryable
  if (error.code === 'ERR_NETWORK' || !error.response) {
    return true;
  }

  // Server errors (5xx) are retryable
  const status = error.response?.status;
  return status !== undefined && status >= 500 && status < 600;
}

/**
 * Determine if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  return error.response?.status === 401 || error.response?.status === 403;
}

/**
 * Log error with context for debugging
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>) {
  console.error(`[ERROR] ${context}:`, {
    message: getErrorMessage(error),
    error,
    ...additionalInfo,
  });
}
