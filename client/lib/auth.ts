// Authentication utility functions

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
  
  if (!authCookie) return null;
  
  return authCookie.split('=')[1];
}

/**
 * Set the authentication token in a cookie
 */
export function setAuthToken(token: string, maxAge: number = 86400): void {
  document.cookie = `auth-token=${token};path=/;max-age=${maxAge};SameSite=Strict`;
}

/**
 * Remove the authentication token
 */
export function removeAuthToken(): void {
  document.cookie = 'auth-token=; path=/; max-age=0';
}

/**
 * Get user data from localStorage
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Set user data in localStorage
 */
export function setUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
  removeAuthToken();
  removeUser();
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
