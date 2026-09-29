package com.example.order_service.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long foodItemId,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}
