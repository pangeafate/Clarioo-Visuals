/**
 * 🎨 MOCK HELPERS - Utility Functions for Prototype
 *
 * Purpose: Centralized utility functions for simulating backend behavior in the visual prototype
 *
 * Mock Behavior:
 * - Network delay simulation for realistic UX
 * - ID generation for mock data
 * - Timestamp utilities for mock records
 *
 * Integration Notes:
 * - These utilities are only needed for the prototype phase
 * - When integrating real backend, remove calls to simulateDelay
 * - Replace generateId with database-generated IDs
 * - getCurrentTimestamp can remain as a general utility
 *
 * @module utils/mockHelpers
 */

/**
 * Simulates a network delay for mock services
 *
 * Purpose: Provides realistic loading states without actual backend calls
 * This helps demonstrate proper loading UI patterns and gives users
 * a sense of normal application behavior.
 *
 * @param ms - Milliseconds to delay (default: 800)
 * @returns Promise that resolves after the specified delay
 *
 * @example
 * ```typescript
 * // Simulate standard API delay
 * await simulateDelay();
 *
 * // Simulate slower operation
 * await simulateDelay(2000);
 *
 * // Instant response (no delay)
 * await simulateDelay(0);
 * ```
 *
 * @remarks
 * - Default 800ms provides good UX without feeling slow
 * - Use longer delays (1500-2500ms) for AI operations
 * - Use 0ms for instant responses when testing
 */
export const simulateDelay = (ms: number = 800): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Simulates variable AI processing time
 *
 * Purpose: AI operations typically have variable response times.
 * This function simulates that variability with a random delay
 * within the specified range.
 *
 * @param min - Minimum delay in milliseconds (default: 1500)
 * @param max - Maximum delay in milliseconds (default: 2500)
 * @returns Promise that resolves after a random delay between min and max
 *
 * @example
 * ```typescript
 * // Simulate AI criteria generation (1.5-2.5 seconds)
 * await simulateAIDelay();
 *
 * // Simulate faster AI operation (0.5-1 second)
 * await simulateAIDelay(500, 1000);
 *
 * // Simulate heavy AI processing (3-5 seconds)
 * await simulateAIDelay(3000, 5000);
 * ```
 *
 * @remarks
 * - Random delay creates more realistic AI behavior
 * - Use for operations that would involve OpenAI API calls
 * - Helps demonstrate proper loading states for variable operations
 */
export const simulateAIDelay = (min: number = 1500, max: number = 2500): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Generates a unique ID with optional prefix
 *
 * Purpose: Creates unique identifiers for mock data records.
 * Uses timestamp + random string for uniqueness.
 *
 * @param prefix - Optional prefix for the ID (e.g., 'project', 'vendor', 'user')
 * @returns Unique ID string in format: prefix_timestamp_random
 *
 * @example
 * ```typescript
 * // Generate project ID: "project_1699876543210_a3f9c2"
 * const projectId = generateId('project');
 *
 * // Generate vendor ID: "vendor_1699876543211_b4e8d3"
 * const vendorId = generateId('vendor');
 *
 * // Generate generic ID: "1699876543212_c5f9e4"
 * const genericId = generateId();
 * ```
 *
 * @remarks
 * - IDs are guaranteed unique within same millisecond due to random suffix
 * - Format matches common UUID patterns for consistency
 * - When integrating backend, replace with database-generated IDs or UUIDs
 * - Prefix helps with debugging and identifying record types
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

/**
 * Returns current timestamp in ISO 8601 format
 *
 * Purpose: Provides consistent timestamp format for all mock records.
 * ISO 8601 is the standard format for dates in JSON and APIs.
 *
 * @returns Current timestamp string (e.g., "2024-11-12T14:30:00.000Z")
 *
 * @example
 * ```typescript
 * const project = {
 *   id: generateId('project'),
 *   name: 'New Project',
 *   created_at: getCurrentTimestamp(),
 *   updated_at: getCurrentTimestamp()
 * };
 * ```
 *
 * @remarks
 * - Format: YYYY-MM-DDTHH:mm:ss.sssZ
 * - Always returns UTC time (Z suffix)
 * - Compatible with Date parsing and comparison
 * - This utility can remain when integrating backend (useful for client-side timestamps)
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Simulates random network errors for testing error states
 *
 * Purpose: Helps demonstrate error handling UI by randomly throwing errors
 * based on specified probability. Useful for testing error boundaries and
 * error messages in the UI.
 *
 * @param probability - Probability of error occurring (0-1, default: 0.1 = 10% chance)
 * @returns Promise that may reject based on probability
 * @throws Error with message "Simulated network error" if random check fails
 *
 * @example
 * ```typescript
 * // 10% chance of error
 * try {
 *   await simulateNetworkError();
 *   // Success - continue with operation
 * } catch (error) {
 *   // Handle error state
 * }
 *
 * // 50% chance of error (for testing)
 * await simulateNetworkError(0.5);
 *
 * // No errors (always succeeds)
 * await simulateNetworkError(0);
 * ```
 *
 * @remarks
 * - Default 10% error rate is realistic for network conditions
 * - Set to 0 to disable error simulation
 * - Set to 1 to always throw errors (useful for error UI testing)
 * - Remove calls to this function when integrating real backend
 */
export const simulateNetworkError = (probability: number = 0.1): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (Math.random() < probability) {
      reject(new Error('Simulated network error'));
    } else {
      resolve();
    }
  });
};

/**
 * Creates a typed service response object
 *
 * Purpose: Provides consistent response structure across all mock services.
 * All services return { data, error } pattern for uniform error handling.
 *
 * @param data - The response data (null if error occurred)
 * @param error - The error object (null if successful)
 * @returns Typed service response with data or error
 *
 * @example
 * ```typescript
 * // Success response
 * return createServiceResponse({ id: '123', name: 'Project' }, null);
 *
 * // Error response
 * return createServiceResponse(null, { message: 'Not found', code: 404 });
 *
 * // Async usage in service
 * const response = await fetchData();
 * return createServiceResponse(response, null);
 * ```
 *
 * @remarks
 * - Follows the { data, error } pattern used throughout the application
 * - Type-safe: ensures either data or error is provided, not both
 * - Maintains consistency with Supabase response pattern
 * - Keep this pattern when integrating backend for uniform error handling
 */
export interface ServiceResponse<T> {
  data: T | null;
  error: { message: string; code?: number } | null;
}

export const createServiceResponse = <T>(
  data: T | null,
  error: { message: string; code?: number } | null
): ServiceResponse<T> => {
  return { data, error };
};
