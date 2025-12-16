'use client';

import { useCallback } from 'react';
import { useCartContext } from '../../context/CartContext';
import { formatPrice } from '../../lib/cart-utils';
import type { CartItem as CartItemType } from '../../types/cart';

interface CartItemProps {
  item: CartItemType;
  /** Show quantity controls */
  editable?: boolean;
  /** Compact mode for drawer */
  compact?: boolean;
  /** Custom class names */
  className?: string;
}

export function CartItem({
  item,
  editable = true,
  compact = false,
  className = '',
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCartContext();
  const { product, quantity, itemKey } = item;

  const handleIncrement = useCallback(() => {
    updateQuantity(itemKey, quantity + 1);
  }, [itemKey, quantity, updateQuantity]);

  const handleDecrement = useCallback(() => {
    if (quantity > 1) {
      updateQuantity(itemKey, quantity - 1);
    }
  }, [itemKey, quantity, updateQuantity]);

  const handleRemove = useCallback(() => {
    removeItem(itemKey);
  }, [itemKey, removeItem]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        updateQuantity(itemKey, value);
      }
    },
    [itemKey, updateQuantity]
  );

  const lineTotal = product.price * quantity;

  if (compact) {
    return (
      <div className={`flex gap-3 py-3 ${className}`}>
        {/* Product Image */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
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
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h4>
              {product.variant && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {Object.values(product.variant.options).join(' / ')}
                </p>
              )}
            </div>
            {editable && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1"
                aria-label="Remove item"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
            )}
          </div>

          <div className="flex items-center justify-between">
            {editable ? (
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-2 py-1 text-sm tabular-nums min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-2 py-1 text-gray-600 hover:bg-gray-50 text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <span className="text-sm text-gray-500">Qty: {quantity}</span>
            )}
            <span className="text-sm font-medium text-gray-900">{formatPrice(lineTotal)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full size cart item (for checkout page)
  return (
    <div className={`flex gap-4 py-6 ${className}`}>
      {/* Product Image */}
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-32 sm:w-32">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">{product.name}</h3>
            {product.variant && (
              <p className="mt-1 text-sm text-gray-500">
                {Object.entries(product.variant.options)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' | ')}
              </p>
            )}
            {product.sku && <p className="mt-1 text-xs text-gray-400">SKU: {product.sku}</p>}
          </div>
          <p className="text-base font-medium text-gray-900">{formatPrice(product.price)}</p>
        </div>

        <div className="mt-4 flex flex-1 items-end justify-between">
          {editable ? (
            <div className="flex items-center gap-2">
              <label htmlFor={`quantity-${itemKey}`} className="sr-only">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg"
                  aria-label="Decrease quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  id={`quantity-${itemKey}`}
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 border-x border-gray-300 py-2 text-center text-sm focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                  aria-label="Increase quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Quantity: {quantity}</span>
          )}

          <p className="text-base font-semibold text-gray-900">{formatPrice(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}
