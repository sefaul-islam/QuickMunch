import React, { useState } from 'react';
import { Store, Plus, Search, AlertCircle } from 'lucide-react';
import type { RestaurantResponse } from '../../../api/types/restaurant';
import { RestaurantCard } from '../components/RestaurantCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export interface RestaurantsTabProps {
  restaurants: RestaurantResponse[];
  isLoading: boolean;
  error: Error | null;
  onOpenCreate: () => void;
  onEdit: (restaurant: RestaurantResponse) => void;
  onChangeImage: (restaurant: RestaurantResponse) => void;
  onDelete: (restaurantId: number) => void;
  onToggleStatus: (restaurantId: number, isOpen: boolean) => void;
  onManageMenu: (restaurant: RestaurantResponse) => void;
  selectedRestaurantId?: number | null;
  isUpdatingStatus?: boolean;
}

export const RestaurantsTab: React.FC<RestaurantsTabProps> = ({
  restaurants,
  isLoading,
  error,
  onOpenCreate,
  onEdit,
  onChangeImage,
  onDelete,
  onToggleStatus,
  onManageMenu,
  selectedRestaurantId,
  isUpdatingStatus = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = restaurants.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/70 pb-5">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            My Restaurants
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Manage your kitchen locations, operating hours, and profile settings.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          pill
          leftIcon={<Plus size={16} />}
          onClick={onOpenCreate}
        >
          Add Restaurant
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 max-w-md">
          <Input
            leftIcon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by restaurant name, address..."
          />
        </div>
        <span className="text-xs text-charcoal-muted font-medium tabular-nums hidden sm:inline">
          {filteredRestaurants.length} of {restaurants.length} locations
        </span>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load restaurants</p>
            <p className="mt-0.5">{error.message || 'Please check your connection and try again.'}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cream-border p-4 space-y-4 animate-pulse"
            >
              <div className="h-44 bg-cream-border/40 rounded-xl" />
              <div className="h-5 bg-cream-border/40 rounded w-2/3" />
              <div className="h-4 bg-cream-border/30 rounded w-1/2" />
              <div className="h-10 bg-cream-border/20 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-border space-y-4 shadow-warm-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cream-surface text-charcoal-faint flex items-center justify-center mx-auto border border-cream-border">
            <Store size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-charcoal">
              {searchQuery ? 'No matching restaurants found' : 'No restaurants created yet'}
            </h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              {searchQuery
                ? `No restaurants match "${searchQuery}". Try a different search term or clear the filter.`
                : 'Create your first culinary kitchen to start managing menu dishes and receiving orders.'}
            </p>
          </div>
          {searchQuery ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={onOpenCreate}
            >
              Create Restaurant
            </Button>
          )}
        </div>
      ) : (
        /* Restaurant Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((res) => (
            <RestaurantCard
              key={res.id}
              restaurant={res}
              isSelected={selectedRestaurantId === res.id}
              onManageMenu={onManageMenu}
              onEdit={onEdit}
              onChangeImage={onChangeImage}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              isUpdatingStatus={isUpdatingStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
