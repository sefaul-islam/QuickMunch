import React, { useState } from 'react';
import { Edit2, Trash2, Camera, MoreVertical, Check, AlertCircle } from 'lucide-react';
import type { FoodItemResponse } from '../../../api/types/restaurant';
import { resolveImageUrl, FALLBACK_FOOD_IMAGE, onFoodImgError } from '../../../lib/imageUtils';
import { Badge } from '../../../components/ui/Badge';

export interface FoodItemCardProps {
  foodItem: FoodItemResponse;
  onEdit: (foodItem: FoodItemResponse) => void;
  onChangeImage: (foodItem: FoodItemResponse) => void;
  onDelete: (foodId: number) => void;
  onToggleAvailability: (foodId: number, isAvailable: boolean) => void;
  isUpdatingAvailability?: boolean;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  foodItem,
  onEdit,
  onChangeImage,
  onDelete,
  onToggleAvailability,
  isUpdatingAvailability = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imageUrl = resolveImageUrl(foodItem.imageUrl, FALLBACK_FOOD_IMAGE);
  const categoryLabel = foodItem.caetegoryName || 'General';

  return (
    <div className="group relative flex flex-col justify-between bg-white rounded-2xl border border-cream-border hover:border-cream-dark transition-all duration-200 overflow-hidden shadow-warm-sm hover:shadow-warm">
      <div>
        {/* Food Thumbnail Header */}
        <div className="relative h-40 w-full bg-charcoal/5 overflow-hidden">
          <img
            src={imageUrl}
            alt={foodItem.name}
            onError={onFoodImgError}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />

          {/* Availability Status Ribbon */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-warm-sm ${
                foodItem.isAvailable
                  ? 'bg-emerald-600/90 text-white'
                  : 'bg-charcoal/80 text-cream'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  foodItem.isAvailable ? 'bg-white animate-pulse' : 'bg-charcoal-faint'
                }`}
              />
              {foodItem.isAvailable ? 'Available' : 'Sold Out'}
            </span>
          </div>

          {/* Action Menu Trigger */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white text-charcoal shadow-warm-sm backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Dish actions"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-cream-border shadow-warm-lg z-30 p-1 space-y-0.5 text-xs animate-scale-in"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(foodItem);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-cream-surface text-left cursor-pointer font-medium"
                    >
                      <Edit2 size={13} className="text-primary" />
                      <span>Edit Dish</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onChangeImage(foodItem);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-cream-surface text-left cursor-pointer font-medium"
                    >
                      <Camera size={13} className="text-terracotta" />
                      <span>Upload Photo</span>
                    </button>

                    <div className="border-t border-cream-border/60 my-0.5" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 text-left cursor-pointer font-medium"
                    >
                      <Trash2 size={13} />
                      <span>Delete Dish</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Photo Upload Button */}
          <button
            type="button"
            onClick={() => onChangeImage(foodItem)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs transition-colors cursor-pointer shadow-warm-sm"
          >
            <Camera size={12} />
            <span>Photo</span>
          </button>
        </div>

        {/* Dish Info */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-base font-bold text-charcoal line-clamp-1">
              {foodItem.name}
            </h4>
            <span className="font-mono text-sm font-bold text-primary tabular-nums shrink-0">
              ${Number(foodItem.price).toFixed(2)}
            </span>
          </div>

          {foodItem.description && (
            <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
              {foodItem.description}
            </p>
          )}

          {/* Category Pill */}
          <div className="pt-1">
            <Badge variant="terracotta" size="sm">
              {categoryLabel}
            </Badge>
          </div>
        </div>
      </div>

      {/* Footer: Quick Availability Switch */}
      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-cream-border/60">
        <span className="text-[11px] font-semibold text-charcoal-muted">
          Availability
        </span>

        <button
          type="button"
          disabled={isUpdatingAvailability}
          onClick={() => onToggleAvailability(foodItem.id, !foodItem.isAvailable)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
            foodItem.isAvailable
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          {foodItem.isAvailable ? (
            <>
              <Check size={12} className="text-emerald-700" />
              <span>In Stock</span>
            </>
          ) : (
            <>
              <AlertCircle size={12} className="text-rose-700" />
              <span>Out of Stock</span>
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 p-5 flex flex-col justify-center items-center text-center space-y-2 animate-scale-in">
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
            <Trash2 size={18} />
          </div>
          <h5 className="font-serif text-base font-bold text-charcoal">Delete {foodItem.name}?</h5>
          <p className="text-[11px] text-charcoal-muted max-w-xs">
            This dish will be permanently removed from this restaurant menu.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 rounded-lg border border-cream-border text-xs font-semibold text-charcoal hover:bg-cream-surface cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(foodItem.id);
              }}
              className="px-3 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold cursor-pointer shadow-warm"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
