import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  leftIcon,
  rightElement,
  containerClassName = '',
  className = '',
  hasError = false,
  ...props
}, ref) => {
  return (
    <div className={`relative flex items-center w-full ${containerClassName}`}>
      {leftIcon && (
        <span className="absolute left-3.5 flex items-center pointer-events-none text-charcoal-muted">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={`w-full bg-cream-card text-charcoal text-sm placeholder:text-charcoal-faint border ${
          hasError ? 'border-red-600 focus:ring-red-600' : 'border-cream-border focus:border-primary focus:ring-1 focus:ring-primary'
        } rounded-lg py-2.5 ${leftIcon ? 'pl-10' : 'pl-3.5'} ${
          rightElement ? 'pr-11' : 'pr-3.5'
        } transition-all duration-150 ease-out outline-none shadow-warm-sm hover:border-charcoal-muted/40 ${className}`}
        {...props}
      />
      {rightElement && (
        <span className="absolute right-3 flex items-center text-charcoal-muted">
          {rightElement}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
