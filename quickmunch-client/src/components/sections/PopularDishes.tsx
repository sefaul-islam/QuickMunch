import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { POPULAR_DISHES } from '../../data/mockData';
import type { Dish, Restaurant, PopularDishItem } from '../../types';
import { RESTAURANTS } from '../../data/mockData';
import { useImageFade } from '../../hooks/useImageFade';
import { onFoodImgError } from '../../lib/imageUtils';

export interface PopularDishesProps {
  onAddToCart: (dish: Dish, restaurant?: Restaurant) => void;
}

export const PopularDishes: React.FC<PopularDishesProps> = ({ onAddToCart }) => {
  const handleAdd = (popularItem: PopularDishItem) => {
    const parentRestaurant = RESTAURANTS.find((r) => r.id === popularItem.restaurantId);
    const dishObj: Dish = {
      id: popularItem.id,
      name: popularItem.name,
      description: popularItem.description,
      price: popularItem.price,
      image: popularItem.image,
      category: 'Signature',
      dietary: popularItem.dietary,
      isSignature: true,
    };
    onAddToCart(dishObj, parentRestaurant);
  };

  return (
    <section id="dishes" className="w-full py-12 bg-cream-card/40 border-t border-cream-border/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Popular Dishes
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
              Customer favorites prepared to order.
            </p>
          </div>
        </div>

        {/* Clean Responsive Dish Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POPULAR_DISHES.map((dish) => (
            <PopularDishCard key={dish.id} dish={dish} onAdd={handleAdd} />
          ))}
        </div>
      </div>
    </section>
  );
};

const PopularDishCard: React.FC<{
  dish: PopularDishItem;
  onAdd: (dish: PopularDishItem) => void;
}> = ({ dish, onAdd }) => {
  const fade = useImageFade('duration-500');

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* Macro Food Photography */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
          <img
            src={dish.image}
            alt={dish.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104 ${fade.imgClassName}`}
            onLoad={fade.onLoad}
            onError={onFoodImgError}
          />
        </div>

        {/* Minimalist Details */}
        <div className="p-4">
          <span className="text-[11px] font-medium text-charcoal-muted block truncate">
            {dish.restaurantName}
          </span>
          <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug mt-0.5">
            {dish.name}
          </h3>
        </div>
      </div>

      {/* Clean Price & Add Action */}
      <div className="px-4 pb-4 pt-0 flex items-center justify-between">
        <span className="text-base font-bold text-charcoal tabular-nums">
          ${dish.price.toFixed(2)}
        </span>

        <motion.button
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.02 }}
          type="button"
          onClick={() => onAdd(dish)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover active:bg-primary-dark text-cream px-3.5 py-2 rounded-lg shadow-warm-sm hover:shadow-warm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[38px]"
          aria-label={`Add ${dish.name} to order bag for $${dish.price.toFixed(2)}`}
        >
          <Plus size={14} />
          <span>Add</span>
        </motion.button>
      </div>
    </motion.article>
  );
};
