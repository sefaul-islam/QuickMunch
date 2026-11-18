import React, { useState } from 'react';
import { Star, Clock, MapPin, Heart, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Restaurant } from '../../types';
import { Badge } from '../ui/Badge';

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
  onQuickAdd,
}) => {
  const [internalFavorite, setInternalFavorite] = useState(false);
  const isFavorite = controlledFavorite !== undefined ? controlledFavorite : internalFavorite;

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
      onClick={() => onSelect?.(restaurant)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect?.(restaurant);
        }
      }}
      className="group relative flex flex-col bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm hover:shadow-editorial transition-shadow duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* Large Attractive Cover Media Frame */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream-dark">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80';
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 items-center">
          {restaurant.badge && (
            <span className="px-3 py-1 text-xs font-semibold tracking-tight text-cream bg-primary/95 backdrop-blur-xs rounded-full shadow-warm-sm border border-primary-light/40">
              {restaurant.badge}
            </span>
          )}
        </div>

        {/* Animated Favorite Button with spring scale */}
        <motion.button
          whileTap={{ scale: 1.25 }}
          whileHover={{ scale: 1.05 }}
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute top-3.5 right-3.5 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            isFavorite
              ? 'bg-terracotta text-cream shadow-warm-sm'
              : 'bg-white/90 text-charcoal hover:bg-white shadow-warm-sm'
          }`}
          aria-label={
            isFavorite
              ? `Remove ${restaurant.name} from saved kitchens`
              : `Save ${restaurant.name} to favorites`
          }
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Bottom Time & Distance Pills */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-cream font-medium">
          <span className="flex items-center gap-1.5 bg-charcoal/80 backdrop-blur-xs px-2.5 py-1 rounded-full">
            <Clock size={12} className="text-terracotta" />
            <span className="tabular-nums">{restaurant.prepTime}</span>
          </span>
          <span className="flex items-center gap-1 bg-charcoal/80 backdrop-blur-xs px-2.5 py-1 rounded-full">
            <MapPin size={11} className="text-cream" />
            <span>
              {restaurant.neighborhood} • {restaurant.distance}
            </span>
          </span>
        </div>
      </div>

      {/* Content Block */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-primary transition-colors flex items-center gap-1">
              {restaurant.name}
              <ArrowUpRight
                size={15}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary"
              />
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-1">
              {restaurant.tagline}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-cream px-2 py-1 rounded-md shrink-0 border border-cream-border/60">
            <Star size={13} className="text-terracotta fill-terracotta" />
            <span className="text-xs font-semibold text-charcoal tabular-nums">
              {restaurant.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-charcoal-muted tabular-nums">
              ({restaurant.reviewCount})
            </span>
          </div>
        </div>

        {/* Dietary / Feature Tags */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {restaurant.dietaryTags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
          <Badge variant="outline" size="sm">
            {restaurant.priceRange}
          </Badge>
        </div>

        {/* Signature Dish Snippet */}
        {restaurant.dishes.length > 0 && (
          <div className="mt-auto pt-3 border-t border-cream-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden mr-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-terracotta shrink-0">
                Signature:
              </span>
              <span className="text-xs text-charcoal font-medium truncate">
                {restaurant.dishes[0].name}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd?.(restaurant.dishes[0], restaurant);
              }}
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded p-0.5"
              aria-label={`Add signature dish ${restaurant.dishes[0].name} from ${restaurant.name} to bag`}
            >
              + ${restaurant.dishes[0].price.toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </motion.article>
  );
};
