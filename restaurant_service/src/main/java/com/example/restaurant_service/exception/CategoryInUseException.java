package com.example.restaurant_service.exception;

public class CategoryInUseException extends RuntimeException {

    public CategoryInUseException(Long categoryId) {
        super("Category with id " + categoryId + " cannot be deleted because it is referenced by food items");
    }
}

