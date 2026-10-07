package com.example.user_service.dto;

public record PublicUserProfileDTO(
        Long id,
        String firstName,
        String profilePictureUrl
) {}
