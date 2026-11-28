package com.example.order_service.exception;

public class FoodItemUnavailableException extends RuntimeException {
    public FoodItemUnavailableException(Long foodItemId, String name) {
        super("Food item '" + name + "' (id: " + foodItemId + ") is currently unavailable");
    }
}
