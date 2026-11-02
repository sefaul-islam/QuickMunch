package com.example.order_service.dto;

public record UserResponseDTO(
        Long id,
        String keycloakId,
        String email
) {}
