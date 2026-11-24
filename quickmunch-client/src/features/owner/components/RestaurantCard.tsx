import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Power,
  UtensilsCrossed,
  Edit2,
  Trash2,
  Camera,
  MoreVertical,
} from 'lucide-react';
import type { RestaurantResponse } from '../../../api/types/restaurant';
import { resolveImageUrl, onRestaurantImgError } from '../../../lib/imageUtils';
import { Badge } from '../../../components/ui/Badge';

export interface RestaurantCardProps {
  restaurant: RestaurantResponse;
  isSelected?: boolean;
  onSelect?: () => void;
  onManageMenu: (restaurant: RestaurantResponse) => void;
  onEdit: (restaurant: RestaurantResponse) => void;
  onChangeImage: (restaurant: RestaurantResponse) => void;
  onDelete: (restaurantId: number) => void;
  onToggleStatus: (restaurantId: number, isOpen: boolean) => void;
  isUpdatingStatus?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  isSelected = false,
  onSelect,
  onManageMenu,
  onEdit,
  onChangeImage,
  onDelete,
  onToggleStatus,
  isUpdatingStatus = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const imageUrl = resolveImageUrl(restaurant.imageUrl);

  return (
    <div
      onClick={onSelect}
      className={`group relative flex flex-col justify-between bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-warm-sm hover:shadow-warm hover:-translate-y-0.5 ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-cream-border hover:border-cream-dark'
      }`}
    >
      <div>
        {/* Cover Image Container */}
        <div className="relative h-44 sm:h-48 w-full bg-charcoal/5 overflow-hidden">
          <img
            src={imageUrl}
            alt={restaurant.name}
            onError={onRestaurantImgError}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />

          {/* Gradient Overlay for badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-charcoal/20" />

          {/* Top Left: Open / Closed Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge
              variant={restaurant.isOpen ? 'sage' : 'default'}
              size="sm"
              className={restaurant.isOpen ? '!bg-emerald-600 text-white font-semibold' : '!bg-charcoal/80 text-white'}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${restaurant.isOpen ? 'bg-white animate-pulse' : 'bg-charcoal-faint'}`} />
              {restaurant.isOpen ? 'Open for Orders' : 'Kitchen Closed'}
            </Badge>
          </div>

          {/* Top Right: Actions Menu Dropdown */}
          <div className="absolute top-3 right-3">
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white text-charcoal shadow-warm-sm backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Restaurant actions"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                  />
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-cream-border shadow-warm-lg z-30 p-1 space-y-0.5 text-xs animate-scale-in"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(restaurant);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-cream-surface text-left cursor-pointer font-medium"
                    >
                      <Edit2 size={13} className="text-primary" />
                      <span>Edit Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onChangeImage(restaurant);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-charcoal hover:bg-cream-surface text-left cursor-pointer font-medium"
                    >
                      <Camera size={13} className="text-terracotta" />
                      <span>Upload Banner</span>
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
                      <span>Delete Restaurant</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Photo Upload Button (Overlay hover) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeImage(restaurant);
            }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs transition-colors cursor-pointer shadow-warm-sm"
          >
            <Camera size={12} />
            <span>Change Photo</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-charcoal tracking-tight">
              {restaurant.name}
            </h3>
            {restaurant.description && (
              <p className="text-xs text-charcoal-muted line-clamp-2 mt-1 leading-relaxed">
                {restaurant.description}
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div className="space-y-1 text-xs text-charcoal-muted pt-1 border-t border-cream-border/60">
            <div className="flex items-center gap-2 truncate">
              <MapPin size={13} className="text-primary shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <Phone size={13} className="text-terracotta shrink-0" />
              <span className="truncate">{restaurant.phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-cream-border/50">
        {/* Status Toggle Switch */}
        <button
          type="button"
          disabled={isUpdatingStatus}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus(restaurant.id, !restaurant.isOpen);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            restaurant.isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-cream-surface text-charcoal-muted border-cream-border hover:bg-cream-border/60'
          }`}
        >
          <Power size={13} className={restaurant.isOpen ? 'text-emerald-600' : 'text-charcoal-faint'} />
          <span>{restaurant.isOpen ? 'Open' : 'Closed'}</span>
        </button>

        {/* Manage Menu Primary Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onManageMenu(restaurant);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary hover:bg-primary-hover text-cream shadow-warm-sm transition-all cursor-pointer"
        >
          <UtensilsCrossed size={13} />
          <span>Manage Menu</span>
        </button>
      </div>

      {/* Delete Confirmation Overlay Modal */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-white/95 backdrop-blur-xs z-30 p-6 flex flex-col justify-center items-center text-center space-y-3 animate-scale-in"
        >
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
            <Trash2 size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-serif text-lg font-bold text-charcoal">Delete {restaurant.name}?</h4>
            <p className="text-xs text-charcoal-muted max-w-xs">
              This will permanently delete this restaurant and all associated menu dishes.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1.5 rounded-lg border border-cream-border text-xs font-semibold text-charcoal hover:bg-cream-surface cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                onDelete(restaurant.id);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-warm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
