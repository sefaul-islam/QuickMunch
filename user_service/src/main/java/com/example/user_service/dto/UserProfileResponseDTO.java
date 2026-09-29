package com.example.user_service.dto;

import java.util.List;
import java.util.Set;

public record UserProfileResponseDTO(
        Long id,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        List<AddressResponseDTO> addresses,
        String profilePictureUrl,
        Set<String> roles
) { }
