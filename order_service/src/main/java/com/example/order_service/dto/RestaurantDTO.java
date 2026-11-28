package com.example.order_service.dto;

public record RestaurantDTO(
        Long id,
        String name,
        Boolean isActive,
        Boolean isOpen
) {}
