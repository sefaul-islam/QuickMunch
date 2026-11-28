import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import type { RestaurantResponse } from '../../api/types/restaurant';
import { useImageFade } from '../../hooks/useImageFade';
import { resolveImageUrl, onRestaurantImgError } from '../../lib/imageUtils';

export interface RestaurantCardProps {
  restaurant: RestaurantResponse;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onSelect?: (restaurant: RestaurantResponse) => void;
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

  const resolvedCover = resolveImageUrl(restaurant.imageUrl);

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
      aria-label={`View menu for ${restaurant.name}${restaurant.isOpen ? ', currently open' : ', currently closed'}`}
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
          src={resolvedCover}
          alt={restaurant.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-104 ${coverFade.imgClassName}`}
          onLoad={coverFade.onLoad}
          onError={onRestaurantImgError}
        />

        {/* Open / Closed Status Pill */}
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-warm-sm ${
            restaurant.isOpen
              ? 'bg-emerald-600/90 text-white'
              : 'bg-charcoal/80 text-cream'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              restaurant.isOpen ? 'bg-white animate-pulse' : 'bg-charcoal-faint'
            }`}
          />
          {restaurant.isOpen ? 'Open Now' : 'Closed'}
        </span>

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

      {/* Content Block: Name, Description, Address, Phone */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug">
            {restaurant.name}
          </h3>

          {restaurant.description && (
            <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
              {restaurant.description}
            </p>
          )}
        </div>

        <div className="space-y-1 text-[11px] text-charcoal-muted pt-2 border-t border-cream-border/50">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={12} className="text-primary shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
          {restaurant.phoneNumber && (
            <div className="flex items-center gap-1.5 truncate">
              <Phone size={12} className="text-terracotta shrink-0" />
              <span className="truncate">{restaurant.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};
