'use client';

import { useMemo } from 'react';
import { useCartContext } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { formatPrice, calculateTotals } from '../../lib/cart-utils';

interface OrderSummaryProps {
  /** Allow editing items in the summary */
  editable?: boolean;
  /** Show individual items */
  showItems?: boolean;
  /** Show items in compact mode */
  compactItems?: boolean;
  /** Custom shipping cost (overrides default calculation) */
  shippingCost?: number;
  /** Custom tax amount (overrides default calculation) */
  tax?: number;
  /** Discount amount to apply */
  discount?: number;
  /** Discount code label */
  discountLabel?: string;
  /** Custom class names */
  className?: string;
  /** Title for the summary */
  title?: string;
}

export function OrderSummary({
  editable = false,
  showItems = true,
  compactItems = true,
  shippingCost: customShipping,
  tax: customTax,
  discount = 0,
  discountLabel = 'Discount',
  className = '',
  title = 'Order Summary',
}: OrderSummaryProps) {
  const { state, subtotal } = useCartContext();
  const { items, isLoading } = state;

  const totals = useMemo(() => {
    const calculated = calculateTotals(items);
    return {
      subtotal: calculated.subtotal,
      shippingCost: customShipping ?? calculated.shippingCost,
      tax: customTax ?? calculated.tax,
      discount,
      total:
        calculated.subtotal +
        (customShipping ?? calculated.shippingCost) +
        (customTax ?? calculated.tax) -
        discount,
    };
  }, [items, customShipping, customTax, discount]);

  if (isLoading) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 rounded-lg ${className}`}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

        {/* Cart Items */}
        {showItems && (
          <div className="divide-y divide-gray-200 border-b border-gray-200 mb-6 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <CartItem
                key={item.itemKey}
                item={item}
                compact={compactItems}
                editable={editable}
              />
            ))}
          </div>
        )}

        {/* Summary Lines */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900 font-medium">{formatPrice(totals.subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900 font-medium">
              {totals.shippingCost === 0 ? (
                <span className="text-green-600">Free</span>
              ) : (
                formatPrice(totals.shippingCost)
              )}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900 font-medium">{formatPrice(totals.tax)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">{discountLabel}</span>
              <span className="text-green-600 font-medium">-{formatPrice(discount)}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-base font-semibold text-gray-900">
                {formatPrice(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Free shipping notice */}
      {totals.shippingCost === 0 && subtotal > 0 && (
        <div className="bg-green-50 px-6 py-3 rounded-b-lg border-t border-green-100">
          <p className="text-sm text-green-700 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            You qualify for free shipping!
          </p>
        </div>
      )}
    </div>
  );
}
