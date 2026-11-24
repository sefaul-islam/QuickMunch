import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { NativeImagePicker } from '../../../components/food/NativeImagePicker';
import type { RestaurantResponse, CreateRestaurantRequest, UpdateRestaurantRequest } from '../../../api/types/restaurant';

export interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRestaurantRequest | UpdateRestaurantRequest, file?: File) => Promise<void>;
  initialData?: RestaurantResponse | null;
  onOpenImageUpload?: (restaurantId: number) => void;
  isSubmitting?: boolean;
}

interface RestaurantFormContentProps {
  initialData?: RestaurantResponse | null;
  onSubmit: (data: CreateRestaurantRequest | UpdateRestaurantRequest, file?: File) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const RestaurantFormContent: React.FC<RestaurantFormContentProps> = ({
  initialData,
  onSubmit,
  onClose,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Restaurant name is required.';
    } else if (name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (phoneNumber.length > 20) {
      newErrors.phoneNumber = 'Phone number must not exceed 20 characters.';
    }

    if (!address.trim()) {
      newErrors.address = 'Physical address is required.';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitError(null);
      await onSubmit({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      }, selectedImageFile || undefined);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save restaurant details.';
      setSubmitError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {submitError && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-700" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Restaurant Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-charcoal">
            Restaurant Name <span className="text-rose-600">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hearth & Stone Kitchen"
            hasError={!!errors.name}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
        </div>

        {/* Phone & Address in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-charcoal">
              Phone Number <span className="text-rose-600">*</span>
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +1 (555) 234-5678"
              hasError={!!errors.phoneNumber}
              maxLength={20}
              disabled={isSubmitting}
            />
            {errors.phoneNumber && <p className="text-[11px] text-rose-600">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-charcoal">
              Address <span className="text-rose-600">*</span>
            </label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 142 Artisan Row, Suite 4"
              hasError={!!errors.address}
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-[11px] text-rose-600">{errors.address}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-charcoal">
            Description <span className="text-charcoal-muted text-[11px] font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Artisan seasonal sourdough, wood-fired hearth bowls, and fresh local produce..."
            className="w-full bg-cream-card text-charcoal text-sm placeholder:text-charcoal-faint border border-cream-border rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-warm-sm transition-all"
            disabled={isSubmitting}
          />
          {errors.description && <p className="text-[11px] text-rose-600">{errors.description}</p>}
        </div>

        {/* Banner Image Selection via Native File Picker */}
        <div className="pt-2 border-t border-cream-border/60">
          <NativeImagePicker
            id="restaurant-banner-image-picker"
            label="Restaurant Banner Image"
            description="Supports JPEG, PNG, or WebP up to 5MB"
            value={imageUrl}
            restaurantId={initialData?.id}
            onChange={(newVal, file) => {
              setImageUrl(newVal);
              if (file) setSelectedImageFile(file);
              else if (!newVal) setSelectedImageFile(null);
            }}
            disabled={isSubmitting}
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-border/60">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Restaurant'}
          </Button>
        </div>
      </form>
  );
};

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData?.name}` : 'Create New Restaurant'}
      description={
        isEditing
          ? 'Update contact info, address, banner, and culinary description.'
          : 'Register your culinary kitchen to start receiving dining orders on QuickMunch.'
      }
      maxWidth="lg"
    >
      {isOpen && (
        <RestaurantFormContent
          key={initialData?.id ? `edit-${initialData.id}-${initialData.imageUrl || ''}` : 'create-new'}
          initialData={initialData}
          onSubmit={onSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
};
