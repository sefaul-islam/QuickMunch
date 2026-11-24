package com.example.restaurant_service.dto.request;

public record UploadUrlRequest(
        String fileName,
        String contentType
) {
}
