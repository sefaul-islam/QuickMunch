export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
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

export type SortOption = 'default' | 'open' | 'name';
