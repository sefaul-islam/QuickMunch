import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CURATED_COLLECTIONS } from '../../data/mockData';

export interface CuratedPicksProps {
  onSelectCollection: (collectionId: string) => void;
}

export const CuratedPicks: React.FC<CuratedPicksProps> = ({ onSelectCollection }) => {
  return (
    <section id="curated" className="w-full py-12 border-t border-cream-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              Curated Dining Themes
            </h2>
            <p className="text-sm text-charcoal-muted mt-1 max-w-xl">
              Thoughtfully curated anthologies connecting you with specialized culinary artisans.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta">
            Weekly Chef Selection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CURATED_COLLECTIONS.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCollection(item.id)}
              className="group relative bg-cream-card rounded-xl border border-cream-border overflow-hidden cursor-pointer shadow-warm-sm hover:shadow-warm hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image with subtle zoom */}
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-dark">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-charcoal text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-warm-sm">
                  {item.tag}
                </span>
                <span className="absolute bottom-3 right-3 text-cream/90 text-xs font-medium tabular-nums">
                  {item.count}
                </span>
              </div>

              {/* Text content */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-charcoal group-hover:text-primary transition-colors flex items-center gap-1">
                    {item.title}
                    <ArrowUpRight size={15} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1 line-clamp-1">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
