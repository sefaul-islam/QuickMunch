import React, { useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ChevronRight,
  SlidersHorizontal,
  Sparkles,
  ArrowDownAZ,
  Power,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useRestaurantsQuery } from '../hooks/queries/useRestaurantQueries';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import type { SortOption } from '../types';

export const RestaurantListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { favoriteRestaurantIds, toggleFavorite } = useCart();

  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRestaurantsQuery();

  const searchQuery = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') === 'open' ? 'open' : 'all';
  const rawSort = searchParams.get('sort');
  const sortBy: SortOption =
    rawSort === 'open' || rawSort === 'name' ? rawSort : 'default';

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'default') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (val: string) => {
    updateParam('q', val.trim() ? val : null);
  };

  const handleStatusSelect = (status: 'all' | 'open') => {
    updateParam('status', status === 'open' ? 'open' : null);
  };

  const handleSortSelect = (sort: SortOption) => {
    updateParam('sort', sort);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const activeRestaurants = useMemo(
    () => restaurants.filter((r) => r.isActive !== false),
    [restaurants],
  );

  // Filter and sort logic on real backend restaurants
  const filteredRestaurants = useMemo(() => {
    let list = [...activeRestaurants];

    if (statusFilter === 'open') {
      list = list.filter((r) => r.isOpen);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)),
      );
    }

    switch (sortBy) {
      case 'open':
        list.sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'default':
      default:
        break;
    }

    return list;
  }, [activeRestaurants, statusFilter, searchQuery, sortBy]);

  const openCount = useMemo(
    () => filteredRestaurants.filter((r) => r.isOpen).length,
    [filteredRestaurants],
  );

  const hasActiveFilters = statusFilter === 'open' || Boolean(searchQuery);

  return (
    <div className="py-6 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-charcoal-muted">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <ChevronRight size={12} className="text-charcoal-faint" />
        <span className="font-semibold text-charcoal">Artisan Kitchens</span>
      </nav>

      {/* Header Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cream-border/60 pb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-terracotta block mb-1">
            Curated Discovery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal tracking-tight">
            Artisan Kitchens
          </h1>
          <p className="mt-2 text-sm sm:text-base text-charcoal-muted max-w-2xl leading-relaxed">
            Independent partner kitchens preparing seasonal, small-batch menus for single-courier dispatch.
          </p>
        </div>

        {/* Kitchen count badge */}
        {!isLoading && !isError && (
          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-charcoal bg-white/80 border border-cream-border px-3.5 py-2 rounded-full shadow-warm-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {openCount} {openCount === 1 ? 'kitchen' : 'kitchens'} open now
            </span>
          </div>
        )}
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="space-y-4">
        {/* Top controls: In-page search + Sort selector */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by kitchen name, address, or description..."
              className="w-full bg-white text-sm text-charcoal placeholder:text-charcoal-faint border border-cream-border focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl py-2.5 pl-10 pr-9 outline-none transition-all shadow-warm-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal p-1 cursor-pointer rounded"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Sort tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-charcoal-muted mr-1">
              <SlidersHorizontal size={13} />
              <span>Sort:</span>
            </span>

            <button
              type="button"
              onClick={() => handleSortSelect('default')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'default'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <Sparkles size={12} />
              <span>Featured</span>
            </button>

            <button
              type="button"
              onClick={() => handleSortSelect('open')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'open'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <Power size={12} />
              <span>Open First</span>
            </button>

            <button
              type="button"
              onClick={() => handleSortSelect('name')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'name'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <ArrowDownAZ size={12} />
              <span>Name A–Z</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => handleStatusSelect('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              statusFilter === 'all'
                ? 'bg-charcoal text-cream shadow-warm-sm'
                : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
            }`}
          >
            All Kitchens
          </button>

          <button
            type="button"
            onClick={() => handleStatusSelect(statusFilter === 'open' ? 'all' : 'open')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              statusFilter === 'open'
                ? 'bg-primary text-cream shadow-warm-sm'
                : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                statusFilter === 'open' ? 'bg-emerald-300' : 'bg-emerald-500'
              }`}
            />
            <span>Open Now</span>
          </button>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 pt-1 text-xs text-charcoal-muted">
            <span className="font-semibold text-charcoal">Active filters:</span>
            {statusFilter === 'open' && (
              <span className="inline-flex items-center gap-1 bg-white border border-cream-border px-2.5 py-1 rounded-full">
                <span>Open Now</span>
                <button
                  type="button"
                  onClick={() => handleStatusSelect('all')}
                  className="hover:text-terracotta cursor-pointer"
                  aria-label="Remove open status filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white border border-cream-border px-2.5 py-1 rounded-full">
                <span>"{searchQuery}"</span>
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="hover:text-terracotta cursor-pointer"
                  aria-label="Remove search filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-terracotta font-semibold hover:underline cursor-pointer ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading, Error, Empty, or Kitchens Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
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
        <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center max-w-md mx-auto my-12 shadow-warm-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">Unable to load kitchens</h2>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            {error?.message || 'We could not connect to the restaurant service. Please try again.'}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => void refetch()}
              leftIcon={<RefreshCw size={15} />}
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={favoriteRestaurantIds.includes(String(restaurant.id))}
              onToggleFavorite={() => toggleFavorite(restaurant.id, restaurant.name)}
              onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-border p-12 text-center max-w-md mx-auto my-12 shadow-warm-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary-surface text-primary mx-auto flex items-center justify-center">
            <Search size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">No kitchens found</h2>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            {hasActiveFilters
              ? "We couldn't find any partner kitchens matching your current filters. Try resetting the filters or searching for something else."
              : 'No partner kitchens are currently registered.'}
          </p>
          {hasActiveFilters && (
            <div className="pt-2">
              <Button variant="primary" onClick={handleResetFilters}>
                Reset all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
