package com.example.order_service.controller;

import com.example.order_service.dto.CreateOrderDTO;
import com.example.order_service.dto.OrderConfirmationResponse;
import com.example.order_service.dto.OrderStatusUpdateDTO;
import com.example.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderConfirmationResponse> createOrder(
            @Valid @RequestBody CreateOrderDTO dto,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(userId, dto));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderConfirmationResponse> getOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.getOrder(orderId, userId));
    }

    @GetMapping
    public ResponseEntity<List<OrderConfirmationResponse>> getOrdersByUser(
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<OrderConfirmationResponse>> getOrdersByRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderConfirmationResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateDTO dto,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, dto, userId));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderConfirmationResponse> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(orderService.cancelOrder(orderId, userId));
    }
}
