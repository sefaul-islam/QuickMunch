package com.example.restaurant_service.dto.response;

import java.io.Serializable;

public record UploadUrlResponse(
        String uploadUrl,
        String objectKey
) implements Serializable {
}
