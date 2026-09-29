package com.example.notification_service.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderEvent(
        String orderNumber,
        Long userId,
        Long restaurantId,
        String status,
        BigDecimal totalAmount,
        String deliveryAddress,
        String eventType,
        LocalDateTime timestamp
) implements Serializable {}
