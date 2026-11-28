/**
 * Centralized Hierarchical Query Key Factory for QuickMunch
 *
 * Query Key conventions:
 * - Rooted with ['quickmunch']
 * - Partitioned by service domain (users, restaurants, orders)
 * - Structured hierarchically: domain -> scope -> entity ID -> sub-resources
 * - Scoped with authenticated user identifier to prevent cross-account cache leakage
 */
export const queryKeys = {
  all: ['quickmunch'] as const,

  users: {
    all: () => [...queryKeys.all, 'users'] as const,
    me: (userId?: string) => [...queryKeys.users.all(), 'me', userId ?? 'current'] as const,
    profile: (userId: string) => [...queryKeys.users.all(), 'profile', userId] as const,
  },

  restaurants: {
    all: () => [...queryKeys.all, 'restaurants'] as const,
    my: (ownerId?: string) => [...queryKeys.restaurants.all(), 'my', ownerId ?? 'current'] as const,
    lists: () => [...queryKeys.restaurants.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.restaurants.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.restaurants.all(), 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.restaurants.details(), String(id)] as const,
    menu: (id: string | number) => [...queryKeys.restaurants.detail(id), 'menu'] as const,
    categories: (id: string | number) => [...queryKeys.restaurants.detail(id), 'categories'] as const,
    foods: (id: string | number) => [...queryKeys.restaurants.detail(id), 'foods'] as const,
  },

  orders: {
    all: () => [...queryKeys.all, 'orders'] as const,
    cart: (userId?: string) => [...queryKeys.orders.all(), 'cart', userId ?? 'current'] as const,
    lists: () => [...queryKeys.orders.all(), 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.orders.lists(), filters ?? {}] as const,
    details: () => [...queryKeys.orders.all(), 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.orders.details(), String(id)] as const,
  },
} as const;
