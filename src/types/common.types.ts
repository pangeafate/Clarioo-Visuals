/**
 * Common/shared type definitions
 *
 * This file contains utility types and interfaces that are used
 * across multiple modules in the application.
 *
 * @module types/common
 */

/**
 * Generic API response wrapper
 * Standard response structure for all API calls
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string;
  status?: number;
}

/**
 * Response metadata
 * Includes pagination, timing, and other useful info
 */
export interface ResponseMeta {
  timestamp: string;
  request_id?: string;
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  has_more: boolean;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
  offset?: number;
  limit?: number;
}

/**
 * Sort order type
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Generic sort parameters
 */
export interface SortParams<T extends string = string> {
  sort_by?: T;
  sort_order?: SortOrder;
}

/**
 * Generic filter parameters
 */
export interface FilterParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

/**
 * Combined query parameters
 */
export interface QueryParams<T extends string = string>
  extends PaginationParams, SortParams<T> {
  filters?: FilterParams;
  search?: string;
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Async operation state
 * Generic state for tracking async operations
 */
export interface AsyncState<T, E = ApiError> {
  data: T | null;
  loading: LoadingState;
  error: E | null;
}

/**
 * ID type (can be string or number depending on backend)
 */
export type ID = string | number;

/**
 * Timestamp type
 * ISO 8601 formatted date string
 */
export type Timestamp = string;

/**
 * Generic record with timestamps
 */
export interface TimestampedRecord {
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Generic record with ID and timestamps
 */
export interface BaseRecord extends TimestampedRecord {
  id: ID;
}

/**
 * Optional fields utility type
 * Makes specified fields optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required fields utility type
 * Makes specified fields required
 */
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Nullable utility type
 * Makes all fields nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Key-value pair
 */
export interface KeyValuePair<K = string, V = any> {
  key: K;
  value: V;
}

/**
 * Select option (for dropdowns, etc.)
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

/**
 * File upload metadata
 */
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
  progress?: number;
}

/**
 * File upload state
 */
export interface FileUploadState extends AsyncState<string> {
  file: FileUpload | null;
  progress: number;
}

/**
 * Notification/Toast types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Notification message
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
}

/**
 * Form validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Generic callback function types
 */
export type VoidCallback = () => void;
export type Callback<T> = (value: T) => void;
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * Event handler types
 */
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;
export type ErrorHandler = (error: Error | ApiError) => void;

/**
 * Coordinates (for maps, positioning, etc.)
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Address information
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  coordinates?: Coordinates;
}

/**
 * Contact information
 */
export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  address?: Address;
}

/**
 * Date range
 */
export interface DateRange {
  start: Timestamp;
  end: Timestamp;
}

/**
 * Price range
 */
export interface PriceRange {
  min: number;
  max: number;
  currency?: string;
}

/**
 * Generic statistics
 */
export interface Statistics {
  total: number;
  active: number;
  inactive: number;
  [key: string]: number;
}
