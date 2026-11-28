package com.example.order_service.dto;

import jakarta.validation.constraints.NotBlank;

public record DeliveryAddressDTO(
        String label,

        @NotBlank(message = "Street is required")
        String street,

        @NotBlank(message = "City is required")
        String city,

        String state,

        @NotBlank(message = "Postal code is required")
        String postalCode,

        String country,
        String recipientName,

        @NotBlank(message = "Recipient phone number is required")
        String recipientPhoneNumber,

        String deliveryInstructions
) {}
