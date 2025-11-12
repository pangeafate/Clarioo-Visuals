/**
 * 🎨 DATA TRANSFORMERS - Data Mapping and Transformation Utilities
 *
 * Purpose: Centralized data transformation functions for converting between
 * service layer data structures and component-layer interfaces.
 *
 * Responsibilities:
 * - Map service responses to UI-friendly formats
 * - Sort and filter data collections
 * - Transform data structures for specific use cases
 * - Validate and normalize data
 *
 * Integration Notes:
 * - These utilities remain useful even with real backend
 * - Separates data transformation from business logic
 * - Makes components simpler by handling data prep in services
 * - Easier to test transformation logic in isolation
 *
 * @module utils/dataTransformers
 */

/**
 * Project status type definition
 */
export type ProjectStatus = 'draft' | 'in-progress' | 'completed' | 'archived';

/**
 * Project interface matching component expectations
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Maps raw service data to Project interface
 *
 * Purpose: Converts service layer project data to the standardized
 * Project interface used throughout components. Ensures all projects
 * have consistent structure regardless of source.
 *
 * @param data - Raw project data array from service
 * @returns Array of mapped Project objects
 *
 * @example
 * ```typescript
 * const rawData = await projectService.fetchProjects();
 * const projects = mapToProjectInterface(rawData);
 * // Now safe to use in components with proper typing
 * ```
 *
 * @remarks
 * - Handles null/undefined descriptions gracefully
 * - Ensures status is typed correctly
 * - Preserves all required fields
 * - Maintains data immutability (returns new objects)
 */
export const mapToProjectInterface = (data: any[]): Project[] => {
  return data.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || null,
    status: p.status as ProjectStatus,
    created_at: p.created_at,
    updated_at: p.updated_at
  }));
};

/**
 * Sorts projects by updated_at in descending order (newest first)
 *
 * Purpose: Display most recently updated projects at the top.
 * This is the default sort order for project lists.
 *
 * @param projects - Array of projects to sort
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const sorted = sortByUpdatedDate(projects);
 * // Project updated today appears before project updated yesterday
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Descending order (newest first)
 * - Handles invalid dates gracefully (treats as epoch)
 * - Empty array returns empty array
 */
export const sortByUpdatedDate = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    const dateA = new Date(b.updated_at).getTime();
    const dateB = new Date(a.updated_at).getTime();
    return dateA - dateB;
  });
};

/**
 * Sorts projects by created_at in descending order (newest first)
 *
 * Purpose: Display most recently created projects at the top.
 * Useful for "Recently Created" views or when updated_at is not relevant.
 *
 * @param projects - Array of projects to sort
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const sorted = sortByCreatedDate(projects);
 * // Project created today appears before project created yesterday
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Descending order (newest first)
 * - Handles invalid dates gracefully
 * - Empty array returns empty array
 */
export const sortByCreatedDate = (projects: Project[]): Project[] => {
  return [...projects].sort((a, b) => {
    const dateA = new Date(b.created_at).getTime();
    const dateB = new Date(a.created_at).getTime();
    return dateA - dateB;
  });
};

/**
 * Filters projects by status
 *
 * Purpose: Get all projects matching a specific status.
 * Useful for status-based views or filtering.
 *
 * @param projects - Array of projects to filter
 * @param status - Status to filter by
 * @returns New filtered array (does not mutate original)
 *
 * @example
 * ```typescript
 * const drafts = filterByStatus(projects, 'draft');
 * const completed = filterByStatus(projects, 'completed');
 * const active = filterByStatus(projects, 'in-progress');
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Case-sensitive status matching
 * - Empty array returns empty array
 * - No matches returns empty array
 */
export const filterByStatus = (projects: Project[], status: ProjectStatus): Project[] => {
  return projects.filter(p => p.status === status);
};

/**
 * Filters projects by user ID
 *
 * Purpose: Get all projects belonging to a specific user.
 * Essential for multi-tenant applications.
 *
 * @param projects - Array of projects to filter (must have user_id field)
 * @param userId - User ID to filter by
 * @returns New filtered array (does not mutate original)
 *
 * @example
 * ```typescript
 * const userProjects = filterByUserId(allProjects, 'user_123');
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Requires projects to have user_id field
 * - Empty array returns empty array
 * - No matches returns empty array
 */
export const filterByUserId = (projects: any[], userId: string): any[] => {
  return projects.filter(p => p.user_id === userId);
};

/**
 * Groups projects by status
 *
 * Purpose: Organize projects into status-based groups.
 * Useful for kanban-style views or status summaries.
 *
 * @param projects - Array of projects to group
 * @returns Object with status keys and project arrays as values
 *
 * @example
 * ```typescript
 * const grouped = groupByStatus(projects);
 * // {
 * //   draft: [project1, project2],
 * //   'in-progress': [project3],
 * //   completed: [project4, project5, project6],
 * //   archived: []
 * // }
 * ```
 *
 * @remarks
 * - Returns object with all possible statuses (empty arrays for unused)
 * - Original array not mutated
 * - Projects are grouped, not sorted within groups
 */
export const groupByStatus = (projects: Project[]): Record<ProjectStatus, Project[]> => {
  const grouped: Record<ProjectStatus, Project[]> = {
    draft: [],
    'in-progress': [],
    completed: [],
    archived: []
  };

  projects.forEach(project => {
    grouped[project.status].push(project);
  });

  return grouped;
};

/**
 * Vendor interface for vendor-related transformations
 */
export interface Vendor {
  id: string;
  name: string;
  description: string;
  website: string;
  pricing: string;
  rating: number;
  features: string[];
}

/**
 * Maps raw service data to Vendor interface
 *
 * Purpose: Converts service layer vendor data to standardized
 * Vendor interface used in components.
 *
 * @param data - Raw vendor data array from service
 * @returns Array of mapped Vendor objects
 *
 * @example
 * ```typescript
 * const rawVendors = await vendorService.fetchVendors();
 * const vendors = mapToVendorInterface(rawVendors);
 * ```
 *
 * @remarks
 * - Ensures all required fields are present
 * - Normalizes data structure
 * - Maintains type safety
 */
export const mapToVendorInterface = (data: any[]): Vendor[] => {
  return data.map(v => ({
    id: v.id,
    name: v.name,
    description: v.description || '',
    website: v.website || '',
    pricing: v.pricing || 'Contact for pricing',
    rating: v.rating || 0,
    features: v.features || []
  }));
};

/**
 * Sorts vendors by rating in descending order (highest first)
 *
 * Purpose: Display highest-rated vendors at the top.
 *
 * @param vendors - Array of vendors to sort
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const sorted = sortByRating(vendors);
 * // 5-star vendors appear before 4-star vendors
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Descending order (highest rating first)
 * - Handles missing ratings (treats as 0)
 */
export const sortByRating = (vendors: Vendor[]): Vendor[] => {
  return [...vendors].sort((a, b) => b.rating - a.rating);
};

/**
 * Sorts vendors by name in alphabetical order
 *
 * Purpose: Display vendors alphabetically for easy scanning.
 *
 * @param vendors - Array of vendors to sort
 * @returns New sorted array (does not mutate original)
 *
 * @example
 * ```typescript
 * const sorted = sortByName(vendors);
 * // "Acme Corp" appears before "Zenith Solutions"
 * ```
 *
 * @remarks
 * - Returns new array (immutable)
 * - Case-insensitive sorting
 * - Ascending order (A-Z)
 */
export const sortByName = (vendors: Vendor[]): Vendor[] => {
  return [...vendors].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
};

/**
 * Validates project data before saving
 *
 * Purpose: Ensures project data meets requirements before
 * sending to service layer. Prevents invalid data from being saved.
 *
 * @param project - Partial project data to validate
 * @returns Object with isValid boolean and errors array
 *
 * @example
 * ```typescript
 * const validation = validateProjectData(projectData);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 *   return;
 * }
 * // Proceed with save
 * ```
 *
 * @remarks
 * - Checks required fields
 * - Validates field formats
 * - Returns descriptive error messages
 * - Useful for form validation
 */
export const validateProjectData = (project: Partial<Project>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!project.name || project.name.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (project.name && project.name.length > 100) {
    errors.push('Project name must be 100 characters or less');
  }

  if (project.status && !['draft', 'in-progress', 'completed', 'archived'].includes(project.status)) {
    errors.push('Invalid project status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Normalizes a string for comparison or search
 *
 * Purpose: Standardizes strings for consistent searching and matching.
 * Removes extra whitespace, converts to lowercase.
 *
 * @param str - String to normalize
 * @returns Normalized string (lowercase, trimmed, single spaces)
 *
 * @example
 * ```typescript
 * normalizeString('  Hello   World  '); // "hello world"
 * normalizeString('CRM Software'); // "crm software"
 * ```
 *
 * @remarks
 * - Converts to lowercase
 * - Trims leading/trailing whitespace
 * - Replaces multiple spaces with single space
 * - Useful for search and comparison
 */
export const normalizeString = (str: string): string => {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Searches projects by name or description
 *
 * Purpose: Filter projects based on search query.
 * Case-insensitive search across name and description fields.
 *
 * @param projects - Array of projects to search
 * @param query - Search query string
 * @returns Filtered array of matching projects
 *
 * @example
 * ```typescript
 * const results = searchProjects(projects, 'crm');
 * // Returns projects with 'crm' in name or description
 * ```
 *
 * @remarks
 * - Case-insensitive
 * - Searches both name and description
 * - Returns empty array if no matches
 * - Empty query returns all projects
 */
export const searchProjects = (projects: Project[], query: string): Project[] => {
  if (!query.trim()) {
    return projects;
  }

  const normalized = normalizeString(query);

  return projects.filter(project => {
    const name = normalizeString(project.name);
    const description = normalizeString(project.description || '');

    return name.includes(normalized) || description.includes(normalized);
  });
};
