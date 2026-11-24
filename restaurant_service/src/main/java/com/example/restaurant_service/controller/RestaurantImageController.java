package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.UploadUrlRequest;
import com.example.restaurant_service.dto.response.UploadUrlResponse;
import com.example.restaurant_service.security.KeycloakSecurityUtil;
import com.example.restaurant_service.service.RestaurantService;
import com.example.restaurant_service.service.S3Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/restaurants")
public class RestaurantImageController {

    private final RestaurantService restaurantService;



    @PostMapping("/{restaurantId}/images/upload-url")
    @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public UploadUrlResponse generateUploadUrl(
            @Valid @RequestBody UploadUrlRequest request,
            @PathVariable Long restaurantId,
            Authentication authentication) {

        String userId = KeycloakSecurityUtil.getKeycloakId(authentication);
        return restaurantService.generateUploadUrl(request,restaurantId, userId);

    }

}
