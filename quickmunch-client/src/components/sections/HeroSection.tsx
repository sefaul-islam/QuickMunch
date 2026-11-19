import React from 'react';
import { ArrowRight, Sparkles, Clock, Star, MapPin, ShieldCheck, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import type { Restaurant, DeliveryAddress } from '../../types';
import { Button } from '../ui/Button';
import { useImageFade } from '../../hooks/useImageFade';
import { onFoodImgError } from '../../lib/imageUtils';

export interface HeroSectionProps {
  currentAddress: DeliveryAddress;
  onOpenLocationModal: () => void;
  onExploreClick: () => void;
  featuredRestaurant: Restaurant;
  onQuickAdd: (dish: Restaurant['dishes'][0], restaurant: Restaurant) => void;
  onSelectDetailKitchen?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentAddress,
  onOpenLocationModal,
  onExploreClick,
  featuredRestaurant,
  onQuickAdd,
  onSelectDetailKitchen,
}) => {
  const featuredDish = featuredRestaurant.dishes[0];
  const heroImageFade = useImageFade('duration-700');

  return (
    <section className="relative w-full pt-8 pb-16 lg:pt-14 lg:pb-22 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left: Editorial Narrative & Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/60 border border-sage-dark/40 text-xs font-semibold text-primary shadow-warm-sm">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span>Independent Kitchens • Direct Courier Dispatch</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal leading-[1.1]">
              Exceptional dining, <br />
              <span className="text-primary italic font-normal">curated</span> for your table.
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted max-w-xl font-normal leading-relaxed">
              QuickMunch connects master pasta artisans, wood-fired hearths, and seasonal chefs directly to your dining room. Every order travels single-courier in thermal-controlled, plastic-free containers.
            </p>

            {/* Address Selector & Call to Action Bar */}
            <div className="p-2 sm:p-2.5 bg-white rounded-2xl border border-cream-border shadow-warm max-w-xl">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLocationModal}
                  className="flex-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-cream-card transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Change delivery address. Current: ${currentAddress.street}, ${currentAddress.neighborhood}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-sage/60 text-primary flex items-center justify-center shrink-0">
                    <MapPin size={17} />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] text-charcoal-muted uppercase font-bold tracking-wider leading-none">
                      Deliver to
                    </span>
                    <span className="text-sm font-semibold text-charcoal truncate block mt-0.5">
                      {currentAddress.street}, {currentAddress.neighborhood}
                    </span>
                  </div>
                </button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onExploreClick}
                  rightIcon={<ArrowRight size={16} />}
                  className="shrink-0 h-12 px-6"
                >
                  Find Food
                </Button>
              </div>
            </div>

            {/* Quality & Philosophy Hallmarks */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-charcoal-muted font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-terracotta" />
                <span>Scratch Kitchens Only</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                <span>Single-Courier Transit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf size={14} className="text-primary" />
                <span>Zero Added Seed Oils</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Asymmetric Multi-Image Food Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Primary Focal Plated Dish */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-cream-border bg-cream-dark shadow-editorial group">
                <img
                  src={featuredDish.image}
                  alt={featuredDish.name}
                  className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${heroImageFade.imgClassName}`}
                  onLoad={heroImageFade.onLoad}
                  onError={onFoodImgError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-black/20" />

                {/* Overlaid Badge */}
                <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-xs text-cream text-xs font-semibold px-3 py-1 rounded-full shadow-warm-sm border border-primary-light/40">
                  Chef Spotlight • {featuredRestaurant.name}
                </div>

                {/* Overlaid Title & Quick Add */}
                <div className="absolute bottom-4 left-4 right-4 text-cream flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-cream/90 font-medium mb-1">
                      <span className="flex items-center gap-1">
                        <Star size={13} className="text-terracotta fill-terracotta" />
                        <strong className="text-cream tabular-nums">
                          {featuredRestaurant.rating.toFixed(1)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-terracotta" />
                        <span className="tabular-nums">{featuredRestaurant.prepTime}</span>
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-cream line-clamp-1">
                      {featuredDish.name}
                    </h3>
                  </div>

                  <Button
                    variant="terracotta"
                    size="sm"
                    onClick={() => onQuickAdd(featuredDish, featuredRestaurant)}
                    className="shrink-0 font-semibold"
                  >
                    + ${featuredDish.price.toFixed(2)}
                  </Button>
                </div>
              </div>

              {/* Secondary Overlapping Detail Card (Interactive Kitchen Showcase) */}
              <motion.div
                tabIndex={0}
                role="button"
                aria-label="View Osteria Dell'Alba kitchen menu for Hand-Rolled 30-Yolk Tagliolini al Tartufo"
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={onSelectDetailKitchen}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDetailKitchen?.();
                  }
                }}
                className="hidden sm:flex absolute -bottom-8 right-4 bg-white p-3 rounded-xl border border-cream-border shadow-editorial items-center gap-3 max-w-xs z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:border-cream-dark transition-all"
              >
                <img
                  src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=300&auto=format&fit=crop&q=80"
                  alt="Hand-rolled egg pasta with white truffle"
                  className="w-13 h-13 rounded-lg object-cover bg-cream-dark shrink-0"
                  onError={onFoodImgError}
                />
                <div className="min-w-0 pr-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta block leading-tight">
                      Hand-Rolled Daily
                    </span>
                    <ArrowRight size={12} className="text-charcoal-muted" />
                  </div>
                  <h4 className="text-xs font-bold text-charcoal truncate">
                    30-Yolk Tagliolini al Tartufo
                  </h4>
                  <p className="text-[11px] text-charcoal-muted truncate">
                    Osteria Dell'Alba • 30–40 min
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
