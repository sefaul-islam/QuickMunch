import React from 'react';
import { Quote } from 'lucide-react';

export const CulinaryStory: React.FC = () => {
  return (
    <section id="story" className="w-full py-16 lg:py-24 bg-cream-card/60 border-y border-cream-border/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal leading-tight">
              Food crafted with intent, <br />
              <span className="text-primary italic font-normal">delivered</span> without compromise.
            </h2>

            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-normal">
              Most delivery apps crowd their systems with thousands of mass-production kitchens,
              batching multiple stops while dishes steam in synthetic plastic bags. We founded QuickMunch
              on a radically different principle: food should reach your table in the exact state the chef envisioned.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-surface text-primary flex items-center justify-center shrink-0 font-serif font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal">
                    Strict Culinary Curation
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    We only partner with independent kitchens dedicated to slow-ferments, pasture-raised proteins, and scratch preparation.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-surface text-primary flex items-center justify-center shrink-0 font-serif font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal">
                    Direct Point-to-Point Dispatch
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    Couriers never pick up multiple orders concurrently. Your order travels directly from the kitchen pass to your table.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary-surface text-primary flex items-center justify-center shrink-0 font-serif font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal">
                    Bespoke Thermal Micro-Climate Packaging
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-0.5 leading-relaxed">
                    Crisp items stay aerated; hot broths maintain extraction temperature; raw sushi stays chilled. 100% plastic-free compostable fiber.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame with Chef Quote */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden border border-cream-border shadow-warm-lg bg-cream-dark">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&auto=format&fit=crop&q=80"
                alt="Chef finishing hand-crafted dish in open kitchen"
                loading="lazy"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />

              {/* Chef Quote Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-xl bg-cream-card/95 backdrop-blur-md border border-cream-border shadow-warm text-charcoal">
                <Quote size={24} className="text-terracotta mb-2" />
                <p className="font-serif text-sm sm:text-base italic leading-relaxed text-charcoal">
                  "QuickMunch treats our dishes as an art form rather than a delivery transaction.
                  Our wood-fired sourdough arrives blistered, hot, and fragrant every single time."
                </p>
                <div className="mt-3 flex items-center justify-between text-xs border-t border-cream-border pt-2">
                  <span className="font-bold text-charcoal">Chef Matteo Rossi</span>
                  <span className="text-charcoal-muted">Executive Chef, Sylvan Hearth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
