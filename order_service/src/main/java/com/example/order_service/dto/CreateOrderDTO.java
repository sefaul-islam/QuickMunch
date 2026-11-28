package com.example.order_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CreateOrderDTO(
        @NotNull(message = "Delivery address is required")
        @Valid
        DeliveryAddressDTO deliveryAddress,

        Long deliveryAddressId
) {}
