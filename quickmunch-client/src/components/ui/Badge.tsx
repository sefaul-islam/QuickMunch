import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'terracotta' | 'sage' | 'outline' | 'rating' | 'subtle';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none tracking-tight';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantStyles = {
    default: 'bg-cream-border/60 text-charcoal border border-cream-border',
    primary: 'bg-primary-surface text-primary border border-primary/20',
    terracotta: 'bg-terracotta-surface text-terracotta-dark border border-terracotta/20',
    sage: 'bg-sage/70 text-primary border border-sage-dark/40 font-semibold',
    outline: 'bg-transparent text-charcoal-muted border border-cream-border',
    rating: 'bg-white text-charcoal border border-cream-border shadow-warm-sm font-semibold tabular-nums',
    subtle: 'bg-white/90 backdrop-blur-sm text-charcoal border border-cream-border/60 shadow-warm-sm',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
