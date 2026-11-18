import React from 'react';
import { Plus, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { POPULAR_DISHES } from '../../data/mockData';
import type { Dish, Restaurant, PopularDishItem } from '../../types';
import { RESTAURANTS } from '../../data/mockData';
import { Badge } from '../ui/Badge';

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
    <section id="dishes" className="w-full py-14 bg-cream-card/50 border-y border-cream-border/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              Signature Dishes of Lower Manhattan
            </h2>
            <p className="text-sm text-charcoal-muted mt-1 max-w-xl">
              Plated culinary highlights prepared to order and delivered in dedicated single-kitchen transit.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Chef Signatures
          </span>
        </div>

        {/* 3-Column Dish Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {POPULAR_DISHES.map((dish) => (
            <motion.article
              key={dish.id}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm hover:shadow-editorial transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Visual Macro Frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-cream-dark">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                  {dish.badge && (
                    <span className="absolute top-3 left-3 bg-primary text-cream text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-warm-sm border border-primary-light/40">
                      {dish.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-charcoal text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-warm-sm">
                    <Star size={12} className="text-terracotta fill-terracotta" />
                    <span className="tabular-nums">{dish.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-[11px] font-semibold text-terracotta uppercase tracking-wider block mb-1">
                    {dish.restaurantName}
                  </span>
                  <h3 className="font-serif text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-2 line-clamp-2 leading-relaxed">
                    {dish.description}
                  </p>

                  {dish.dietary && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {dish.dietary.map((tag) => (
                        <Badge key={tag} variant="default" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Price & Add Action */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-cream-border/50 mt-2">
                <div>
                  <span className="text-[10px] text-charcoal-faint block uppercase font-bold tracking-wider">
                    Price
                  </span>
                  <span className="font-serif text-lg font-bold text-charcoal tabular-nums">
                    ${dish.price.toFixed(2)}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  type="button"
                  onClick={() => handleAdd(dish)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-hover active:bg-primary-dark text-cream px-3.5 py-2 rounded-lg shadow-warm-sm hover:shadow-warm transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus size={14} />
                  Add to Bag
                </motion.button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
