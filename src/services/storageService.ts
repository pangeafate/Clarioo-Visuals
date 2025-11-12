/**
 * 🎨 STORAGE SERVICE - localStorage Abstraction Layer
 *
 * Purpose: Centralized localStorage operations with error handling and type safety.
 * Abstracts browser storage API to make it easier to:
 * - Switch to different storage mechanisms later
 * - Add error handling consistently
 * - Provide type-safe storage operations
 * - Mock storage in tests
 *
 * Benefits:
 * - Single place to handle storage errors
 * - Type-safe get/set operations
 * - Easy to test (can mock this service)
 * - Can switch to sessionStorage, IndexedDB, or API later
 * - Consistent error handling
 *
 * Integration Notes:
 * - This pattern remains useful even with backend integration
 * - Can extend to sync with backend (local-first approach)
 * - Consider replacing with Zustand persist or similar for complex state
 *
 * @module services/storageService
 */

/**
 * Storage keys used throughout the application
 * Centralized to prevent typos and make refactoring easier
 */
export const STORAGE_KEYS = {
  CUSTOM_CRITERION_TYPES: 'custom_criterion_types',
  USER_PREFERENCES: 'user_preferences',
  DRAFT_PROJECTS: 'draft_projects',
  UI_STATE: 'ui_state'
} as const;

/**
 * Type-safe storage service with error handling
 */
class StorageService {
  /**
   * Checks if localStorage is available
   * Some browsers/modes (private browsing) may block localStorage
   *
   * @returns true if localStorage is available
   * @private
   */
  private isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      console.warn('localStorage is not available');
      return false;
    }
  }

  /**
   * Gets an item from localStorage with type safety
   *
   * @template T - The expected type of the stored value
   * @param key - Storage key
   * @param defaultValue - Value to return if key not found or error occurs
   * @returns The stored value or default value
   *
   * @example
   * ```typescript
   * // Get string
   * const name = storageService.getItem<string>('user_name', 'Guest');
   *
   * // Get object
   * const settings = storageService.getItem<Settings>('settings', defaultSettings);
   *
   * // Get array
   * const types = storageService.getItem<string[]>('types', []);
   * ```
   *
   * @remarks
   * - Returns defaultValue if storage unavailable
   * - Returns defaultValue if JSON parse fails
   * - Returns defaultValue if key not found
   * - Type-safe through generics
   */
  getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);

      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Sets an item in localStorage with type safety
   *
   * @template T - The type of value being stored
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   * @returns true if successful, false if error occurred
   *
   * @example
   * ```typescript
   * // Store string
   * storageService.setItem('user_name', 'John');
   *
   * // Store object
   * storageService.setItem('settings', { theme: 'dark', lang: 'en' });
   *
   * // Store array
   * storageService.setItem('types', ['Performance', 'Security']);
   * ```
   *
   * @remarks
   * - Automatically JSON stringifies value
   * - Returns false if storage unavailable
   * - Returns false if JSON stringify fails
   * - Logs errors to console
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Removes an item from localStorage
   *
   * @param key - Storage key to remove
   * @returns true if successful, false if error occurred
   *
   * @example
   * ```typescript
   * storageService.removeItem('user_session');
   * ```
   *
   * @remarks
   * - Safe to call even if key doesn't exist
   * - Returns false if storage unavailable
   * - Logs errors to console
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Clears all items from localStorage
   *
   * ⚠️ WARNING: This removes ALL localStorage data for the domain
   *
   * @returns true if successful, false if error occurred
   *
   * @example
   * ```typescript
   * // Clear everything (use with caution!)
   * storageService.clear();
   * ```
   *
   * @remarks
   * - Removes ALL localStorage items
   * - Use with caution
   * - Returns false if storage unavailable
   * - Logs errors to console
   */
  clear(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Gets all keys in localStorage
   *
   * @returns Array of all storage keys
   *
   * @example
   * ```typescript
   * const keys = storageService.getAllKeys();
   * console.log('Stored keys:', keys);
   * ```
   *
   * @remarks
   * - Returns empty array if storage unavailable
   * - Includes keys from other parts of the app
   * - Useful for debugging storage state
   */
  getAllKeys(): string[] {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  // ===========================================
  // Application-Specific Methods
  // ===========================================

  /**
   * Gets custom criterion types
   *
   * Purpose: Retrieve user-defined criterion types for criteria builder.
   * These are custom types that users have added beyond the defaults.
   *
   * @returns Array of custom criterion type names
   *
   * @example
   * ```typescript
   * const customTypes = storageService.getCustomCriterionTypes();
   * // Returns: ['Performance', 'Security', 'Scalability']
   * ```
   *
   * @remarks
   * - Returns empty array if none found
   * - Safe to call anytime (won't throw)
   * - Custom types persist across sessions
   */
  getCustomCriterionTypes(): string[] {
    return this.getItem<string[]>(STORAGE_KEYS.CUSTOM_CRITERION_TYPES, []);
  }

  /**
   * Saves custom criterion types
   *
   * Purpose: Persist user-defined criterion types for future use.
   *
   * @param types - Array of custom criterion type names
   * @returns true if successful
   *
   * @example
   * ```typescript
   * const types = ['Performance', 'Security', 'Scalability'];
   * storageService.saveCustomCriterionTypes(types);
   * ```
   *
   * @remarks
   * - Overwrites existing types
   * - Automatically deduplicates types
   * - Filters out empty strings
   * - Returns false if storage fails
   */
  saveCustomCriterionTypes(types: string[]): boolean {
    // Clean the array: dedupe, trim, remove empties
    const cleaned = Array.from(new Set(
      types
        .map(t => t.trim())
        .filter(t => t.length > 0)
    ));

    return this.setItem(STORAGE_KEYS.CUSTOM_CRITERION_TYPES, cleaned);
  }

  /**
   * Adds a new custom criterion type
   *
   * Purpose: Add a single custom type without replacing existing ones.
   *
   * @param type - Custom criterion type name to add
   * @returns true if successful
   *
   * @example
   * ```typescript
   * storageService.addCustomCriterionType('Performance');
   * ```
   *
   * @remarks
   * - Won't add duplicates (case-sensitive)
   * - Trims whitespace
   * - Ignores empty strings
   * - Returns false if storage fails
   */
  addCustomCriterionType(type: string): boolean {
    const trimmed = type.trim();
    if (!trimmed) {
      return false;
    }

    const existing = this.getCustomCriterionTypes();

    // Don't add if already exists (case-sensitive)
    if (existing.includes(trimmed)) {
      return true;
    }

    return this.saveCustomCriterionTypes([...existing, trimmed]);
  }

  /**
   * Removes a custom criterion type
   *
   * Purpose: Delete a user-defined criterion type.
   *
   * @param type - Custom criterion type name to remove
   * @returns true if successful
   *
   * @example
   * ```typescript
   * storageService.removeCustomCriterionType('Performance');
   * ```
   *
   * @remarks
   * - Case-sensitive matching
   * - Safe to call even if type doesn't exist
   * - Returns false if storage fails
   */
  removeCustomCriterionType(type: string): boolean {
    const existing = this.getCustomCriterionTypes();
    const filtered = existing.filter(t => t !== type);
    return this.saveCustomCriterionTypes(filtered);
  }

  /**
   * Clears all custom criterion types
   *
   * Purpose: Remove all user-defined criterion types, resetting to defaults.
   *
   * @returns true if successful
   *
   * @example
   * ```typescript
   * storageService.clearCustomCriterionTypes();
   * ```
   */
  clearCustomCriterionTypes(): boolean {
    return this.removeItem(STORAGE_KEYS.CUSTOM_CRITERION_TYPES);
  }

  /**
   * Gets user preferences
   *
   * Purpose: Retrieve user UI preferences (theme, language, etc.)
   *
   * @returns User preferences object
   *
   * @example
   * ```typescript
   * const prefs = storageService.getUserPreferences();
   * console.log('Theme:', prefs.theme);
   * ```
   */
  getUserPreferences(): {
    theme?: 'light' | 'dark';
    language?: string;
    [key: string]: any;
  } {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, {});
  }

  /**
   * Saves user preferences
   *
   * Purpose: Persist user UI preferences
   *
   * @param preferences - User preferences object
   * @returns true if successful
   *
   * @example
   * ```typescript
   * storageService.saveUserPreferences({ theme: 'dark', language: 'en' });
   * ```
   */
  saveUserPreferences(preferences: Record<string, any>): boolean {
    return this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Also export class for testing/mocking
export default StorageService;
