import React, { useRef } from 'react';
import { X, Star, Clock, MapPin } from 'lucide-react';
import type { Restaurant, Dish } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { useImageFade } from '../../hooks/useImageFade';
import { onRestaurantImgError, onFoodImgError } from '../../lib/imageUtils';

export interface RestaurantModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (dish: Dish, restaurant: Restaurant) => void;
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const coverFade = useImageFade('duration-500');

  useDialogFocus({
    isOpen,
    onClose,
    containerRef: modalRef,
  });

  if (!isOpen || !restaurant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-name"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-cream-card rounded-2xl border border-cream-border overflow-hidden shadow-warm-lg z-10 my-8 animate-scale-in max-h-[90vh] flex flex-col outline-none"
      >
        {/* Hero image header */}
        <div className="relative h-56 sm:h-64 w-full bg-cream-dark shrink-0">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className={`w-full h-full object-cover ${coverFade.imgClassName}`}
            onLoad={coverFade.onLoad}
            onError={onRestaurantImgError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-black/20" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-cream-card/90 text-charcoal hover:bg-cream-card transition-colors shadow-warm-sm cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close restaurant details"
          >
            <X size={18} />
          </button>

          {/* Restaurant details over image */}
          <div className="absolute bottom-4 left-5 right-5 text-cream">
            {restaurant.badge && (
              <Badge variant="primary" size="sm" className="mb-1.5">
                {restaurant.badge}
              </Badge>
            )}
            <h2 id="restaurant-modal-name" className="font-serif text-2xl sm:text-3xl font-bold text-cream">
              {restaurant.name}
            </h2>
            <p className="text-xs sm:text-sm text-cream/90 mt-0.5 max-w-lg">
              {restaurant.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-cream/80 font-medium">
              <span className="flex items-center gap-1">
                <Star size={13} className="text-terracotta fill-terracotta" />
                <strong className="text-cream tabular-nums">{restaurant.rating.toFixed(1)}</strong> ({restaurant.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-terracotta" />
                <span className="tabular-nums">{restaurant.prepTime}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                <span>{restaurant.neighborhood}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Menu list content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-cream-border">
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Kitchen Signature Dishes
            </h3>
            <span className="text-xs text-charcoal-muted tabular-nums">
              {restaurant.dishes.length} items
            </span>
          </div>

          <div className="space-y-3">
            {restaurant.dishes.map((dish) => (
              <DishRow
                key={dish.id}
                dish={dish}
                restaurant={restaurant}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** Individual dish row — extracted to get a fresh useImageFade per dish */
const DishRow: React.FC<{
  dish: Dish;
  restaurant: Restaurant;
  onAddToCart: (dish: Dish, restaurant: Restaurant) => void;
}> = ({ dish, restaurant, onAddToCart }) => {
  const fade = useImageFade('duration-300');

  return (
    <div className="flex items-start justify-between gap-4 p-3.5 bg-white rounded-xl border border-cream-border hover:border-cream-dark transition-all shadow-warm-sm">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-serif text-base font-semibold text-charcoal">
            {dish.name}
          </h4>
          {dish.isSignature && (
            <Badge variant="terracotta" size="sm">
              Signature
            </Badge>
          )}
        </div>
        <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
          {dish.description}
        </p>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-sm font-bold text-charcoal tabular-nums">
            ${dish.price.toFixed(2)}
          </span>
          {dish.dietary?.map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <img
          src={dish.image}
          alt={dish.name}
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-cream-dark ${fade.imgClassName}`}
          onLoad={fade.onLoad}
          onError={onFoodImgError}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAddToCart(dish, restaurant)}
        >
          + Add
        </Button>
      </div>
    </div>
  );
};
