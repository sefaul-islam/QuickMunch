package com.example.order_service.dto;

import com.example.order_service.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record OrderStatusUpdateDTO(
        @NotNull(message = "Status is required")
        OrderStatus status
) {}
