const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Helper to set cookie
const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof window !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

// Helper to get cookie
const getCookie = (name: string): string | null => {
  if (typeof window !== 'undefined') {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

// Helper to delete cookie
const deleteCookie = (name: string): void => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    // Store in both localStorage (for backward compatibility) and cookies (for middleware)
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    // Also store in cookies for middleware access
    setCookie(ACCESS_TOKEN_KEY, accessToken, 7); // 7 days
    setCookie(REFRESH_TOKEN_KEY, refreshToken, 7);
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try localStorage first, then cookies
    return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try localStorage first, then cookies
    return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    // Clear from localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // Clear from cookies
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  }
};

export const hasValidToken = (): boolean => {
  return !!getAccessToken();
};
