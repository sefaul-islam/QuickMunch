import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import type { Restaurant } from '../../types';
import { useImageFade } from '../../hooks/useImageFade';
import { onRestaurantImgError } from '../../lib/imageUtils';

export interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSelect?: (restaurant: Restaurant) => void;
  onQuickAdd?: (dish: Restaurant['dishes'][0], restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isFavorite: controlledFavorite,
  onToggleFavorite,
  onSelect,
}) => {
  const navigate = useNavigate();
  const [internalFavorite, setInternalFavorite] = useState(false);
  const isFavorite = controlledFavorite !== undefined ? controlledFavorite : internalFavorite;
  const coverFade = useImageFade('duration-500');

  const handleClick = () => {
    if (onSelect) {
      onSelect(restaurant);
    } else {
      navigate(`/restaurants/${restaurant.id}`);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      setInternalFavorite(!internalFavorite);
    }
  };

  return (
    <motion.article
      tabIndex={0}
      role="button"
      aria-label={`View menu for ${restaurant.name}, ${restaurant.cuisine} cuisine, rated ${restaurant.rating}`}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-col bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm hover:shadow-warm transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Clean Cover Media Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-dark">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-104 ${coverFade.imgClassName}`}
          onLoad={coverFade.onLoad}
          onError={onRestaurantImgError}
        />

        {/* Favorite Button */}
        <motion.button
          whileTap={{ scale: 1.2 }}
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isFavorite
              ? 'bg-terracotta text-cream shadow-warm-sm'
              : 'bg-white/85 text-charcoal hover:bg-white shadow-warm-sm'
          }`}
          aria-label={
            isFavorite
              ? `Remove ${restaurant.name} from saved kitchens`
              : `Save ${restaurant.name} to favorites`
          }
        >
          <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>
      </div>

      {/* Clean Content Block: Name, Rating, Meta, Delivery */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug">
            {restaurant.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs font-semibold text-charcoal shrink-0">
            <Star size={13} className="text-terracotta fill-terracotta" />
            <span className="tabular-nums">{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Cuisine, Neighborhood & Prep Time */}
        <p className="text-xs text-charcoal-muted line-clamp-1">
          {restaurant.cuisine} • {restaurant.neighborhood} • {restaurant.prepTime}
        </p>

        {/* Delivery Fee & Free Delivery Threshold */}
        <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1 border-t border-cream-border/50">
          <span>
            {restaurant.deliveryFee === 0 ? (
              <strong className="text-primary font-semibold">Free Delivery</strong>
            ) : (
              `$${restaurant.deliveryFee.toFixed(2)} delivery`
            )}
          </span>
          <span className="font-medium text-charcoal/70">
            {restaurant.priceRange}
          </span>
        </div>
      </div>
    </motion.article>
  );
};
