package com.example.order_service.exception;

public class CartRestaurantMismatchException extends RuntimeException {
    public CartRestaurantMismatchException(Long currentRestaurantId, Long requestedRestaurantId) {
        super("Cart already contains items from restaurant " + currentRestaurantId
                + ". Clear your cart before adding items from restaurant " + requestedRestaurantId);
    }
}
