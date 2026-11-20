import { describe, it, expect, beforeEach } from 'vitest';
import { queryClient, clearUserServerCache } from '../../api/queryClient';
import { queryKeys } from '../../hooks/queries/queryKeys';

describe('Authentication & Query Cache Lifecycle', () => {
  beforeEach(() => {
    queryClient.clear();
    localStorage.clear();
  });

  it('purges user and order server queries on logout while preserving public queries and localStorage cart', () => {
    // 1. Populate server-state query cache with user data, order data, and public restaurant catalog
    queryClient.setQueryData(queryKeys.users.me('user-alpha-99'), {
      id: 'user-alpha-99',
      firstName: 'Alice',
      email: 'alice@example.com',
    });
    queryClient.setQueryData(queryKeys.orders.detail(505), {
      id: 505,
      totalAmount: 38.5,
      status: 'PREPARING',
    });
    queryClient.setQueryData(queryKeys.restaurants.detail('sylvan-hearth'), {
      id: 'sylvan-hearth',
      name: 'Sylvan Hearth',
      rating: 4.9,
    });

    // 2. Populate client-side localStorage state (Cart and Favorites)
    localStorage.setItem(
      'quickmunch_cart',
      JSON.stringify([
        {
          dish: { id: 'd-1', name: 'Artisan Sourdough', price: 12 },
          restaurant: { id: 'sylvan-hearth', name: 'Sylvan Hearth' },
          quantity: 2,
        },
      ])
    );
    localStorage.setItem('quickmunch_favorites', JSON.stringify(['sylvan-hearth', 'osteria']));

    // Verify all queries and local storage are populated before logout
    expect(queryClient.getQueryData(queryKeys.users.me('user-alpha-99'))).toBeDefined();
    expect(queryClient.getQueryData(queryKeys.orders.detail(505))).toBeDefined();
    expect(queryClient.getQueryData(queryKeys.restaurants.detail('sylvan-hearth'))).toBeDefined();
    expect(localStorage.getItem('quickmunch_cart')).not.toBeNull();
    expect(localStorage.getItem('quickmunch_favorites')).not.toBeNull();

    // 3. Trigger cache purge (as called during logout or 401 session expiration)
    clearUserServerCache();

    // 4. Assert: User-specific & order data are removed to prevent cross-account leak
    expect(queryClient.getQueryData(queryKeys.users.me('user-alpha-99'))).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.orders.detail(505))).toBeUndefined();

    // 5. Assert: Public restaurant catalog queries remain cached for fast guest navigation
    expect(queryClient.getQueryData(queryKeys.restaurants.detail('sylvan-hearth'))).toEqual({
      id: 'sylvan-hearth',
      name: 'Sylvan Hearth',
      rating: 4.9,
    });

    // 6. Assert: Shopping cart and favorites in localStorage are preserved
    const preservedCart = JSON.parse(localStorage.getItem('quickmunch_cart') || '[]');
    expect(preservedCart).toHaveLength(1);
    expect(preservedCart[0].dish.id).toBe('d-1');

    const preservedFavorites = JSON.parse(localStorage.getItem('quickmunch_favorites') || '[]');
    expect(preservedFavorites).toEqual(['sylvan-hearth', 'osteria']);
  });
});
