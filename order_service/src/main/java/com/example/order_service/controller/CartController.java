package com.example.order_service.controller;

import com.example.order_service.dto.AddToCartRequest;
import com.example.order_service.dto.CartDTO;
import com.example.order_service.dto.UpdateCartItemRequest;
import com.example.order_service.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.getCart(jwt.getSubject()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(
            @Valid @RequestBody AddToCartRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.addItem(jwt.getSubject(), request));
    }

    @PutMapping("/items/{foodItemId}")
    public ResponseEntity<CartDTO> updateItemQuantity(
            @PathVariable Long foodItemId,
            @Valid @RequestBody UpdateCartItemRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.updateItemQuantity(jwt.getSubject(), foodItemId, request));
    }

    @DeleteMapping("/items/{foodItemId}")
    public ResponseEntity<CartDTO> removeItem(
            @PathVariable Long foodItemId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(cartService.removeItem(jwt.getSubject(), foodItemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getSubject());
        return ResponseEntity.noContent().build();
    }
}
