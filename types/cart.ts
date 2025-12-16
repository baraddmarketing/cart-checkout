/**
 * Core cart types for the e-commerce cart system
 * These types are payment-gateway agnostic and can be extended as needed
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  sku?: string;
  /** Optional variant info (size, color, etc.) */
  variant?: ProductVariant;
  /** Any additional product metadata */
  metadata?: Record<string, unknown>;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  /** Unique key for cart item (productId + variantId if applicable) */
  itemKey: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemKey: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemKey: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'HYDRATE'; payload: CartItem[] };

export interface CartContextValue {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  /** Computed values */
  itemCount: number;
  subtotal: number;
  /** Convenience methods */
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getItem: (itemKey: string) => CartItem | undefined;
}

/** Shipping address for checkout */
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/** Billing address - can be same as shipping */
export interface BillingAddress extends ShippingAddress {
  sameAsShipping?: boolean;
}

/** Order data created at checkout before payment redirect */
export interface OrderData {
  id: string;
  items: CartItem[];
  shipping: ShippingAddress;
  billing: BillingAddress;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

/** Checkout form values */
export interface CheckoutFormValues {
  shipping: ShippingAddress;
  billing: BillingAddress;
  notes?: string;
}

/** Payment redirect configuration - gateway agnostic */
export interface PaymentRedirectConfig {
  /** External payment URL to redirect to */
  url: string;
  /** HTTP method for redirect (GET or POST) */
  method: 'GET' | 'POST';
  /** Additional params to send with redirect */
  params?: Record<string, string>;
}

/** Callback for creating an order - implement based on your backend */
export type CreateOrderFn = (
  formData: CheckoutFormValues,
  cartItems: CartItem[],
  totals: { subtotal: number; shippingCost: number; tax: number; total: number }
) => Promise<{ order: OrderData; paymentRedirect: PaymentRedirectConfig }>;
