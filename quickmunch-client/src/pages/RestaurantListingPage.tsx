import React, { useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, X, ChevronRight, SlidersHorizontal, Sparkles, Star, Clock, CircleDollarSign } from 'lucide-react';
import { RESTAURANTS, CATEGORIES } from '../data/mockData';
import { RestaurantCard } from '../components/food/RestaurantCard';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

type SortKey = 'curated' | 'rating' | 'prepTime' | 'deliveryFee';

export const RestaurantListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { favoriteRestaurantIds, toggleFavorite, addToCart } = useCart();

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sortBy = (searchParams.get('sort') as SortKey) || 'curated';

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'curated') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (val: string) => {
    updateParam('q', val.trim() ? val : null);
  };

  const handleCategorySelect = (catId: string) => {
    updateParam('category', catId === selectedCategory ? null : catId);
  };

  const handleSortSelect = (sort: SortKey) => {
    updateParam('sort', sort);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  // Filter and sort logic
  const filteredRestaurants = useMemo(() => {
    let list = [...RESTAURANTS];

    // Filter by category
    if (selectedCategory !== 'all') {
      const catObj = CATEGORIES.find((c) => c.id === selectedCategory);
      if (catObj) {
        list = list.filter(
          (r) =>
            r.cuisine.toLowerCase() === catObj.name.toLowerCase() ||
            r.cuisine.toLowerCase().includes(selectedCategory) ||
            r.dietaryTags.some((t) => t.toLowerCase().includes(selectedCategory))
        );
      }
    }

    // Filter by search query (name, cuisine, neighborhood, tagline, dish names)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.neighborhood.toLowerCase().includes(q) ||
          r.tagline.toLowerCase().includes(q) ||
          r.dishes.some(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.description.toLowerCase().includes(q)
          )
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'prepTime':
        list.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime));
        break;
      case 'deliveryFee':
        list.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      case 'curated':
      default:
        // Keep default curated order
        break;
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

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
        <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-charcoal bg-white/80 border border-cream-border px-3.5 py-2 rounded-full shadow-warm-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'kitchen' : 'kitchens'} open now</span>
        </div>
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
              placeholder="Search by kitchen, cuisine, or specific dish..."
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
              onClick={() => handleSortSelect('curated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'curated'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <Sparkles size={12} />
              <span>Curated</span>
            </button>

            <button
              type="button"
              onClick={() => handleSortSelect('rating')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'rating'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <Star size={12} className={sortBy === 'rating' ? 'fill-cream' : 'text-terracotta fill-terracotta'} />
              <span>Highest Rated</span>
            </button>

            <button
              type="button"
              onClick={() => handleSortSelect('prepTime')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'prepTime'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <Clock size={12} />
              <span>Fastest</span>
            </button>

            <button
              type="button"
              onClick={() => handleSortSelect('deliveryFee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                sortBy === 'deliveryFee'
                  ? 'bg-primary text-cream shadow-warm-sm'
                  : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
              }`}
            >
              <CircleDollarSign size={12} />
              <span>Lowest Fee</span>
            </button>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          <button
            type="button"
            onClick={() => handleCategorySelect('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              selectedCategory === 'all'
                ? 'bg-charcoal text-cream shadow-warm-sm'
                : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
            }`}
          >
            All Cuisines
          </button>

          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isSelected
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary (if any applied) */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center flex-wrap gap-2 pt-1 text-xs text-charcoal-muted">
            <span className="font-semibold text-charcoal">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white border border-cream-border px-2.5 py-1 rounded-full">
                <span>{activeCategoryObj?.name || selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className="hover:text-terracotta cursor-pointer"
                  aria-label="Remove category filter"
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

      {/* Kitchens Grid or Empty State */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={favoriteRestaurantIds.includes(restaurant.id)}
              onToggleFavorite={() => toggleFavorite(restaurant.id)}
              onQuickAdd={(dish, rest) => addToCart(dish, rest)}
              onSelect={() => navigate(`/restaurants/${restaurant.id}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-cream-border p-12 text-center max-w-md mx-auto my-12 shadow-warm-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary-surface text-primary mx-auto flex items-center justify-center">
            <Search size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal">No kitchens found</h2>
          <p className="text-sm text-charcoal-muted leading-relaxed">
            We couldn't find any partner kitchens matching your current filters. Try resetting the filters or searching for something else.
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={handleResetFilters}>
              Reset all filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
