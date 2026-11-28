export interface CartItemResponse {
  id: number;
  foodItemId: number;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
}

export interface CartResponse {
  id: number | null;
  userId: string;
  restaurantId: number | null;
  items: CartItemResponse[];
  totalItems: number;
  subtotal: number;
  updatedAt: string | null;
}

export interface AddToCartRequest {
  restaurantId: number;
  foodItemId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface DeliveryAddressPayload {
  label?: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  recipientName?: string;
  recipientPhoneNumber: string;
  deliveryInstructions?: string;
}

export interface CreateOrderRequest {
  deliveryAddress: DeliveryAddressPayload;
  deliveryAddressId?: number | null;
}

export interface OrderItemResponse {
  id: number;
  foodItemId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderConfirmationResponse {
  id: number;
  orderNumber: string;
  userId: string;
  restaurantId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddressId: number | null;
  items: OrderItemResponse[];
  createdAt: string;
}
