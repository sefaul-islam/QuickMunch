import React, { useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../../types';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';
import { onFoodImgError, resolveFoodImageUrl } from '../../lib/imageUtils';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  onCheckout?: () => void;
  isLoading?: boolean;
  isSyncing?: boolean;
  error?: string | null;
  onDismissError?: () => void;
  isAuthenticated?: boolean;
}

const DELIVERY_FEE = 2.99;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isLoading = false,
  isSyncing = false,
  error = null,
  onDismissError,
  isAuthenticated = true,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useDialogFocus({
    isOpen,
    onClose,
    containerRef: drawerRef,
  });

  const subtotal = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Body */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              ref={drawerRef}
              tabIndex={-1}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-cream-border shadow-editorial flex flex-col outline-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-cream-border bg-cream-card/70">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-primary-surface text-primary flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </span>
                  <div>
                    <h2 id="cart-drawer-title" className="font-serif text-lg font-bold text-charcoal">
                      Your Order Bag
                    </h2>
                    <span className="text-[11px] text-charcoal-muted block">
                      {isSyncing ? 'Saving changes...' : 'Direct single-kitchen transit'}
                    </span>
                  </div>
                  {items.length > 0 && (
                    <span className="text-xs bg-primary text-cream px-2 py-0.5 rounded-full font-semibold tabular-nums ml-1">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      disabled={isSyncing}
                      className="text-xs text-charcoal-muted hover:text-red-700 font-semibold px-2 py-1 rounded transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-charcoal-muted hover:text-charcoal hover:bg-cream-border/40 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Close order bag"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  className="mx-4 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start justify-between gap-2 text-xs text-rose-700"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  {onDismissError && (
                    <button
                      type="button"
                      onClick={onDismissError}
                      className="text-rose-700 hover:text-rose-900 font-semibold cursor-pointer"
                      aria-label="Dismiss cart error"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-cream-border/60">
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2].map((idx) => (
                      <div key={idx} className="flex items-center gap-3.5 py-2">
                        <div className="w-16 h-16 rounded-lg bg-cream-border/40 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-cream-border/40 rounded w-2/3" />
                          <div className="h-3 bg-cream-border/30 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-cream-dark/60 flex items-center justify-center text-charcoal-muted">
                      <ShoppingBag size={28} />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-charcoal">
                        Your bag is empty
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-1 max-w-xs">
                        Explore our scratch kitchens and add signature dishes prepared to order.
                      </p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.div
                        key={item.dish.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="py-4 first:pt-0 last:pb-0 flex items-center gap-3.5"
                      >
                        <img
                          src={resolveFoodImageUrl(item.dish.image)}
                          alt={item.dish.name}
                          className="w-16 h-16 rounded-lg object-cover bg-cream-dark shrink-0 border border-cream-border"
                          onError={onFoodImgError}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-bold text-charcoal truncate">
                            {item.dish.name}
                          </h4>
                          <span className="text-[11px] text-charcoal-muted block truncate">
                            {item.restaurantName}
                          </span>
                          <span className="text-xs font-semibold text-charcoal tabular-nums block mt-1">
                            ${(item.dish.price * item.quantity).toFixed(2)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center border border-cream-border rounded-lg bg-cream-card/60 p-0.5">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            disabled={isSyncing}
                            onClick={() => onUpdateQuantity(item.dish.id, -1)}
                            className="p-2.5 text-charcoal hover:text-primary transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                            aria-label={`Decrease quantity of ${item.dish.name}`}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 size={13} className="text-red-600" />
                            ) : (
                              <Minus size={13} />
                            )}
                          </motion.button>
                          <span className="text-xs font-bold text-charcoal w-5 text-center tabular-nums">
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            disabled={isSyncing}
                            onClick={() => onUpdateQuantity(item.dish.id, 1)}
                            className="p-2.5 text-charcoal hover:text-primary transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                            aria-label={`Increase quantity of ${item.dish.name}`}
                          >
                            <Plus size={13} />
                          </motion.button>
                        </div>

                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => onRemoveItem(item.dish.id)}
                          className="p-1.5 text-charcoal-muted hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          aria-label={`Remove ${item.dish.name} from bag`}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-cream-border bg-cream-card/90 space-y-3">
                  <div className="space-y-1.5 text-xs text-charcoal-muted">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-charcoal font-semibold tabular-nums">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dedicated Courier Transit</span>
                      <span className="text-charcoal font-semibold tabular-nums">
                        ${deliveryFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-cream-border text-sm font-bold text-charcoal">
                      <span>Total Due</span>
                      <span className="text-primary text-base tabular-nums">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {!isAuthenticated && (
                    <p className="text-[11px] text-charcoal-muted text-center">
                      You will be asked to sign in to place your order.
                    </p>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={isSyncing}
                    rightIcon={<ArrowRight size={16} />}
                    onClick={onCheckout}
                  >
                    Proceed to Checkout • ${total.toFixed(2)}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
