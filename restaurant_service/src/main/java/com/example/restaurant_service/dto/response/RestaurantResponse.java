package com.example.restaurant_service.dto.response;

import java.time.LocalDateTime;

public record RestaurantResponse(
        Long id,
        Long ownerId,
        String name,
        String description,
        String phoneNumber,
        String address,
        String imageUrl,
        Boolean isActive,
        Boolean isOpen,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

