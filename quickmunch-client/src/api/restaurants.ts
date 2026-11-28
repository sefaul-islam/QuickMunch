import axios from 'axios';
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  RestaurantResponse,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  FoodItemResponse,
  CreateFoodItemRequest,
  UpdateFoodItemRequest,
  UploadUrlResponse,
  UploadUrlRequest,
} from './types/restaurant';

/**
 * Isolated axios instance for direct S3 presigned URL uploads.
 * Never inherits Keycloak Bearer tokens, interceptors, or backend base URLs.
 */
const s3UploadClient = axios.create({
  timeout: 60000,
});

export const restaurantsApi = {
  /**
   * Fetches all public restaurants from restaurant-service via API Gateway
   * Endpoint: GET /api/restaurants
   */
  getAllRestaurants: async (): Promise<RestaurantResponse[]> => {
    const response = await apiClient.get<RestaurantResponse[]>(API_ENDPOINTS.RESTAURANTS.BASE);
    return response.data;
  },

  /**
   * Fetches the current authenticated owner's restaurants
   * Endpoint: GET /api/restaurants/my
   */
  getMyRestaurants: async (): Promise<RestaurantResponse[]> => {
    const response = await apiClient.get<RestaurantResponse[]>(API_ENDPOINTS.RESTAURANTS.MY);
    return response.data;
  },

  /**
   * Fetches a specific restaurant by its ID
   * Endpoint: GET /api/restaurants/{id}
   */
  getRestaurant: async (id: number | string): Promise<RestaurantResponse> => {
    const response = await apiClient.get<RestaurantResponse>(API_ENDPOINTS.RESTAURANTS.BY_ID(id));
    return response.data;
  },

  /**
   * Creates a new restaurant owned by the authenticated user
   * Endpoint: POST /api/restaurants
   */
  createRestaurant: async (data: CreateRestaurantRequest): Promise<RestaurantResponse> => {
    const response = await apiClient.post<RestaurantResponse>(API_ENDPOINTS.RESTAURANTS.BASE, data);
    return response.data;
  },

  /**
   * Updates existing restaurant details
   * Endpoint: PUT /api/restaurants/{id}
   */
  updateRestaurant: async (
    id: number | string,
    data: UpdateRestaurantRequest,
  ): Promise<RestaurantResponse> => {
    const response = await apiClient.put<RestaurantResponse>(API_ENDPOINTS.RESTAURANTS.BY_ID(id), data);
    return response.data;
  },

  /**
   * Deletes a restaurant
   * Endpoint: DELETE /api/restaurants/{id}
   */
  deleteRestaurant: async (id: number | string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.RESTAURANTS.BY_ID(id));
  },

  /**
   * Toggles or updates restaurant open/closed status
   * Endpoint: PATCH /api/restaurants/{id}/status
   */
  updateRestaurantStatus: async (
    id: number | string,
    isOpen: boolean,
  ): Promise<RestaurantResponse> => {
    const response = await apiClient.patch<RestaurantResponse>(
      API_ENDPOINTS.RESTAURANTS.STATUS(id),
      { isOpen },
    );
    return response.data;
  },

  // -------------------------------------------------------------
  // Categories Management (Scoped to Restaurant)
  // -------------------------------------------------------------

  /**
   * Fetches menu categories for a specific restaurant
   * Endpoint: GET /api/restaurants/{restaurantId}/categories
   */
  getCategories: async (restaurantId: number | string): Promise<CategoryResponse[]> => {
    const response = await apiClient.get<CategoryResponse[]>(
      API_ENDPOINTS.RESTAURANTS.CATEGORIES(restaurantId),
    );
    return response.data;
  },

  /**
   * Creates a new menu category for a restaurant
   * Endpoint: POST /api/restaurants/{restaurantId}/categories
   */
  createCategory: async (
    restaurantId: number | string,
    data: CreateCategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>(
      API_ENDPOINTS.RESTAURANTS.CATEGORIES(restaurantId),
      data,
    );
    return response.data;
  },

  /**
   * Updates a category name or description
   * Endpoint: PUT /api/restaurants/{restaurantId}/categories/{categoryId}
   */
  updateCategory: async (
    restaurantId: number | string,
    categoryId: number | string,
    data: UpdateCategoryRequest,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.put<CategoryResponse>(
      API_ENDPOINTS.RESTAURANTS.CATEGORY_BY_ID(restaurantId, categoryId),
      data,
    );
    return response.data;
  },

  /**
   * Deletes a category
   * Endpoint: DELETE /api/restaurants/{restaurantId}/categories/{categoryId}
   */
  deleteCategory: async (
    restaurantId: number | string,
    categoryId: number | string,
  ): Promise<void> => {
    await apiClient.delete(
      API_ENDPOINTS.RESTAURANTS.CATEGORY_BY_ID(restaurantId, categoryId),
    );
  },

  // -------------------------------------------------------------
  // Food Items Management (Scoped to Restaurant)
  // -------------------------------------------------------------

  /**
   * Fetches food items for a restaurant
   * Endpoint: GET /api/restaurants/{restaurantId}/foods
   */
  getFoodItems: async (restaurantId: number | string): Promise<FoodItemResponse[]> => {
    const response = await apiClient.get<FoodItemResponse[]>(
      API_ENDPOINTS.RESTAURANTS.FOODS(restaurantId),
    );
    return response.data;
  },

  /**
   * Fetches single food item details
   * Endpoint: GET /api/restaurants/{restaurantId}/foods/{foodId}
   */
  getFoodItem: async (
    restaurantId: number | string,
    foodId: number | string,
  ): Promise<FoodItemResponse> => {
    const response = await apiClient.get<FoodItemResponse>(
      API_ENDPOINTS.RESTAURANTS.FOOD_BY_ID(restaurantId, foodId),
    );
    return response.data;
  },

  /**
   * Creates a new dish/food item in a restaurant
   * Endpoint: POST /api/restaurants/{restaurantId}/foods
   */
  createFoodItem: async (
    restaurantId: number | string,
    data: CreateFoodItemRequest,
  ): Promise<FoodItemResponse> => {
    const response = await apiClient.post<FoodItemResponse>(
      API_ENDPOINTS.RESTAURANTS.FOODS(restaurantId),
      data,
    );
    return response.data;
  },

  /**
   * Updates an existing food item
   * Endpoint: PUT /api/restaurants/{restaurantId}/foods/{foodId}
   */
  updateFoodItem: async (
    restaurantId: number | string,
    foodId: number | string,
    data: UpdateFoodItemRequest,
  ): Promise<FoodItemResponse> => {
    const response = await apiClient.put<FoodItemResponse>(
      API_ENDPOINTS.RESTAURANTS.FOOD_BY_ID(restaurantId, foodId),
      data,
    );
    return response.data;
  },

  /**
   * Deletes a food item
   * Endpoint: DELETE /api/restaurants/{restaurantId}/foods/{foodId}
   */
  deleteFoodItem: async (
    restaurantId: number | string,
    foodId: number | string,
  ): Promise<void> => {
    await apiClient.delete(
      API_ENDPOINTS.RESTAURANTS.FOOD_BY_ID(restaurantId, foodId),
    );
  },

  /**
   * Toggles dish live inventory availability
   * Endpoint: PATCH /api/restaurants/{restaurantId}/foods/{foodId}/availability
   */
  updateFoodAvailability: async (
    restaurantId: number | string,
    foodId: number | string,
    isAvailable: boolean,
  ): Promise<FoodItemResponse> => {
    const response = await apiClient.patch<FoodItemResponse>(
      API_ENDPOINTS.RESTAURANTS.FOOD_AVAILABILITY(restaurantId, foodId),
      { isAvailable },
    );
    return response.data;
  },

  // -------------------------------------------------------------
  // S3 Presigned URL & Direct S3 Upload
  // -------------------------------------------------------------

  /**
   * Requests an AWS S3 presigned PUT URL and object key from restaurant-service
   * Endpoint: POST /api/restaurants/{restaurantId}/images/upload-url
   */
  getUploadUrl: async (
    restaurantId: number | string,
    fileName: string,
    contentType: string,
  ): Promise<UploadUrlResponse> => {
    const payload: UploadUrlRequest = { fileName, contentType };
    const response = await apiClient.post<UploadUrlResponse>(
      API_ENDPOINTS.RESTAURANTS.UPLOAD_URL(restaurantId),
      payload,
    );
    return response.data;
  },

  /**
   * Direct HTTP PUT upload to AWS S3 presigned URL.
   *
   * Crucial security & architecture rules:
   * 1. Never sends Keycloak Bearer token to S3.
   * 2. Sets exact Content-Type matching file mime type.
   * 3. Dispatches upload progress events (0-100%).
   */
  uploadFileToS3: async (
    uploadUrl: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<void> => {
    await s3UploadClient.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },
};
