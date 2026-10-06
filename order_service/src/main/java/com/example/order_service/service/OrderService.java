package com.example.order_service.service;

import com.example.order_service.client.RestaurantServiceClient;
import com.example.order_service.client.UserServiceClient;
import com.example.order_service.dto.*;
import com.example.order_service.entity.Order;
import com.example.order_service.entity.OrderItem;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.enums.PaymentStatus;
import com.example.order_service.exception.InvalidOrderStateException;
import com.example.order_service.exception.OrderNotFoundException;
import com.example.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;
    private final RestaurantServiceClient restaurantServiceClient;
    private final OrderEventPublisher orderEventPublisher;

    @Value("${order.delivery-fee:2.99}")
    private BigDecimal defaultDeliveryFee;

    @Transactional
    public OrderConfirmationResponse createOrder(Long userId,String email, CreateOrderDTO dto) {
        userServiceClient.verifyUserExists(userId);
        restaurantServiceClient.getRestaurant(dto.restaurantId());

        BigDecimal subtotal = BigDecimal.ZERO;

        Order order = Order.builder()
                .userId(userId)
                .restaurantId(dto.restaurantId())
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .deliveryAddress(dto.deliveryAddress())
                .orderNumber("QM-" + System.currentTimeMillis())
                .build();

        for (OrderItemDTO itemDto : dto.items()) {
            FoodItemDTO foodItem = restaurantServiceClient.getFoodItem(dto.restaurantId(), itemDto.foodItemId());
            
            BigDecimal itemSubtotal = foodItem.price().multiply(BigDecimal.valueOf(itemDto.quantity()));
            subtotal = subtotal.add(itemSubtotal);
            
            OrderItem item = OrderItem.builder()
                    .order(order)
                    .foodItemId(foodItem.id())
                    .quantity(itemDto.quantity())
                    .unitPrice(foodItem.price())
                    .subtotal(itemSubtotal)
                    .build();
            
            order.getItems().add(item);
        }

        order.setSubtotal(subtotal);
        order.setDeliveryFee(defaultDeliveryFee);
        order.setTotalAmount(subtotal.add(defaultDeliveryFee));

        Order savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderCreated(savedOrder,email);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderConfirmationResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
                
        if (!order.getUserId().equals(userId)) {
            throw new OrderNotFoundException(orderId); // Or generic access denied
        }
        
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderConfirmationResponse> getOrdersByUser(Long userId) {
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
    public OrderConfirmationResponse updateOrderStatus(Long orderId, String email, OrderStatusUpdateDTO dto, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        validateStatusTransition(order.getStatus(), dto.status());
        
        order.setStatus(dto.status());
        Order savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderStatusUpdated(savedOrder,email);
        
        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderConfirmationResponse cancelOrder(Long orderId,String email, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));
                
        if (!order.getUserId().equals(userId)) {
            throw new OrderNotFoundException(orderId);
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new InvalidOrderStateException("Order cannot be cancelled in status: " + order.getStatus());
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);
        orderEventPublisher.publishOrderCancelled(savedOrder,email);
        
        return mapToResponse(savedOrder);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = false;
        switch (current) {
            case PENDING:
                valid = next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
                break;
            case CONFIRMED:
                valid = next == OrderStatus.PREPARING || next == OrderStatus.CANCELLED;
                break;
            case PREPARING:
                valid = next == OrderStatus.READY;
                break;
            case READY:
                valid = next == OrderStatus.OUT_FOR_DELIVERY;
                break;
            case OUT_FOR_DELIVERY:
                valid = next == OrderStatus.DELIVERED;
                break;
            default:
                valid = false;
        }
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
                order.getDeliveryAddress(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
