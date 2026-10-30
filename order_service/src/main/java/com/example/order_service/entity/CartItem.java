
package com.example.order_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "cart_items",
        indexes = {
                @Index(
                        name = "idx_cart_item_cart_id",
                        columnList = "cart_id"
                )
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_cart_food_item",
                        columnNames = {"cart_id", "food_item_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @Column(name = "food_item_id", nullable = false)
    private Long foodItemId;

    @Column(nullable = false)
    private Integer quantity;
}
