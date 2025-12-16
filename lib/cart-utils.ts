import type { CartItem, Product, PaymentRedirectConfig } from '../types/cart';

/**
 * Generate a unique key for a cart item based on product ID and variant
 */
export function generateItemKey(product: Product): string {
  if (product.variant) {
    return `${product.id}-${product.variant.id}`;
  }
  return product.id;
}

/**
 * Calculate the subtotal for all cart items
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/**
 * Calculate the total number of items in the cart
 */
export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Format a price for display
 * @param amount - Price in cents or dollars depending on your setup
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 */
export function formatPrice(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate shipping cost - implement based on your business logic
 * This is a placeholder that returns free shipping over $50
 */
export function calculateShipping(subtotal: number): number {
  if (subtotal >= 50) return 0;
  return 5.99;
}

/**
 * Calculate tax - implement based on your business logic
 * This is a placeholder that calculates 8% tax
 */
export function calculateTax(subtotal: number): number {
  return subtotal * 0.08;
}

/**
 * Calculate cart totals
 */
export function calculateTotals(items: CartItem[]) {
  const subtotal = calculateSubtotal(items);
  const shippingCost = calculateShipping(subtotal);
  const tax = calculateTax(subtotal);
  const total = subtotal + shippingCost + tax;

  return {
    subtotal,
    shippingCost,
    tax,
    total,
  };
}

/**
 * Generate a unique order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Redirect to external payment gateway
 * Handles both GET and POST redirects
 */
export function redirectToPayment(config: PaymentRedirectConfig): void {
  if (config.method === 'GET') {
    const url = new URL(config.url);
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    window.location.href = url.toString();
  } else {
    // POST redirect via form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = config.url;
    form.style.display = 'none';

    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
    }

    document.body.appendChild(form);
    form.submit();
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]{7,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate postal code (US format)
 */
export function isValidPostalCode(postalCode: string, country = 'US'): boolean {
  if (country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(postalCode);
  }
  // Add other country validations as needed
  return postalCode.length >= 3;
}
