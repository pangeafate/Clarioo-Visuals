/**
 * Project-related type definitions
 *
 * This file contains all types related to projects, including
 * project data structures, status enums, and workflow states.
 *
 * @module types/project
 */

/**
 * Project status type
 * Represents the current state of a project in its lifecycle
 */
export type ProjectStatus = 'draft' | 'in-progress' | 'completed' | 'archived';

/**
 * Main project interface
 * Represents a vendor discovery project with all its properties
 */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  user_id?: string; // Optional for frontend use
  category?: string; // Optional categorization
}

/**
 * Workflow state for tracking project progress through the 5-step process
 */
export interface WorkflowState {
  current_step: number; // 1-5 for the five steps
  completed_steps: number[]; // Array of completed step numbers
  tech_request_completed?: boolean;
  criteria_completed?: boolean;
  vendor_selection_completed?: boolean;
  comparison_completed?: boolean;
  invite_sent?: boolean;
}

/**
 * Extended project data with workflow state (used in services)
 */
export interface ProjectWithWorkflow extends Project {
  workflow_state: WorkflowState;
}

/**
 * Project creation request payload
 */
export interface CreateProjectRequest {
  user_id: string;
  name: string;
  description: string;
  category?: string;
  status?: ProjectStatus;
  workflow_state?: WorkflowState;
}

/**
 * Project update request payload
 */
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  category?: string;
  workflow_state?: WorkflowState;
}

/**
 * Project list filters
 */
export interface ProjectFilters {
  status?: ProjectStatus;
  category?: string;
  search?: string;
  user_id?: string;
}

/**
 * Project sort options
 */
export type ProjectSortBy = 'created_at' | 'updated_at' | 'name' | 'status';

export type ProjectSortOrder = 'asc' | 'desc';

/**
 * Project query parameters
 */
export interface ProjectQueryParams {
  filters?: ProjectFilters;
  sortBy?: ProjectSortBy;
  sortOrder?: ProjectSortOrder;
  limit?: number;
  offset?: number;
}
