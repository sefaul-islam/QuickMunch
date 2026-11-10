package com.example.order_service.dto;

public record DeliveryAddressDTO(
    String label,
    String street,
    String city,
    String state,
    String zipCode,
    String country,
    String recipientName,
    String recipientPhoneNumber,
    String deliveryInstructions
) {
}
