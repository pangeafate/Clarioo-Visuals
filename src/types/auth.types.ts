/**
 * Authentication-related type definitions
 *
 * This file contains all types related to user authentication,
 * sessions, and user management.
 *
 * @module types/auth
 */

/**
 * User role type
 * Defines available user roles in the system
 */
export type UserRole = 'user' | 'admin' | 'vendor';

/**
 * User status type
 * Tracks user account state
 */
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Main user interface
 * Represents a user account in the system
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login?: string;
  avatar_url?: string;
  company?: string;
  phone?: string;
}

/**
 * User profile (subset of User for public display)
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  company?: string;
}

/**
 * Session interface
 * Represents an active user session
 */
export interface Session {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  name: string;
  company?: string;
  phone?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirmation
 */
export interface PasswordResetConfirmation {
  token: string;
  new_password: string;
}

/**
 * Authentication response
 * Standard response structure for auth operations
 */
export interface AuthResponse {
  session: Session | null;
  user: User | null;
  error: AuthError | null;
}

/**
 * Authentication error
 */
export interface AuthError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string;
}

/**
 * Email verification confirmation
 */
export interface EmailVerificationConfirmation {
  token: string;
  user_id: string;
}

/**
 * User update request
 */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar_url?: string;
  company?: string;
  phone?: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

/**
 * Auth state
 * Represents the current authentication state in the application
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

/**
 * OAuth provider type
 */
export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'apple';

/**
 * OAuth login request
 */
export interface OAuthLoginRequest {
  provider: OAuthProvider;
  redirect_url?: string;
}

/**
 * Token refresh request
 */
export interface TokenRefreshRequest {
  refresh_token: string;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

/**
 * User invitation
 */
export interface UserInvitation {
  email: string;
  role: UserRole;
  invited_by: string;
  expires_at: string;
  token: string;
}

/**
 * Accept invitation request
 */
export interface AcceptInvitationRequest {
  token: string;
  password: string;
  name: string;
}
