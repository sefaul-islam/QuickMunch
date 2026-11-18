import React from 'react';
import { Star, Clock, MapPin, ArrowRight, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import type { Restaurant } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface FeaturedSpotlightProps {
  restaurants: Restaurant[];
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onQuickAdd: (dish: Restaurant['dishes'][0], restaurant: Restaurant) => void;
}

export const FeaturedSpotlight: React.FC<FeaturedSpotlightProps> = ({
  restaurants,
  favoriteIds = [],
  onToggleFavorite,
  onSelectRestaurant,
  onQuickAdd,
}) => {
  const heroRestaurant = restaurants[0]; // Sylvan Hearth
  const sideRestaurants = restaurants.slice(1, 3); // Kuroshio and Osteria
  const isHeroFavorite = heroRestaurant ? favoriteIds.includes(heroRestaurant.id) : false;

  return (
    <section id="spotlight" className="w-full py-14 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Featured Kitchen Spotlight
            </h2>
            <p className="text-sm text-charcoal-muted mt-1 max-w-xl">
              Independent kitchens selected for their uncompromising devotion to craft, scratch preparations, and seasonal ingredients.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Weekly Editorial Pick
          </span>
        </div>

        {/* Asymmetric Magazine-Style Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Large Spotlight Hero Card (7 Cols) */}
          {heroRestaurant && (
            <motion.div
              tabIndex={0}
              role="button"
              aria-label={`View kitchen menu for ${heroRestaurant.name}, ${heroRestaurant.cuisine} cuisine, rated ${heroRestaurant.rating}`}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onSelectRestaurant(heroRestaurant)}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectRestaurant(heroRestaurant);
                }
              }}
              className="lg:col-span-7 bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm hover:shadow-editorial transition-shadow duration-300 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-dark">
                <img
                  src={heroRestaurant.image}
                  alt={heroRestaurant.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-4 left-4">
                  <Badge variant="sage" size="md">
                    {heroRestaurant.badge || 'Chef Spotlight'}
                  </Badge>
                </div>

                {onToggleFavorite && (
                  <div className="absolute top-4 right-4">
                    <motion.button
                      whileTap={{ scale: 1.25 }}
                      whileHover={{ scale: 1.05 }}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(heroRestaurant.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer shadow-warm-sm ${
                        isHeroFavorite
                          ? 'bg-terracotta text-cream'
                          : 'bg-white/80 hover:bg-white text-charcoal'
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                      aria-label={
                        isHeroFavorite
                          ? `Remove ${heroRestaurant.name} from saved kitchens`
                          : `Save ${heroRestaurant.name} to favorites`
                      }
                    >
                      <Heart size={16} className={isHeroFavorite ? 'fill-cream' : ''} />
                    </motion.button>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 text-cream flex items-end justify-between">
                  <div>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cream">
                      {heroRestaurant.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-cream/90 mt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <Star size={13} className="text-terracotta fill-terracotta" />
                        <span className="tabular-nums">{heroRestaurant.rating.toFixed(1)}</span> (
                        {heroRestaurant.reviewCount})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-terracotta" />
                        <span className="tabular-nums">{heroRestaurant.prepTime}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        <span>{heroRestaurant.neighborhood}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Narrative Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-charcoal-muted leading-relaxed">
                  {heroRestaurant.tagline} Baked in a customized 850°F Italian oven, each pizza features heritage flours, long ambient fermentation, and micro-farmed stracciatella.
                </p>

                {/* Signature Dish Highlight */}
                {heroRestaurant.dishes[0] && (
                  <div className="p-3.5 bg-cream rounded-xl border border-cream-border flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta block">
                        Signature Creation
                      </span>
                      <span className="text-xs font-bold text-charcoal truncate block">
                        {heroRestaurant.dishes[0].name}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(heroRestaurant.dishes[0], heroRestaurant);
                      }}
                    >
                      + ${heroRestaurant.dishes[0].price.toFixed(2)}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Right: Stacked Curated Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {sideRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                tabIndex={0}
                role="button"
                aria-label={`View kitchen menu for ${restaurant.name}, ${restaurant.cuisine} cuisine, rated ${restaurant.rating}`}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => onSelectRestaurant(restaurant)}
                onKeyDown={(e) => {
                  if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectRestaurant(restaurant);
                  }
                }}
                className="bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm hover:shadow-editorial transition-shadow duration-300 cursor-pointer p-4 flex flex-col sm:flex-row gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="relative aspect-square sm:w-40 rounded-xl overflow-hidden bg-cream-dark shrink-0">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                  {restaurant.badge && (
                    <span className="absolute top-2 left-2 bg-primary text-cream text-[10px] font-bold px-2 py-0.5 rounded-full shadow-warm-sm">
                      {restaurant.badge}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-terracotta">
                        {restaurant.cuisine}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-semibold text-charcoal">
                        <Star size={12} className="text-terracotta fill-terracotta" />
                        <span className="tabular-nums">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-charcoal mt-1 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-charcoal-muted line-clamp-2 mt-1 leading-relaxed">
                      {restaurant.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-cream-border/60 flex items-center justify-between text-xs text-charcoal-muted">
                    <span className="tabular-nums">
                      {restaurant.prepTime} • {restaurant.neighborhood}
                    </span>
                    <span className="font-semibold text-primary inline-flex items-center gap-1">
                      Menu <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
