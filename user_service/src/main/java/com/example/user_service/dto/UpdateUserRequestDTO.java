package com.example.user_service.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequestDTO(

        @Size(max = 50, message = "First name must not exceed 50 characters")
        String firstName,

        @Size(max = 50, message = "Last name must not exceed 50 characters")
        String lastName,

        @Size(max = 15, message = "Phone number must not exceed 15 characters")
        String phoneNumber
) {
}
