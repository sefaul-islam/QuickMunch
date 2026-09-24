package com.example.order_service.exception;

public class RestaurantNotFoundException extends RuntimeException{

    public RestaurantNotFoundException(Long id){
        super("Restaurant not found with id: " + id);
    }
}
