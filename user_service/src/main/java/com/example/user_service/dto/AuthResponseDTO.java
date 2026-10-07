package com.example.user_service.dto;

import java.util.Set;

public record AuthResponseDTO(
        String token,
        Long userId,
        String email,
        Set<String> roles,
        String refreshToken
) {
}
