import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'terracotta' | 'sage' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  pill?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium select-none cursor-pointer text-center transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[42px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-primary text-cream hover:bg-primary-hover active:bg-primary-dark shadow-warm-sm hover:shadow-warm',
    secondary: 'bg-white text-charcoal border border-cream-border hover:bg-cream-card hover:border-cream-dark shadow-warm-sm',
    terracotta: 'bg-terracotta text-cream hover:bg-terracotta-hover active:bg-terracotta-dark shadow-warm-sm hover:shadow-warm',
    sage: 'bg-sage text-primary font-semibold hover:bg-sage-dark/70 active:bg-sage-dark border border-sage-dark/30 shadow-warm-sm',
    outline: 'bg-transparent text-primary border border-primary/30 hover:border-primary hover:bg-primary-surface',
    ghost: 'bg-transparent text-charcoal hover:bg-cream-border/40 active:bg-cream-border/60',
  };

  const radiusStyles = pill ? 'rounded-full' : 'rounded-lg';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${radiusStyles} ${widthStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-label="Loading" />
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};
