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
    <footer className="w-full bg-[#132E26] text-cream py-10 border-t border-primary-light/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* Brand */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-terracotta flex items-center justify-center text-cream shadow-warm-sm">
                <span className="font-serif font-bold text-base leading-none">Q</span>
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-cream">
                Quick<span className="text-terracotta">Munch</span>
              </span>
            </div>
            <p className="text-xs text-cream/70">
              Independent kitchens, delivered with care.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-cream/80">
            <a href="#kitchens" className="hover:text-cream transition-colors">Kitchens</a>
            <a href="#dishes" className="hover:text-cream transition-colors">Popular Dishes</a>
            <a href="#dispatch" className="hover:text-cream transition-colors">Dispatch & Courier</a>
            <span className="hover:text-cream transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-cream transition-colors cursor-pointer">Terms</span>
          </div>

          {/* Minimal Newsletter */}
          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="text-xs text-emerald-300 flex items-center gap-1.5 py-1.5">
                <Check size={14} />
                <span>Subscribed to weekly dispatches</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Get weekly dining picks"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full md:w-56 text-xs bg-white/10 text-cream placeholder:text-cream/50 border border-white/15 rounded-lg px-3 py-2 outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-all"
                />
                <button
                  type="submit"
                  className="bg-terracotta hover:bg-terracotta-hover text-cream px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 min-h-[34px] flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  aria-label="Subscribe"
                >
                  <span>Join</span>
                  <ArrowRight size={13} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Minimal Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-cream/50 gap-2">
          <p>© {new Date().getFullYear()} QuickMunch Technologies Inc. Food delivery with culinary integrity.</p>
          <p>Lower Manhattan, NY</p>
        </div>
      </div>
    </footer>
  );
};
