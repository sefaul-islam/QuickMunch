package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.CreateCategoryRequest;
import com.example.restaurant_service.dto.request.UpdateCategoryRequest;
import com.example.restaurant_service.dto.response.CategoryResponse;
import com.example.restaurant_service.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(
                restaurantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(categoryService.getCategories(restaurantId));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ResponseEntity.ok(
                categoryService.updateCategory(restaurantId, categoryId, request));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId) {
        categoryService.deleteCategory(restaurantId, categoryId);
        return ResponseEntity.noContent().build();
    }
}

