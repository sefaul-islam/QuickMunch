import React, { useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CartItem } from '../../types';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (dishId: string, delta: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearCart: () => void;
  onCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useDialogFocus({
    isOpen,
    onClose,
    containerRef: drawerRef,
  });

  const subtotal = items.reduce((acc, item) => acc + item.dish.price * item.quantity, 0);
  const freeDeliveryThreshold = 45.0;
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 2.99;
  const packagingFee = items.length > 0 ? 1.50 : 0;
  const total = subtotal + deliveryFee + packagingFee;
  const progressToFreeDelivery = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

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
                      Direct single-kitchen transit
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
                      className="text-xs text-charcoal-muted hover:text-red-700 font-semibold px-2 py-1 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

              {/* Free Delivery Threshold Meter */}
              <div className="p-4 bg-sage/40 border-b border-sage-dark/30">
                <div className="flex justify-between text-xs font-semibold text-primary mb-1.5">
                  <span>
                    {subtotal >= freeDeliveryThreshold
                      ? 'Complimentary Courier Pass Unlocked!'
                      : `Add $${(freeDeliveryThreshold - subtotal).toFixed(2)} for Free Courier Dispatch`}
                  </span>
                  <span className="tabular-nums">{Math.round(progressToFreeDelivery)}%</span>
                </div>
                <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden border border-sage-dark/20">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeDelivery}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 divide-y divide-cream-border/60">
                {items.length === 0 ? (
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
                          src={item.dish.image}
                          alt={item.dish.name}
                          className="w-16 h-16 rounded-lg object-cover bg-cream-dark shrink-0 border border-cream-border"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
                          }}
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
                            onClick={() => onUpdateQuantity(item.dish.id, -1)}
                            className="p-1.5 text-charcoal hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
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
                            onClick={() => onUpdateQuantity(item.dish.id, 1)}
                            className="p-1.5 text-charcoal hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
                            aria-label={`Increase quantity of ${item.dish.name}`}
                          >
                            <Plus size={13} />
                          </motion.button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.dish.id)}
                          className="p-1.5 text-charcoal-muted hover:text-red-700 transition-colors cursor-pointer rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
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
                        {deliveryFee === 0 ? (
                          <strong className="text-primary font-bold">FREE</strong>
                        ) : (
                          `$${deliveryFee.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sustainable Sugarcane Fiber Packaging</span>
                      <span className="text-charcoal font-semibold tabular-nums">
                        ${packagingFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-cream-border text-sm font-bold text-charcoal">
                      <span>Total Due</span>
                      <span className="text-primary text-base tabular-nums">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
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
