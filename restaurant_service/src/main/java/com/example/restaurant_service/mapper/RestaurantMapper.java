package com.example.restaurant_service.mapper;

import com.example.restaurant_service.dto.request.CreateRestaurantRequest;
import com.example.restaurant_service.dto.response.RestaurantResponse;
import com.example.restaurant_service.entity.Restaurant;

public final class RestaurantMapper {

    private RestaurantMapper() {
    }

    public static Restaurant toEntity(CreateRestaurantRequest request) {
        return Restaurant.builder()
                .ownerId(request.ownerId())
                .name(request.name())
                .description(request.description())
                .phoneNumber(request.phoneNumber())
                .address(request.address())
                .imageUrl(request.imageUrl())
                .build();
    }

    public static RestaurantResponse toResponse(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getOwnerId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getPhoneNumber(),
                restaurant.getAddress(),
                restaurant.getImageUrl(),
                restaurant.getIsActive(),
                restaurant.getIsOpen(),
                restaurant.getCreatedAt(),
                restaurant.getUpdatedAt()
        );
    }
}

