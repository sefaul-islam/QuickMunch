import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { ApiError } from '../../api/apiError';
import { queryKeys } from './queryKeys';
import { useAuth } from '../useAuth';
import type { CreateOrderRequest, OrderConfirmationResponse } from '../../api/types/order';

export function useMyOrdersQuery() {
  const { isAuthenticated, user } = useAuth();

  return useQuery<OrderConfirmationResponse[], ApiError>({
    queryKey: queryKeys.orders.list({ scope: 'my', userId: String(user?.id ?? 'current') }),
    queryFn: () => ordersApi.getMyOrders(),
    enabled: isAuthenticated,
    staleTime: 15000,
    refetchOnMount: 'always',
  });
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation<OrderConfirmationResponse, ApiError, CreateOrderRequest>({
    mutationFn: (payload) => ordersApi.createOrder(payload),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
      queryClient.setQueryData(queryKeys.orders.detail(order.id), order);
    },
  });
}

export function useOrderDetailQuery(orderId?: number | string | null) {
  const { isAuthenticated } = useAuth();

  return useQuery<OrderConfirmationResponse, ApiError>({
    queryKey: queryKeys.orders.detail(orderId ?? ''),
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: isAuthenticated && Boolean(orderId),
  });
}
