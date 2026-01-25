'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/lib/types/auth';
import { getAccessToken, clearTokens, setTokens, hasValidToken, getRefreshToken } from '@/lib/utils/token';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { getErrorMessage, isRetryableError, isAuthError, logError } from '@/lib/utils/error';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('[AUTH] Initializing authentication...');
      
      if (!hasValidToken()) {
        console.log('[AUTH] No valid token found, skipping user fetch');
        setIsLoading(false);
        return;
      }

      try {
        console.log('[AUTH] Valid token found, fetching user profile...');
        const { authApi } = await import('@/lib/api/auth');
        const userData = await authApi.getCurrentUser();
        
        console.log('[AUTH] User profile fetched successfully:', {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
        });
        
        setUser(userData);
        setRetryCount(0); // Reset retry count on success
      } catch (error) {
        logError('AUTH_INIT', error, { retryCount });
        
        // Handle different error scenarios
        if (isAuthError(error)) {
          // Authentication error - token is invalid or user doesn't have permission
          console.error('[AUTH] Authentication error:', getErrorMessage(error));
          
          const refreshToken = getRefreshToken();
          if (refreshToken && error instanceof AxiosError && error.response?.status === 401) {
            console.log('[AUTH] Refresh token exists, axios interceptor will handle refresh');
            // Don't clear tokens yet, let the interceptor try to refresh
            // If it fails, the interceptor will redirect to login
          } else {
            console.error('[AUTH] Clearing session due to auth error');
            clearTokens();
            setUser(null);
          }
        } else if (isRetryableError(error)) {
          // Network or server error - retry with exponential backoff
          console.error('[AUTH] Retryable error:', getErrorMessage(error));
          
          if (retryCount < 3) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s
            console.log(`[AUTH] Retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`);
            
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, delay);
            return; // Don't set loading to false yet
          } else {
            console.error('[AUTH] Max retries reached, giving up');
            // Don't clear tokens on retryable errors - keep session for retry later
            console.log('[AUTH] Keeping tokens for future retry');
          }
        } else {
          // Other errors (404, validation, etc.)
          console.error('[AUTH] Non-retryable error:', getErrorMessage(error));
          clearTokens();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [retryCount]);

  const login = useCallback((accessToken: string, refreshToken: string, userData: User) => {
    console.log('[AUTH] User logged in:', {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
    });
    setTokens(accessToken, refreshToken);
    setUser(userData);
    setRetryCount(0); // Reset retry count on new login
  }, []);

  const logout = useCallback(() => {
    console.log('[AUTH] User logged out');
    clearTokens();
    setUser(null);
    setRetryCount(0);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((userData: User) => {
    console.log('[AUTH] User profile updated:', {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
    });
    setUser(userData);
  }, []);

  const refreshUserProfile = useCallback(async () => {
    console.log('[AUTH] Manually refreshing user profile...');
    
    if (!hasValidToken()) {
      console.log('[AUTH] No valid token, cannot refresh profile');
      throw new Error('No valid authentication token');
    }

    try {
      const { authApi } = await import('@/lib/api/auth');
      const userData = await authApi.getCurrentUser();
      console.log('[AUTH] User profile refreshed successfully');
      setUser(userData);
    } catch (error) {
      logError('AUTH_REFRESH', error);
      
      if (isAuthError(error)) {
        console.log('[AUTH] Token invalid during manual refresh, logging out');
        clearTokens();
        setUser(null);
        router.push('/login');
      }
      
      throw error; // Re-throw so caller can handle
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateUser,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
