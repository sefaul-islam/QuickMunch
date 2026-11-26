import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Heart,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  CircleDollarSign,
  UtensilsCrossed,
} from 'lucide-react';
import { motion } from 'motion/react';
import { RESTAURANTS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useImageFade } from '../hooks/useImageFade';
import {
  onRestaurantImgError,
  onFoodImgError,
  resolveImageUrl,
  FALLBACK_FOOD_IMAGE,
} from '../lib/imageUtils';
import type { Dish } from '../types';

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

  const restaurant = useMemo(() => {
    return RESTAURANTS.find((r) => r.id === restaurantId);
  }, [restaurantId]);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!restaurant) return [];
    return Array.from(new Set(restaurant.dishes.map((d) => d.category)));
  }, [restaurant]);

  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string | null>(null);
  const activeCategory = selectedCategoryTab || (categories.length > 0 ? categories[0] : '');
  const categoryNavRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to sync active category on scroll
  useEffect(() => {
    if (categories.length === 0) return;

    const observers: IntersectionObserver[] = [];
    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setSelectedCategoryTab(cat);
            }
          });
        },
        { rootMargin: '-140px 0px -70% 0px' }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [categories]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategoryTab(cat);
    const el = document.getElementById(`category-${cat}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

  const isFavorite = favoriteRestaurantIds.includes(restaurant.id);

  return (
    <div className="pb-24">
      {/* 1. Top Breadcrumb & Cover Media Header */}
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
              src={restaurant.image}
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
              onClick={() => toggleFavorite(restaurant.id)}
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
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wider uppercase text-cream">
                  {restaurant.cuisine}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-terracotta/90 text-[11px] font-semibold text-cream">
                  {restaurant.priceRange}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-cream tracking-tight drop-shadow-sm">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-cream/90 max-w-2xl font-light">
                {restaurant.tagline}
              </p>

              {/* Badges / Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 text-xs text-cream/95">
                {/* Rating */}
                <div className="flex items-center gap-1.5 font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Star size={14} className="text-amber-300 fill-amber-300" />
                  <span className="tabular-nums">{restaurant.rating.toFixed(1)}</span>
                  <span className="text-cream/70 font-normal">({restaurant.reviewCount}+ reviews)</span>
                </div>

                {/* Prep & Transit */}
                <div className="flex items-center gap-1.5 font-semibold">
                  <Clock size={14} className="text-cream/80" />
                  <span>{restaurant.prepTime} delivery</span>
                </div>

                {/* Delivery Fee */}
                <div className="flex items-center gap-1.5 font-semibold">
                  <CircleDollarSign size={14} className="text-cream/80" />
                  <span>
                    {restaurant.deliveryFee === 0
                      ? 'Free Delivery'
                      : `$${restaurant.deliveryFee.toFixed(2)} delivery fee`}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-cream/80 font-normal">
                  <MapPin size={14} />
                  <span>{restaurant.neighborhood}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-banner: Dietary tags & Free delivery notice */}
          <div className="bg-cream-surface/90 px-6 py-3.5 border-t border-cream-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-charcoal-muted font-semibold">Kitchen Features:</span>
              {restaurant.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-white border border-cream-border text-charcoal font-medium text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="text-primary font-semibold text-[11px] sm:text-xs">
              Orders over ${restaurant.freeDeliveryThreshold} qualify for complimentary single-courier delivery.
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sticky Category Navigation Sub-bar */}
      <div
        ref={categoryNavRef}
        className="sticky top-18 z-30 bg-cream/95 backdrop-blur-md border-b border-cream-border/80 shadow-warm-sm mt-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
            {categories.map((cat) => {
              const isCurrent = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCurrent
                      ? 'bg-primary text-cream shadow-warm-sm'
                      : 'bg-white text-charcoal hover:bg-cream-surface border border-cream-border'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Menu Categories & Dishes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {categories.map((cat) => {
          const dishesInCat = restaurant.dishes.filter((d) => d.category === cat);
          return (
            <section key={cat} id={`category-${cat}`} className="scroll-mt-36 space-y-4">
              <div className="flex items-baseline justify-between border-b border-cream-border/80 pb-3">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
                  {cat}
                </h2>
                <span className="text-xs text-charcoal-muted font-medium">
                  {dishesInCat.length} {dishesInCat.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {dishesInCat.map((dish) => (
                  <MenuItemCard
                    key={dish.id}
                    dish={dish}
                    restaurant={restaurant}
                    cartItems={cartItems}
                    onAddToCart={addToCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </section>
          );
        })}
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
  dish: Dish;
  restaurant: { id: string; name: string };
  cartItems: { dish: Dish; quantity: number }[];
  onAddToCart: (dish: Dish, restaurant?: { id: string; name: string }) => void;
  onUpdateQuantity: (dishId: string, delta: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  dish,
  restaurant,
  cartItems,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const dishFade = useImageFade('duration-500');
  const cartItem = cartItems.find((item) => item.dish.id === dish.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <article
      aria-label={`${dish.name}, $${dish.price.toFixed(2)}`}
      className="group bg-white rounded-2xl border border-cream-border p-4 flex gap-4 hover:shadow-warm transition-all duration-200"
    >
      {/* Left: Dish Information */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1.5">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {dish.isSignature && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-terracotta bg-terracotta-surface px-2 py-0.5 rounded-full">
                <Sparkles size={10} />
                Signature
              </span>
            )}
            {dish.dietary?.includes('Spicy') && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                Spicy
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal group-hover:text-primary transition-colors leading-snug">
            {dish.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">
            {dish.description}
          </p>

          {/* Dietary tags */}
          {dish.dietary && dish.dietary.length > 0 && (
            <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
              {dish.dietary.map((t) => (
                <span
                  key={t}
                  className="text-[10px] text-charcoal-muted bg-cream-surface px-1.5 py-0.5 rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price & Quantity Controls */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-cream-border/60">
          <span className="font-bold text-sm sm:text-base text-charcoal tabular-nums">
            ${dish.price.toFixed(2)}
          </span>

          {/* Add or Quantity Adjuster */}
          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => onAddToCart(dish, restaurant)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cream hover:bg-primary text-charcoal hover:text-cream border border-cream-border hover:border-primary text-xs font-semibold transition-all cursor-pointer shadow-warm-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Add ${dish.name} to order bag for $${dish.price.toFixed(2)}`}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-primary text-cream rounded-full px-2 py-1 shadow-warm-sm">
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish.id, -1)}
                className="w-6 h-6 rounded-full hover:bg-primary-hover flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none"
                aria-label={`Decrease quantity of ${dish.name}`}
              >
                <Minus size={13} />
              </button>
              <span className="text-xs font-bold tabular-nums min-w-[14px] text-center" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(dish.id, 1)}
                className="w-6 h-6 rounded-full hover:bg-primary-hover flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none"
                aria-label={`Increase quantity of ${dish.name}`}
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
          src={resolveImageUrl(dish.image, FALLBACK_FOOD_IMAGE)}
          alt={dish.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 ${dishFade.imgClassName}`}
          onLoad={dishFade.onLoad}
          onError={onFoodImgError}
        />
      </div>
    </article>
  );
};
