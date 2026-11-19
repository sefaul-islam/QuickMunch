import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category } from '../../types';
import { onRestaurantImgError } from '../../lib/imageUtils';

export interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mouse drag state
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Check scroll boundary
  const updateScrollBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollBounds();

    el.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);
    return () => {
      el.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [updateScrollBounds]);

  // Desktop Mouse Wheel translation (deltaY -> horizontal scroll)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If predominantly vertical scroll, translate to horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll <= 0) return;

        const canLeft = el.scrollLeft > 0;
        const canRight = el.scrollLeft < maxScroll - 2;

        if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
          e.preventDefault();
          el.scrollBy({ left: e.deltaY * 1.3, behavior: 'auto' });
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Smooth scroll by button
  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Center selected item if near edge
  useEffect(() => {
    const activePill = pillRefs.current[selectedCategory];
    const container = scrollRef.current;
    if (activePill && container) {
      const pillLeft = activePill.offsetLeft;
      const pillWidth = activePill.offsetWidth;
      const containerScroll = container.scrollLeft;
      const containerWidth = container.clientWidth;

      if (
        pillLeft < containerScroll + 40 ||
        pillLeft + pillWidth > containerScroll + containerWidth - 40
      ) {
        activePill.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedCategory]);

  // Drag handlers for desktop mouse grab-to-scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftStartRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftStartRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  };

  const handlePillClick = (catId: string) => {
    if (hasDraggedRef.current) return;
    onSelectCategory(catId);
  };

  return (
    <section className="w-full py-8 border-y border-cream-border/60 bg-cream-card/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-charcoal">
            Categories
          </h2>

          {/* Desktop Arrow Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollByAmount(-300)}
              disabled={!canScrollLeft}
              aria-label="Previous categories"
              className={`w-7 h-7 rounded-full border border-cream-border bg-white text-charcoal flex items-center justify-center transition-all shadow-warm-sm ${
                canScrollLeft
                  ? 'hover:bg-cream-dark hover:border-charcoal/20 cursor-pointer active:scale-95'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(300)}
              disabled={!canScrollRight}
              aria-label="Next categories"
              className={`w-7 h-7 rounded-full border border-cream-border bg-white text-charcoal flex items-center justify-center transition-all shadow-warm-sm ${
                canScrollRight
                  ? 'hover:bg-cream-dark hover:border-charcoal/20 cursor-pointer active:scale-95'
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Carousel Track with Gradient Fades & Dragging */}
        <div className="relative">
          {/* Left subtle gradient fade */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-cream/90 to-transparent z-10 transition-opacity duration-300 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Right subtle gradient fade */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-cream/90 to-transparent z-10 transition-opacity duration-300 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Category Track */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none py-1 px-1 cursor-grab active:cursor-grabbing select-none scroll-smooth"
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  ref={(el) => {
                    pillRefs.current[category.id] = el;
                  }}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ y: -1 }}
                  onClick={() => handlePillClick(category.id)}
                  className={`relative shrink-0 flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border transition-all duration-150 cursor-pointer text-xs font-medium select-none min-h-[42px] ${
                    isSelected
                      ? 'bg-primary text-cream border-primary shadow-warm-sm'
                      : 'bg-white text-charcoal border-cream-border hover:border-cream-dark hover:bg-cream-surface shadow-warm-sm'
                  }`}
                >
                  {/* Visual Category Photo Thumbnail */}
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-cream-dark border border-cream-border/60">
                    <img
                      src={category.image}
                      alt={category.name}
                      draggable={false}
                      className="w-full h-full object-cover pointer-events-none"
                      onError={onRestaurantImgError}
                    />
                  </div>

                  <span className="whitespace-nowrap font-semibold">
                    {category.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
