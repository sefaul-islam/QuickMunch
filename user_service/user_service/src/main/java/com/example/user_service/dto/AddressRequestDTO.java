package com.example.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddressRequestDTO(

        @Size(max = 30, message = "Label must not exceed 30 characters")
        String label,

        @NotBlank(message = "Street is required")
        String street,

        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 100, message = "State must not exceed 100 characters")
        String state,

        @Size(max = 20, message = "Zip code must not exceed 20 characters")
        String zipCode,

        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country
) {
}

