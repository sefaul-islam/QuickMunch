import React, { useState, useMemo } from 'react';
import { MapPin, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateOrderMutation } from '../../hooks/queries/useOrderQueries';
import { ApiError } from '../../api/apiError';
import type { UserProfile } from '../../auth/AuthContext';
import type { CartItem, DeliveryAddress } from '../../types';
import type { OrderConfirmationResponse } from '../../api/types/order';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  user: UserProfile | null;
  currentAddress: DeliveryAddress | null;
  onOrderSuccess: (order: OrderConfirmationResponse) => void;
  onViewOrders?: () => void;
}

const DELIVERY_FEE = 2.99;

export const CheckoutModal: React.FC<CheckoutModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <CheckoutModalContent {...props} />;
};

const CheckoutModalContent: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  user,
  currentAddress,
  onOrderSuccess,
  onViewOrders,
}) => {
  const savedAddresses = useMemo(() => user?.addresses ?? [], [user]);
  const initialSavedAddress = useMemo(
    () => savedAddresses.find((a) => String(a.id) === currentAddress?.id) ?? savedAddresses[0],
    [savedAddresses, currentAddress],
  );

  const createOrderMutation = useCreateOrderMutation();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    initialSavedAddress?.id ?? null,
  );
  const [label, setLabel] = useState(
    initialSavedAddress?.label || currentAddress?.label || 'Home',
  );
  const [street, setStreet] = useState(
    initialSavedAddress?.street || currentAddress?.street || '',
  );
  const [city, setCity] = useState(
    initialSavedAddress?.city || currentAddress?.neighborhood || '',
  );
  const [stateVal, setStateVal] = useState(initialSavedAddress?.state || '');
  const [postalCode, setPostalCode] = useState(initialSavedAddress?.zipCode || '');
  const [country, setCountry] = useState(initialSavedAddress?.country || '');
  const [recipientName, setRecipientName] = useState(
    [user?.firstName, user?.lastName].filter(Boolean).join(' '),
  );
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState(user?.phoneNumber || '');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationResponse | null>(null);

  const handleSelectSavedAddress = (addressId: number) => {
    const found = savedAddresses.find((a) => a.id === addressId);
    if (!found) return;
    setSelectedAddressId(found.id);
    setLabel(found.label || 'Home');
    setStreet(found.street || '');
    setCity(found.city || '');
    setStateVal(found.state || '');
    setPostalCode(found.zipCode || '');
    setCountry(found.country || '');
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!street.trim() || !city.trim() || !postalCode.trim() || !recipientPhoneNumber.trim()) {
      setValidationError('Please provide street, city, postal code, and recipient phone number.');
      return;
    }

    try {
      const order = await createOrderMutation.mutateAsync({
        deliveryAddressId: selectedAddressId,
        deliveryAddress: {
          label: label.trim() || undefined,
          street: street.trim(),
          city: city.trim(),
          state: stateVal.trim() || undefined,
          postalCode: postalCode.trim(),
          country: country.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          recipientPhoneNumber: recipientPhoneNumber.trim(),
          deliveryInstructions: deliveryInstructions.trim() || undefined,
        },
      });
      setConfirmedOrder(order);
      onOrderSuccess(order);
    } catch (err) {
      if (err instanceof ApiError) {
        setValidationError(err.message);
      } else {
        setValidationError('Unable to place your order. Please try again.');
      }
    }
  };

  const totalDue = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={confirmedOrder ? 'Order Confirmed' : 'Complete Your Order'}
      description={
        confirmedOrder
          ? 'Your order has been sent to the kitchen.'
          : 'Confirm your delivery details to place your order from your saved cart.'
      }
      maxWidth="lg"
    >
      {confirmedOrder ? (
        <div className="space-y-5 mt-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 size={22} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-sm text-charcoal">
                Order #{confirmedOrder.orderNumber}
              </p>
              <p className="text-charcoal-muted">
                Status: <strong className="text-charcoal">{confirmedOrder.status}</strong> •{' '}
                {confirmedOrder.items.length}{' '}
                {confirmedOrder.items.length === 1 ? 'dish' : 'dishes'} • Total:{' '}
                <strong className="text-primary tabular-nums">
                  ${Number(confirmedOrder.totalAmount).toFixed(2)}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-border">
            {onViewOrders && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onViewOrders();
                }}
              >
                View Dashboard
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-charcoal block">
                Saved Delivery Addresses
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedAddresses.map((addr) => {
                  const selected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr.id)}
                      className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        selected
                          ? 'border-primary bg-primary-surface/40'
                          : 'border-cream-border hover:bg-cream-surface'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-charcoal">
                        <MapPin size={13} className="text-primary" />
                        <span>{addr.label || 'Saved Address'}</span>
                      </div>
                      <p className="text-charcoal-muted mt-0.5 truncate">
                        {addr.street}, {addr.city} {addr.zipCode}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="checkout-street" className="text-xs font-medium text-charcoal block mb-1">
                Street Address *
              </label>
              <Input
                id="checkout-street"
                type="text"
                placeholder="123 Main St, Apt 4B"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                  setSelectedAddressId(null);
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="checkout-city" className="text-xs font-medium text-charcoal block mb-1">
                City *
              </label>
              <Input
                id="checkout-city"
                type="text"
                placeholder="Dhaka"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setSelectedAddressId(null);
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="checkout-postal" className="text-xs font-medium text-charcoal block mb-1">
                Postal Code *
              </label>
              <Input
                id="checkout-postal"
                type="text"
                placeholder="1200"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  setSelectedAddressId(null);
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="checkout-name" className="text-xs font-medium text-charcoal block mb-1">
                Recipient Name
              </label>
              <Input
                id="checkout-name"
                type="text"
                placeholder="Full name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="checkout-phone" className="text-xs font-medium text-charcoal block mb-1">
                Recipient Phone Number *
              </label>
              <Input
                id="checkout-phone"
                type="tel"
                placeholder="+1 555-0199"
                value={recipientPhoneNumber}
                onChange={(e) => setRecipientPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="checkout-instructions" className="text-xs font-medium text-charcoal block mb-1">
                Delivery Instructions (optional)
              </label>
              <Input
                id="checkout-instructions"
                type="text"
                placeholder="Gate code, drop-off preference..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-3.5 rounded-xl bg-cream-surface/70 border border-cream-border space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-charcoal mb-1">
              <ShoppingBag size={14} className="text-primary" />
              <span>
                Order Summary ({items.reduce((sum, i) => sum + i.quantity, 0)} items)
              </span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-charcoal-muted">
              <span>Delivery Fee</span>
              <span className="font-semibold text-charcoal tabular-nums">${DELIVERY_FEE.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-cream-border font-bold text-charcoal text-sm">
              <span>Total</span>
              <span className="text-primary tabular-nums">${totalDue.toFixed(2)}</span>
            </div>
          </div>

          {validationError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-border">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={createOrderMutation.isPending}
              rightIcon={<ArrowRight size={15} />}
            >
              Place Order • ${totalDue.toFixed(2)}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
