package com.example.order_service.service;

import com.example.order_service.client.RestaurantServiceClient;
import com.example.order_service.client.UserServiceClient;
import com.example.order_service.dto.*;
import com.example.order_service.entity.Cart;
import com.example.order_service.entity.CartItem;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.exception.EmptyCartException;
import com.example.order_service.exception.FoodItemNotFoundException;
import com.example.order_service.exception.FoodItemUnavailableException;
import com.example.order_service.exception.InvalidOrderStateException;
import com.example.order_service.exception.OrderNotFoundException;
import com.example.order_service.message.OrderEventPublisher;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;
    private final RestaurantServiceClient restaurantServiceClient;
    private final OrderEventPublisher orderEventPublisher;
    private final OrderPersistenceService orderPersistenceService;
    private final CartPersistenceService cartPersistenceService;

    private UserResponseDTO getAuthenticatedUser(String keycloakId) {
        return userServiceClient.getUserByKeycloakId(keycloakId);
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'USER', 'ADMIN')")
    public OrderConfirmationResponse createOrder(String keycloakId, String email, CreateOrderDTO dto) {
        UserResponseDTO user = getAuthenticatedUser(keycloakId);

        Cart cart = cartPersistenceService.findCartWithItems(keycloakId)
                .filter(c -> !c.getItems().isEmpty())
                .orElseThrow(() -> new EmptyCartException("Cannot create an order from an empty cart"));

        RestaurantDTO restaurant = restaurantServiceClient.getRestaurant(cart.getRestaurantId());
        if (restaurant != null && Boolean.FALSE.equals(restaurant.isActive())) {
            throw new InvalidOrderStateException("Restaurant is currently inactive");
        }

        Map<Long, FoodItemDTO> foodItemsMap = restaurantServiceClient.getFoodItemsMap(cart.getRestaurantId());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>(cart.getItems().size());

        for (CartItem cartItem : cart.getItems()) {
            FoodItemDTO foodItem = foodItemsMap.get(cartItem.getFoodItemId());
            if (foodItem == null) {
                throw new FoodItemNotFoundException(cartItem.getFoodItemId());
            }
            if (Boolean.FALSE.equals(foodItem.isAvailable())) {
                throw new FoodItemUnavailableException(foodItem.id(), foodItem.name());
            }
            if (foodItem.price() == null) {
                throw new IllegalStateException(
                        "Invalid food item or price for food item ID: " + cartItem.getFoodItemId()
                );
            }
            if (foodItem.price().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalStateException(
                        "Food item price cannot be negative for food item ID: " + cartItem.getFoodItemId()
                );
            }

            BigDecimal itemSubtotal = foodItem.price().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);

            OrderItem item = OrderItem.builder()
                    .foodItemId(foodItem.id())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(foodItem.price())
                    .subtotal(itemSubtotal)
                    .build();

            orderItems.add(item);
        }

        Order savedOrder = orderPersistenceService.saveOrderAndClearCart(
                user.keycloakId(),
                cart.getRestaurantId(),
                cart.getId(),
                dto,
                subtotal,
                orderItems
        );
        orderEventPublisher.publishOrderCreated(savedOrder, email);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderConfirmationResponse getOrder(Long orderId, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderConfirmationResponse> getOrdersByUser(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderConfirmationResponse> getOrdersByRestaurant(Long restaurantId) {
        return orderRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public OrderConfirmationResponse updateOrderStatus(Long orderId, String email, OrderStatusUpdateDTO dto, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        validateStatusTransition(order.getStatus(), dto.status());

        order.setStatus(dto.status());
        Order savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderStatusUpdated(savedOrder, email);

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderConfirmationResponse cancelOrder(Long orderId, String email, String userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Order cannot be cancelled in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderCancelled(savedOrder, email);

        return mapToResponse(savedOrder);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PREPARING || next == OrderStatus.CANCELLED;
            case PREPARING -> next == OrderStatus.READY;
            case READY -> next == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> next == OrderStatus.DELIVERED;
            default -> false;
        };
        if (!valid) {
            throw new InvalidOrderStateException("Invalid status transition from " + current + " to " + next);
        }
    }

    private OrderConfirmationResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getFoodItemId(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ))
                .toList();

        return new OrderConfirmationResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUserId(),
                order.getRestaurantId(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getSubtotal(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getDeliveryAddressId(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
