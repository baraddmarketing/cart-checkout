'use client';

import { useCartContext } from '../context/CartContext';

/**
 * Main hook for accessing cart functionality.
 * This is a convenience wrapper around useCartContext.
 *
 * @example
 * ```tsx
 * const { addItem, removeItem, items, subtotal, itemCount, openCart } = useCart();
 *
 * // Add a product
 * addItem({ id: '1', name: 'Product', price: 29.99 });
 *
 * // Remove an item
 * removeItem('item-key');
 *
 * // Update quantity
 * updateQuantity('item-key', 3);
 *
 * // Open the cart drawer
 * openCart();
 * ```
 */
export function useCart() {
  const context = useCartContext();

  return {
    // State
    items: context.state.items,
    isOpen: context.state.isOpen,
    isLoading: context.state.isLoading,

    // Computed
    itemCount: context.itemCount,
    subtotal: context.subtotal,
    isEmpty: context.state.items.length === 0,

    // Actions
    addItem: context.addItem,
    removeItem: context.removeItem,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart,
    openCart: context.openCart,
    closeCart: context.closeCart,
    toggleCart: context.toggleCart,
    getItem: context.getItem,

    // Raw dispatch for advanced use cases
    dispatch: context.dispatch,
  };
}

export default useCart;
