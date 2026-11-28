package com.example.order_service.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long foodItemId,
        String name,
        String imageUrl,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal,
        Boolean isAvailable
) {}
