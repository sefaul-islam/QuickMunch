package com.example.restaurant_service.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FoodItemResponse(
        Long id,
        Long restaurantId,
        Long categoryId,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean isAvailable,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

