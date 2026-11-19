/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import type { CartItem, Dish, Restaurant, DeliveryAddress } from '../types';
import { RESTAURANTS, DELIVERY_ADDRESSES } from '../data/mockData';

export interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (dish: Dish, restaurant?: Restaurant | { id: string; name: string }) => void;
  updateQuantity: (dishId: string, delta: number) => void;
  removeItem: (dishId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCartCount: number;
  cartSubtotal: number;
  currentAddress: DeliveryAddress;
  setCurrentAddress: (address: DeliveryAddress) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  favoriteRestaurantIds: string[];
  toggleFavorite: (restaurantId: string) => void;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CART_STORAGE_KEY = 'quickmunch_cart';
const FAVORITES_STORAGE_KEY = 'quickmunch_favorites';
const ADDRESS_STORAGE_KEY = 'quickmunch_address';

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Address & Location state
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress>(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DELIVERY_ADDRESSES[0];
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        dish: RESTAURANTS[0].dishes[0],
        restaurantId: RESTAURANTS[0].id,
        restaurantName: RESTAURANTS[0].name,
        quantity: 1,
      },
    ];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Favorites state
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return ['sylvan-hearth'];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteRestaurantIds));
    } catch {
      // Ignore
    }
  }, [favoriteRestaurantIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(currentAddress));
    } catch {
      // Ignore
    }
  }, [currentAddress]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const toggleFavorite = useCallback((restaurantId: string) => {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    const name = restaurant?.name || 'Kitchen';
    setFavoriteRestaurantIds((prev) => {
      if (prev.includes(restaurantId)) {
        showToast(`Removed ${name} from saved kitchens`);
        return prev.filter((id) => id !== restaurantId);
      } else {
        showToast(`Saved ${name} to favorites`);
        return [...prev, restaurantId];
      }
    });
  }, [showToast]);

  const addToCart = useCallback((dish: Dish, restaurant?: Restaurant | { id: string; name: string }) => {
    const restId = restaurant?.id || RESTAURANTS[0].id;
    const restName = restaurant?.name || RESTAURANTS[0].name;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
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
  }, [showToast]);

  const updateQuantity = useCallback((dishId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  const removeItem = useCallback((dishId: string) => {
    setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.dish.price * item.quantity, 0),
    [cartItems]
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
      totalCartCount,
      cartSubtotal,
      currentAddress,
      isLocationModalOpen,
      favoriteRestaurantIds,
      toggleFavorite,
      toastMessage,
      showToast,
    ]
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
