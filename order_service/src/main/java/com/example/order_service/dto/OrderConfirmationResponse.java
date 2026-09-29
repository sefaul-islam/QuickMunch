package com.example.order_service.dto;

import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderConfirmationResponse(
        Long id,
        String orderNumber,
        Long userId,
        Long restaurantId,
        OrderStatus status,
        PaymentStatus paymentStatus,
        BigDecimal subtotal,
        BigDecimal deliveryFee,
        BigDecimal totalAmount,
        String deliveryAddress,
        List<OrderItemResponse> items,
        LocalDateTime createdAt
) {}
