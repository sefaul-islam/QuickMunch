package com.example.restaurant_service.service;

import com.example.restaurant_service.dto.request.CreateFoodItemRequest;
import com.example.restaurant_service.dto.request.UpdateFoodItemRequest;
import com.example.restaurant_service.dto.response.FoodItemResponse;
import com.example.restaurant_service.entity.Category;
import com.example.restaurant_service.entity.FoodItem;
import com.example.restaurant_service.entity.Restaurant;
import com.example.restaurant_service.exception.FoodItemNotFoundException;
import com.example.restaurant_service.mapper.FoodItemMapper;
import com.example.restaurant_service.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final RestaurantService restaurantService;
    private final CategoryService categoryService;

    public FoodItemService(FoodItemRepository foodItemRepository,
                            RestaurantService restaurantService,
                            CategoryService categoryService) {
        this.foodItemRepository = foodItemRepository;
        this.restaurantService = restaurantService;
        this.categoryService = categoryService;
    }

    @Transactional
    public FoodItemResponse createFoodItem(Long restaurantId,
                                            CreateFoodItemRequest request,
                                            Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        Category category = resolveCategory(request.categoryId(), restaurantId);

        FoodItem foodItem = FoodItemMapper.toEntity(request, restaurant, category);
        FoodItem saved = foodItemRepository.save(foodItem);
        return FoodItemMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FoodItemResponse> getFoodItems(Long restaurantId) {
        restaurantService.findRestaurantOrThrow(restaurantId);

        return foodItemRepository.findByRestaurantId(restaurantId).stream()
                .map(FoodItemMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FoodItemResponse getFoodItem(Long restaurantId, Long foodId) {
        restaurantService.findRestaurantOrThrow(restaurantId);

        FoodItem foodItem = findFoodItemOrThrow(foodId, restaurantId);
        return FoodItemMapper.toResponse(foodItem);
    }

    @Transactional
    public FoodItemResponse updateFoodItem(Long restaurantId, Long foodId,
                                            UpdateFoodItemRequest request,
                                            Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        FoodItem foodItem = findFoodItemOrThrow(foodId, restaurantId);

        Category category = resolveCategory(request.categoryId(), restaurantId);

        foodItem.setCategory(category);
        foodItem.setName(request.name());
        foodItem.setDescription(request.description());
        foodItem.setPrice(request.price());
        foodItem.setImageUrl(request.imageUrl());

        FoodItem saved = foodItemRepository.save(foodItem);
        return FoodItemMapper.toResponse(saved);
    }

    @Transactional
    public void deleteFoodItem(Long restaurantId, Long foodId,
                                Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        FoodItem foodItem = findFoodItemOrThrow(foodId, restaurantId);
        foodItemRepository.delete(foodItem);
    }

    @Transactional
    public FoodItemResponse updateAvailability(Long restaurantId, Long foodId,
                                                Boolean isAvailable,
                                                Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        FoodItem foodItem = findFoodItemOrThrow(foodId, restaurantId);
        foodItem.setIsAvailable(isAvailable);

        FoodItem saved = foodItemRepository.save(foodItem);
        return FoodItemMapper.toResponse(saved);
    }

    private FoodItem findFoodItemOrThrow(Long foodId, Long restaurantId) {
        return foodItemRepository.findByIdAndRestaurantId(foodId, restaurantId)
                .orElseThrow(() -> new FoodItemNotFoundException(foodId));
    }

    private Category resolveCategory(Long categoryId, Long restaurantId) {
        if (categoryId == null) {
            return null;
        }
        return categoryService.findCategoryByIdAndRestaurant(categoryId, restaurantId);
    }
}
