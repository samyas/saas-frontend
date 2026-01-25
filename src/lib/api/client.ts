import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/lib/utils/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add access token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} (authenticated)`);
    } else {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} (unauthenticated)`);
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log error details
    if (error.response) {
      console.error(`[API] ${error.response.status} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, {
        status: error.response.status,
        message: (error.response.data as any)?.message || error.message,
      });
    } else if (error.request) {
      console.error('[API] No response received:', {
        url: originalRequest.url,
        code: error.code,
        message: error.message,
      });
    } else {
      console.error('[API] Request setup error:', error.message);
    }

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('[API] Attempting token refresh...');

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('[API] No refresh token available, redirecting to login');
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        console.log('[API] Calling refresh token endpoint...');
        const response = await axios.post(`${API_URL}/v1/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        console.log('[API] Token refresh successful');
        setTokens(accessToken, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        console.log('[API] Retrying original request with new token...');
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
