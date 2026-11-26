import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  resolveImageUrl,
  resolveFoodImageUrl,
  FALLBACK_FOOD_IMAGE,
  makeImgErrorHandler,
  S3_ASSETS_BASE_URL,
} from '../../lib/imageUtils';
import { RestaurantDetailPage } from '../../pages/RestaurantDetailPage';
import { FoodItemCard } from '../../features/owner/components/FoodItemCard';
import { CartProvider } from '../../context/CartContext';
import type { FoodItemResponse } from '../../api/types/restaurant';

describe('S3 Image Resolution & Kitchen Food Item Images', () => {
  describe('1. S3 Image Resolution Utility', () => {
    it('resolves standard S3 object keys to asset path/URL without hardcoded bucket', () => {
      const resolved = resolveImageUrl('restaurants/4/food/food-image.jpg');
      expect(resolved).toBe('/restaurants/4/food/food-image.jpg');
    });

    it('safely handles leading slashes in S3 object keys', () => {
      const resolved = resolveImageUrl('/restaurants/4/food/food-image.jpg');
      expect(resolved).toBe('/restaurants/4/food/food-image.jpg');

      const resolvedMultiple = resolveImageUrl('///restaurants/101/pasta.jpg');
      expect(resolvedMultiple).toBe('/restaurants/101/pasta.jpg');
    });

    it('preserves absolute web URLs, data URIs, and blob URIs without prefixing', () => {
      expect(resolveImageUrl('https://images.example.com/taco.jpg')).toBe(
        'https://images.example.com/taco.jpg',
      );
      expect(resolveImageUrl('http://localhost:8080/logo.png')).toBe(
        'http://localhost:8080/logo.png',
      );
      expect(resolveImageUrl('data:image/svg+xml;utf8,<svg></svg>')).toBe(
        'data:image/svg+xml;utf8,<svg></svg>',
      );
      expect(resolveImageUrl('blob:http://localhost:5173/uuid-1234')).toBe(
        'blob:http://localhost:5173/uuid-1234',
      );
    });

    it('returns custom fallback for null, undefined, empty, or whitespace-only keys', () => {
      expect(resolveImageUrl(null, FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl(undefined, FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('   ', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
    });

    it('provides resolveFoodImageUrl defaulting to the neutral QuickMunch food fallback', () => {
      expect(resolveFoodImageUrl(null)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveFoodImageUrl('restaurants/1/food/dish.jpg')).toBe(
        `${S3_ASSETS_BASE_URL}/restaurants/1/food/dish.jpg`,
      );
    });

    it('ensures FALLBACK_FOOD_IMAGE is a neutral QuickMunch-themed data URI and not an external placeholder', () => {
      expect(FALLBACK_FOOD_IMAGE.startsWith('data:image/svg+xml')).toBe(true);
      expect(FALLBACK_FOOD_IMAGE.toLowerCase()).not.toContain('unsplash');
      expect(decodeURIComponent(FALLBACK_FOOD_IMAGE)).toContain('QuickMunch Dish');
    });

    it('makeImgErrorHandler swaps src to fallback and clears onerror to avoid infinite loops', () => {
      const handler = makeImgErrorHandler(FALLBACK_FOOD_IMAGE);
      const fakeImg = {
        src: 'https://broken.s3.amazonaws.com/missing.jpg',
        onerror: vi.fn(),
      } as unknown as HTMLImageElement;

      const fakeEvent = {
        currentTarget: fakeImg,
      } as unknown as React.SyntheticEvent<HTMLImageElement>;

      handler(fakeEvent);

      expect(fakeImg.src).toBe(FALLBACK_FOOD_IMAGE);
      expect(fakeImg.onerror).toBeNull();
    });
  });

  describe('2. Customer-Facing Kitchens Section (RestaurantDetailPage)', () => {
    it('displays resolved S3 URLs for food items in the kitchen menu', () => {
      render(
        <CartProvider>
          <MemoryRouter initialEntries={['/restaurants/sylvan-hearth']}>
            <Routes>
              <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>,
      );

      // Verify customer-facing dish images resolve to S3 URLs
      const figPizzaImg = screen.getByRole('img', { name: 'Charred Fig & Stracciatella Pizza' });
      expect(figPizzaImg.getAttribute('src')).toBe('/restaurants/1/food/sh-1.jpg');

      const chanterelleImg = screen.getByRole('img', { name: 'Wild Chanterelle & Taleggio Pizza' });
      expect(chanterelleImg.getAttribute('src')).toBe('/restaurants/1/food/sh-4.jpg');
    });

    it('swaps broken customer dish image to neutral QuickMunch fallback on error', () => {
      render(
        <CartProvider>
          <MemoryRouter initialEntries={['/restaurants/sylvan-hearth']}>
            <Routes>
              <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>,
      );

      const dishImg = screen.getByRole('img', { name: 'Charred Fig & Stracciatella Pizza' });
      expect(dishImg.getAttribute('src')).toContain('restaurants/1/food/sh-1.jpg');

      // Trigger image load error
      fireEvent.error(dishImg);

      expect(dishImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);
    });
  });

  describe("3. Restaurant Owner's Kitchen Management Section (FoodItemCard)", () => {
    const baseMockFood: FoodItemResponse = {
      id: 2001,
      restaurantId: 4,
      categoryId: 10,
      caetegoryName: 'Tacos',
      name: 'Smoked Wagyu Birria Tacos',
      description: 'Slow-simmered wagyu shank with consommé',
      price: 22.0,
      imageUrl: 'restaurants/4/food/birria.jpg',
      isAvailable: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    it('renders actual uploaded S3 image on FoodItemCard', () => {
      render(
        <FoodItemCard
          foodItem={baseMockFood}
          onEdit={vi.fn()}
          onChangeImage={vi.fn()}
          onDelete={vi.fn()}
          onToggleAvailability={vi.fn()}
        />,
      );

      const foodImg = screen.getByRole('img', { name: 'Smoked Wagyu Birria Tacos' });
      expect(foodImg.getAttribute('src')).toBe('/restaurants/4/food/birria.jpg');
    });

    it('displays neutral QuickMunch-themed fallback when food imageUrl is null or empty', () => {
      const { rerender } = render(
        <FoodItemCard
          foodItem={{ ...baseMockFood, imageUrl: null }}
          onEdit={vi.fn()}
          onChangeImage={vi.fn()}
          onDelete={vi.fn()}
          onToggleAvailability={vi.fn()}
        />,
      );

      let foodImg = screen.getByRole('img', { name: 'Smoked Wagyu Birria Tacos' });
      expect(foodImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);

      // Empty string
      rerender(
        <FoodItemCard
          foodItem={{ ...baseMockFood, imageUrl: '' }}
          onEdit={vi.fn()}
          onChangeImage={vi.fn()}
          onDelete={vi.fn()}
          onToggleAvailability={vi.fn()}
        />,
      );
      foodImg = screen.getByRole('img', { name: 'Smoked Wagyu Birria Tacos' });
      expect(foodImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);
    });

    it('swaps broken owner dish image to neutral fallback and avoids infinite loop', () => {
      render(
        <FoodItemCard
          foodItem={baseMockFood}
          onEdit={vi.fn()}
          onChangeImage={vi.fn()}
          onDelete={vi.fn()}
          onToggleAvailability={vi.fn()}
        />,
      );

      const foodImg = screen.getByRole('img', { name: 'Smoked Wagyu Birria Tacos' });
      expect(foodImg.getAttribute('src')).toContain('restaurants/4/food/birria.jpg');

      // Trigger error
      fireEvent.error(foodImg);

      expect(foodImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);
    });
  });
});
