/**
 * Centralized API Endpoints for QuickMunch Spring Boot Microservices
 *
 * Microservices routing conventions (via API Gateway or direct service ports):
 * - /api/users/*       -> user-service (:8081)
 * - /api/restaurants/* -> restaurant-service (:8082)
 * - /api/categories/*  -> restaurant-service (:8082)
 * - /api/food-items/*  -> restaurant-service (:8082)
 * - /api/orders/*      -> order-service (:8083)
 */
export const API_ENDPOINTS = {
  USERS: {
    ME: '/api/users/me',
    BY_ID: (id: string) => `/api/users/${encodeURIComponent(id)}`,
    SYNC: '/api/users/sync',
  },
  RESTAURANTS: {
    BASE: '/api/restaurants',
    BY_ID: (id: string | number) => `/api/restaurants/${encodeURIComponent(String(id))}`,
    MY: '/api/restaurants/my',
    BY_OWNER: (ownerId: string) => `/api/restaurants/owner/${encodeURIComponent(ownerId)}`,
    CATEGORIES: '/api/categories',
    FOOD_ITEMS: '/api/food-items',
    FOOD_ITEM_BY_ID: (id: string | number) => `/api/food-items/${encodeURIComponent(String(id))}`,
  },
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: (id: string | number) => `/api/orders/${encodeURIComponent(String(id))}`,
    MY: '/api/orders/my',
    CANCEL: (id: string | number) => `/api/orders/${encodeURIComponent(String(id))}/cancel`,
    STATUS: (id: string | number) => `/api/orders/${encodeURIComponent(String(id))}/status`,
  },
} as const;
