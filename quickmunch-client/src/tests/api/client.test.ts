import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  apiClient,
  isTrustedApiUrl,
  setTokenGetter,
  setUnauthorizedHandler,
  setForbiddenHandler,
  API_BASE_URL,
} from '../../api/client';
import { ApiError, normalizeApiError } from '../../api/apiError';

describe('Centralized API Client (Axios) & Error Normalization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base Configuration & Token Attachment', () => {
    it('has configured base URL and standard headers', () => {
      expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
      expect(apiClient.defaults.headers['Accept']).toContain('application/json');
    });

    it('attaches current Bearer token from token getter to trusted outgoing requests', async () => {
      const mockTokenGetter = vi.fn().mockResolvedValue('jwt-token-xyz');
      setTokenGetter(mockTokenGetter);

      let capturedHeaders: Record<string, unknown> = {};
      const originalAdapter = apiClient.defaults.adapter;

      apiClient.defaults.adapter = async (config) => {
        capturedHeaders = (config.headers as Record<string, unknown>) || {};
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      try {
        await apiClient.get('/api/test-endpoint');
        expect(mockTokenGetter).toHaveBeenCalled();
        expect(capturedHeaders.Authorization).toBe('Bearer jwt-token-xyz');
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    });

    it('does NOT attach Bearer token to untrusted third-party URLs', async () => {
      const mockTokenGetter = vi.fn().mockResolvedValue('secret-jwt-token');
      setTokenGetter(mockTokenGetter);

      let capturedHeaders: Record<string, unknown> = {};
      const originalAdapter = apiClient.defaults.adapter;

      apiClient.defaults.adapter = async (config) => {
        capturedHeaders = (config.headers as Record<string, unknown>) || {};
        return {
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      };

      try {
        await apiClient.get('https://untrusted-thirdparty-service.com/analytics');
        expect(capturedHeaders.Authorization).toBeUndefined();
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    });

    it('isTrustedApiUrl accurately differentiates relative, gateway, and third-party origins', () => {
      expect(isTrustedApiUrl('/api/restaurants')).toBe(true);
      expect(isTrustedApiUrl('/api/users/me')).toBe(true);
      expect(isTrustedApiUrl(`${API_BASE_URL}/api/orders`)).toBe(true);
      expect(isTrustedApiUrl('https://malicious-external-site.com/api/steal')).toBe(false);
      expect(isTrustedApiUrl('https://cdn.thirdparty.com/images')).toBe(false);
    });
  });

  describe('Response Interceptor & Status Handling', () => {
    it('invokes unauthorized handler on HTTP 401 response and normalizes to ApiError', async () => {
      const unauthorizedSpy = vi.fn();
      setUnauthorizedHandler(unauthorizedSpy);

      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => {
        const error = Object.assign(new Error('Request failed with status code 401'), {
          isAxiosError: true,
          response: {
            status: 401,
            data: { status: 401, message: 'Token expired', timestamp: '2026-11-20T00:00:00' },
            config,
          },
        });
        throw error;
      };

      try {
        await apiClient.get('/api/protected');
        expect.unreachable('Should have rejected with ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(401);
        expect(apiErr.isAuthError).toBe(true);
        expect(apiErr.message).toBe('Token expired');
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }

      expect(unauthorizedSpy).toHaveBeenCalledTimes(1);
    });

    it('invokes forbidden handler on HTTP 403 response differentiated from 401', async () => {
      const unauthorizedSpy = vi.fn();
      const forbiddenSpy = vi.fn();
      setUnauthorizedHandler(unauthorizedSpy);
      setForbiddenHandler(forbiddenSpy);

      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => {
        const error = Object.assign(new Error('Request failed with status code 403'), {
          isAxiosError: true,
          response: {
            status: 403,
            data: { status: 403, message: 'Access denied: RESTAURANT_OWNER role required' },
            config,
          },
        });
        throw error;
      };

      try {
        await apiClient.get('/api/admin-resource');
        expect.unreachable('Should have rejected with ApiError');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(403);
        expect(apiErr.isAuthError).toBe(true);
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }

      expect(forbiddenSpy).toHaveBeenCalledTimes(1);
      expect(unauthorizedSpy).not.toHaveBeenCalled();
    });

    it('normalizes 400 Bad Request with field validation errors into ApiError', async () => {
      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => {
        const error = Object.assign(new Error('Request failed with status code 400'), {
          isAxiosError: true,
          response: {
            status: 400,
            data: {
              status: 400,
              message: 'Validation failed',
              errors: {
                name: 'Restaurant name cannot be blank',
                cuisine: 'At least one cuisine is required',
              },
            },
            config,
          },
        });
        throw error;
      };

      try {
        await apiClient.post('/api/restaurants', {});
        expect.unreachable('Should have rejected');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError);
        const apiErr = err as ApiError;
        expect(apiErr.status).toBe(400);
        expect(apiErr.code).toBe('VALIDATION_ERROR');
        expect(apiErr.isValidationError).toBe(true);
        expect(apiErr.fieldErrors).toEqual({
          name: 'Restaurant name cannot be blank',
          cuisine: 'At least one cuisine is required',
        });
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    });

    it('normalizes network errors into friendly ApiError', () => {
      const networkError = Object.assign(new Error('Network Error'), {
        isAxiosError: true,
        code: 'ERR_NETWORK',
        request: {},
      });

      const normalized = normalizeApiError(networkError);
      expect(normalized.isNetworkError).toBe(true);
      expect(normalized.code).toBe('NETWORK_ERROR');
      expect(normalized.message).toContain('Unable to connect to QuickMunch services');
    });

    it('normalizes timeout errors into friendly ApiError', () => {
      const timeoutError = Object.assign(new Error('timeout of 15000ms exceeded'), {
        isAxiosError: true,
        code: 'ECONNABORTED',
        request: {},
      });

      const normalized = normalizeApiError(timeoutError);
      expect(normalized.isTimeout).toBe(true);
      expect(normalized.code).toBe('TIMEOUT');
      expect(normalized.message).toContain('Request timed out');
    });

    it('normalizes request cancellation properly', () => {
      const cancelError = Object.assign(new Error('canceled'), {
        name: 'CanceledError',
      });

      const normalized = normalizeApiError(cancelError);
      expect(normalized.isCanceled).toBe(true);
      expect(normalized.code).toBe('CANCELLED');
    });
  });
});
