'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useCartContext } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { formatPrice } from '../../lib/cart-utils';

interface CartDrawerProps {
  /** URL for checkout page */
  checkoutUrl?: string;
  /** Custom class names for the drawer */
  className?: string;
  /** Title for the drawer */
  title?: string;
  /** Text for empty cart */
  emptyMessage?: string;
  /** Text for checkout button */
  checkoutButtonText?: string;
  /** Custom checkout handler instead of navigation */
  onCheckout?: () => void;
  /** Custom continue shopping handler */
  onContinueShopping?: () => void;
}

export function CartDrawer({
  checkoutUrl = '/checkout',
  className = '',
  title = 'Shopping Cart',
  emptyMessage = 'Your cart is empty',
  checkoutButtonText = 'Checkout',
  onCheckout,
  onContinueShopping,
}: CartDrawerProps) {
  const { state, closeCart, subtotal, itemCount } = useCartContext();
  const { isOpen, items, isLoading } = state;
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  // Trap focus within drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCheckout = useCallback(() => {
    if (onCheckout) {
      onCheckout();
    } else {
      window.location.href = checkoutUrl;
    }
    closeCart();
  }, [onCheckout, checkoutUrl, closeCart]);

  const handleContinueShopping = useCallback(() => {
    if (onContinueShopping) {
      onContinueShopping();
    }
    closeCart();
  }, [onContinueShopping, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">({itemCount} items)</span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <svg
                className="animate-spin h-8 w-8 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-500 mb-4">{emptyMessage}</p>
              <button
                type="button"
                onClick={handleContinueShopping}
                className="text-sm font-medium text-black hover:text-gray-700 underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <CartItem key={item.itemKey} item={item} compact editable />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>{formatPrice(subtotal)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full rounded-lg bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
            >
              {checkoutButtonText}
            </button>
            <button
              type="button"
              onClick={handleContinueShopping}
              className="mt-3 w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
