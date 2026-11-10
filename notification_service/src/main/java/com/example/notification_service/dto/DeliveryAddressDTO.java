package com.example.notification_service.dto;

public record DeliveryAddressDTO(
    String label,
    String street,
    String city,
    String state,
    String postalCode,
    String country,
    String recipientName,
    String recipientPhoneNumber,
    String deliveryInstructions
) {
}
