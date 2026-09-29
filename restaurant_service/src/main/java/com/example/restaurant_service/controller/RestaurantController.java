package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.CreateRestaurantRequest;
import com.example.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.example.restaurant_service.dto.response.RestaurantResponse;
import com.example.restaurant_service.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    public ResponseEntity<RestaurantResponse> createRestaurant(
            @Valid @RequestBody CreateRestaurantRequest request,
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        RestaurantResponse response = restaurantService.createRestaurant(
                request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<RestaurantResponse> getRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(restaurantService.getRestaurant(restaurantId));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByOwner(
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(ownerId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants(
            Authentication authentication) {
        Long ownerId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(ownerId));
    }

    @PutMapping("/{restaurantId}")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Long restaurantId,
            @Valid @RequestBody UpdateRestaurantRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(
                restaurantService.updateRestaurant(restaurantId, request, userId));
    }

    @DeleteMapping("/{restaurantId}")
    public ResponseEntity<Void> deleteRestaurant(
            @PathVariable Long restaurantId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        restaurantService.deleteRestaurant(restaurantId, userId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{restaurantId}/status")
    public ResponseEntity<RestaurantResponse> updateStatus(
            @PathVariable Long restaurantId,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Boolean isOpen = request.get("isOpen");
        if (isOpen == null) {
            throw new IllegalArgumentException("'isOpen' field is required");
        }
        return ResponseEntity.ok(
                restaurantService.updateStatus(restaurantId, isOpen, userId));
    }
}
