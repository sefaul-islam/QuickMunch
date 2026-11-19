import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="w-full bg-[#132E26] text-cream pt-16 pb-12 border-t border-primary-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Brand Manifesto Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center text-cream shadow-warm-sm">
                <span className="font-serif font-bold text-lg leading-none">Q</span>
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-cream">
                Quick<span className="text-terracotta">Munch</span>
              </span>
            </div>

            <p className="text-sm text-cream/80 max-w-sm leading-relaxed font-normal">
              A curated delivery platform dedicated to authentic neighborhood dining.
              We partner exclusively with independent kitchens who cook with intention,
              delivering each order directly in climate-retained, sustainable packaging.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-cream/70">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Direct Kitchen Couriers Active in Lower Manhattan</span>
            </div>
          </div>

          {/* Neighborhoods Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base font-semibold text-cream">
              Neighborhoods
            </h4>
            <ul className="space-y-2 text-xs text-cream/75">
              <li><span className="hover:text-cream transition-colors cursor-pointer">West Village</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">East Village</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">SoHo & NoHo</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Tribeca</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Lower East Side</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Flatiron District</span></li>
            </ul>
          </div>

          {/* Culinary Standards */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base font-semibold text-cream">
              Culinary Standards
            </h4>
            <ul className="space-y-2 text-xs text-cream/75">
              <li><span className="hover:text-cream transition-colors cursor-pointer">Artisan Wood-Fired</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Fresh Hand-Rolled</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Pasture-Raised Meats</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Zero Seed Oils</span></li>
              <li><span className="hover:text-cream transition-colors cursor-pointer">Compostable Liners</span></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-base font-semibold text-cream">
              The Weekly Appetite
            </h4>
            <p className="text-xs text-cream/75 leading-relaxed">
              Curated dining dispatches, seasonal chef collaborations, and private tasting notices.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                <Check size={16} />
                <span>You're on the guest list. Welcome!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-white/10 text-cream placeholder:text-cream/50 border border-white/20 rounded-lg px-3.5 py-2.5 outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-terracotta hover:bg-terracotta-hover text-cream p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md transition-all active:scale-[0.96] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
                <span className="text-[10px] text-cream/50 block">
                  Weekly dispatches. No spam. Unsubscribe anytime.
                </span>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream/60 gap-4">
          <p>© {new Date().getFullYear()} QuickMunch Technologies Inc. Food delivery with culinary integrity.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-cream transition-colors cursor-pointer">Privacy & Food Safety</span>
            <span className="hover:text-cream transition-colors cursor-pointer">Courier Fair Pay Guarantee</span>
            <span className="hover:text-cream transition-colors cursor-pointer">Kitchen Partner Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
