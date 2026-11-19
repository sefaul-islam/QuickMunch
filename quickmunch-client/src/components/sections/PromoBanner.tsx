import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PromoBannerProps {
  onCtaClick?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onCtaClick }) => {
  return (
    <section id="dispatch" className="w-full py-10 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-sage/50 border border-sage-dark/40 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-warm-sm">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck size={16} />
              <span>Direct Single-Courier Dispatch</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-charcoal leading-snug">
              Complimentary delivery on orders over $45.
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Your order travels directly from the kitchen to your table with no batched stops in thermal-locked containers.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={onCtaClick}
            rightIcon={<ArrowRight size={15} />}
            className="shrink-0 whitespace-nowrap"
          >
            Find Food
          </Button>
        </div>
      </div>
    </section>
  );
};
