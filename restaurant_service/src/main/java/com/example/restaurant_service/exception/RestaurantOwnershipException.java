package com.example.restaurant_service.exception;

public class RestaurantOwnershipException extends RuntimeException {

    public RestaurantOwnershipException(Long restaurantId) {
        super("You do not own restaurant with id: " + restaurantId);
    }
}
