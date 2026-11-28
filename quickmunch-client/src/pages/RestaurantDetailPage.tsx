import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Phone,
  ChevronRight,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  UtensilsCrossed,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  useRestaurantDetailQuery,
  useCategoriesQuery,
  useFoodItemsQuery,
} from '../hooks/queries/useRestaurantQueries';
import { ApiError } from '../api/apiError';
import { useCart } from '../context/CartContext';
import { useImageFade } from '../hooks/useImageFade';
import {
  onRestaurantImgError,
  onFoodImgError,
  resolveImageUrl,
  resolveFoodImageUrl,
} from '../lib/imageUtils';
import type { Dish } from '../types';
import type { FoodItemResponse } from '../api/types/restaurant';

interface MenuSection {
  id: string;
  title: string;
  items: FoodItemResponse[];
}

export const RestaurantDetailPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const coverFade = useImageFade('duration-700');

  const {
    cartItems,
    addToCart,
    updateQuantity,
    setIsCartOpen,
    totalCartCount,
    cartSubtotal,
    favoriteRestaurantIds,
    toggleFavorite,
  } = useCart();

  const restaurantQuery = useRestaurantDetailQuery(restaurantId);
  const categoriesQuery = useCategoriesQuery(restaurantId);
  const foodsQuery = useFoodItemsQuery(restaurantId);

  const restaurant = restaurantQuery.data;
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);
  const foodItems = useMemo(() => foodsQuery.data ?? [], [foodsQuery.data]);

  // Group menu items by backend categories, placing uncategorized dishes into "Menu" / "General"
  const menuSections = useMemo<MenuSection[]>(() => {
    const sections: MenuSection[] = [];
    const assignedFoodIds = new Set<number>();

    categories.forEach((cat) => {
      const items = foodItems.filter((item) => item.categoryId === cat.id);
      if (items.length > 0) {
        items.forEach((item) => assignedFoodIds.add(item.id));
        sections.push({
          id: `category-${cat.id}`,
          title: cat.name,
          items,
        });
      }
    });

    // Any remaining dishes whose categoryId wasn't matched or is null
    const remaining = foodItems.filter((item) => !assignedFoodIds.has(item.id));
    if (remaining.length > 0) {
      // Group remaining by caetegoryName if present, else "General"
      const byName = new Map<string, FoodItemResponse[]>();
      remaining.forEach((item) => {
        const label = item.caetegoryName?.trim() || 'General';
        const existing = byName.get(label) ?? [];
        existing.push(item);
        byName.set(label, existing);
      });

      byName.forEach((items, label) => {
        sections.push({
          id: `category-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: label,
          items,
        });
      });
    }

    return sections;
  }, [categories, foodItems]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const activeSectionId =
    selectedSectionId || (menuSections.length > 0 ? menuSections[0].id : '');
  const categoryNavRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to sync active category on scroll
  useEffect(() => {
    if (menuSections.length === 0) return;

    const observers: IntersectionObserver[] = [];
    menuSections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setSelectedSectionId(section.id);
            }
          });
        },
        { rootMargin: '-140px 0px -70% 0px' },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [menuSections]);

  const handleCategoryClick = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Loading state
  if (restaurantQuery.isLoading) {
    return (
      <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-pulse">
        <div className="h-4 w-48 bg-cream-border/40 rounded" />
        <div className="aspect-[21/9] min-h-[260px] rounded-3xl bg-cream-border/40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="h-36 bg-white rounded-2xl border border-cream-border" />
          ))}
        </div>
      </div>
    );
  }

  const isNotFound =
    !restaurantId ||
    (restaurantQuery.error instanceof ApiError && restaurantQuery.error.status === 404);

  // Error state (non-404 API failure — never fall back to fake data)
  if (restaurantQuery.isError && !isNotFound) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-700 mx-auto flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Unable to Load Kitchen</h1>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          {restaurantQuery.error?.message ||
            'An error occurred while fetching this kitchen from the server.'}
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => void restaurantQuery.refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-cream font-semibold text-sm shadow-warm hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-charcoal border border-cream-border font-semibold text-sm hover:bg-cream-surface transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>All Kitchens</span>
          </button>
        </div>
      </div>
    );
  }

  // 404 Not Found fallback
  if (!restaurant) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary-surface text-primary mx-auto flex items-center justify-center">
          <UtensilsCrossed size={28} />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Kitchen Not Found</h1>
        <p className="text-sm text-charcoal-muted leading-relaxed">
          The artisan kitchen you are looking for is currently unavailable or may have relocated.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/restaurants')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-cream font-semibold text-sm shadow-warm hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Browse All Kitchens</span>
          </button>
        </div>
      </div>
    );
  }

  const restaurantIdStr = String(restaurant.id);
  const isFavorite = favoriteRestaurantIds.includes(restaurantIdStr);
  const resolvedCoverImage = resolveImageUrl(restaurant.imageUrl);

  return (
    <div className="pb-24">
      {/* 1. Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-charcoal-muted mb-4">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="text-charcoal-faint" />
          <Link to="/restaurants" className="hover:text-primary transition-colors">
            Kitchens
          </Link>
          <ChevronRight size={12} className="text-charcoal-faint" />
          <span className="font-semibold text-charcoal truncate max-w-[200px] sm:max-w-none">
            {restaurant.name}
          </span>
        </nav>
      </div>

      {/* Hero Banner with Restaurant Cover Image & Metadata */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-cream-dark border border-cream-border shadow-warm">
          {/* Cover Media */}
          <div className="relative aspect-[21/9] min-h-[260px] sm:min-h-[340px] w-full overflow-hidden">
            <img
              src={resolvedCoverImage}
              alt={restaurant.name}
              className={`w-full h-full object-cover ${coverFade.imgClassName}`}
              onLoad={coverFade.onLoad}
              onError={onRestaurantImgError}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/60 via-transparent to-transparent pointer-events-none" />

            {/* Favorite toggle button */}
            <motion.button
              whileTap={{ scale: 1.15 }}
              whileHover={{ scale: 1.05 }}
              type="button"
              onClick={() => toggleFavorite(restaurant.id, restaurant.name)}
              className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-3 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isFavorite
                  ? 'bg-terracotta text-cream'
                  : 'bg-white/85 text-charcoal hover:bg-white'
              }`}
              aria-label={
                isFavorite
                  ? `Remove ${restaurant.name} from saved kitchens`
                  : `Save ${restaurant.name} to favorites`
              }
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </motion.button>

            {/* Content overlay inside cover */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-cream space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase ${
                    restaurant.isOpen
                      ? 'bg-emerald-600/90 text-white'
                      : 'bg-charcoal/80 text-cream'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      restaurant.isOpen ? 'bg-white animate-pulse' : 'bg-charcoal-faint'
                    }`}
                  />
                  {restaurant.isOpen ? 'Open for Orders' : 'Currently Closed'}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cream tracking-tight drop-shadow-sm">
                {restaurant.name}
              </h1>

              {restaurant.description && (
                <p className="text-xs sm:text-sm text-cream/90 max-w-2xl font-light">
                  {restaurant.description}
                </p>
              )}

              {/* Address & Phone Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 text-xs text-cream/95">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin size={14} className="text-terracotta" />
                  <span>{restaurant.address}</span>
                </div>

                {restaurant.phoneNumber && (
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-cream/80" />
                    <span>{restaurant.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-banner */}
          <div className="bg-cream-surface/90 px-6 py-3.5 border-t border-cream-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-charcoal-muted font-semibold">Menu Offerings:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-cream-border text-charcoal font-medium text-[11px]">
                {foodItems.length} {foodItems.length === 1 ? 'dish' : 'dishes'}
              </span>
              {menuSections.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-white border border-cream-border text-charcoal font-medium text-[11px]">
                  {menuSections.length} {menuSections.length === 1 ? 'category' : 'categories'}
                </span>
              )}
            </div>

            <div className="text-primary font-semibold text-[11px] sm:text-xs">
              {restaurant.isOpen
                ? 'Accepting orders for direct single-courier delivery.'
                : 'This kitchen is currently closed for new orders.'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sticky Category Navigation Sub-bar */}
      {menuSections.length > 0 && (
        <div
          ref={categoryNavRef}
          className="sticky top-18 z-30 bg-cream/95 backdrop-blur-md border-b border-cream-border/80 shadow-warm-sm mt-6"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
              {menuSections.map((section) => {
                const isCurrent = activeSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleCategoryClick(section.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isCurrent
                        ? 'bg-primary text-cream shadow-warm-sm'
                        : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
                    }`}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Menu Categories & Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {foodsQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="h-36 bg-white rounded-2xl border border-cream-border" />
            ))}
          </div>
        ) : foodsQuery.isError ? (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3 max-w-md mx-auto">
            <AlertCircle size={24} className="mx-auto text-rose-700" />
            <h2 className="font-serif text-xl font-bold text-charcoal">Unable to load menu</h2>
            <p className="text-xs text-charcoal-muted">
              {foodsQuery.error?.message || 'Failed to retrieve dishes for this kitchen.'}
            </p>
            <button
              type="button"
              onClick={() => void foodsQuery.refetch()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-cream text-xs font-semibold cursor-pointer hover:bg-primary-hover"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        ) : menuSections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-cream-border p-12 text-center space-y-2 max-w-md mx-auto">
            <UtensilsCrossed size={24} className="mx-auto text-charcoal-faint" />
            <h2 className="font-serif text-xl font-bold text-charcoal">No menu items yet</h2>
            <p className="text-xs text-charcoal-muted">
              This kitchen has not published dishes to its menu yet.
            </p>
          </div>
        ) : (
          menuSections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-36 space-y-4">
              <div className="flex items-baseline justify-between border-b border-cream-border/80 pb-3">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                  {section.title}
                </h2>
                <span className="text-xs text-charcoal-muted font-medium">
                  {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {section.items.map((food) => (
                  <MenuItemCard
                    key={food.id}
                    foodItem={food}
                    restaurant={{ id: restaurantIdStr, name: restaurant.name }}
                    cartItems={cartItems}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* 4. Floating Mobile Order Bag Trigger */}
      {totalCartCount > 0 && (
        <aside
          aria-label="Order bag summary"
          className="fixed bottom-6 left-4 right-4 z-40 sm:hidden"
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-primary text-cream rounded-2xl shadow-editorial font-semibold text-sm cursor-pointer border border-primary-light/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center text-xs font-bold text-cream">
                {totalCartCount}
              </div>
              <span>View Order Bag</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tabular-nums">${cartSubtotal.toFixed(2)}</span>
              <ShoppingBag size={16} />
            </div>
          </motion.button>
        </aside>
      )}
    </div>
  );
};

// Sub-component: MenuItemCard
interface MenuItemCardProps {
  foodItem: FoodItemResponse;
  restaurant: { id: string; name: string };
  cartItems: { dish: Dish; quantity: number }[];
  onAddToCart: (dish: Dish, restaurant: { id: string; name: string }) => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  foodItem,
  restaurant,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const dishFade = useImageFade('duration-500');
  const dishId = String(foodItem.id);
  const cartItem = cartItems.find((item) => item.dish.id === dishId);
  const quantity = cartItem?.quantity || 0;
  const price = Number(foodItem.price);

  const dishPayload: Dish = {
    id: dishId,
    name: foodItem.name,
    description: foodItem.description || '',
    price,
    image: foodItem.imageUrl || '',
    category: foodItem.caetegoryName || undefined,
  };

  return (
    <article
      aria-label={`${foodItem.name}, $${price.toFixed(2)}`}
      className="group bg-white rounded-2xl border border-cream-border p-4 flex gap-4 hover:shadow-warm transition-all duration-200"
    >
      {/* Left: Dish Information */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          {/* Availability / Category Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {!foodItem.isAvailable && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Sold Out
              </span>
            )}
            {foodItem.caetegoryName && (
              <span className="text-[10px] font-medium text-charcoal-muted bg-cream-surface px-2 py-0.5 rounded-full">
                {foodItem.caetegoryName}
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug">
            {foodItem.name}
          </h3>

          {/* Short Description */}
          {foodItem.description && (
            <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
              {foodItem.description}
            </p>
          )}
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-cream-border/60">
          <span className="font-bold text-sm sm:text-base text-charcoal tabular-nums">
            ${price.toFixed(2)}
          </span>

          {/* Add or Quantity Adjuster */}
          {quantity === 0 ? (
            <button
              type="button"
              disabled={!foodItem.isAvailable}
              onClick={() => onAddToCart(dishPayload, restaurant)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream hover:bg-primary text-charcoal hover:text-cream disabled:opacity-50 disabled:cursor-not-allowed border border-cream-border hover:border-primary text-xs font-semibold transition-all cursor-pointer shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Add ${foodItem.name} to order bag for $${price.toFixed(2)}`}
            >
              <Plus size={14} />
              <span>{foodItem.isAvailable ? 'Add' : 'Unavailable'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-primary text-cream rounded-full px-2 py-1 shadow-warm-sm">
              <button
                type="button"
                onClick={() => onUpdateQuantity(dishId, -1)}
                className="w-6 h-6 rounded-full hover:bg-primary-hover flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none"
                aria-label={`Decrease quantity of ${foodItem.name}`}
              >
                <Minus size={13} />
              </button>
              <span className="text-xs font-bold tabular-nums min-w-[14px] text-center" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(dishId, 1)}
                className="w-6 h-6 rounded-full hover:bg-primary-hover flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none"
                aria-label={`Increase quantity of ${foodItem.name}`}
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Macro Dish Photo */}
      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-cream-dark shrink-0 relative">
        <img
          src={resolveFoodImageUrl(foodItem.imageUrl)}
          alt={foodItem.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${dishFade.imgClassName}`}
          onLoad={dishFade.onLoad}
          onError={onFoodImgError}
        />
      </div>
    </article>
  );
};
