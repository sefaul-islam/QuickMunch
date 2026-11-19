import React from 'react';
import { ArrowUpDown, SlidersHorizontal, RotateCcw, X } from 'lucide-react';
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
    <section id="kitchens" className="w-full py-12 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
                Recommended Kitchens & Artisans
              </h2>
              <span className="text-xs bg-white border border-cream-border px-2.5 py-0.5 rounded-full font-semibold text-charcoal tabular-nums shadow-warm-sm">
                {restaurants.length} available
              </span>
            </div>
            <p className="text-sm text-charcoal-muted">
              Hand-selected kitchens cooking with scratch methods, seasonal produce, and integrity.
            </p>
            {selectedCategory && selectedCategory !== 'all' && categoryName && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-charcoal-muted font-medium">Active Craft:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-cream shadow-warm-sm">
                  {categoryName}
                  {onClearCategory && (
                    <button
                      type="button"
                      onClick={onClearCategory}
                      className="hover:text-cream/70 cursor-pointer ml-0.5 p-1 min-h-[28px] min-w-[28px] inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cream rounded"
                      aria-label="Clear category filter"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-charcoal-muted font-medium flex items-center gap-1">
              <ArrowUpDown size={13} />
              Sort:
            </span>
            <div className="inline-flex bg-white rounded-lg border border-cream-border p-1 shadow-warm-sm">
              <button
                type="button"
                onClick={() => onSortChange('curated')}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  sortBy === 'curated'
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'text-charcoal hover:text-primary'
                }`}
              >
                Curated
              </button>
              <button
                type="button"
                onClick={() => onSortChange('rating')}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  sortBy === 'rating'
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'text-charcoal hover:text-primary'
                }`}
              >
                Rating
              </button>
              <button
                type="button"
                onClick={() => onSortChange('prepTime')}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  sortBy === 'prepTime'
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'text-charcoal hover:text-primary'
                }`}
              >
                Fastest
              </button>
            </div>
          </div>
        </div>

        {/* Search Feedback if active */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-6 p-3.5 bg-white rounded-xl border border-cream-border text-xs text-charcoal shadow-warm-sm">
            <span>
              Showing culinary results matching: <strong className="text-primary">"{searchQuery}"</strong>
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-terracotta hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={12} />
              Clear query
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
              No kitchens found matching your selection
            </h3>
            <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
              Try adjusting your search query, selecting another category above, or browsing all available kitchens.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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
