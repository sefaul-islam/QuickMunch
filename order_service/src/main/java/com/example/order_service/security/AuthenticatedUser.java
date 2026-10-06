package com.example.order_service.security;

public record AuthenticatedUser(

        Long userId,
        String email
) {}
