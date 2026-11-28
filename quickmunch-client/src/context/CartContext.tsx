/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  useRef,
} from 'react';
import type { CartItem, Dish, DeliveryAddress } from '../types';
import type { CartResponse, OrderConfirmationResponse } from '../api/types/order';
import { AuthContext } from '../auth/AuthContext';
import { ordersApi } from '../api/orders';
import { restaurantsApi } from '../api/restaurants';
import { ApiError } from '../api/apiError';

export interface CartRestaurantRef {
  id: string | number;
  name: string;
}

export interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (dish: Dish, restaurant: CartRestaurantRef) => void;
  updateQuantity: (dishId: string, delta: number) => void;
  removeItem: (dishId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoginPromptOpen: boolean;
  setIsLoginPromptOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isCartLoading: boolean;
  isCartSyncing: boolean;
  cartError: string | null;
  clearCartError: () => void;
  markOrderCompleted: (order: OrderConfirmationResponse) => void;
  recentOrders: OrderConfirmationResponse[];
  totalCartCount: number;
  cartSubtotal: number;
  currentAddress: DeliveryAddress | null;
  setCurrentAddress: (address: DeliveryAddress | null) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  favoriteRestaurantIds: string[];
  toggleFavorite: (restaurantId: string | number, restaurantName?: string) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CART_STORAGE_KEY = 'quickmunch_cart';
const FAVORITES_STORAGE_KEY = 'quickmunch_favorites';
const ADDRESS_STORAGE_KEY = 'quickmunch_address';

export const CartContext = createContext<CartContextValue | undefined>(undefined);

function readGuestCartFromStorage(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

function clearGuestCartStorage(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read AuthContext safely so tests mounting CartProvider standalone continue to work as guest mode
  const auth = useContext(AuthContext);
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const authUserKey = auth?.user?.id ? String(auth.user.id) : null;

  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress | null>(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage read errors
    }
    return null;
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => readGuestCartFromStorage());
  const cartItemsRef = useRef<CartItem[]>(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderConfirmationResponse[]>([]);

  const restaurantNamesRef = useRef<Record<string, string>>({});
  const wasAuthenticatedRef = useRef<boolean>(false);

  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage read errors
    }
    return [];
  });

  // Sync guest cart to localStorage ONLY when unauthenticated
  useEffect(() => {
    if (isAuthenticated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteRestaurantIds));
    } catch {
      // Ignore
    }
  }, [favoriteRestaurantIds]);

  useEffect(() => {
    try {
      if (currentAddress) {
        localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(currentAddress));
      } else {
        localStorage.removeItem(ADDRESS_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [currentAddress]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const clearCartError = useCallback(() => {
    setCartError(null);
  }, []);

  const applyServerCart = useCallback(async (serverCart: CartResponse) => {
    if (!serverCart.items || serverCart.items.length === 0) {
      setCartItems([]);
      return;
    }

    const restIdStr = serverCart.restaurantId != null ? String(serverCart.restaurantId) : '';
    let restName = restIdStr ? restaurantNamesRef.current[restIdStr] : undefined;

    if (!restName && serverCart.restaurantId != null) {
      try {
        const restaurant = await restaurantsApi.getRestaurant(serverCart.restaurantId);
        restName = restaurant.name;
        restaurantNamesRef.current[restIdStr] = restaurant.name;
      } catch {
        restName = 'Artisan Kitchen';
      }
    }

    const mapped: CartItem[] = serverCart.items.map((item) => ({
      dish: {
        id: String(item.foodItemId),
        name: item.name,
        description: '',
        price: Number(item.unitPrice),
        image: item.imageUrl || '',
      },
      restaurantId: restIdStr,
      restaurantName: restName || 'Artisan Kitchen',
      quantity: item.quantity,
    }));

    setCartItems(mapped);
  }, []);

  // Load persisted cart on authentication and sync any guest items created before login
  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      if (wasAuthenticatedRef.current) {
        wasAuthenticatedRef.current = false;
        setCartItems(readGuestCartFromStorage());
        setRecentOrders([]);
        setCartError(null);
      }
      return;
    }

    wasAuthenticatedRef.current = true;

    const loadAndSyncCart = async () => {
      setIsCartLoading(true);
      setCartError(null);
      try {
        let serverCart = await ordersApi.getCart();
        const guestItems = readGuestCartFromStorage();

        if ((!serverCart.items || serverCart.items.length === 0) && guestItems.length > 0) {
          const targetRestaurantId = guestItems[0].restaurantId;
          const sameRestaurantItems = guestItems.filter(
            (item) => item.restaurantId === targetRestaurantId,
          );

          for (const item of sameRestaurantItems) {
            restaurantNamesRef.current[item.restaurantId] = item.restaurantName;
            const restaurantNum = Number(item.restaurantId);
            const foodNum = Number(item.dish.id);
            if (!Number.isFinite(restaurantNum) || !Number.isFinite(foodNum)) continue;

            serverCart = await ordersApi.addCartItem({
              restaurantId: restaurantNum,
              foodItemId: foodNum,
              quantity: item.quantity,
            });
          }
          clearGuestCartStorage();
        } else if (serverCart.items && serverCart.items.length > 0) {
          clearGuestCartStorage();
        }

        if (!cancelled) {
          await applyServerCart(serverCart);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof ApiError ? err.message : 'Unable to load your saved bag';
          setCartError(message);
        }
      } finally {
        if (!cancelled) {
          setIsCartLoading(false);
        }
      }
    };

    void loadAndSyncCart();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authUserKey, applyServerCart]);

  const toggleFavorite = useCallback(
    (restaurantId: string | number, restaurantName?: string) => {
      const idStr = String(restaurantId);
      const name = restaurantName || 'Kitchen';
      setFavoriteRestaurantIds((prev) => {
        if (prev.includes(idStr)) {
          showToast(`Removed ${name} from saved kitchens`);
          return prev.filter((id) => id !== idStr);
        }
        showToast(`Saved ${name} to favorites`);
        return [...prev, idStr];
      });
    },
    [showToast],
  );

  const addToCart = useCallback(
    (dish: Dish, restaurant: CartRestaurantRef) => {
      const restId = String(restaurant.id);
      const restName = restaurant.name;
      restaurantNamesRef.current[restId] = restName;

      if (!isAuthenticated) {
        const currentItems = cartItemsRef.current;
        if (currentItems.length > 0 && currentItems[0].restaurantId !== restId) {
          const message = `Your bag has items from ${currentItems[0].restaurantName}. Clear your bag before adding items from ${restName}.`;
          setCartError(message);
          showToast(message);
          setIsCartOpen(true);
          return;
        }
        setCartError(null);
        setCartItems((prev) => {
          const existing = prev.find((item) => item.dish.id === dish.id);
          if (existing) {
            return prev.map((item) =>
              item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item,
            );
          }
          return [
            ...prev,
            {
              dish,
              restaurantId: restId,
              restaurantName: restName,
              quantity: 1,
            },
          ];
        });
        showToast(`Added ${dish.name} to order bag`);
        return;
      }

      setCartError(null);
      setIsCartSyncing(true);
      void ordersApi
        .addCartItem({
          restaurantId: Number(restaurant.id),
          foodItemId: Number(dish.id),
          quantity: 1,
        })
        .then(async (serverCart) => {
          await applyServerCart(serverCart);
          showToast(`Added ${dish.name} to order bag`);
        })
        .catch((err) => {
          const message =
            err instanceof ApiError
              ? err.message
              : 'Unable to add dish to your persisted cart';
          setCartError(message);
          showToast(message);
          if (err instanceof ApiError && err.status === 409) {
            setIsCartOpen(true);
          }
        })
        .finally(() => {
          setIsCartSyncing(false);
        });
    },
    [isAuthenticated, applyServerCart, showToast],
  );

  const updateQuantity = useCallback(
    (dishId: string, delta: number) => {
      if (!isAuthenticated) {
        setCartItems((prev) =>
          prev
            .map((item) => {
              if (item.dish.id === dishId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        );
        return;
      }

      const existing = cartItemsRef.current.find((item) => item.dish.id === dishId);
      if (!existing) return;

      const newQty = existing.quantity + delta;
      setCartError(null);
      setIsCartSyncing(true);

      const request =
        newQty <= 0
          ? ordersApi.removeCartItem(dishId)
          : ordersApi.updateCartItem(dishId, { quantity: newQty });

      void request
        .then((serverCart) => applyServerCart(serverCart))
        .catch((err) => {
          const message = err instanceof ApiError ? err.message : 'Unable to update item quantity';
          setCartError(message);
          showToast(message);
        })
        .finally(() => {
          setIsCartSyncing(false);
        });
    },
    [isAuthenticated, applyServerCart, showToast],
  );

  const removeItem = useCallback(
    (dishId: string) => {
      if (!isAuthenticated) {
        setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
        return;
      }

      setCartError(null);
      setIsCartSyncing(true);
      void ordersApi
        .removeCartItem(dishId)
        .then((serverCart) => applyServerCart(serverCart))
        .catch((err) => {
          const message = err instanceof ApiError ? err.message : 'Unable to remove item';
          setCartError(message);
          showToast(message);
        })
        .finally(() => {
          setIsCartSyncing(false);
        });
    },
    [isAuthenticated, applyServerCart, showToast],
  );

  const clearCart = useCallback(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      clearGuestCartStorage();
      return;
    }

    setCartError(null);
    setIsCartSyncing(true);
    void ordersApi
      .clearCart()
      .then(() => {
        setCartItems([]);
        clearGuestCartStorage();
      })
      .catch((err) => {
        const message = err instanceof ApiError ? err.message : 'Unable to clear cart';
        setCartError(message);
        showToast(message);
      })
      .finally(() => {
        setIsCartSyncing(false);
      });
  }, [isAuthenticated, showToast]);

  const markOrderCompleted = useCallback(
    (order: OrderConfirmationResponse) => {
      setCartItems([]);
      clearGuestCartStorage();
      setCartError(null);
      setRecentOrders((prev) => [order, ...prev]);
      showToast(`Order ${order.orderNumber} placed!`);
    },
    [showToast],
  );

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      isLoginPromptOpen,
      setIsLoginPromptOpen,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isCartLoading,
      isCartSyncing,
      cartError,
      clearCartError,
      markOrderCompleted,
      recentOrders,
      totalCartCount,
      cartSubtotal,
      currentAddress,
      setCurrentAddress,
      isLocationModalOpen,
      setIsLocationModalOpen,
      favoriteRestaurantIds,
      toggleFavorite,
      toastMessage,
      showToast,
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      isCartOpen,
      isLoginPromptOpen,
      isCheckoutOpen,
      isCartLoading,
      isCartSyncing,
      cartError,
      clearCartError,
      markOrderCompleted,
      recentOrders,
      totalCartCount,
      cartSubtotal,
      currentAddress,
      isLocationModalOpen,
      favoriteRestaurantIds,
      toggleFavorite,
      toastMessage,
      showToast,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
