package com.example.restaurant_service.exception;

public class DuplicateCategoryException extends RuntimeException {

    public DuplicateCategoryException(String categoryName, Long restaurantId) {
        super("Category '" + categoryName + "' already exists for restaurant with id: " + restaurantId);
    }
}

