import React, { useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { NativeImagePicker } from '../../../components/food/NativeImagePicker';
import type {
  FoodItemResponse,
  CreateFoodItemRequest,
  UpdateFoodItemRequest,
  CategoryResponse,
} from '../../../api/types/restaurant';
import { FALLBACK_FOOD_IMAGE } from '../../../lib/imageUtils';

export interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number | string;
  categories: CategoryResponse[];
  onSubmit: (data: CreateFoodItemRequest | UpdateFoodItemRequest) => Promise<void>;
  initialData?: FoodItemResponse | null;
  onOpenImageUpload?: () => void;
  onOpenCategoryManager?: () => void;
  isSubmitting?: boolean;
}

interface FoodItemFormContentProps {
  restaurantId: number | string;
  categories: CategoryResponse[];
  onSubmit: (data: CreateFoodItemRequest | UpdateFoodItemRequest) => Promise<void>;
  initialData?: FoodItemResponse | null;
  onOpenCategoryManager?: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const FoodItemFormContent: React.FC<FoodItemFormContentProps> = ({
  restaurantId,
  categories,
  onSubmit,
  initialData,
  onOpenCategoryManager,
  onClose,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : '');
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.categoryId
      ? String(initialData.categoryId)
      : categories.length > 0
        ? String(categories[0].id)
        : ''
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Dish name is required.';
    } else if (name.length > 100) {
      newErrors.name = 'Name must not exceed 100 characters.';
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice)) {
      newErrors.price = 'Price is required.';
    } else if (parsedPrice < 0.01) {
      newErrors.price = 'Price must be at least $0.01.';
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
        price: parseFloat(price),
        categoryId: categoryId ? Number(categoryId) : null,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save food item.';
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

        {/* Dish Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-charcoal">
            Dish Name <span className="text-rose-600">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Truffle Wild Mushroom Risotto"
            hasError={!!errors.name}
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-[11px] text-rose-600">{errors.name}</p>}
        </div>

        {/* Price & Category in 2 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-charcoal">
              Price ($ USD) <span className="text-rose-600">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 18.50"
              hasError={!!errors.price}
              disabled={isSubmitting}
            />
            {errors.price && <p className="text-[11px] text-rose-600">{errors.price}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-charcoal">Category</label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Manage</span>
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-cream-card text-charcoal text-sm border border-cream-border rounded-lg py-2.5 px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-warm-sm transition-all"
              disabled={isSubmitting}
            >
              <option value="">Uncategorized (General)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
            placeholder="Slow-simmered arborio rice, black truffle emulsion, sautéed foraged chanterelles, and aged parmesan crisp..."
            className="w-full bg-cream-card text-charcoal text-sm placeholder:text-charcoal-faint border border-cream-border rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-warm-sm transition-all"
            disabled={isSubmitting}
          />
          {errors.description && <p className="text-[11px] text-rose-600">{errors.description}</p>}
        </div>

        {/* Dish Presentation Photo via Native File Picker */}
        <div className="pt-2 border-t border-cream-border/60">
          <NativeImagePicker
            id="food-item-image-picker"
            label="Dish Presentation Photo"
            description="Supports JPEG, PNG, or WebP up to 5MB"
            value={imageUrl}
            restaurantId={restaurantId}
            fallbackImage={FALLBACK_FOOD_IMAGE}
            onChange={(newVal) => setImageUrl(newVal)}
            disabled={isSubmitting}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-border/60">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add to Menu'}
          </Button>
        </div>
      </form>
  );
};

export const FoodItemModal: React.FC<FoodItemModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  categories,
  onSubmit,
  initialData,
  onOpenCategoryManager,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit ${initialData?.name}` : 'Add Menu Item'}
      description="Configure dish name, category, price, and dish presentation photo."
      maxWidth="lg"
    >
      {isOpen && (
        <FoodItemFormContent
          key={initialData?.id ? `edit-${initialData.id}-${initialData.imageUrl || ''}` : 'create-new-food'}
          restaurantId={restaurantId}
          categories={categories}
          onSubmit={onSubmit}
          initialData={initialData}
          onOpenCategoryManager={onOpenCategoryManager}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />
      )}
    </Modal>
  );
};
