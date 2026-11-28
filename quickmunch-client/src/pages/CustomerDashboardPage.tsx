import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  MapPin,
  Clock,
  Repeat,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useMyOrdersQuery, useOrderDetailQuery } from '../hooks/queries/useOrderQueries';
import type { OrderConfirmationResponse, OrderStatus } from '../api/types/order';

const STATUS_BADGE_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-800 border-sky-200',
  PREPARING: 'bg-primary-surface text-primary border-primary/20',
  READY: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-violet-50 text-violet-800 border-violet-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-800 border-rose-200',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending Confirmation',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready for Pickup',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const CustomerDashboardPage: React.FC = () => {
  const { user, appRoles } = useAuth();
  const navigate = useNavigate();
  const ordersQuery = useMyOrdersQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const orderDetailQuery = useOrderDetailQuery(selectedOrderId);

  const orders = ordersQuery.data ?? [];

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : 'Valued Customer';

  const toggleOrderDetails = (orderId: number) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="py-8 sm:py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header Profile Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-border/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-cream flex items-center justify-center font-serif text-2xl font-bold shadow-warm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-surface text-primary text-[11px] font-bold tracking-wide uppercase">
                Customer View
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Welcome back, {user?.firstName || 'Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-muted">
              Explore menus, track active dining orders, and discover new kitchens.
            </p>
          </div>
        </div>

        {/* Switch Role Button (Only if user has multiple roles) */}
        {appRoles.length > 1 && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => navigate('/select-role')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-cream-surface text-charcoal border border-cream-border transition-all cursor-pointer shadow-warm-sm"
            >
              <Repeat size={13} className="text-terracotta" />
              <span>Switch Role</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Discovery & Backend Orders */}
        <div className="md:col-span-2 space-y-6">
          {/* Direct Kitchen Discovery Promo Card */}
          <div className="p-6 sm:p-8 bg-primary text-cream rounded-2xl shadow-editorial space-y-4">
            <div className="w-10 h-10 rounded-xl bg-cream/10 flex items-center justify-center text-terracotta">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-bold">Ready to order something special?</h2>
              <p className="text-xs sm:text-sm text-cream/80 leading-relaxed max-w-lg">
                Explore hand-crafted small batch menus from our partner artisan kitchens with direct delivery.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/restaurants"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cream text-primary hover:bg-cream-surface text-xs font-semibold shadow-warm transition-colors"
              >
                <span>Browse Artisan Kitchens</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Live Orders & Status from Backend */}
          <div className="bg-white rounded-2xl border border-cream-border p-6 shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between border-b border-cream-border/60 pb-3">
              <h3 className="font-serif text-lg font-bold text-charcoal flex items-center gap-2">
                <Clock size={18} className="text-terracotta" />
                <span>Your Orders &amp; Status</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  void ordersQuery.refetch();
                  if (selectedOrderId != null) {
                    void orderDetailQuery.refetch();
                  }
                }}
                disabled={ordersQuery.isFetching}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary-hover disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={12} className={ordersQuery.isFetching ? 'animate-spin' : ''} />
                <span>{ordersQuery.isFetching ? 'Refreshing...' : 'Refresh Status'}</span>
              </button>
            </div>

            {ordersQuery.isLoading ? (
              <div className="space-y-3 animate-pulse" aria-label="Loading orders">
                {[1, 2].map((idx) => (
                  <div key={idx} className="h-20 rounded-xl bg-cream-surface/70 border border-cream-border" />
                ))}
              </div>
            ) : ordersQuery.isError ? (
              <div className="p-6 text-center bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
                <AlertCircle size={22} className="mx-auto text-rose-700" />
                <p className="text-xs font-semibold text-charcoal">Unable to load your orders</p>
                <p className="text-[11px] text-charcoal-muted">
                  {ordersQuery.error?.message || 'An error occurred while fetching your orders.'}
                </p>
                <button
                  type="button"
                  onClick={() => void ordersQuery.refetch()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-cream text-xs font-semibold cursor-pointer hover:bg-primary-hover"
                >
                  <RefreshCw size={12} />
                  <span>Try Again</span>
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-cream-surface/50 rounded-xl border border-dashed border-cream-border space-y-2">
                <ShoppingBag size={24} className="mx-auto text-charcoal-faint" />
                <p className="text-xs font-semibold text-charcoal">No orders placed yet</p>
                <p className="text-[11px] text-charcoal-muted max-w-sm mx-auto">
                  When you place orders from our artisan kitchens, their live status and details will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const isExpanded = selectedOrderId === order.id;
                  const detailedOrder: OrderConfirmationResponse =
                    isExpanded && orderDetailQuery.data ? orderDetailQuery.data : order;
                  const statusStyle =
                    STATUS_BADGE_STYLES[detailedOrder.status] ??
                    'bg-cream-surface text-charcoal border-cream-border';
                  const statusLabel =
                    STATUS_LABELS[detailedOrder.status] ?? detailedOrder.status;

                  return (
                    <div
                      key={order.id}
                      className="rounded-xl bg-cream-surface/60 border border-cream-border overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleOrderDetails(order.id)}
                        aria-expanded={isExpanded}
                        className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-cream-surface transition-colors cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-charcoal">
                              #{detailedOrder.orderNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusStyle}`}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-[10px] font-medium text-charcoal-muted">
                              Payment: {detailedOrder.paymentStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal-muted">
                            Restaurant #{detailedOrder.restaurantId} •{' '}
                            {detailedOrder.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                            {detailedOrder.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                              ? 'item'
                              : 'items'}
                            {detailedOrder.createdAt
                              ? ` • ${new Date(detailedOrder.createdAt).toLocaleString()}`
                              : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-bold text-primary tabular-nums">
                            ${Number(detailedOrder.totalAmount).toFixed(2)}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={15} className="text-charcoal-muted" />
                          ) : (
                            <ChevronDown size={15} className="text-charcoal-muted" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-cream-border/60 bg-white/70 space-y-2 text-xs">
                          <div className="space-y-1">
                            {detailedOrder.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-charcoal"
                              >
                                <span>
                                  Dish #{item.foodItemId} × {item.quantity}
                                </span>
                                <span className="tabular-nums font-medium">
                                  ${Number(item.subtotal).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-cream-border/50 space-y-0.5 text-[11px] text-charcoal-muted">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span className="tabular-nums">
                                ${Number(detailedOrder.subtotal).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Fee</span>
                              <span className="tabular-nums">
                                ${Number(detailedOrder.deliveryFee).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-charcoal text-xs pt-0.5">
                              <span>Total</span>
                              <span className="text-primary tabular-nums">
                                ${Number(detailedOrder.totalAmount).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-cream-border p-5 shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-cream-border/60 pb-3 text-primary">
              <MapPin size={18} />
              <h3 className="font-serif text-base font-bold text-charcoal">Delivery Preferences</h3>
            </div>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Manage your delivery addresses and account profile settings.
            </p>
            <Link
              to="/account"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-cream-surface hover:bg-cream-dark/30 border border-cream-border/70 text-xs font-semibold text-charcoal transition-colors"
            >
              <span>Manage Addresses</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
