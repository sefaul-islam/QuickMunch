import React from 'react';
import { Plus } from 'lucide-react';
import type { Dish, Restaurant } from '../../types';
import { Badge } from '../ui/Badge';

export interface DishCardProps {
  dish: Dish;
  restaurant?: Restaurant;
  onAddToCart: (dish: Dish, restaurant?: Restaurant) => void;
}

export const DishCard: React.FC<DishCardProps> = ({
  dish,
  restaurant,
  onAddToCart,
}) => {
  return (
    <div className="group relative flex flex-col sm:flex-row bg-cream-card rounded-xl border border-cream-border p-4 gap-4 transition-all duration-200 ease-out hover:shadow-warm hover:border-cream-dark">
      {/* Visual Frame */}
      <div className="relative aspect-[4/3] sm:w-36 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-cream-dark">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        />
        {dish.isSignature && (
          <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-terracotta text-cream px-2 py-0.5 rounded-full shadow-warm-sm">
            Signature
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-base font-semibold text-charcoal group-hover:text-primary transition-colors">
              {dish.name}
            </h4>
            <span className="text-sm font-semibold text-charcoal tabular-nums shrink-0">
              ${dish.price.toFixed(2)}
            </span>
          </div>

          <p className="text-xs text-charcoal-muted mt-1 line-clamp-2 leading-relaxed">
            {dish.description}
          </p>

          {dish.dietary && dish.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dish.dietary.map((d) => (
                <Badge key={d} variant="outline" size="sm">
                  {d}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-cream-border/50">
          {restaurant && (
            <span className="text-xs text-charcoal-muted truncate">
              by <span className="font-medium text-charcoal">{restaurant.name}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => onAddToCart(dish, restaurant)}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-primary text-cream px-3 py-1.5 rounded-lg transition-transform duration-150 active:scale-[0.96] hover:bg-primary-hover shadow-warm-sm cursor-pointer"
          >
            <Plus size={14} />
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
};
