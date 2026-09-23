package com.example.restaurant_service.repository;

import com.example.restaurant_service.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByRestaurantId(Long restaurantId);

    List<FoodItem> findByCategoryId(Long categoryId);

    Optional<FoodItem> findByIdAndRestaurantId(Long id, Long restaurantId);

    boolean existsByCategoryId(Long categoryId);
}

