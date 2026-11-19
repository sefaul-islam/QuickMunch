import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useDialogFocus } from '../../hooks/useDialogFocus';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useDialogFocus({
    isOpen,
    onClose,
    containerRef: modalRef,
  });

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-desc' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs transition-opacity duration-200 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-cream-card rounded-xl border border-cream-border p-6 shadow-warm-lg z-10 transition-all duration-200 ease-out animate-scale-in outline-none`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 id="modal-title" className="font-serif text-xl sm:text-2xl font-semibold text-charcoal">
                {title}
              </h2>
            )}
            {description && (
              <p id="modal-desc" className="text-sm text-charcoal-muted mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-charcoal-muted hover:text-charcoal hover:bg-cream-border/40 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
