import React, { useState } from 'react';
import { Trash2, Plus, AlertCircle, Layers } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { CategoryResponse, CreateCategoryRequest } from '../../../api/types/restaurant';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number | string;
  restaurantName?: string;
  categories: CategoryResponse[];
  onCreateCategory: (data: CreateCategoryRequest) => Promise<void>;
  onDeleteCategory: (categoryId: number) => Promise<void>;
  isCreating?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  restaurantName,
  categories,
  onCreateCategory,
  onDeleteCategory,
  isCreating = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }
    if (name.length > 50) {
      setError('Category name must not exceed 50 characters.');
      return;
    }
    if (description && description.length > 300) {
      setError('Description must not exceed 300 characters.');
      return;
    }

    try {
      await onCreateCategory({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create category.';
      setError(msg);
    }
  };

  const handleDelete = async (catId: number) => {
    try {
      setDeletingId(catId);
      setError(null);
      await onDeleteCategory(catId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete category (it may still contain food items).';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Menu Categories"
      description={`Organize dishes for ${restaurantName || 'this kitchen'} (e.g. Appetizers, Mains, Artisanal Bakery, Desserts).`}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {error && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-700" />
            <span>{error}</span>
          </div>
        )}

        {/* Existing Categories List */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-charcoal">
            Active Categories ({categories.length})
          </label>

          {categories.length === 0 ? (
            <div className="p-6 text-center bg-cream-surface rounded-xl border border-dashed border-cream-border text-xs text-charcoal-muted">
              <Layers size={20} className="mx-auto text-charcoal-faint mb-1.5" />
              <span>No custom categories defined yet. Dishes will display as General.</span>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2.5 bg-cream-surface rounded-xl border border-cream-border/70 text-xs"
                >
                  <div className="truncate mr-3">
                    <p className="font-semibold text-charcoal truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-[11px] text-charcoal-muted truncate">{cat.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={deletingId === cat.id}
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 text-charcoal-muted hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create New Category Form */}
        <form onSubmit={handleCreate} className="space-y-3 pt-3 border-t border-cream-border/60">
          <div className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
            <Plus size={14} className="text-primary" />
            <span>Add New Category</span>
          </div>

          <div className="space-y-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category Name (e.g. Hearth Pizzas, Signature Pastas)"
              maxLength={50}
              disabled={isCreating}
            />

            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              maxLength={300}
              disabled={isCreating}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              disabled={!name.trim() || isCreating}
            >
              Add Category
            </Button>
          </div>
        </form>

        <div className="pt-2 border-t border-cream-border/60 flex justify-end">
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
