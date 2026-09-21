package com.example.user_service.dto;

public record AddressResponseDTO(
        Long id,
        String label,
        String street,
        String city,
        String state,
        String zipCode,
        String country
) {
}

