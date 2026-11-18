import React from 'react';
import type { Category } from '../../types';

export interface CategoryPillsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer ${
                isSelected
                  ? 'bg-primary text-cream shadow-warm-sm ring-1 ring-primary-light'
                  : 'bg-cream-card text-charcoal border border-cream-border hover:bg-white hover:border-cream-dark shadow-warm-sm'
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full tabular-nums ${
                  isSelected
                    ? 'bg-primary-hover text-cream'
                    : 'bg-cream-border/60 text-charcoal-muted'
                }`}
              >
                {category.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
