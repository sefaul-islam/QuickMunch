import React from 'react';
import { ShieldCheck, Thermometer, HeartHandshake } from 'lucide-react';

export const ExperiencePerks: React.FC = () => {
  const perks = [
    {
      icon: <ShieldCheck size={22} className="text-primary" />,
      title: 'Direct Courier Transit',
      description: 'Your courier picks up only your meal and navigates directly to your door. No batched detours or cold meals.',
    },
    {
      icon: <Thermometer size={22} className="text-terracotta" />,
      title: 'Precision Micro-Climate Bags',
      description: 'Steam vents for wood-fired crusts, insulated cores for slow-braised broths, and active cooling for raw crudos.',
    },
    {
      icon: <HeartHandshake size={22} className="text-primary" />,
      title: 'Ethical Kitchen Economics',
      description: 'We charge sustainable partner fees so our artisan chefs can afford organic heritage grain and fair kitchen compensation.',
    },
  ];

  return (
    <section id="standards" className="w-full py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            Elevating the delivery craft at every touchpoint
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {perks.map((perk, idx) => (
            <div
              key={idx}
              className="bg-cream-card rounded-xl border border-cream-border p-6 shadow-warm-sm hover:shadow-warm transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-cream-surface border border-cream-border flex items-center justify-center mb-4 shadow-warm-sm">
                {perk.icon}
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal mb-2">
                {perk.title}
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                {perk.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
