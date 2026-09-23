package com.example.restaurant_service.mapper;

import com.example.restaurant_service.dto.request.CreateCategoryRequest;
import com.example.restaurant_service.dto.response.CategoryResponse;
import com.example.restaurant_service.entity.Category;
import com.example.restaurant_service.entity.Restaurant;

public final class CategoryMapper {

    private CategoryMapper() {
    }

    public static Category toEntity(CreateCategoryRequest request,
                                     Restaurant restaurant) {
        return Category.builder()
                .restaurant(restaurant)
                .name(request.name())
                .description(request.description())
                .build();
    }

    public static CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getRestaurant().getId(),
                category.getName(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}

