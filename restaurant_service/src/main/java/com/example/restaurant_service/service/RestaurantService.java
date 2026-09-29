package com.example.restaurant_service.service;

import com.example.restaurant_service.dto.request.CreateRestaurantRequest;
import com.example.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.example.restaurant_service.dto.response.RestaurantResponse;
import com.example.restaurant_service.entity.Restaurant;
import com.example.restaurant_service.exception.RestaurantHasDependentsException;
import com.example.restaurant_service.exception.RestaurantNotFoundException;
import com.example.restaurant_service.exception.RestaurantOwnershipException;
import com.example.restaurant_service.mapper.RestaurantMapper;
import com.example.restaurant_service.repository.CategoryRepository;
import com.example.restaurant_service.repository.FoodItemRepository;
import com.example.restaurant_service.repository.RestaurantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;

    public RestaurantService(RestaurantRepository restaurantRepository,
                              FoodItemRepository foodItemRepository,
                              CategoryRepository categoryRepository) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request,
                                                Long ownerId) {
        Restaurant restaurant = RestaurantMapper.toEntity(request, ownerId);
        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurant(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        return RestaurantMapper.toResponse(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    @Transactional
    public RestaurantResponse updateRestaurant(Long id,
                                                UpdateRestaurantRequest request,
                                                Long authenticatedUserId) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant, authenticatedUserId);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setPhoneNumber(request.phoneNumber());
        restaurant.setAddress(request.address());
        restaurant.setImageUrl(request.imageUrl());

        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    @Transactional
    public void deleteRestaurant(Long id, Long authenticatedUserId) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant, authenticatedUserId);

        boolean hasFoodItems = !foodItemRepository.findByRestaurantId(id).isEmpty();
        boolean hasCategories = !categoryRepository.findByRestaurantId(id).isEmpty();

        if (hasFoodItems || hasCategories) {
            throw new RestaurantHasDependentsException(id);
        }

        restaurantRepository.delete(restaurant);
    }

    @Transactional
    public RestaurantResponse updateStatus(Long id, Boolean isOpen,
                                            Long authenticatedUserId) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        verifyOwnership(restaurant, authenticatedUserId);

        restaurant.setIsOpen(isOpen);
        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    public Restaurant findRestaurantOrThrow(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));
    }

    public void verifyOwnership(Restaurant restaurant, Long authenticatedUserId) {
        if (!restaurant.getOwnerId().equals(authenticatedUserId)) {
            throw new RestaurantOwnershipException(restaurant.getId());
        }
    }
}
