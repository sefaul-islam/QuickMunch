/**
 * QuickMunch Restaurant Service API Contracts & DTOs
 *
 * Mapped directly from Spring Boot restaurant-service DTOs:
 * - RestaurantResponse, CreateRestaurantRequest, UpdateRestaurantRequest
 * - CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest
 * - FoodItemResponse, CreateFoodItemRequest, UpdateFoodItemRequest
 * - UploadUrlRequest, UploadUrlResponse
 */

export interface RestaurantResponse {
  id: number;
  ownerId: string;
  name: string;
  description?: string | null;
  phoneNumber: string;
  address: string;
  imageUrl?: string | null;
  isActive: boolean;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantRequest {
  name: string;
  description?: string;
  phoneNumber: string;
  address: string;
  imageUrl?: string;
}

export interface UpdateRestaurantRequest {
  name: string;
  description?: string;
  phoneNumber: string;
  address: string;
  imageUrl?: string;
}

export interface CategoryResponse {
  id: number;
  restaurantId: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

export interface FoodItemResponse {
  id: number;
  restaurantId: number;
  /** Note: Backend DTO field spelling is caetegoryName */
  caetegoryName?: string | null;
  categoryId?: number | null;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFoodItemRequest {
  categoryId?: number | null;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface UpdateFoodItemRequest {
  categoryId?: number | null;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface UploadUrlRequest {
  fileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp' | string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  objectKey: string;
}
