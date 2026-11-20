import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './apiError';
import { queryKeys } from '../hooks/queries/queryKeys';

/**
 * Intelligent retry predicate:
 * - Never retries non-recoverable 4xx client errors (400, 401, 403, 404, 409, 422, etc.)
 * - Never retries cancelled requests
 * - Retries up to 2 times for network, timeout, or 5xx server errors with exponential backoff
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.isCanceled) return false;
    if (error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
  }
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh data window
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection window
      retry: shouldRetryQuery,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Prevents unwanted network storms on tab focus
      refetchOnReconnect: true, // Auto-recovery upon restoring network connection
    },
    mutations: {
      retry: false, // Mutations are non-idempotent by default, do not retry blindly
      onError: (error) => {
        console.warn('[QuickMunch Query] Mutation encountered an error:', error);
      },
    },
  },
});

/**
 * Clears user-scoped server queries on logout or session expiration.
 * Preserves public server queries (e.g. restaurant catalogs) and does NOT affect
 * client-side localStorage state (shopping cart, favorite kitchens, saved address).
 */
export function clearUserServerCache(): void {
  queryClient.removeQueries({ queryKey: queryKeys.users.all() });
  queryClient.removeQueries({ queryKey: queryKeys.orders.all() });
}
