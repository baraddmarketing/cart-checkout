/**
 * E-Commerce Cart & Checkout System
 *
 * A modular, production-ready cart system for Next.js 16+
 * with TypeScript and Tailwind CSS.
 *
 * Zero dependencies for state management - uses React Context + useReducer.
 * Payment gateway agnostic - collects order info and redirects to external payment.
 *
 * @example
 * ```tsx
 * // In your root layout:
 * import { CartProvider, CartDrawer } from './cart';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <CartProvider>
 *           {children}
 *           <CartDrawer />
 *         </CartProvider>
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // In your product page:
 * import { AddToCartButton } from './cart';
 *
 * <AddToCartButton product={product} showQuantitySelector />
 *
 * // In your header:
 * import { CartIcon } from './cart';
 *
 * <CartIcon />
 * ```
 */

// Context & Provider
export { CartProvider, useCartContext, CartContext } from './context/CartContext';

// Hooks
export { useCart } from './hooks/useCart';

// Components
export {
  AddToCartButton,
  CartDrawer,
  CartIcon,
  CartItem,
  CheckoutForm,
  OrderSummary,
} from './components/cart';

// Utilities
export {
  generateItemKey,
  calculateSubtotal,
  calculateItemCount,
  calculateTotals,
  calculateShipping,
  calculateTax,
  formatPrice,
  generateOrderId,
  redirectToPayment,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
} from './lib/cart-utils';

// Types
export type {
  Product,
  ProductVariant,
  CartItem as CartItemType,
  CartState,
  CartAction,
  CartContextValue,
  ShippingAddress,
  BillingAddress,
  OrderData,
  CheckoutFormValues,
  PaymentRedirectConfig,
  CreateOrderFn,
} from './types/cart';
