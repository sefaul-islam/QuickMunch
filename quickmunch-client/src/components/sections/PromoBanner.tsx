import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { onRestaurantImgError } from '../../lib/imageUtils';

export interface PromoBannerProps {
  onCtaClick?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onCtaClick }) => {
  return (
    <section id="dispatch" className="w-full py-16 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sage/90 via-sage to-sage-dark/60 border border-sage-dark/50 shadow-editorial p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-sage-dark/40 text-xs font-semibold text-primary shadow-warm-sm">
                <Sparkles size={14} className="text-terracotta" />
                <span>Complimentary Courier Pass</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary leading-tight">
                Single-courier dispatch, <br />
                <span className="italic font-normal">complimentary</span> over $45.
              </h2>

              <p className="text-sm sm:text-base text-charcoal/80 max-w-xl leading-relaxed font-normal">
                Your order never rides with other stops or sits steaming in a multi-drop car.
                We dispatch a dedicated courier equipped with precision thermal fiber boxes so your
                wood-fired crust arrives blistered and hot.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-white/60">
                  <div className="w-7 h-7 rounded-lg bg-primary-surface text-primary flex items-center justify-center shrink-0">
                    <Thermometer size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal">Thermal Micro-Climate</h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">Ventilated steam control for crusts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-white/60">
                  <div className="w-7 h-7 rounded-lg bg-primary-surface text-primary flex items-center justify-center shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-charcoal">100% Plastic-Free</h4>
                    <p className="text-[11px] text-charcoal-muted mt-0.5">Certified compostable sugarcane fiber</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onCtaClick}
                  rightIcon={<ArrowRight size={16} />}
                >
                  Order for Dinner
                </Button>
              </div>
            </div>

            {/* Right Visual Image */}
            <div className="lg:col-span-5 relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="relative rounded-2xl overflow-hidden border border-white/40 shadow-warm-lg bg-cream-dark aspect-[4/3]"
              >
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80"
                  alt="Curated dinner table with artisanal wood-fired and pasta creations"
                  className="w-full h-full object-cover"
                  onError={onRestaurantImgError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-black/10" />

                <div className="absolute bottom-4 left-4 right-4 text-cream">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta block">
                    Zero Compromise
                  </span>
                  <p className="font-serif text-sm font-semibold text-cream">
                    From the kitchen pass directly to your table
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
