package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.CreateFoodItemRequest;
import com.example.restaurant_service.dto.request.UpdateFoodItemRequest;
import com.example.restaurant_service.dto.response.FoodItemResponse;
import com.example.restaurant_service.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/foods")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @PostMapping
    public ResponseEntity<FoodItemResponse> createFoodItem(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateFoodItemRequest request) {
        FoodItemResponse response = foodItemService.createFoodItem(
                restaurantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getFoodItems(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(foodItemService.getFoodItems(restaurantId));
    }

    @GetMapping("/{foodId}")
    public ResponseEntity<FoodItemResponse> getFoodItem(
            @PathVariable Long restaurantId,
            @PathVariable Long foodId) {
        return ResponseEntity.ok(
                foodItemService.getFoodItem(restaurantId, foodId));
    }

    @PutMapping("/{foodId}")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Long restaurantId,
            @PathVariable Long foodId,
            @Valid @RequestBody UpdateFoodItemRequest request) {
        return ResponseEntity.ok(
                foodItemService.updateFoodItem(restaurantId, foodId, request));
    }

    @DeleteMapping("/{foodId}")
    public ResponseEntity<Void> deleteFoodItem(
            @PathVariable Long restaurantId,
            @PathVariable Long foodId) {
        foodItemService.deleteFoodItem(restaurantId, foodId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{foodId}/availability")
    public ResponseEntity<FoodItemResponse> updateAvailability(
            @PathVariable Long restaurantId,
            @PathVariable Long foodId,
            @RequestBody Map<String, Boolean> request) {
        Boolean isAvailable = request.get("isAvailable");
        if (isAvailable == null) {
            throw new IllegalArgumentException("'isAvailable' field is required");
        }
        return ResponseEntity.ok(
                foodItemService.updateAvailability(restaurantId, foodId, isAvailable));
    }
}

