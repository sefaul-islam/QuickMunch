package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.CreateCategoryRequest;
import com.example.restaurant_service.dto.request.UpdateCategoryRequest;
import com.example.restaurant_service.dto.response.CategoryResponse;
import com.example.restaurant_service.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
            @Valid @RequestBody CreateCategoryRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        CategoryResponse response = categoryService.createCategory(
                restaurantId, request, userId);
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
            @Valid @RequestBody UpdateCategoryRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(
                categoryService.updateCategory(
                        restaurantId, categoryId, request, userId));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        categoryService.deleteCategory(restaurantId, categoryId, userId);
        return ResponseEntity.noContent().build();
    }
}
