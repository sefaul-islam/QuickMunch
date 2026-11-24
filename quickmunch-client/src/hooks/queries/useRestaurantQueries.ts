import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantsApi } from '../../api/restaurants';
import { queryKeys } from './queryKeys';
import { useAuth } from '../useAuth';
import type {
  RestaurantResponse,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CategoryResponse,
  CreateCategoryRequest,
  FoodItemResponse,
  CreateFoodItemRequest,
  UpdateFoodItemRequest,
} from '../../api/types/restaurant';

/**
 * Hook: Fetches the current authenticated owner's restaurants
 */
export function useMyRestaurantsQuery() {
  const { isAuthenticated, user } = useAuth();

  return useQuery<RestaurantResponse[], Error>({
    queryKey: queryKeys.restaurants.my(String(user?.id ?? 'current')),
    queryFn: () => restaurantsApi.getMyRestaurants(),
    enabled: isAuthenticated,
    staleTime: 30000,
  });
}

/**
 * Hook: Fetches a single restaurant by ID
 */
export function useRestaurantDetailQuery(restaurantId?: number | string | null) {
  return useQuery<RestaurantResponse, Error>({
    queryKey: queryKeys.restaurants.detail(restaurantId ?? ''),
    queryFn: () => restaurantsApi.getRestaurant(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 60000,
  });
}

/**
 * Hook: Creates a new restaurant and invalidates the owner's restaurants list
 */
export function useCreateRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation<RestaurantResponse, Error, CreateRestaurantRequest>({
    mutationFn: (data) => restaurantsApi.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all() });
    },
  });
}

/**
 * Hook: Updates restaurant information
 */
export function useUpdateRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation<RestaurantResponse, Error, { id: number | string; data: UpdateRestaurantRequest }>({
    mutationFn: ({ id, data }) => restaurantsApi.updateRestaurant(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all() });
      queryClient.setQueryData(queryKeys.restaurants.detail(updated.id), updated);
    },
  });
}

/**
 * Hook: Deletes a restaurant
 */
export function useDeleteRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id) => restaurantsApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all() });
    },
  });
}

/**
 * Hook: Updates restaurant open/closed status
 */
export function useUpdateRestaurantStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<RestaurantResponse, Error, { id: number | string; isOpen: boolean }>({
    mutationFn: ({ id, isOpen }) => restaurantsApi.updateRestaurantStatus(id, isOpen),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all() });
      queryClient.setQueryData(queryKeys.restaurants.detail(updated.id), updated);
    },
  });
}

/**
 * Hook: Fetches menu categories for a specific restaurant
 */
export function useCategoriesQuery(restaurantId?: number | string | null) {
  return useQuery<CategoryResponse[], Error>({
    queryKey: queryKeys.restaurants.categories(restaurantId ?? ''),
    queryFn: () => restaurantsApi.getCategories(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 60000,
  });
}

/**
 * Hook: Creates a new category for a restaurant
 */
export function useCreateCategoryMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<CategoryResponse, Error, CreateCategoryRequest>({
    mutationFn: (data) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to create a category');
      return restaurantsApi.createCategory(restaurantId, data);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.categories(restaurantId) });
      }
    },
  });
}

/**
 * Hook: Deletes a category
 */
export function useDeleteCategoryMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (categoryId) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to delete a category');
      return restaurantsApi.deleteCategory(restaurantId, categoryId);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.categories(restaurantId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.foods(restaurantId) });
      }
    },
  });
}

/**
 * Hook: Fetches food items for a specific restaurant
 */
export function useFoodItemsQuery(restaurantId?: number | string | null) {
  return useQuery<FoodItemResponse[], Error>({
    queryKey: queryKeys.restaurants.foods(restaurantId ?? ''),
    queryFn: () => restaurantsApi.getFoodItems(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 30000,
  });
}

/**
 * Hook: Creates a food item in a restaurant
 */
export function useCreateFoodItemMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<FoodItemResponse, Error, CreateFoodItemRequest>({
    mutationFn: (data) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to create a food item');
      return restaurantsApi.createFoodItem(restaurantId, data);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.foods(restaurantId) });
      }
    },
  });
}

/**
 * Hook: Updates an existing food item
 */
export function useUpdateFoodItemMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<FoodItemResponse, Error, { foodId: number | string; data: UpdateFoodItemRequest }>({
    mutationFn: ({ foodId, data }) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to update a food item');
      return restaurantsApi.updateFoodItem(restaurantId, foodId, data);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.foods(restaurantId) });
      }
    },
  });
}

/**
 * Hook: Deletes a food item
 */
export function useDeleteFoodItemMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (foodId) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to delete a food item');
      return restaurantsApi.deleteFoodItem(restaurantId, foodId);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.foods(restaurantId) });
      }
    },
  });
}

/**
 * Hook: Toggles food availability
 */
export function useUpdateFoodAvailabilityMutation(restaurantId?: number | string | null) {
  const queryClient = useQueryClient();

  return useMutation<FoodItemResponse, Error, { foodId: number | string; isAvailable: boolean }>({
    mutationFn: ({ foodId, isAvailable }) => {
      if (!restaurantId) throw new Error('Restaurant ID is required to update availability');
      return restaurantsApi.updateFoodAvailability(restaurantId, foodId, isAvailable);
    },
    onSuccess: () => {
      if (restaurantId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.foods(restaurantId) });
      }
    },
  });
}
