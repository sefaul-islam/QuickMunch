import React from 'react';

/** Generic restaurant/kitchen fallback — a warm restaurant interior shot */
export const FALLBACK_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';

/** Generic food/dish fallback — a warm bowl of food */
export const FALLBACK_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

/** AWS S3 asset host configuration matching backend */
export const S3_ASSETS_BASE_URL = 'https://quickmunch-assets-prod.s3.ap-south-1.amazonaws.com';

/** Accepted image mime types enforced by restaurant-service */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

/** Maximum image size in bytes (5MB) */
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/**
 * Resolves a stored image reference (full URL, relative path, or S3 object key)
 * to a browser-renderable absolute URL.
 */
export function resolveImageUrl(
  imageUrl?: string | null,
  fallback = FALLBACK_RESTAURANT_IMAGE,
): string {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return fallback;
  }

  const clean = imageUrl.trim();

  // Already a full web URL, data URI, or browser object URL
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // AWS S3 object key (e.g. "restaurants/1/uuid.jpg")
  if (clean.startsWith('restaurants/')) {
    return `${S3_ASSETS_BASE_URL}/${clean}`;
  }

  // Relative path starting with slash
  if (clean.startsWith('/')) {
    return clean;
  }

  // Fallback as S3 key
  return `${S3_ASSETS_BASE_URL}/${clean}`;
}

/**
 * Validates file type and size against backend constraints
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType)) {
    return {
      valid: false,
      error: 'Unsupported image format. Please select a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed size is 5MB.`,
    };
  }

  return { valid: true };
}

/**
 * Formats byte counts into human-readable strings (e.g., "450 KB", "2.1 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Returns an onError handler that swaps the broken image src to the given
 * fallback URL exactly once, preventing infinite error-loop retries.
 */
export function makeImgErrorHandler(
  fallback: string,
): React.ReactEventHandler<HTMLImageElement> {
  return (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  };
}

/** Pre-bound handlers for the two common fallback cases */
export const onRestaurantImgError = makeImgErrorHandler(FALLBACK_RESTAURANT_IMAGE);
export const onFoodImgError = makeImgErrorHandler(FALLBACK_FOOD_IMAGE);
