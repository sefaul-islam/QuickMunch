import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  resolveImageUrl,
  resolveFoodImageUrl,
  FALLBACK_FOOD_IMAGE,
  FALLBACK_RESTAURANT_IMAGE,
  makeImgErrorHandler,
  S3_ASSETS_BASE_URL,
} from '../../lib/imageUtils';
import { RestaurantDetailPage } from '../../pages/RestaurantDetailPage';
import { FoodItemCard } from '../../features/owner/components/FoodItemCard';
import { CartProvider } from '../../context/CartContext';
import { restaurantsApi } from '../../api/restaurants';
import type {
  RestaurantResponse,
  CategoryResponse,
  FoodItemResponse,
} from '../../api/types/restaurant';

vi.mock('../../api/restaurants', () => ({
  restaurantsApi: {
    getAllRestaurants: vi.fn(),
    getMyRestaurants: vi.fn(),
    getRestaurant: vi.fn(),
    createRestaurant: vi.fn(),
    updateRestaurant: vi.fn(),
    deleteRestaurant: vi.fn(),
    updateRestaurantStatus: vi.fn(),
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
    getFoodItems: vi.fn(),
    getFoodItem: vi.fn(),
    createFoodItem: vi.fn(),
    updateFoodItem: vi.fn(),
    deleteFoodItem: vi.fn(),
    updateFoodAvailability: vi.fn(),
    getUploadUrl: vi.fn(),
    uploadFileToS3: vi.fn(),
  },
}));

const normalizedBase = S3_ASSETS_BASE_URL.replace(/\/+$/, '');
const expectedS3Url = (key: string) => (normalizedBase ? `${normalizedBase}/${key}` : `/${key}`);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe('S3 Image Resolution & Kitchen Food Item Images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('1. S3 Image Resolution Utility', () => {
    it('resolves standard S3 object keys to configured CDN/S3 base URL or root-relative path', () => {
      const resolved = resolveImageUrl('restaurants/4/food/food-image.jpg');
      expect(resolved).toBe(expectedS3Url('restaurants/4/food/food-image.jpg'));
    });

    it('safely handles leading slashes in S3 object keys', () => {
      const resolved = resolveImageUrl('/restaurants/4/food/food-image.jpg');
      expect(resolved).toBe(expectedS3Url('restaurants/4/food/food-image.jpg'));

      const resolvedMultiple = resolveImageUrl('///restaurants/101/pasta.jpg');
      expect(resolvedMultiple).toBe(expectedS3Url('restaurants/101/pasta.jpg'));
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

    it('returns local fallback for null, undefined, empty, whitespace, or string sentinel keys', () => {
      expect(resolveImageUrl(null, FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl(undefined, FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('   ', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('null', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveImageUrl('undefined', FALLBACK_FOOD_IMAGE)).toBe(FALLBACK_FOOD_IMAGE);
    });

    it('provides resolveFoodImageUrl defaulting to the neutral QuickMunch food fallback', () => {
      expect(resolveFoodImageUrl(null)).toBe(FALLBACK_FOOD_IMAGE);
      expect(resolveFoodImageUrl('restaurants/1/food/dish.jpg')).toBe(
        expectedS3Url('restaurants/1/food/dish.jpg'),
      );
    });

    it('ensures both FALLBACK_FOOD_IMAGE and FALLBACK_RESTAURANT_IMAGE are local data URIs', () => {
      expect(FALLBACK_FOOD_IMAGE.startsWith('data:image/svg+xml')).toBe(true);
      expect(FALLBACK_FOOD_IMAGE.toLowerCase()).not.toContain('unsplash');
      expect(decodeURIComponent(FALLBACK_FOOD_IMAGE)).toContain('QuickMunch Dish');

      expect(FALLBACK_RESTAURANT_IMAGE.startsWith('data:image/svg+xml')).toBe(true);
      expect(FALLBACK_RESTAURANT_IMAGE.toLowerCase()).not.toContain('unsplash');
      expect(decodeURIComponent(FALLBACK_RESTAURANT_IMAGE)).toContain('QuickMunch Kitchen');
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
    const mockBackendRestaurant: RestaurantResponse = {
      id: 1,
      ownerId: 'owner-1',
      name: 'Hearth & Crumb',
      description: 'Wood-fired seasonal baking',
      phoneNumber: '+1 555-0100',
      address: '101 Market Street',
      imageUrl: 'restaurants/1/banner.jpg',
      isActive: true,
      isOpen: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const mockCategories: CategoryResponse[] = [
      {
        id: 10,
        restaurantId: 1,
        name: 'Pizzas',
        description: 'Sourdough pizzas',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    const mockFoods: FoodItemResponse[] = [
      {
        id: 100,
        restaurantId: 1,
        categoryId: 10,
        caetegoryName: 'Pizzas',
        name: 'Charred Fig Pizza',
        description: 'Sourdough crust with figs',
        price: 24.5,
        imageUrl: 'restaurants/1/food/sh-1.jpg',
        isAvailable: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 101,
        restaurantId: 1,
        categoryId: 10,
        caetegoryName: 'Pizzas',
        name: 'Mushroom Levain Pizza',
        description: 'Roasted wild mushrooms',
        price: 26.0,
        imageUrl: null,
        isAvailable: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    ];

    it('displays resolved S3 URLs for restaurant and food items from backend API', async () => {
      vi.mocked(restaurantsApi.getRestaurant).mockResolvedValue(mockBackendRestaurant);
      vi.mocked(restaurantsApi.getCategories).mockResolvedValue(mockCategories);
      vi.mocked(restaurantsApi.getFoodItems).mockResolvedValue(mockFoods);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <CartProvider>
            <MemoryRouter initialEntries={['/restaurants/1']}>
              <Routes>
                <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </QueryClientProvider>,
      );

      const bannerImg = await screen.findByRole('img', { name: 'Hearth & Crumb' });
      expect(bannerImg.getAttribute('src')).toBe(expectedS3Url('restaurants/1/banner.jpg'));

      const figPizzaImg = await screen.findByRole('img', { name: 'Charred Fig Pizza' });
      expect(figPizzaImg.getAttribute('src')).toBe(expectedS3Url('restaurants/1/food/sh-1.jpg'));

      const mushroomImg = await screen.findByRole('img', { name: 'Mushroom Levain Pizza' });
      expect(mushroomImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);
    });

    it('swaps broken customer dish image to neutral QuickMunch fallback on error', async () => {
      vi.mocked(restaurantsApi.getRestaurant).mockResolvedValue(mockBackendRestaurant);
      vi.mocked(restaurantsApi.getCategories).mockResolvedValue(mockCategories);
      vi.mocked(restaurantsApi.getFoodItems).mockResolvedValue(mockFoods);

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <CartProvider>
            <MemoryRouter initialEntries={['/restaurants/1']}>
              <Routes>
                <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
              </Routes>
            </MemoryRouter>
          </CartProvider>
        </QueryClientProvider>,
      );

      const dishImg = await screen.findByRole('img', { name: 'Charred Fig Pizza' });
      expect(dishImg.getAttribute('src')).toContain('restaurants/1/food/sh-1.jpg');

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
      expect(foodImg.getAttribute('src')).toBe(expectedS3Url('restaurants/4/food/birria.jpg'));
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

      fireEvent.error(foodImg);

      expect(foodImg.getAttribute('src')).toBe(FALLBACK_FOOD_IMAGE);
    });
  });
});
