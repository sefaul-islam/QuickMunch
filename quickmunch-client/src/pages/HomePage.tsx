import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useRestaurantsQuery } from '../hooks/queries/useRestaurantQueries';
import { HeroSection } from '../components/sections/HeroSection';
import { RestaurantGrid } from '../components/sections/RestaurantGrid';
import { PopularDishes } from '../components/sections/PopularDishes';
import { PromoBanner } from '../components/sections/PromoBanner';
import { useCart } from '../context/CartContext';
import type { SortOption } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, favoriteRestaurantIds, toggleFavorite } = useCart();

  const {
    data: restaurants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRestaurantsQuery();

  const [openOnly, setOpenOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const activeRestaurants = useMemo(
    () => restaurants.filter((r) => r.isActive !== false),
    [restaurants],
  );

  // Filter and sort backend restaurants
  const filteredRestaurants = useMemo(() => {
    let list = [...activeRestaurants];

    if (openOnly) {
      list = list.filter((r) => r.isOpen);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.address.toLowerCase().includes(query) ||
          (r.description && r.description.toLowerCase().includes(query)),
      );
    }

    if (sortBy === 'open') {
      list.sort((a, b) => Number(b.isOpen) - Number(a.isOpen));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [activeRestaurants, openOnly, searchQuery, sortBy]);

  return (
    <div>
      {/* Hero Section (Curated Showcase) */}
      <HeroSection
        onExploreClick={() => navigate('/restaurants')}
        onShowcaseClick={() => navigate('/restaurants')}
      />

      {/* Partner Kitchens from Backend */}
      <section id="kitchens" className="relative">
        <RestaurantGrid
          restaurants={filteredRestaurants}
          isLoading={isLoading}
          isError={isError}
          errorMessage={error?.message}
          onRetry={() => void refetch()}
          favoriteIds={favoriteRestaurantIds}
          onToggleFavorite={(restaurant) => toggleFavorite(restaurant.id, restaurant.name)}
          openOnly={openOnly}
          onToggleOpenOnly={() => setOpenOnly((prev) => !prev)}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectRestaurant={(restaurant) => navigate(`/restaurants/${restaurant.id}`)}
          onResetFilters={() => {
            setOpenOnly(false);
            setSearchQuery('');
          }}
        />

        {/* View All Kitchens link at bottom of grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-12 flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-cream-surface border border-cream-border text-sm font-semibold text-charcoal shadow-warm-sm hover:shadow-warm transition-all cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span>
              {activeRestaurants.length > 0
                ? `Explore all ${activeRestaurants.length} artisan kitchens`
                : 'Explore all artisan kitchens'}
            </span>
            <ArrowRight size={16} className="text-terracotta group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Featured Dishes from Backend */}
      <section id="dishes">
        <PopularDishes
          restaurants={activeRestaurants}
          isLoadingRestaurants={isLoading}
          onAddToCart={addToCart}
        />
      </section>

      {/* Direct Courier Promo */}
      <section id="dispatch">
        <PromoBanner onCtaClick={() => navigate('/restaurants')} />
      </section>
    </div>
  );
};
