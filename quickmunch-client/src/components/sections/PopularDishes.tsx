import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Dish } from '../../types';
import type { FoodItemResponse, RestaurantResponse } from '../../api/types/restaurant';
import { useFeaturedDishesQuery } from '../../hooks/queries/useRestaurantQueries';
import { useImageFade } from '../../hooks/useImageFade';
import { resolveFoodImageUrl, onFoodImgError } from '../../lib/imageUtils';

export interface PopularDishesProps {
  restaurants: RestaurantResponse[];
  isLoadingRestaurants?: boolean;
  onAddToCart: (dish: Dish, restaurant: { id: string | number; name: string }) => void;
}

export const PopularDishes: React.FC<PopularDishesProps> = ({
  restaurants,
  isLoadingRestaurants = false,
  onAddToCart,
}) => {
  const { dishes, isLoading, isError } = useFeaturedDishesQuery(restaurants);

  const handleAdd = (foodItem: FoodItemResponse, restaurant: RestaurantResponse) => {
    const dishObj: Dish = {
      id: String(foodItem.id),
      name: foodItem.name,
      description: foodItem.description || '',
      price: Number(foodItem.price),
      image: foodItem.imageUrl || '',
      category: foodItem.caetegoryName || undefined,
    };
    onAddToCart(dishObj, { id: restaurant.id, name: restaurant.name });
  };

  return (
    <section id="dishes" className="w-full py-12 bg-cream-card/40 border-t border-cream-border/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Featured Dishes
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
              Available dishes prepared to order from partner kitchens.
            </p>
          </div>
        </div>

        {isLoadingRestaurants || isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm animate-pulse"
              >
                <div className="aspect-[4/3] bg-cream-border/40" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-cream-border/30 rounded w-1/3" />
                  <div className="h-5 bg-cream-border/40 rounded w-2/3" />
                  <div className="h-4 bg-cream-border/30 rounded w-1/4 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 bg-white rounded-2xl border border-rose-200 text-center space-y-2">
            <AlertCircle size={22} className="mx-auto text-rose-700" />
            <p className="text-xs font-semibold text-charcoal">Unable to load menu dishes right now.</p>
          </div>
        ) : dishes.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-cream-border text-center space-y-2">
            <UtensilsCrossed size={22} className="mx-auto text-charcoal-faint" />
            <p className="text-xs font-semibold text-charcoal">No dishes available yet</p>
            <p className="text-[11px] text-charcoal-muted">
              Browse kitchens to explore newly added menu items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dishes.map(({ foodItem, restaurant }) => (
              <PopularDishCard
                key={`${restaurant.id}-${foodItem.id}`}
                foodItem={foodItem}
                restaurant={restaurant}
                onAdd={() => handleAdd(foodItem, restaurant)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const PopularDishCard: React.FC<{
  foodItem: FoodItemResponse;
  restaurant: RestaurantResponse;
  onAdd: () => void;
}> = ({ foodItem, restaurant, onAdd }) => {
  const fade = useImageFade('duration-500');
  const resolvedSrc = resolveFoodImageUrl(foodItem.imageUrl);

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Macro Food Photography */}
        <Link
          to={`/restaurants/${restaurant.id}`}
          className="block relative aspect-[4/3] w-full overflow-hidden bg-cream-dark"
        >
          <img
            src={resolvedSrc}
            alt={foodItem.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104 ${fade.imgClassName}`}
            onLoad={fade.onLoad}
            onError={onFoodImgError}
          />
        </Link>

        {/* Minimalist Details */}
        <div className="p-4">
          <Link
            to={`/restaurants/${restaurant.id}`}
            className="text-[11px] font-medium text-charcoal-muted hover:text-primary block truncate transition-colors"
          >
            {restaurant.name}
          </Link>
          <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug mt-0.5">
            {foodItem.name}
          </h3>
          {foodItem.caetegoryName && (
            <span className="inline-block mt-1 text-[10px] font-medium text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded-full">
              {foodItem.caetegoryName}
            </span>
          )}
        </div>
      </div>

      {/* Clean Price & Add Action */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between">
        <span className="text-base font-bold text-charcoal tabular-nums">
          ${Number(foodItem.price).toFixed(2)}
        </span>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.02 }}
          type="button"
          onClick={onAdd}
          disabled={!foodItem.isAvailable}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover active:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-cream px-3.5 py-2 rounded-lg shadow-warm-sm hover:shadow-warm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[38px]"
          aria-label={`Add ${foodItem.name} to order bag for $${Number(foodItem.price).toFixed(2)}`}
        >
          <Plus size={14} />
          <span>Add</span>
        </motion.button>
      </div>
    </motion.article>
  );
};
