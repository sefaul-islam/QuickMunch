package com.example.user_service.dto;

public record UserResponseDTO(
        Long id,
        String keycloakId,
        String email
) {
}
