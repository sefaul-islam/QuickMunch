import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RestaurantListingPage } from '../../pages/RestaurantListingPage';
import { RestaurantDetailPage } from '../../pages/RestaurantDetailPage';
import { HomePage } from '../../pages/HomePage';
import { CartProvider, useCart } from '../../context/CartContext';
import { restaurantsApi } from '../../api/restaurants';
import { ApiError } from '../../api/apiError';
import {
  S3_ASSETS_BASE_URL,
  FALLBACK_RESTAURANT_IMAGE,
} from '../../lib/imageUtils';
import type { RestaurantResponse, FoodItemResponse } from '../../api/types/restaurant';

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

const mockRestaurants: RestaurantResponse[] = [
  {
    id: 11,
    ownerId: 'owner-a',
    name: 'Cedar & Salt Bistro',
    description: 'Seasonal roasted plates and sourdough.',
    phoneNumber: '+1 555-2211',
    address: '88 Cedar Street',
    imageUrl: 'restaurants/11/cover.jpg',
    isActive: true,
    isOpen: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 12,
    ownerId: 'owner-b',
    name: 'Nori & Broth',
    description: 'Slow-simmered noodle bowls.',
    phoneNumber: '+1 555-3344',
    address: '14 Harbor Ave',
    imageUrl: null,
    isActive: true,
    isOpen: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const mockFoods: FoodItemResponse[] = [
  {
    id: 501,
    restaurantId: 11,
    categoryId: null,
    caetegoryName: 'Mains',
    name: 'Roasted Sea Bass',
    description: 'Herb crusted fillet',
    price: 29.0,
    imageUrl: 'restaurants/11/seabass.jpg',
    isAvailable: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

describe('Backend Restaurant & S3 Integration (No Mock Fallbacks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders backend restaurants on RestaurantListingPage with resolved S3 and fallback images', async () => {
    vi.mocked(restaurantsApi.getAllRestaurants).mockResolvedValue(mockRestaurants);

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CartProvider>
          <MemoryRouter initialEntries={['/restaurants']}>
            <RestaurantListingPage />
          </MemoryRouter>
        </CartProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Cedar & Salt Bistro')).toBeDefined();
    expect(screen.getByText('Nori & Broth')).toBeDefined();

    const cedarImg = screen.getByRole('img', { name: 'Cedar & Salt Bistro' });
    expect(cedarImg.getAttribute('src')).toBe(expectedS3Url('restaurants/11/cover.jpg'));

    const noriImg = screen.getByRole('img', { name: 'Nori & Broth' });
    expect(noriImg.getAttribute('src')).toBe(FALLBACK_RESTAURANT_IMAGE);
  });

  it('displays error state without fake fallback when RestaurantListingPage API call fails', async () => {
    vi.mocked(restaurantsApi.getAllRestaurants).mockRejectedValue(
      new ApiError({ message: 'Gateway unavailable', status: 503, code: 'GATEWAY_ERROR' }),
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CartProvider>
          <MemoryRouter initialEntries={['/restaurants']}>
            <RestaurantListingPage />
          </MemoryRouter>
        </CartProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Unable to load kitchens')).toBeDefined();
    expect(screen.getByText('Gateway unavailable')).toBeDefined();
    expect(screen.queryByText('Sylvan Hearth & Bakery')).toBeNull();
  });

  it('displays error state without fake fallback when RestaurantDetailPage API call fails', async () => {
    vi.mocked(restaurantsApi.getRestaurant).mockRejectedValue(
      new ApiError({ message: 'Service error', status: 500, code: 'SERVER_ERROR' }),
    );
    vi.mocked(restaurantsApi.getCategories).mockResolvedValue([]);
    vi.mocked(restaurantsApi.getFoodItems).mockResolvedValue([]);

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CartProvider>
          <MemoryRouter initialEntries={['/restaurants/11']}>
            <Routes>
              <Route path="/restaurants/:restaurantId" element={<RestaurantDetailPage />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Unable to Load Kitchen')).toBeDefined();
    expect(screen.getByText('Service error')).toBeDefined();
  });

  it('renders HomePage hero showcase alongside real backend restaurants and dishes', async () => {
    vi.mocked(restaurantsApi.getAllRestaurants).mockResolvedValue(mockRestaurants);
    vi.mocked(restaurantsApi.getFoodItems).mockImplementation(async (id) =>
      Number(id) === 11 ? mockFoods : [],
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CartProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </CartProvider>
      </QueryClientProvider>,
    );

    // Curated hero remains intact
    expect(screen.getByText('Hand-Rolled 30-Yolk Tagliolini al Tartufo')).toBeDefined();

    // Backend kitchens and dishes load
    expect((await screen.findAllByText('Cedar & Salt Bistro')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Roasted Sea Bass')).toBeDefined();
  });

  it('displays error state without fake fallback when HomePage API call fails', async () => {
    vi.mocked(restaurantsApi.getAllRestaurants).mockRejectedValue(
      new ApiError({ message: 'Backend down', status: 503, code: 'GATEWAY_ERROR' }),
    );

    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <CartProvider>
          <MemoryRouter initialEntries={['/']}>
            <HomePage />
          </MemoryRouter>
        </CartProvider>
      </QueryClientProvider>,
    );

    // Hero remains intact while grid reports the API failure instead of fake restaurants
    expect(screen.getByText('Hand-Rolled 30-Yolk Tagliolini al Tartufo')).toBeDefined();
    expect(await screen.findByText('Unable to load kitchens')).toBeDefined();
    expect(screen.getByText('Backend down')).toBeDefined();
  });

  it('initializes CartContext empty without mock dishes, favorites, or addresses', () => {
    const CartProbe = () => {
      const { cartItems, favoriteRestaurantIds, currentAddress } = useCart();
      return (
        <div>
          <span data-testid="cart-count">{cartItems.length}</span>
          <span data-testid="fav-count">{favoriteRestaurantIds.length}</span>
          <span data-testid="address">{currentAddress ? currentAddress.street : 'none'}</span>
        </div>
      );
    };

    render(
      <CartProvider>
        <CartProbe />
      </CartProvider>,
    );

    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.getByTestId('fav-count').textContent).toBe('0');
    expect(screen.getByTestId('address').textContent).toBe('none');
  });
});
