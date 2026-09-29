package com.example.order_service.dto;

import java.math.BigDecimal;

public record FoodItemDTO(
        Long id,
        Long restaurantId,
        Long categoryId,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        Boolean isAvailable
) {}
