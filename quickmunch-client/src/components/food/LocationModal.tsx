import React, { useState } from 'react';
import { MapPin, Check, Plus } from 'lucide-react';
import type { DeliveryAddress } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: DeliveryAddress[];
  currentAddress: DeliveryAddress;
  onSelectAddress: (address: DeliveryAddress) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  addresses,
  currentAddress,
  onSelectAddress,
}) => {
  const [selectedId, setSelectedId] = useState(currentAddress.id);
  const [customStreet, setCustomStreet] = useState('');
  const [customNeighborhood, setCustomNeighborhood] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleConfirm = () => {
    if (isAddingNew && customStreet.trim()) {
      const newAddress: DeliveryAddress = {
        id: `custom-${Date.now()}`,
        label: 'Custom Address',
        street: customStreet.trim(),
        neighborhood: customNeighborhood.trim() || 'New York, NY',
      };
      onSelectAddress(newAddress);
      setIsAddingNew(false);
      onClose();
    } else {
      const found = addresses.find((a) => a.id === selectedId);
      if (found) {
        onSelectAddress(found);
      }
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Delivery Address"
      description="Select your neighborhood to see available artisan kitchens and live prep times."
      maxWidth="md"
    >
      <div className="space-y-3 mt-2" role="radiogroup" aria-label="Available delivery addresses">
        {addresses.map((address) => {
          const isSelected = selectedId === address.id && !isAddingNew;
          return (
            <button
              key={address.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setSelectedId(address.id);
                setIsAddingNew(false);
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isSelected
                  ? 'border-primary bg-primary-surface/40'
                  : 'border-cream-border hover:bg-cream-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    isSelected ? 'bg-primary text-cream' : 'bg-cream-border/60 text-charcoal'
                  }`}
                >
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-charcoal">{address.label}</span>
                    {address.isDefault && (
                      <span className="text-[10px] bg-cream-border text-charcoal-muted px-1.5 py-0.2 rounded font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    {address.street}, {address.neighborhood}
                  </p>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-cream">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}

        {/* Option to add custom address */}
        {!isAddingNew ? (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 border border-dashed border-charcoal-muted/40 rounded-lg text-xs font-semibold text-charcoal hover:bg-cream-surface transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Plus size={14} />
            Enter a different delivery address
          </button>
        ) : (
          <div className="p-3.5 rounded-lg border border-primary bg-primary-surface/20 space-y-2">
            <label className="text-xs font-medium text-charcoal block">Street Address</label>
            <input
              type="text"
              placeholder="e.g. 75 Bleeker St, Apt 4B"
              value={customStreet}
              onChange={(e) => setCustomStreet(e.target.value)}
              className="w-full text-xs p-2 rounded-md bg-white border border-cream-border text-charcoal focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <label className="text-xs font-medium text-charcoal block">Neighborhood or City</label>
            <input
              type="text"
              placeholder="e.g. Greenwich Village, NY"
              value={customNeighborhood}
              onChange={(e) => setCustomNeighborhood(e.target.value)}
              className="w-full text-xs p-2 rounded-md bg-white border border-cream-border text-charcoal focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-cream-border">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleConfirm}>
          Set Delivery Location
        </Button>
      </div>
    </Modal>
  );
};
