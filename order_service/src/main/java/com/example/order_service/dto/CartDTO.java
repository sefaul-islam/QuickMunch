package com.example.order_service.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CartDTO(
        Long id,
        String userId,
        Long restaurantId,
        List<CartItemResponse> items,
        Integer totalItems,
        BigDecimal subtotal,
        LocalDateTime updatedAt
) {
    public static CartDTO empty(String userId) {
        return new CartDTO(null, userId, null, List.of(), 0, BigDecimal.ZERO, null);
    }
}
