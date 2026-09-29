package com.example.restaurant_service.service;

import com.example.restaurant_service.dto.request.CreateCategoryRequest;
import com.example.restaurant_service.dto.request.UpdateCategoryRequest;
import com.example.restaurant_service.dto.response.CategoryResponse;
import com.example.restaurant_service.entity.Category;
import com.example.restaurant_service.entity.Restaurant;
import com.example.restaurant_service.exception.CategoryInUseException;
import com.example.restaurant_service.exception.CategoryNotFoundException;
import com.example.restaurant_service.exception.DuplicateCategoryException;
import com.example.restaurant_service.mapper.CategoryMapper;
import com.example.restaurant_service.repository.CategoryRepository;
import com.example.restaurant_service.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final FoodItemRepository foodItemRepository;
    private final RestaurantService restaurantService;

    public CategoryService(CategoryRepository categoryRepository,
                            FoodItemRepository foodItemRepository,
                            RestaurantService restaurantService) {
        this.categoryRepository = categoryRepository;
        this.foodItemRepository = foodItemRepository;
        this.restaurantService = restaurantService;
    }

    @Transactional
    public CategoryResponse createCategory(Long restaurantId,
                                            CreateCategoryRequest request,
                                            Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        if (categoryRepository.existsByRestaurantIdAndNameIgnoreCase(
                restaurantId, request.name())) {
            throw new DuplicateCategoryException(request.name(), restaurantId);
        }

        Category category = CategoryMapper.toEntity(request, restaurant);
        Category saved = categoryRepository.save(category);
        return CategoryMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(Long restaurantId) {
        restaurantService.findRestaurantOrThrow(restaurantId);

        return categoryRepository.findByRestaurantId(restaurantId).stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse updateCategory(Long restaurantId, Long categoryId,
                                            UpdateCategoryRequest request,
                                            Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        Category category = categoryRepository
                .findByIdAndRestaurantId(categoryId, restaurantId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));

        if (!category.getName().equalsIgnoreCase(request.name())
                && categoryRepository.existsByRestaurantIdAndNameIgnoreCase(
                        restaurantId, request.name())) {
            throw new DuplicateCategoryException(request.name(), restaurantId);
        }

        category.setName(request.name());
        category.setDescription(request.description());

        Category saved = categoryRepository.save(category);
        return CategoryMapper.toResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long restaurantId, Long categoryId,
                                Long authenticatedUserId) {
        Restaurant restaurant = restaurantService.findRestaurantOrThrow(restaurantId);
        restaurantService.verifyOwnership(restaurant, authenticatedUserId);

        Category category = categoryRepository
                .findByIdAndRestaurantId(categoryId, restaurantId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));

        if (foodItemRepository.existsByCategoryId(categoryId)) {
            throw new CategoryInUseException(categoryId);
        }

        categoryRepository.delete(category);
    }

    public Category findCategoryByIdAndRestaurant(Long categoryId,
                                                    Long restaurantId) {
        return categoryRepository
                .findByIdAndRestaurantId(categoryId, restaurantId)
                .orElseThrow(() -> new CategoryNotFoundException(categoryId));
    }
}
