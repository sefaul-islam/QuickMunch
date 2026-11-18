export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  dietary?: string[];
  isSignature?: boolean;
}

export interface PopularDishItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;
  reviewCount: number;
  dietary?: string[];
  badge?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  prepTime: string;
  deliveryFee: number;
  minOrder: number;
  priceRange: '$$' | '$$$' | '$$$$';
  image: string;
  neighborhood: string;
  distance: string;
  featuredDish: string;
  dietaryTags: string[];
  dishes: Dish[];
  badge?: string;
  freeDeliveryThreshold?: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  count: number;
  image: string;
}

export interface CartItem {
  dish: Dish;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  neighborhood: string;
  isDefault?: boolean;
}

export type SortOption = 'curated' | 'rating' | 'prepTime' | 'price';
