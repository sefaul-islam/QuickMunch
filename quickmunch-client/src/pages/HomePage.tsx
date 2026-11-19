import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RESTAURANTS, CATEGORIES } from '../data/mockData';
import { HeroSection } from '../components/sections/HeroSection';
import { CategoryNav } from '../components/sections/CategoryNav';
import { RestaurantGrid } from '../components/sections/RestaurantGrid';
import { PopularDishes } from '../components/sections/PopularDishes';
import { PromoBanner } from '../components/sections/PromoBanner';
import { useCart } from '../context/CartContext';
import type { SortOption } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, favoriteRestaurantIds, toggleFavorite } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('curated');

  // Filter restaurants on homepage
  const filteredRestaurants = useMemo(() => {
    let list = [...RESTAURANTS];

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

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          r.neighborhood.toLowerCase().includes(query) ||
          r.tagline.toLowerCase().includes(query) ||
          r.dishes.some(
            (d) =>
              d.name.toLowerCase().includes(query) ||
              d.description.toLowerCase().includes(query)
          )
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'prepTime') {
      list.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  const selectedCategoryName = CATEGORIES.find((c) => c.id === selectedCategory)?.name;

  return (
    <div>
      {/* Hero Section */}
      <HeroSection
        onExploreClick={() => navigate('/restaurants')}
        onSelectDetailKitchen={() => navigate('/restaurants/osteria-alba')}
      />

      {/* Category Nav */}
      <CategoryNav
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
        }}
      />

      {/* Featured Artisan Kitchens */}
      <section id="kitchens" className="relative">
        <RestaurantGrid
          restaurants={filteredRestaurants}
          favoriteIds={favoriteRestaurantIds}
          onToggleFavorite={toggleFavorite}
          selectedCategory={selectedCategory}
          categoryName={selectedCategoryName}
          onClearCategory={() => setSelectedCategory('all')}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectRestaurant={(restaurant) => navigate(`/restaurants/${restaurant.id}`)}
          onQuickAdd={addToCart}
          onResetFilters={() => {
            setSelectedCategory('all');
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
            <span>Explore all {RESTAURANTS.length} artisan kitchens</span>
            <ArrowRight size={16} className="text-terracotta group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Popular Dishes */}
      <section id="dishes">
        <PopularDishes onAddToCart={addToCart} />
      </section>

      {/* Direct Courier Promo */}
      <section id="dispatch">
        <PromoBanner onCtaClick={() => navigate('/restaurants')} />
      </section>
    </div>
  );
};
