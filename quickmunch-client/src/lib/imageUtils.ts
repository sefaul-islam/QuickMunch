import React from 'react';

/** Generic restaurant/kitchen fallback — a warm restaurant interior shot */
export const FALLBACK_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';

/** Generic food/dish fallback — a warm bowl of food */
export const FALLBACK_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';

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
