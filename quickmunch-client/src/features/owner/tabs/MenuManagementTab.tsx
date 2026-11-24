import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Layers,
  Store,
  AlertCircle,
} from 'lucide-react';
import type {
  RestaurantResponse,
  FoodItemResponse,
  CategoryResponse,
} from '../../../api/types/restaurant';
import { FoodItemCard } from '../components/FoodItemCard';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export interface MenuManagementTabProps {
  restaurants: RestaurantResponse[];
  selectedRestaurant: RestaurantResponse | null;
  onSelectRestaurant: (restaurant: RestaurantResponse) => void;
  categories: CategoryResponse[];
  foodItems: FoodItemResponse[];
  isLoadingFoods: boolean;
  foodsError: Error | null;
  onOpenCreateDish: () => void;
  onEditDish: (foodItem: FoodItemResponse) => void;
  onChangeDishImage: (foodItem: FoodItemResponse) => void;
  onDeleteDish: (foodId: number) => void;
  onToggleAvailability: (foodId: number, isAvailable: boolean) => void;
  onOpenCategoryManager: () => void;
  onOpenCreateRestaurant: () => void;
  isUpdatingAvailability?: boolean;
}

export const MenuManagementTab: React.FC<MenuManagementTabProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  categories,
  foodItems,
  isLoadingFoods,
  foodsError,
  onOpenCreateDish,
  onEditDish,
  onChangeDishImage,
  onDeleteDish,
  onToggleAvailability,
  onOpenCategoryManager,
  onOpenCreateRestaurant,
  isUpdatingAvailability = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');

  // Filter food items by search and category
  const filteredFoods = foodItems.filter((item) => {
    // Category check
    if (selectedCategoryId !== 'ALL') {
      if (item.categoryId !== selectedCategoryId) {
        return false;
      }
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCat = item.caetegoryName?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }

    return true;
  });

  if (restaurants.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-cream-border space-y-4 shadow-warm-sm max-w-lg mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-cream-surface text-charcoal-faint flex items-center justify-center mx-auto border border-cream-border">
          <Store size={32} />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold text-charcoal">
            No Restaurant Registered
          </h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Before configuring culinary dishes and menu offerings, you must register a restaurant.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          leftIcon={<Plus size={16} />}
          onClick={onOpenCreateRestaurant}
        >
          Create Restaurant First
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Restaurant Selector Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/70 pb-5">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Menu Management
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-0.5">
            Manage culinary offerings, pricing, categories, and real-time stock for{' '}
            <strong className="text-charcoal">{selectedRestaurant?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            leftIcon={<Layers size={15} />}
            onClick={onOpenCategoryManager}
          >
            Categories ({categories.length})
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            pill
            leftIcon={<Plus size={16} />}
            onClick={onOpenCreateDish}
          >
            Add Dish
          </Button>
        </div>
      </div>

      {/* Restaurant Tabs Pill (when owner owns multiple restaurants) */}
      {restaurants.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-charcoal-muted shrink-0 mr-1 flex items-center gap-1">
            <Store size={14} />
            <span>Kitchen:</span>
          </span>
          {restaurants.map((res) => {
            const isSelected = selectedRestaurant?.id === res.id;
            return (
              <button
                key={res.id}
                type="button"
                onClick={() => onSelectRestaurant(res)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-cream shadow-warm-sm'
                    : 'bg-white hover:bg-cream-surface text-charcoal border border-cream-border'
                }`}
              >
                {res.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Category Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategoryId === 'ALL'
                ? 'bg-charcoal text-cream shadow-warm-sm'
                : 'bg-cream-card hover:bg-white text-charcoal border border-cream-border'
            }`}
          >
            All Items ({foodItems.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = foodItems.filter((f) => f.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-terracotta text-cream shadow-warm-sm'
                    : 'bg-cream-card hover:bg-white text-charcoal border border-cream-border'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64 shrink-0">
          <Input
            leftIcon={<Search size={15} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish by name..."
          />
        </div>
      </div>

      {/* Error State */}
      {foodsError && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load menu dishes</p>
            <p className="mt-0.5">{foodsError.message || 'Please check your connection.'}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoadingFoods ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-cream-border p-4 space-y-3 animate-pulse"
            >
              <div className="h-36 bg-cream-border/40 rounded-xl" />
              <div className="h-4 bg-cream-border/40 rounded w-2/3" />
              <div className="h-3 bg-cream-border/30 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-cream-border space-y-4 shadow-warm-sm max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cream-surface text-charcoal-faint flex items-center justify-center mx-auto border border-cream-border">
            <UtensilsCrossed size={30} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-charcoal">
              {searchQuery || selectedCategoryId !== 'ALL'
                ? 'No matching dishes'
                : 'No menu dishes yet'}
            </h3>
            <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
              {searchQuery || selectedCategoryId !== 'ALL'
                ? 'Try resetting the category filter or searching with different keywords.'
                : 'Add dishes, set prices, and upload mouth-watering photos to showcase your food.'}
            </p>
          </div>
          {searchQuery || selectedCategoryId !== 'ALL' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId('ALL');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              leftIcon={<Plus size={16} />}
              onClick={onOpenCreateDish}
            >
              Add First Dish
            </Button>
          )}
        </div>
      ) : (
        /* Dishes Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFoods.map((food) => (
            <FoodItemCard
              key={food.id}
              foodItem={food}
              onEdit={onEditDish}
              onChangeImage={onChangeDishImage}
              onDelete={onDeleteDish}
              onToggleAvailability={onToggleAvailability}
              isUpdatingAvailability={isUpdatingAvailability}
            />
          ))}
        </div>
      )}
    </div>
  );
};
