import React from 'react';

/** Generic restaurant/kitchen fallback — a warm restaurant interior shot */
export const FALLBACK_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';

/** Neutral QuickMunch-themed food/dish fallback data URI */
export const FALLBACK_FOOD_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">' +
      '<rect width="400" height="300" fill="#FAF7F2"/>' +
      '<rect x="2" y="2" width="396" height="296" rx="14" fill="#FAF7F2" stroke="#E8E1D3" stroke-width="2"/>' +
      '<circle cx="200" cy="126" r="46" fill="#E8EFEA"/>' +
      '<path d="M165 146c0-19.33 15.67-35 35-35s35 15.67 35 35H165z" fill="#173D32"/>' +
      '<circle cx="200" cy="107" r="4.5" fill="#D98245"/>' +
      '<rect x="157" y="150" width="86" height="5" rx="2.5" fill="#173D32"/>' +
      '<text x="200" y="202" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif" font-size="12" font-weight="600" fill="#626661" letter-spacing="0.4">QuickMunch Dish</text>' +
      '</svg>',
  );

/** Image CDN / S3 asset host configuration */
export const S3_ASSETS_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_S3_BASE_URL) || '';

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

  const baseUrl = S3_ASSETS_BASE_URL.replace(/\/+$/, '');
  const normalizedKey = clean.replace(/^\/+/, '');

  // AWS S3 / CDN object key (e.g. "restaurants/1/uuid.jpg" or "/restaurants/1/uuid.jpg")
  if (normalizedKey.startsWith('restaurants/')) {
    return baseUrl ? `${baseUrl}/${normalizedKey}` : `/${normalizedKey}`;
  }

  // Relative public asset path starting with slash (e.g. "/favicon.svg")
  if (clean.startsWith('/') && !clean.startsWith('/restaurants/')) {
    return clean;
  }

  // Fallback as S3 / CDN key
  return baseUrl ? `${baseUrl}/${normalizedKey}` : `/${normalizedKey}`;
}

/**
 * Convenience function for resolving food item images with the neutral QuickMunch food fallback
 */
export function resolveFoodImageUrl(imageUrl?: string | null): string {
  return resolveImageUrl(imageUrl, FALLBACK_FOOD_IMAGE);
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
