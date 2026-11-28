import React from 'react';
import { LogIn, ShoppingBag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  itemCount?: number;
  subtotal?: number;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  itemCount = 0,
  subtotal = 0,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign in to place your order"
      description="You need to be logged in to create a persistent order and track delivery."
      maxWidth="sm"
    >
      <div className="space-y-4 mt-2">
        <div className="p-3.5 rounded-xl bg-primary-surface/50 border border-primary/15 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary text-cream flex items-center justify-center shrink-0">
            <ShoppingBag size={18} />
          </div>
          <div className="text-xs text-charcoal space-y-1">
            <p className="font-semibold">
              {itemCount > 0
                ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} in your bag ($${subtotal.toFixed(2)})`
                : 'Your bag is ready to save'}
            </p>
            <p className="text-charcoal-muted leading-relaxed">
              Log in with your QuickMunch account to save your cart and submit your order. Your selected dishes will be waiting for you when you return.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-border">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Continue Browsing
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<LogIn size={15} />}
            onClick={onLogin}
          >
            Log In to Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};
