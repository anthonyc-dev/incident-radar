/**
 * Auth-related types for token-based authentication.
 * Aligned with backend PublicUser and auth API contracts.
 */

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  deviceId: string;
}

export interface LoginResponse {
  user: User;
}

export interface AuthApiError {
  error?: string;
  message?: string;
}
