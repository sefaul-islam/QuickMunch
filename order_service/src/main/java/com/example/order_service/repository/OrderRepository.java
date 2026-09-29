package com.example.order_service.repository;

import com.example.order_service.entity.Order;
import com.example.order_service.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);
}
