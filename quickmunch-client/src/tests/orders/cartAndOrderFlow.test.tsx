import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { CartProvider, useCart } from '../../context/CartContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ordersApi } from '../../api/orders';
import { restaurantsApi } from '../../api/restaurants';
import { ApiError } from '../../api/apiError';
import type { CartResponse, OrderConfirmationResponse } from '../../api/types/order';
import type { RestaurantResponse } from '../../api/types/restaurant';

vi.mock('../../api/orders', () => ({
  ordersApi: {
    getCart: vi.fn(),
    addCartItem: vi.fn(),
    updateCartItem: vi.fn(),
    removeCartItem: vi.fn(),
    clearCart: vi.fn(),
    createOrder: vi.fn(),
    getOrder: vi.fn(),
  },
}));

vi.mock('../../api/restaurants', () => ({
  restaurantsApi: {
    getRestaurant: vi.fn(),
    getAllRestaurants: vi.fn(),
    getMyRestaurants: vi.fn(),
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

const mockLogin = vi.fn().mockResolvedValue(undefined);

const createMockAuth = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  user: null,
  roles: [],
  appRoles: [],
  activeRole: null,
  selectRole: vi.fn(),
  clearActiveRole: vi.fn(),
  login: mockLogin,
  logout: vi.fn(),
  getAccessToken: vi.fn().mockResolvedValue('mock-token'),
  refreshProfile: vi.fn(),
  error: null,
  ...overrides,
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const TestDishPage = () => {
  const { addToCart, setIsCartOpen, cartItems } = useCart();
  return (
    <div>
      <span data-testid="cart-item-count">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
      <button
        type="button"
        onClick={() =>
          addToCart(
            {
              id: '101',
              name: 'Herb Burger',
              description: 'Chargrilled',
              price: 12.5,
              image: '',
            },
            { id: '10', name: 'Cedar Bistro' },
          )
        }
      >
        Add Herb Burger
      </button>
      <button
        type="button"
        onClick={() =>
          addToCart(
            {
              id: '202',
              name: 'Miso Ramen',
              description: 'Rich broth',
              price: 15,
              image: '',
            },
            { id: '20', name: 'Nori & Broth' },
          )
        }
      >
        Add Miso Ramen
      </button>
      <button type="button" onClick={() => setIsCartOpen(true)}>
        Open Bag
      </button>
    </div>
  );
};

const renderAppWithAuth = (authValue: AuthContextValue) => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={authValue}>
        <CartProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<TestDishPage />} />
                <Route path="customer/dashboard" element={<div>Customer Dashboard</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

const sampleRestaurant: RestaurantResponse = {
  id: 10,
  ownerId: 'owner-1',
  name: 'Cedar Bistro',
  description: 'Seasonal kitchen',
  phoneNumber: '+1 555-1234',
  address: '10 Cedar St',
  imageUrl: null,
  isActive: true,
  isOpen: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const sampleServerCart: CartResponse = {
  id: 1,
  userId: 'kc-cust-1',
  restaurantId: 10,
  items: [
    {
      id: 11,
      foodItemId: 101,
      name: 'Herb Burger',
      imageUrl: null,
      unitPrice: 12.5,
      quantity: 1,
      subtotal: 12.5,
      isAvailable: true,
    },
  ],
  totalItems: 1,
  subtotal: 12.5,
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Cart Persistence & Order Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(restaurantsApi.getRestaurant).mockResolvedValue(sampleRestaurant);
  });

  it('prompts login dialog when unauthenticated user clicks Proceed to Checkout', async () => {
    renderAppWithAuth(createMockAuth({ isAuthenticated: false }));

    fireEvent.click(screen.getByText('Add Herb Burger'));
    expect(screen.getByTestId('cart-item-count').textContent).toBe('1');

    fireEvent.click(screen.getByText('Open Bag'));
    expect(await screen.findByText('Your Order Bag')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));

    expect(await screen.findByText('Sign in to place your order')).toBeDefined();
    expect(
      screen.getByText(/Log in with your QuickMunch account to save your cart and submit your order/i),
    ).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Log In to Order/i }));
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(ordersApi.createOrder).not.toHaveBeenCalled();
  });

  it('syncs guest cart items into backend cart upon authentication', async () => {
    localStorage.setItem(
      'quickmunch_cart',
      JSON.stringify([
        {
          dish: { id: '101', name: 'Herb Burger', description: '', price: 12.5, image: '' },
          restaurantId: '10',
          restaurantName: 'Cedar Bistro',
          quantity: 2,
        },
      ]),
    );

    vi.mocked(ordersApi.getCart).mockResolvedValue({
      id: null,
      userId: 'kc-cust-1',
      restaurantId: null,
      items: [],
      totalItems: 0,
      subtotal: 0,
      updatedAt: null,
    });
    vi.mocked(ordersApi.addCartItem).mockResolvedValue({
      ...sampleServerCart,
      items: [{ ...sampleServerCart.items[0], quantity: 2, subtotal: 25 }],
      totalItems: 2,
      subtotal: 25,
    });

    renderAppWithAuth(
      createMockAuth({
        isAuthenticated: true,
        user: {
          id: 'kc-cust-1',
          firstName: 'Sefaul',
          lastName: 'Islam',
          email: 'sefaul@example.com',
        },
      }),
    );

    await waitFor(() => {
      expect(ordersApi.getCart).toHaveBeenCalledTimes(1);
      expect(ordersApi.addCartItem).toHaveBeenCalledWith({
        restaurantId: 10,
        foodItemId: 101,
        quantity: 2,
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-item-count').textContent).toBe('2');
    });
    expect(localStorage.getItem('quickmunch_cart')).toBeNull();
  });

  it('persists cart additions/updates via ordersApi and places order from persisted cart', async () => {
    vi.mocked(ordersApi.getCart).mockResolvedValue({
      id: null,
      userId: 'kc-cust-1',
      restaurantId: null,
      items: [],
      totalItems: 0,
      subtotal: 0,
      updatedAt: null,
    });
    vi.mocked(ordersApi.addCartItem).mockResolvedValue(sampleServerCart);
    vi.mocked(ordersApi.updateCartItem).mockResolvedValue({
      ...sampleServerCart,
      items: [{ ...sampleServerCart.items[0], quantity: 2, subtotal: 25 }],
      totalItems: 2,
      subtotal: 25,
    });

    const confirmation: OrderConfirmationResponse = {
      id: 901,
      orderNumber: 'QM-ABC12345',
      userId: 'kc-cust-1',
      restaurantId: 10,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      subtotal: 25,
      deliveryFee: 2.99,
      totalAmount: 27.99,
      deliveryAddressId: 77,
      items: [
        { id: 1, foodItemId: 101, quantity: 2, unitPrice: 12.5, subtotal: 25 },
      ],
      createdAt: '2026-01-01T00:00:00Z',
    };
    vi.mocked(ordersApi.createOrder).mockResolvedValue(confirmation);

    renderAppWithAuth(
      createMockAuth({
        isAuthenticated: true,
        user: {
          id: 'kc-cust-1',
          firstName: 'Sefaul',
          lastName: 'Islam',
          email: 'sefaul@example.com',
          phoneNumber: '01700000000',
          addresses: [
            {
              id: 77,
              label: 'Home',
              street: '123 Main St',
              city: 'Dhaka',
              state: 'Dhaka',
              zipCode: '1200',
              country: 'BD',
            },
          ],
        },
      }),
    );

    await waitFor(() => expect(ordersApi.getCart).toHaveBeenCalledTimes(1));

    // Add dish -> calls POST /api/orders/cart/items
    fireEvent.click(screen.getByText('Add Herb Burger'));
    await waitFor(() => {
      expect(ordersApi.addCartItem).toHaveBeenCalledWith({
        restaurantId: 10,
        foodItemId: 101,
        quantity: 1,
      });
    });

    // Open cart and increment quantity -> calls PUT /api/orders/cart/items/101
    fireEvent.click(screen.getByText('Open Bag'));
    const incButton = await screen.findByLabelText('Increase quantity of Herb Burger');
    fireEvent.click(incButton);

    await waitFor(() => {
      expect(ordersApi.updateCartItem).toHaveBeenCalledWith('101', { quantity: 2 });
    });

    // Proceed to Checkout -> opens CheckoutModal pre-filled with saved address
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Checkout/i }));
    expect(await screen.findByText('Complete Your Order')).toBeDefined();

    // Place Order -> calls POST /api/orders
    fireEvent.click(screen.getByRole('button', { name: /Place Order/i }));

    await waitFor(() => {
      expect(ordersApi.createOrder).toHaveBeenCalledWith({
        deliveryAddressId: 77,
        deliveryAddress: {
          label: 'Home',
          street: '123 Main St',
          city: 'Dhaka',
          state: 'Dhaka',
          postalCode: '1200',
          country: 'BD',
          recipientName: 'Sefaul Islam',
          recipientPhoneNumber: '01700000000',
          deliveryInstructions: undefined,
        },
      });
    });

    expect(await screen.findByText('Order Confirmed')).toBeDefined();
    expect(screen.getByText('Order #QM-ABC12345')).toBeDefined();
    expect(screen.getByTestId('cart-item-count').textContent).toBe('0');
  });

  it('displays conflict error in CartDrawer when adding from a different restaurant', async () => {
    vi.mocked(ordersApi.getCart).mockResolvedValue(sampleServerCart);
    vi.mocked(ordersApi.addCartItem).mockRejectedValue(
      new ApiError({
        message: 'Cart already contains items from restaurant 10. Clear your cart before adding items from restaurant 20',
        status: 409,
        code: 'CONFLICT',
      }),
    );

    renderAppWithAuth(
      createMockAuth({
        isAuthenticated: true,
        user: {
          id: 'kc-cust-1',
          firstName: 'Sefaul',
          lastName: 'Islam',
          email: 'sefaul@example.com',
        },
      }),
    );

    await waitFor(() => expect(screen.getByTestId('cart-item-count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('Add Miso Ramen'));

    const alertBanner = await screen.findByRole('alert');
    expect(alertBanner.textContent).toMatch(/Cart already contains items from restaurant 10/i);
  });
});
