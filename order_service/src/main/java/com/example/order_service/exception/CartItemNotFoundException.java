package com.example.order_service.exception;

public class CartItemNotFoundException extends RuntimeException {
    public CartItemNotFoundException(Long foodItemId) {
        super("Cart item not found for food item id: " + foodItemId);
    }
}
