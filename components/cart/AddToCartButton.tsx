'use client';

import { useState, useCallback } from 'react';
import { useCartContext } from '../../context/CartContext';
import type { Product } from '../../types/cart';

interface AddToCartButtonProps {
  product: Product;
  /** Initial quantity (default: 1) */
  quantity?: number;
  /** Show quantity selector */
  showQuantitySelector?: boolean;
  /** Open cart drawer after adding */
  openCartOnAdd?: boolean;
  /** Custom class names */
  className?: string;
  /** Button text */
  children?: React.ReactNode;
  /** Callback after item is added */
  onAdd?: (product: Product, quantity: number) => void;
  /** Disabled state */
  disabled?: boolean;
}

export function AddToCartButton({
  product,
  quantity: initialQuantity = 1,
  showQuantitySelector = false,
  openCartOnAdd = true,
  className = '',
  children,
  onAdd,
  disabled = false,
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCartContext();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(() => {
    setIsAdding(true);
    addItem(product, quantity);
    onAdd?.(product, quantity);

    if (openCartOnAdd) {
      openCart();
    }

    // Brief visual feedback
    setTimeout(() => {
      setIsAdding(false);
    }, 300);
  }, [product, quantity, addItem, openCart, openCartOnAdd, onAdd]);

  const incrementQuantity = useCallback(() => {
    setQuantity((q) => q + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const baseButtonStyles =
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showQuantitySelector && (
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            type="button"
            onClick={decrementQuantity}
            disabled={quantity <= 1 || disabled}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="px-4 py-2 text-center min-w-[3rem] tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={incrementQuantity}
            disabled={disabled}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg"
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
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className={`${baseButtonStyles} px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus-visible:ring-gray-900 ${
          isAdding ? 'scale-95' : ''
        }`}
      >
        {isAdding ? (
          <svg
            className="animate-spin h-5 w-5 mr-2"
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
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        )}
        {children ?? 'Add to Cart'}
      </button>
    </div>
  );
}
