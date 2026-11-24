package com.example.restaurant_service.dto.response;

import java.io.Serializable;
import java.time.LocalDateTime;

public record RestaurantResponse(
        Long id,
        String ownerId,
        String name,
        String description,
        String phoneNumber,
        String address,
        String imageUrl,
        Boolean isActive,
        Boolean isOpen,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) implements Serializable {
}

