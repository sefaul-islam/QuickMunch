package com.example.restaurant_service.mapper;

import com.example.restaurant_service.dto.request.CreateFoodItemRequest;
import com.example.restaurant_service.dto.response.FoodItemResponse;
import com.example.restaurant_service.entity.Category;
import com.example.restaurant_service.entity.FoodItem;
import com.example.restaurant_service.entity.Restaurant;

public final class FoodItemMapper {

    private FoodItemMapper() {
    }

    public static FoodItem toEntity(CreateFoodItemRequest request,
                                     Restaurant restaurant,
                                     Category category) {
        return FoodItem.builder()
                .restaurant(restaurant)
                .category(category)
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .imageUrl(request.imageUrl())
                .build();
    }

    public static FoodItemResponse toResponse(FoodItem foodItem) {
        return new FoodItemResponse(
                foodItem.getId(),
                foodItem.getRestaurant().getId(),
                foodItem.getCategory() != null ? foodItem.getCategory().getId() : null,
                foodItem.getName(),
                foodItem.getDescription(),
                foodItem.getPrice(),
                foodItem.getImageUrl(),
                foodItem.getIsAvailable(),
                foodItem.getCreatedAt(),
                foodItem.getUpdatedAt()
        );
    }
}

