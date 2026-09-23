package com.example.restaurant_service.service;

import com.example.restaurant_service.client.UserServiceClient;
import com.example.restaurant_service.dto.request.CreateRestaurantRequest;
import com.example.restaurant_service.dto.request.UpdateRestaurantRequest;
import com.example.restaurant_service.dto.response.RestaurantResponse;
import com.example.restaurant_service.entity.Restaurant;
import com.example.restaurant_service.exception.RestaurantHasDependentsException;
import com.example.restaurant_service.exception.RestaurantNotFoundException;
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
    private final UserServiceClient userServiceClient;

    public RestaurantService(RestaurantRepository restaurantRepository,
                              FoodItemRepository foodItemRepository,
                              CategoryRepository categoryRepository,
                              UserServiceClient userServiceClient) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.userServiceClient = userServiceClient;
    }

    // TASK 9 — Create Restaurant
    @Transactional
    public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
        userServiceClient.verifyUserExists(request.ownerId());

        Restaurant restaurant = RestaurantMapper.toEntity(request);
        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    // TASK 10 — Get Restaurant
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurant(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        return RestaurantMapper.toResponse(restaurant);
    }

    // TASK 11 — Get All Restaurants
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll().stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    // TASK 12 — Get Restaurants By Owner
    @Transactional(readOnly = true)
    public List<RestaurantResponse> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId).stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    // TASK 13 — Update Restaurant
    @Transactional
    public RestaurantResponse updateRestaurant(Long id,
                                                UpdateRestaurantRequest request) {
        Restaurant restaurant = findRestaurantOrThrow(id);

        restaurant.setName(request.name());
        restaurant.setDescription(request.description());
        restaurant.setPhoneNumber(request.phoneNumber());
        restaurant.setAddress(request.address());
        restaurant.setImageUrl(request.imageUrl());

        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    // TASK 14 — Delete Restaurant
    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = findRestaurantOrThrow(id);

        boolean hasFoodItems = !foodItemRepository.findByRestaurantId(id).isEmpty();
        boolean hasCategories = !categoryRepository.findByRestaurantId(id).isEmpty();

        if (hasFoodItems || hasCategories) {
            throw new RestaurantHasDependentsException(id);
        }

        restaurantRepository.delete(restaurant);
    }

    // TASK 15 — Restaurant Open/Close Status
    @Transactional
    public RestaurantResponse updateStatus(Long id, Boolean isOpen) {
        Restaurant restaurant = findRestaurantOrThrow(id);
        restaurant.setIsOpen(isOpen);
        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantMapper.toResponse(saved);
    }

    // Shared helper — used by Category/FoodItem services too
    public Restaurant findRestaurantOrThrow(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RestaurantNotFoundException(id));
    }
}

