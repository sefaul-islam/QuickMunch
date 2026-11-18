import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Restaurant, Dish, CartItem, SortOption, DeliveryAddress } from './types';
import { RESTAURANTS, CATEGORIES, DELIVERY_ADDRESSES } from './data/mockData';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { CategoryNav } from './components/sections/CategoryNav';
import { FeaturedSpotlight } from './components/sections/FeaturedSpotlight';
import { PopularDishes } from './components/sections/PopularDishes';
import { PromoBanner } from './components/sections/PromoBanner';
import { RestaurantGrid } from './components/sections/RestaurantGrid';
import { CartDrawer } from './components/food/CartDrawer';
import { LocationModal } from './components/food/LocationModal';
import { RestaurantModal } from './components/food/RestaurantModal';

export function App() {
  // Navigation & Location state
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress>(DELIVERY_ADDRESSES[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('curated');

  // Restaurant modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Cart state (with 1 initial artisanal dish to show bag affordance immediately)
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      dish: RESTAURANTS[0].dishes[0],
      restaurantId: RESTAURANTS[0].id,
      restaurantName: RESTAURANTS[0].name,
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Shared favorites state across FeaturedSpotlight and RestaurantGrid
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState<string[]>(['sylvan-hearth']);

  const handleToggleFavorite = (restaurantId: string) => {
    const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);
    const name = restaurant?.name || 'Kitchen';
    setFavoriteRestaurantIds((prev) => {
      if (prev.includes(restaurantId)) {
        showToast(`Removed ${name} from saved kitchens`);
        return prev.filter((id) => id !== restaurantId);
      } else {
        showToast(`Saved ${name} to favorites`);
        return [...prev, restaurantId];
      }
    });
  };

  // Filtered and sorted restaurants
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

    // Filter by search query
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

    // Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'prepTime') {
      list.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime));
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart actions
  const handleAddToCart = (dish: Dish, restaurant?: Restaurant) => {
    const restId = restaurant?.id || RESTAURANTS[0].id;
    const restName = restaurant?.name || RESTAURANTS[0].name;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          dish,
          restaurantId: restId,
          restaurantName: restName,
          quantity: 1,
        },
      ];
    });

    showToast(`Added ${dish.name} to order bag`);
  };

  const handleUpdateQuantity = (dishId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.dish.id === dishId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (dishId: string) => {
    setCartItems((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const selectedCategoryName = CATEGORIES.find((c) => c.id === selectedCategory)?.name;

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans selection:bg-primary selection:text-cream">
      {/* 1. Premium Sticky Navigation */}
      <Navbar
        currentAddress={currentAddress}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        cartItems={cartItems}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onAccountClick={() => showToast('QuickMunch Member: Preview profile active')}
      />

      {/* Mobile Drawer Menu */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentAddress={currentAddress}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Flow: 7 Homepage Sections */}
      <main className="flex-1">
        {/* 2. Editorial Hero with Asymmetric Food Collage */}
        <HeroSection
          currentAddress={currentAddress}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onExploreClick={() => handleScrollToSection('kitchens')}
          featuredRestaurant={RESTAURANTS[0]}
          onQuickAdd={handleAddToCart}
          onSelectDetailKitchen={() =>
            setSelectedRestaurant(RESTAURANTS.find((r) => r.id === 'osteria-alba') || null)
          }
        />

        {/* 3. Photographic Category Navigation */}
        <CategoryNav
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
          }}
        />

        {/* 4. Recommended Kitchens & Artisans Grid (directly under category scroller!) */}
        <RestaurantGrid
          restaurants={filteredRestaurants}
          favoriteIds={favoriteRestaurantIds}
          onToggleFavorite={handleToggleFavorite}
          selectedCategory={selectedCategory}
          categoryName={selectedCategoryName}
          onClearCategory={() => setSelectedCategory('all')}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelectRestaurant={setSelectedRestaurant}
          onQuickAdd={handleAddToCart}
          onResetFilters={handleResetFilters}
        />

        {/* 5. Featured Kitchens Spotlight (Magazine Asymmetric Layout) */}
        <FeaturedSpotlight
          restaurants={RESTAURANTS}
          favoriteIds={favoriteRestaurantIds}
          onToggleFavorite={handleToggleFavorite}
          onSelectRestaurant={setSelectedRestaurant}
          onQuickAdd={handleAddToCart}
        />

        {/* 6. Popular Dishes Showcase (Dish-First Macro Plating) */}
        <PopularDishes onAddToCart={handleAddToCart} />

        {/* 7. Promotional Banner (Soft Sage & Forest Green Feature) */}
        <PromoBanner onCtaClick={() => handleScrollToSection('kitchens')} />
      </main>

      {/* 8. Polished Editorial Footer */}
      <Footer />

      {/* Slide-over Dining Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => {
          showToast('Order confirmed for single-courier dispatch (Mock)');
          setCartItems([]);
          setIsCartOpen(false);
        }}
      />

      {/* Delivery Address Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        addresses={DELIVERY_ADDRESSES}
        currentAddress={currentAddress}
        onSelectAddress={setCurrentAddress}
      />

      {/* Restaurant Full Menu Modal */}
      <RestaurantModal
        restaurant={selectedRestaurant}
        isOpen={Boolean(selectedRestaurant)}
        onClose={() => setSelectedRestaurant(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Floating Confirmation Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-primary text-cream text-xs font-semibold rounded-xl shadow-editorial border border-primary-light/40"
          >
            <div className="w-5 h-5 rounded-full bg-cream text-primary flex items-center justify-center shrink-0">
              <Check size={12} strokeWidth={3} />
            </div>
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="ml-2 text-terracotta underline font-bold hover:text-cream cursor-pointer"
            >
              View Bag
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
