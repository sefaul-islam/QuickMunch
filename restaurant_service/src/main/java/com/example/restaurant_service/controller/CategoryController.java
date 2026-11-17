package com.example.restaurant_service.controller;

import com.example.restaurant_service.dto.request.CreateCategoryRequest;
import com.example.restaurant_service.dto.request.UpdateCategoryRequest;
import com.example.restaurant_service.dto.response.CategoryResponse;
import com.example.restaurant_service.security.KeycloakSecurityUtil;
import com.example.restaurant_service.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(
            @PathVariable Long restaurantId,
            @Valid @RequestBody CreateCategoryRequest request,
            Authentication authentication) {
        String userId = KeycloakSecurityUtil.getKeycloakId(authentication);
        CategoryResponse response = categoryService.createCategory(
                restaurantId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(categoryService.getCategories(restaurantId));
    }

    @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            @Valid @RequestBody UpdateCategoryRequest request,
            Authentication authentication) {
        String userId = KeycloakSecurityUtil.getKeycloakId(authentication);
        return ResponseEntity.ok(
                categoryService.updateCategory(
                        restaurantId, categoryId, request, userId));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('RESTAURANT_OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long restaurantId,
            @PathVariable Long categoryId,
            Authentication authentication) {
        String userId = KeycloakSecurityUtil.getKeycloakId(authentication);
        categoryService.deleteCategory(restaurantId, categoryId, userId);
        return ResponseEntity.noContent().build();
    }
}
