import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  AddToCartRequest,
  CartResponse,
  CreateOrderRequest,
  OrderConfirmationResponse,
  UpdateCartItemRequest,
} from './types/order';

export const ordersApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get<CartResponse>(API_ENDPOINTS.ORDERS.CART.BASE);
    return response.data;
  },

  addCartItem: async (payload: AddToCartRequest): Promise<CartResponse> => {
    const response = await apiClient.post<CartResponse>(API_ENDPOINTS.ORDERS.CART.ITEMS, payload);
    return response.data;
  },

  updateCartItem: async (
    foodItemId: number | string,
    payload: UpdateCartItemRequest,
  ): Promise<CartResponse> => {
    const response = await apiClient.put<CartResponse>(
      API_ENDPOINTS.ORDERS.CART.ITEM_BY_ID(foodItemId),
      payload,
    );
    return response.data;
  },

  removeCartItem: async (foodItemId: number | string): Promise<CartResponse> => {
    const response = await apiClient.delete<CartResponse>(
      API_ENDPOINTS.ORDERS.CART.ITEM_BY_ID(foodItemId),
    );
    return response.data;
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ORDERS.CART.BASE);
  },

  createOrder: async (payload: CreateOrderRequest): Promise<OrderConfirmationResponse> => {
    const response = await apiClient.post<OrderConfirmationResponse>(
      API_ENDPOINTS.ORDERS.BASE,
      payload,
    );
    return response.data;
  },

  getMyOrders: async (): Promise<OrderConfirmationResponse[]> => {
    const response = await apiClient.get<OrderConfirmationResponse[]>(API_ENDPOINTS.ORDERS.MY);
    return response.data;
  },

  getOrder: async (orderId: number | string): Promise<OrderConfirmationResponse> => {
    const response = await apiClient.get<OrderConfirmationResponse>(
      API_ENDPOINTS.ORDERS.BY_ID(orderId),
    );
    return response.data;
  },
};
