import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { HERO_SHOWCASE_ITEM } from '../../data/heroShowcaseData';
import { Button } from '../ui/Button';
import { useImageFade } from '../../hooks/useImageFade';
import { onFoodImgError } from '../../lib/imageUtils';

export interface HeroSectionProps {
  onExploreClick: () => void;
  onShowcaseClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onShowcaseClick,
}) => {
  const heroFade = useImageFade('duration-700');
  const handleShowcaseAction = onShowcaseClick ?? onExploreClick;

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left: Headline & Single Action */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5 space-y-5"
          >
            <span className="text-xs font-semibold tracking-wider uppercase text-terracotta">
              Artisan Food Delivery
            </span>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal leading-[1.08]">
              Exceptional dining, curated for your table.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted font-normal leading-relaxed max-w-lg">
              Handcrafted dishes from independent kitchens, delivered fresh in direct single-courier transit.
            </p>

            <div className="pt-2 flex items-center gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={onExploreClick}
                rightIcon={<ArrowRight size={16} />}
                className="px-7 py-3.5 text-sm sm:text-base font-medium shadow-warm hover:shadow-editorial"
              >
                Explore Kitchens
              </Button>
            </div>
          </motion.div>

          {/* Right: High-Quality Focused Food Photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-7"
          >
            <div
              tabIndex={0}
              role="button"
              aria-label={HERO_SHOWCASE_ITEM.ariaLabel}
              onClick={handleShowcaseAction}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleShowcaseAction();
                }
              }}
              className="group relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-cream-dark border border-cream-border shadow-warm hover:shadow-editorial transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <img
                src={HERO_SHOWCASE_ITEM.imageUrl}
                alt={HERO_SHOWCASE_ITEM.imageAlt}
                className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-103 ${heroFade.imgClassName}`}
                onLoad={heroFade.onLoad}
                onError={onFoodImgError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent pointer-events-none" />

              {/* Minimalist Floating Caption */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-cream">
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-terracotta block mb-0.5">
                    {HERO_SHOWCASE_ITEM.eyebrow}
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-cream drop-shadow-xs">
                    {HERO_SHOWCASE_ITEM.title}
                  </h2>
                  <p className="text-xs text-cream/80 mt-0.5">
                    {HERO_SHOWCASE_ITEM.subtitle}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold bg-white/90 text-charcoal px-3 py-1.5 rounded-full shadow-warm-sm group-hover:bg-white transition-colors">
                  {HERO_SHOWCASE_ITEM.ctaLabel} <ArrowRight size={13} className="text-primary" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
