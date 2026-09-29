package com.example.order_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderDTO(
        @NotNull(message = "Restaurant ID is required")
        Long restaurantId,

        @NotBlank(message = "Delivery address is required")
        String deliveryAddress,

        @NotEmpty(message = "Order must contain at least one item")
        @Valid
        List<OrderItemDTO> items
) {}
