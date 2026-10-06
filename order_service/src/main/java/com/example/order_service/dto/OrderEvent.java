package com.example.order_service.dto;

import com.example.order_service.enums.OrderStatus;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderEvent(
        String orderNumber,
        Long userId,
        Long restaurantId,
        String email,
        OrderStatus status,
        BigDecimal totalAmount,
        String deliveryAddress,
        String eventType,
        LocalDateTime timestamp
) implements Serializable {}
