package com.example.restaurant_service.exception;

public class RestaurantHasDependentsException extends RuntimeException {

    public RestaurantHasDependentsException(Long restaurantId) {
        super("Restaurant with id " + restaurantId
                + " cannot be deleted because it has categories or food items");
    }
}

