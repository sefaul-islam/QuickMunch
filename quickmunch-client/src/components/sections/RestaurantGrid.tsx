import React from 'react';
import { SlidersHorizontal, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react';
import type { RestaurantResponse } from '../../api/types/restaurant';
import type { SortOption } from '../../types';
import { RestaurantCard } from '../food/RestaurantCard';

export interface RestaurantGridProps {
  restaurants: RestaurantResponse[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  favoriteIds?: string[];
  onToggleFavorite?: (restaurant: RestaurantResponse) => void;
  openOnly?: boolean;
  onToggleOpenOnly?: () => void;
  searchQuery: string;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSelectRestaurant: (restaurant: RestaurantResponse) => void;
  onResetFilters: () => void;
}

export const RestaurantGrid: React.FC<RestaurantGridProps> = ({
  restaurants,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  favoriteIds,
  onToggleFavorite,
  openOnly = false,
  onToggleOpenOnly,
  searchQuery,
  sortBy,
  onSortChange,
  onSelectRestaurant,
  onResetFilters,
}) => {
  return (
    <section id="kitchens" className="w-full py-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Minimal & Functional */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Popular Kitchens
            </h2>
            {!isLoading && !isError && (
              <span className="text-xs text-charcoal-muted font-medium tabular-nums">
                ({restaurants.length})
              </span>
            )}

            {onToggleOpenOnly && (
              <button
                type="button"
                onClick={onToggleOpenOnly}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  openOnly
                    ? 'bg-primary text-cream border-primary shadow-warm-sm'
                    : 'bg-white text-charcoal border-cream-border hover:bg-cream-surface'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    openOnly ? 'bg-emerald-300' : 'bg-emerald-500'
                  }`}
                />
                <span>Open Now</span>
              </button>
            )}
          </div>

          {/* Clean Sort Tabs */}
          <div className="inline-flex self-start sm:self-auto bg-white rounded-lg border border-cream-border p-1 shadow-warm-sm text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSortChange('default')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'default'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => onSortChange('open')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'open'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Open First
            </button>
            <button
              type="button"
              onClick={() => onSortChange('name')}
              className={`px-3.5 py-2 min-h-[38px] rounded-md transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'name'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Name A–Z
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

        {/* Loading, Error, Empty, or Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm animate-pulse"
              >
                <div className="aspect-[16/10] bg-cream-border/40" />
                <div className="p-4 space-y-2.5">
                  <div className="h-5 bg-cream-border/40 rounded w-2/3" />
                  <div className="h-3.5 bg-cream-border/30 rounded w-full" />
                  <div className="h-3 bg-cream-border/25 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-rose-200 p-8 shadow-warm-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 mx-auto flex items-center justify-center text-rose-700">
              <AlertCircle size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Unable to load kitchens
            </h3>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              {errorMessage || 'Could not retrieve restaurants from the server. Please try again.'}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-primary text-cream text-xs font-semibold rounded-lg shadow-warm-sm hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-cream-border p-8 shadow-warm-sm">
            <div className="w-12 h-12 rounded-full bg-cream mx-auto flex items-center justify-center text-charcoal-muted mb-3">
              <SlidersHorizontal size={22} />
            </div>
            <h3 className="font-serif text-lg font-bold text-charcoal">
              No kitchens found
            </h3>
            <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
              {openOnly || searchQuery
                ? 'Try adjusting your search query or clearing active filters.'
                : 'No kitchens are currently listed.'}
            </p>
            {(openOnly || searchQuery) && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 px-4 py-2 bg-primary text-cream text-xs font-semibold rounded-lg shadow-warm-sm hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Show All Kitchens
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFavorite={favoriteIds?.includes(String(restaurant.id))}
                onToggleFavorite={
                  onToggleFavorite ? () => onToggleFavorite(restaurant) : undefined
                }
                onSelect={onSelectRestaurant}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
