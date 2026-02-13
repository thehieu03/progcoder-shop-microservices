/**
 * Common API Response Types
 */

// ==================== Base Response Types ====================

export interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiError {
  errorMessage: string;
  details?: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: ApiError[];
}

// ==================== Query Parameters ====================

export interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  search?: string;
  status?: string | any; // Allow specific status types to override
  [key: string]: any;
}

// ==================== Common Types ====================

export type Guid = string;

export interface AuditableDto {
  createdOnUtc?: string;
  createdBy?: string;
  lastModifiedOnUtc?: string;
  lastModifiedBy?: string;
}
