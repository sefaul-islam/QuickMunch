/**
 * Standard Spring Data JPA Page response contract
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Standard pagination and sorting request parameters
 */
export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string | string[];
}

/**
 * Optional standard envelope wrapper for APIs using response bodies
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

/**
 * Backend Spring Boot error response body formats
 * Accommodates user-service ErrorResponseDTO and restaurant-service validation maps
 */
export interface BackendErrorResponse {
  status?: number;
  message?: string;
  timestamp?: string;
  errors?: Record<string, string>;
  error?: string;
  path?: string;
}
