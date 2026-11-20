import axios from 'axios';
import type { BackendErrorResponse } from './types/common';

export interface ApiErrorParams {
  message: string;
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isAuthError?: boolean;
  isValidationError?: boolean;
  isCanceled?: boolean;
  cause?: unknown;
}

/**
 * Standardized ApiError representing normalized backend and network errors
 */
export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string>;
  readonly timestamp?: string;
  readonly isNetworkError: boolean;
  readonly isTimeout: boolean;
  readonly isAuthError: boolean;
  readonly isValidationError: boolean;
  readonly isCanceled: boolean;
  readonly cause?: unknown;

  constructor(params: ApiErrorParams) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status;
    this.code = params.code;
    this.fieldErrors = params.fieldErrors;
    this.timestamp = params.timestamp;
    this.isNetworkError = Boolean(params.isNetworkError);
    this.isTimeout = Boolean(params.isTimeout);
    this.isAuthError = Boolean(params.isAuthError);
    this.isValidationError = Boolean(params.isValidationError);
    this.isCanceled = Boolean(params.isCanceled);
    this.cause = params.cause;

    // Maintains proper stack trace in V8 environments if available
    const errorConstructor = Error as unknown as {
      captureStackTrace?: (target: object, constructor: unknown) => void;
    };
    errorConstructor.captureStackTrace?.(this, ApiError);
  }
}

/**
 * Normalizes any error (Axios, Network, DOM, Spring Boot DTO) into an ApiError
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Handle request cancellation
  if (axios.isCancel(error) || (error instanceof Error && error.name === 'CanceledError')) {
    return new ApiError({
      message: 'Request was cancelled',
      code: 'CANCELLED',
      isCanceled: true,
      cause: error,
    });
  }

  if (axios.isAxiosError(error)) {
    // 1. Client-side network or timeout issues (no response received)
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      return new ApiError({
        message: 'Request timed out. Please check your connection and try again.',
        code: 'TIMEOUT',
        isTimeout: true,
        cause: error,
      });
    }

    if (error.code === 'ERR_NETWORK' || (!error.response && error.request)) {
      return new ApiError({
        message: 'Unable to connect to QuickMunch services. Please check your network connection.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        cause: error,
      });
    }

    // 2. HTTP response from Spring Boot microservice / API Gateway
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as BackendErrorResponse | string | undefined;

      let message = '';
      let fieldErrors: Record<string, string> | undefined;
      let timestamp: string | undefined;

      if (typeof data === 'string') {
        message = data;
      } else if (data && typeof data === 'object') {
        message = data.message || data.error || '';
        fieldErrors = data.errors;
        timestamp = data.timestamp;
      }

      // Safe fallbacks for empty or uninformative messages
      if (!message) {
        switch (status) {
          case 400:
            message = 'Invalid request parameters';
            break;
          case 401:
            message = 'Authentication required or session expired';
            break;
          case 403:
            message = 'You do not have permission to perform this action';
            break;
          case 404:
            message = 'The requested resource was not found';
            break;
          case 409:
            message = 'Resource conflict occurred';
            break;
          case 422:
            message = 'Validation failed for request data';
            break;
          case 429:
            message = 'Too many requests. Please slow down and try again later.';
            break;
          case 500:
            message = 'An unexpected server error occurred. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            message = 'QuickMunch services are temporarily unavailable. Please try again in a moment.';
            break;
          default:
            message = error.message || `Request failed with status code ${status}`;
        }
      }

      const isValidationError = status === 400 || status === 422 || Boolean(fieldErrors && Object.keys(fieldErrors).length > 0);
      const isAuthError = status === 401 || status === 403;

      let code = `HTTP_${status}`;
      if (isValidationError) code = 'VALIDATION_ERROR';
      else if (status === 401) code = 'UNAUTHORIZED';
      else if (status === 403) code = 'FORBIDDEN';
      else if (status === 404) code = 'NOT_FOUND';
      else if (status === 409) code = 'CONFLICT';
      else if (status === 429) code = 'TOO_MANY_REQUESTS';
      else if (status >= 500) code = 'SERVER_ERROR';

      return new ApiError({
        message,
        status,
        code,
        fieldErrors,
        timestamp,
        isAuthError,
        isValidationError,
        cause: error,
      });
    }
  }

  // Generic fallback for any other unknown errors
  if (error instanceof Error) {
    return new ApiError({
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      cause: error,
    });
  }

  return new ApiError({
    message: typeof error === 'string' ? error : 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    cause: error,
  });
}
