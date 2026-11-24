import React from 'react';
import {
  Store,
  UtensilsCrossed,
  Power,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Camera,
  Repeat,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { RestaurantResponse, FoodItemResponse } from '../../../api/types/restaurant';
import { resolveImageUrl, onRestaurantImgError } from '../../../lib/imageUtils';
import { useAuth } from '../../../hooks/useAuth';
import type { OwnerTabType } from '../components/OwnerSidebar';

export interface OverviewTabProps {
  restaurants: RestaurantResponse[];
  selectedRestaurant: RestaurantResponse | null;
  foodItems: FoodItemResponse[];
  onSelectRestaurant: (restaurant: RestaurantResponse) => void;
  onNavigateTab: (tab: OwnerTabType) => void;
  onOpenCreateRestaurant: () => void;
  onOpenCreateFoodItem: () => void;
  onOpenCategoryManager: () => void;
  onChangeImage: (restaurant: RestaurantResponse) => void;
  onToggleStatus: (restaurantId: number, isOpen: boolean) => void;
  isUpdatingStatus?: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  restaurants,
  selectedRestaurant,
  foodItems,
  onNavigateTab,
  onOpenCreateRestaurant,
  onOpenCreateFoodItem,
  onOpenCategoryManager,
  onChangeImage,
  onToggleStatus,
  isUpdatingStatus = false,
}) => {
  const navigate = useNavigate();
  const { user, appRoles } = useAuth();

  const totalRestaurants = restaurants.length;
  const totalFoods = foodItems.length;
  const openRestaurants = restaurants.filter((r) => r.isOpen).length;

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Kitchen Partner';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Editorial Headline & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-terracotta text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            <Store size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta-surface text-terracotta-dark text-[11px] font-bold tracking-wide uppercase">
                Restaurant Owner
              </span>
              {selectedRestaurant && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedRestaurant.isOpen
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-cream-dark text-charcoal-muted'
                  }`}
                >
                  {selectedRestaurant.isOpen ? 'Kitchen Open' : 'Kitchen Closed'}
                </span>
              )}
            </div>

            {/* Note: "Kitchen Command Center" preserved for test expectations */}
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight mt-0.5">
              Kitchen Command Center
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Logged in as <strong className="text-charcoal">{displayName}</strong>
            </p>
          </div>
        </div>

        {/* Switch Role Button (Rendered when user possesses multiple roles) */}
        {appRoles.length > 1 && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-cream-surface text-charcoal border border-cream-border transition-all cursor-pointer shadow-warm-sm"
            >
              <Repeat size={13} className="text-terracotta" />
              <span>Switch Role</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">My Restaurants</span>
            <Store size={18} className="text-primary" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal tabular-nums">
            {totalRestaurants}
          </div>
          <p className="text-[11px] text-charcoal-muted">Active partner establishments</p>
        </div>

        <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Dishes on Menu</span>
            <UtensilsCrossed size={18} className="text-terracotta" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal tabular-nums">
            {totalFoods}
          </div>
          <p className="text-[11px] text-charcoal-muted">In selected restaurant</p>
        </div>

        <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Kitchens Open</span>
            <Power size={18} className="text-emerald-600" />
          </div>
          <div className="font-serif text-3xl font-bold text-charcoal tabular-nums">
            {openRestaurants} <span className="text-xs font-sans text-charcoal-muted font-normal">/ {totalRestaurants}</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Accepting live customer orders</p>
        </div>

        <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-medium">Asset Storage</span>
            <Sparkles size={18} className="text-sage-deep" />
          </div>
          <div className="font-serif text-2xl font-bold text-charcoal flex items-center gap-1.5">
            <span>AWS S3</span>
            <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">Live</span>
          </div>
          <p className="text-[11px] text-charcoal-muted">Presigned direct uploads active</p>
        </div>
      </div>

      {/* Selected Kitchen Spotlight Banner */}
      {selectedRestaurant ? (
        <div className="bg-white rounded-2xl border border-cream-border overflow-hidden shadow-warm-sm">
          <div className="relative h-44 sm:h-52 w-full bg-charcoal/5">
            <img
              src={resolveImageUrl(selectedRestaurant.imageUrl)}
              alt={selectedRestaurant.name}
              onError={onRestaurantImgError}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />

            {/* Banner Top Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChangeImage(selectedRestaurant)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer shadow-warm-sm"
              >
                <Camera size={13} />
                <span>Change Banner</span>
              </button>
            </div>

            {/* Banner Bottom Details */}
            <div className="absolute bottom-4 left-4 right-4 text-cream flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cream/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-cream">
                  Active Spotlight
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                  {selectedRestaurant.name}
                </h2>
                <p className="text-xs text-cream/90 max-w-xl truncate mt-0.5">
                  {selectedRestaurant.address} • {selectedRestaurant.phoneNumber}
                </p>
              </div>

              {/* Status Switch */}
              <div className="shrink-0">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => onToggleStatus(selectedRestaurant.id, !selectedRestaurant.isOpen)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shadow-editorial ${
                    selectedRestaurant.isOpen
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white text-charcoal hover:bg-cream-surface'
                  }`}
                >
                  <Power size={14} />
                  <span>{selectedRestaurant.isOpen ? 'Open for Orders' : 'Kitchen Closed'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Sub-Actions Bar */}
          <div className="p-4 bg-cream-surface/60 flex flex-wrap items-center justify-between gap-3 border-t border-cream-border/60">
            <p className="text-xs text-charcoal-muted">
              {foodItems.length} culinary dish{foodItems.length === 1 ? '' : 'es'} configured for this kitchen
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenCreateFoodItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-terracotta hover:bg-terracotta-hover text-cream shadow-warm-sm transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Dish</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('menu')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-cream shadow-warm-sm transition-all cursor-pointer"
              >
                <UtensilsCrossed size={13} />
                <span>Open Menu Manager</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('restaurants')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-cream-card text-charcoal border border-cream-border shadow-warm-sm transition-all cursor-pointer"
              >
                <span>View All ({restaurants.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State if no restaurants exist */
        <div className="bg-white rounded-2xl border border-cream-border p-8 text-center space-y-4 shadow-warm-sm">
          <div className="w-16 h-16 rounded-2xl bg-terracotta-surface text-terracotta-dark flex items-center justify-center mx-auto shadow-warm-sm">
            <Store size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Welcome to Your Kitchen Portal
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto">
              You have not registered any restaurants yet. Register your first kitchen to configure dishes and begin receiving dining orders.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateRestaurant}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-cream text-xs sm:text-sm font-semibold shadow-warm transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Register Your First Restaurant</span>
          </button>
        </div>
      )}

      {/* Operational Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigateTab('restaurants')}
          className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm hover:shadow-warm transition-all hover:-translate-y-0.5 cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-surface text-primary flex items-center justify-center">
              <Store size={20} />
            </div>
            <ArrowRight size={16} className="text-charcoal-muted" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-charcoal">Restaurant Profiles</h4>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
              Update addresses, contact phone numbers, descriptions, and banner photos.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('menu')}
          className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm hover:shadow-warm transition-all hover:-translate-y-0.5 cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-surface text-terracotta-dark flex items-center justify-center">
              <UtensilsCrossed size={20} />
            </div>
            <ArrowRight size={16} className="text-charcoal-muted" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-charcoal">Culinary Menu Offerings</h4>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
              Add new dishes, update pricing, toggle real-time stock availability, and manage categories.
            </p>
          </div>
        </div>

        <div
          onClick={onOpenCategoryManager}
          className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm hover:shadow-warm transition-all hover:-translate-y-0.5 cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
            <div className="w-10 h-10 rounded-xl bg-sage-light text-sage-deep flex items-center justify-center">
              <Layers size={20} />
            </div>
            <ArrowRight size={16} className="text-charcoal-muted" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-charcoal">Menu Categories</h4>
            <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
              Organize food into intuitive sections like Appetizers, Mains, Pizzas, and Desserts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
