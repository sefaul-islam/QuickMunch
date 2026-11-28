/**
 * Curated showcase entry used exclusively by the homepage HeroSection.
 * Do not import or reuse this data in restaurant listings, search results,
 * restaurant detail pages, or cart logic.
 */
export interface HeroShowcaseItem {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  ctaLabel: string;
  ariaLabel: string;
}

export const HERO_SHOWCASE_ITEM: HeroShowcaseItem = {
  eyebrow: 'Artisan Showcase',
  title: 'Hand-Rolled 30-Yolk Tagliolini al Tartufo',
  subtitle: 'Small-batch seasonal kitchens • Direct courier delivery',
  imageUrl: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=1400&auto=format&fit=crop&q=80',
  imageAlt: 'Hand-rolled tagliolini pasta served with shaved truffle',
  ctaLabel: 'Browse Kitchens',
  ariaLabel: 'Explore QuickMunch artisan kitchens',
};
