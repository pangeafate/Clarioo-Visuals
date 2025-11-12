/**
 * 🎨 MOCK AUTHENTICATION SERVICE
 *
 * Purpose: Simulates authentication behavior for visual prototype.
 * Uses dummy data from /src/data/api/auth.json without real backend.
 *
 * Mock Behavior:
 * - Always succeeds for any valid login/signup attempt
 * - Returns demo user and session data
 * - Simulates realistic network delays
 * - Ephemeral session storage (resets on page refresh)
 *
 * Integration Notes:
 * - When integrating Supabase, replace this service with supabase.auth methods
 * - Type interfaces match Supabase auth types for easy migration
 * - Remove all simulateDelay() calls
 * - Remove authData import and currentSession variable
 * - Update error handling to match Supabase error structure
 *
 * @module services/mock/authService
 */

import authData from '@/data/api/auth.json';
import { simulateDelay, getCurrentTimestamp } from '@/utils/mockHelpers';
import type {
  User,
  Session,
  AuthError,
  AuthResponse,
  LoginCredentials,
  RegistrationData,
  UpdateUserRequest
} from '@/types';

// In-memory session storage (ephemeral - resets on refresh)
let currentSession: Session | null = null;

/**
 * Mock sign in - always succeeds with valid input
 *
 * Purpose: Simulates user login without real authentication backend.
 * Returns demo user and session data for any valid email/password.
 *
 * Mock Behavior:
 * - Validates email format (must contain @)
 * - Validates required fields (email and password)
 * - Always succeeds with demo data if validation passes
 * - Stores session in memory (ephemeral)
 * - Simulates 800ms network delay
 *
 * @param email - User email (any valid email format accepted)
 * @param password - User password (any password accepted)
 * @returns Promise resolving to AuthResponse with user, session, or error
 *
 * @example
 * ```typescript
 * const response = await signIn('user@example.com', 'password123');
 * if (response.error) {
 *   console.error('Login failed:', response.error.message);
 * } else {
 *   console.log('Logged in as:', response.user?.email);
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.signInWithPassword() for production
 * - Currently returns same demo user regardless of credentials
 * - Session persists only until page refresh
 * - No actual password verification in prototype
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  await simulateDelay(800);

  // Validate input format (basic check)
  if (!email || !password) {
    return {
      user: null,
      session: null,
      error: { message: 'Email and password are required', code: 'VALIDATION_ERROR' }
    };
  }

  if (!email.includes('@')) {
    return {
      user: null,
      session: null,
      error: { message: 'Invalid email format', code: 'VALIDATION_ERROR' }
    };
  }

  // Always succeed with demo data
  const session: Session = {
    ...authData.session,
    user: authData.user
  };

  currentSession = session;

  return {
    user: authData.user,
    session,
    error: null
  };
};

/**
 * Mock sign up - always succeeds with valid input
 *
 * Purpose: Simulates user registration without real backend.
 * Creates a new user account and returns session data.
 *
 * Mock Behavior:
 * - Validates email format and password strength
 * - Always succeeds if validation passes
 * - Merges provided data with demo user data
 * - Creates active session immediately
 * - Simulates 1000ms network delay
 *
 * @param email - User email (must be valid format)
 * @param password - User password (minimum 6 characters)
 * @param fullName - Optional user's full name (defaults to demo data)
 * @param companyName - Optional user's company name (defaults to demo data)
 * @returns Promise resolving to AuthResponse with user, session, or error
 *
 * @example
 * ```typescript
 * const response = await signUp(
 *   'newuser@example.com',
 *   'securepass123',
 *   'John Doe',
 *   'Acme Corp'
 * );
 * if (response.error) {
 *   console.error('Signup failed:', response.error.message);
 * } else {
 *   console.log('Account created:', response.user?.email);
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.signUp() for production
 * - No duplicate email checking in prototype
 * - No email verification in prototype
 * - Session persists only until page refresh
 */
export const signUp = async (
  email: string,
  password: string,
  fullName?: string,
  companyName?: string
): Promise<AuthResponse> => {
  await simulateDelay(1000);

  // Validate input format
  if (!email || !password) {
    return {
      user: null,
      session: null,
      error: { message: 'Email and password are required', code: 'VALIDATION_ERROR' }
    };
  }

  if (!email.includes('@')) {
    return {
      user: null,
      session: null,
      error: { message: 'Invalid email format', code: 'VALIDATION_ERROR' }
    };
  }

  if (password.length < 6) {
    return {
      user: null,
      session: null,
      error: { message: 'Password must be at least 6 characters', code: 'VALIDATION_ERROR' }
    };
  }

  // Create user with provided data or defaults
  const user: User = {
    ...authData.user,
    email,
    name: fullName || authData.user.name,
    company: companyName || authData.user.company
  };

  const session: Session = {
    ...authData.session,
    user
  };

  currentSession = session;

  return {
    user,
    session,
    error: null
  };
};

/**
 * Mock sign out - always succeeds
 *
 * Purpose: Simulates user logout without backend.
 * Clears the ephemeral session from memory.
 *
 * Mock Behavior:
 * - Always succeeds
 * - Clears currentSession immediately
 * - Simulates 300ms network delay
 * - No server-side session invalidation
 *
 * @returns Promise resolving to object with potential error (always null)
 *
 * @example
 * ```typescript
 * await signOut();
 * console.log('User signed out');
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.signOut() for production
 * - In prototype, simply clears memory (no API call)
 * - Session is already ephemeral (lost on page refresh)
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  await simulateDelay(300);

  currentSession = null;

  return { error: null };
};

/**
 * Get current session
 *
 * Purpose: Retrieves the active user session.
 * Used for checking authentication status and accessing tokens.
 *
 * Mock Behavior:
 * - Returns currentSession from memory
 * - Always succeeds (no auth errors)
 * - Simulates 200ms network delay
 * - Returns null if no session exists
 *
 * @returns Promise resolving to session and error object
 *
 * @example
 * ```typescript
 * const { session, error } = await getSession();
 * if (session) {
 *   console.log('User is authenticated:', session.user.email);
 * } else {
 *   console.log('No active session');
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.getSession() for production
 * - In prototype, reads from memory (not persistent)
 * - Real implementation would verify token validity
 */
export const getSession = async (): Promise<{
  session: Session | null;
  error: AuthError | null;
}> => {
  await simulateDelay(200);

  return {
    session: currentSession,
    error: null
  };
};

/**
 * Get current user
 *
 * Purpose: Retrieves the authenticated user's data.
 * Convenience method that extracts user from session.
 *
 * Mock Behavior:
 * - Returns user from currentSession
 * - Always succeeds (no auth errors)
 * - Simulates 200ms network delay
 * - Returns null if no session exists
 *
 * @returns Promise resolving to user and error object
 *
 * @example
 * ```typescript
 * const { user, error } = await getUser();
 * if (user) {
 *   console.log('Current user:', user.name);
 * } else {
 *   console.log('Not authenticated');
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.getUser() for production
 * - Equivalent to getSession() but returns only user data
 * - Real implementation would fetch fresh user data from server
 */
export const getUser = async (): Promise<{
  user: User | null;
  error: AuthError | null;
}> => {
  await simulateDelay(200);

  return {
    user: currentSession?.user || null,
    error: null
  };
};

/**
 * Update user profile
 *
 * Purpose: Updates user profile information.
 * Changes are ephemeral in prototype (not persisted).
 *
 * Mock Behavior:
 * - Requires active session
 * - Merges updates with existing user data
 * - Updates updated_at timestamp
 * - Changes persist only in memory
 * - Simulates 500ms network delay
 *
 * @param updates - Partial user object with fields to update
 * @returns Promise resolving to AuthResponse with updated user/session
 *
 * @example
 * ```typescript
 * const response = await updateProfile({
 *   name: 'John Smith',
 *   company: 'New Company Inc'
 * });
 * if (response.user) {
 *   console.log('Profile updated:', response.user.name);
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.updateUser() for production
 * - Changes are NOT persisted in prototype
 * - Real implementation would save to database
 * - Lost on page refresh in prototype
 */
export const updateProfile = async (
  updates: Partial<User>
): Promise<AuthResponse> => {
  await simulateDelay(500);

  if (!currentSession) {
    return {
      user: null,
      session: null,
      error: { message: 'No active session', code: 'AUTH_ERROR' }
    };
  }

  // Update user in session (ephemeral)
  const updatedUser = {
    ...currentSession.user,
    ...updates,
    updated_at: getCurrentTimestamp()
  };

  currentSession = {
    ...currentSession,
    user: updatedUser
  };

  return {
    user: updatedUser,
    session: currentSession,
    error: null
  };
};

/**
 * Reset password - mock implementation
 *
 * Purpose: Initiates password reset flow.
 * In prototype, validates email but doesn't send actual email.
 *
 * Mock Behavior:
 * - Validates email format
 * - Always succeeds if valid email
 * - No actual email sent in prototype
 * - Simulates 600ms network delay
 *
 * @param email - User email for password reset
 * @returns Promise resolving to object with potential error
 *
 * @example
 * ```typescript
 * const { error } = await resetPassword('user@example.com');
 * if (!error) {
 *   console.log('Password reset email sent (simulated)');
 * }
 * ```
 *
 * @remarks
 * - Replace with supabase.auth.resetPasswordForEmail() for production
 * - No email actually sent in prototype
 * - Real implementation would trigger email with reset link
 * - No password reset token generated in prototype
 */
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  await simulateDelay(600);

  if (!email || !email.includes('@')) {
    return {
      error: { message: 'Invalid email format', code: 'VALIDATION_ERROR' }
    };
  }

  // Simulate success (no actual email sent in prototype)
  return { error: null };
};

/**
 * Check if user is authenticated
 *
 * Purpose: Synchronous check for authentication status.
 * Convenience utility for components.
 *
 * @returns true if user has active session, false otherwise
 *
 * @example
 * ```typescript
 * if (isAuthenticated()) {
 *   console.log('User is logged in');
 * } else {
 *   console.log('User is not logged in');
 * }
 * ```
 *
 * @remarks
 * - Synchronous (no delay)
 * - Simply checks currentSession !== null
 * - Use getSession() for async check with full session data
 */
export const isAuthenticated = (): boolean => {
  return currentSession !== null;
};
