package com.example.restaurant_service.dto.response;

import java.io.Serializable;
import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        Long restaurantId,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) implements Serializable {
}

