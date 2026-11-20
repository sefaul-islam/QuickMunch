import { describe, it, expect } from 'vitest';
import { queryClient, shouldRetryQuery } from '../../api/queryClient';
import { ApiError } from '../../api/apiError';
import { queryKeys } from '../../hooks/queries/queryKeys';

describe('TanStack QueryClient & Query Key Architecture', () => {
  describe('Centralized QueryClient Configuration', () => {
    it('initializes with production defaults for caching and refetching', () => {
      const defaultQueryOptions = queryClient.getDefaultOptions().queries;
      expect(defaultQueryOptions?.staleTime).toBe(5 * 60 * 1000); // 5 min
      expect(defaultQueryOptions?.gcTime).toBe(15 * 60 * 1000); // 15 min
      expect(defaultQueryOptions?.refetchOnWindowFocus).toBe(false);
      expect(defaultQueryOptions?.refetchOnReconnect).toBe(true);
    });

    it('configures mutations without automatic blind retries', () => {
      const defaultMutationOptions = queryClient.getDefaultOptions().mutations;
      expect(defaultMutationOptions?.retry).toBe(false);
    });
  });

  describe('Intelligent Retry Predicate (shouldRetryQuery)', () => {
    it('does NOT retry on 4xx client errors (400, 401, 403, 404, 409, 422)', () => {
      const statuses = [400, 401, 403, 404, 409, 422];
      for (const status of statuses) {
        const error = new ApiError({
          message: `Client error ${status}`,
          status,
          code: `HTTP_${status}`,
        });
        expect(shouldRetryQuery(0, error)).toBe(false);
      }
    });

    it('does NOT retry cancelled queries', () => {
      const error = new ApiError({
        message: 'Request cancelled',
        code: 'CANCELLED',
        isCanceled: true,
      });
      expect(shouldRetryQuery(0, error)).toBe(false);
    });

    it('retries transient 5xx server errors up to 2 times', () => {
      const error = new ApiError({
        message: 'Internal Server Error',
        status: 500,
        code: 'SERVER_ERROR',
      });
      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(1, error)).toBe(true);
      expect(shouldRetryQuery(2, error)).toBe(false);
    });

    it('retries transient network drops up to 2 times', () => {
      const error = new ApiError({
        message: 'Network connection lost',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(1, error)).toBe(true);
      expect(shouldRetryQuery(2, error)).toBe(false);
    });
  });

  describe('Hierarchical Query Keys Conventions', () => {
    it('generates consistent root query key', () => {
      expect(queryKeys.all).toEqual(['quickmunch']);
    });

    it('generates scoped user query keys preventing cross-account leakage', () => {
      expect(queryKeys.users.all()).toEqual(['quickmunch', 'users']);
      expect(queryKeys.users.me('sub-uuid-abc')).toEqual(['quickmunch', 'users', 'me', 'sub-uuid-abc']);
      expect(queryKeys.users.me()).toEqual(['quickmunch', 'users', 'me', 'current']);
      expect(queryKeys.users.profile('user-101')).toEqual(['quickmunch', 'users', 'profile', 'user-101']);
    });

    it('generates hierarchical restaurant query keys with filter serialization', () => {
      expect(queryKeys.restaurants.all()).toEqual(['quickmunch', 'restaurants']);
      expect(queryKeys.restaurants.lists()).toEqual(['quickmunch', 'restaurants', 'list']);
      expect(queryKeys.restaurants.list({ cuisine: 'pizza' })).toEqual([
        'quickmunch',
        'restaurants',
        'list',
        { cuisine: 'pizza' },
      ]);
      expect(queryKeys.restaurants.detail('sylvan-hearth')).toEqual([
        'quickmunch',
        'restaurants',
        'detail',
        'sylvan-hearth',
      ]);
      expect(queryKeys.restaurants.menu(42)).toEqual([
        'quickmunch',
        'restaurants',
        'detail',
        '42',
        'menu',
      ]);
    });

    it('generates hierarchical order query keys', () => {
      expect(queryKeys.orders.all()).toEqual(['quickmunch', 'orders']);
      expect(queryKeys.orders.detail(999)).toEqual(['quickmunch', 'orders', 'detail', '999']);
    });
  });
});
