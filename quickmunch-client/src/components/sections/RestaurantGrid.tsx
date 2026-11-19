import React from 'react';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import type { Restaurant, SortOption } from '../../types';
import { RestaurantCard } from '../food/RestaurantCard';

export interface RestaurantGridProps {
  restaurants: Restaurant[];
  favoriteIds?: string[];
  onToggleFavorite?: (id: string) => void;
  selectedCategory?: string;
  categoryName?: string;
  onClearCategory?: () => void;
  searchQuery: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onQuickAdd: (dish: Restaurant['dishes'][0], restaurant: Restaurant) => void;
  onResetFilters: () => void;
}

export const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  restaurants,
  favoriteIds,
  onToggleFavorite,
  selectedCategory,
  categoryName,
  onClearCategory,
  searchQuery,
  sortBy,
  onSortChange,
  onSelectRestaurant,
  onQuickAdd,
  onResetFilters,
}) => {
  return (
    <section id="kitchens" className="w-full py-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Minimal & Functional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Popular Kitchens
            </h2>
            <span className="text-xs text-charcoal-muted font-medium tabular-nums">
              ({restaurants.length})
            </span>

            {selectedCategory && selectedCategory !== 'all' && categoryName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-cream shadow-warm-sm ml-1">
                {categoryName}
                {onClearCategory && (
                  <button
                    type="button"
                    onClick={onClearCategory}
                    className="hover:text-cream/70 cursor-pointer p-0.5 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream rounded"
                    aria-label="Clear category filter"
                  >
                    <X size={12} />
                  </button>
                )}
              </span>
            )}
          </div>

          {/* Clean Sort Tabs */}
          <div className="inline-flex self-start sm:self-auto bg-white rounded-lg border border-cream-border p-1 shadow-warm-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSortChange('curated')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'curated'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Curated
            </button>
            <button
              type="button"
              onClick={() => onSortChange('rating')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'rating'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Rating
            </button>
            <button
              type="button"
              onClick={() => onSortChange('prepTime')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'prepTime'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Fastest
            </button>
          </div>
        </div>

        {/* Active Search Notification */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-6 p-3 bg-white rounded-xl border border-cream-border text-xs text-charcoal shadow-warm-sm">
            <span>
              Results for: <strong className="text-primary">"{searchQuery}"</strong>
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-terracotta hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              Clear search
            </button>
          </div>
        )}

        {/* Restaurant Cards Grid */}
        {restaurants.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-cream-border p-8 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-charcoal-muted mb-3">
              <SlidersHorizontal size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              No kitchens found
            </h3>
            <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
              Try adjusting your search query or selecting another category.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-4 px-4 py-2 bg-primary text-cream text-xs font-semibold rounded-lg shadow-warm-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Show All Kitchens
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favoriteIds?.includes(restaurant.id)}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(restaurant.id) : undefined}
                onSelect={onSelectRestaurant}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
