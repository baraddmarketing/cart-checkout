'use client';

import Link from 'next/link';
import { CheckoutForm } from '../../components/cart/CheckoutForm';
import { OrderSummary } from '../../components/cart/OrderSummary';
import { useCartContext } from '../../context/CartContext';
import { generateOrderId } from '../../lib/cart-utils';
import type { CheckoutFormValues, CartItem, OrderData, PaymentRedirectConfig } from '../../types/cart';

/**
 * Example checkout page showing form + order summary layout.
 * Customize the createOrder function to integrate with your backend.
 */
export default function CheckoutPage() {
  const { itemCount, state } = useCartContext();

  /**
   * Replace this with your actual order creation logic.
   * This should:
   * 1. Send order data to your backend
   * 2. Create the order in your database
   * 3. Return the payment gateway redirect URL
   */
  const handleCreateOrder = async (
    formData: CheckoutFormValues,
    cartItems: CartItem[],
    totals: { subtotal: number; shippingCost: number; tax: number; total: number }
  ): Promise<{ order: OrderData; paymentRedirect: PaymentRedirectConfig }> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const order: OrderData = {
      id: generateOrderId(),
      items: cartItems,
      shipping: formData.shipping,
      billing: formData.billing,
      subtotal: totals.subtotal,
      shippingCost: totals.shippingCost,
      tax: totals.tax,
      total: totals.total,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    // TODO: Replace with your actual payment gateway URL
    // Examples:
    // - Stripe: Return Stripe Checkout session URL
    // - PayPal: Return PayPal redirect URL
    // - Custom: Return your payment page URL with order ID
    const paymentRedirect: PaymentRedirectConfig = {
      url: '/payment/process', // Replace with your payment URL
      method: 'GET',
      params: {
        orderId: order.id,
        amount: order.total.toFixed(2),
      },
    };

    return { order, paymentRedirect };
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-black rounded-full" />
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
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
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some items to your cart to checkout.</p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Store
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Secure Checkout</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7">
            <CheckoutForm
              onCreateOrder={handleCreateOrder}
              onOrderCreated={(orderId) => {
                console.log('Order created:', orderId);
              }}
              onError={(error) => {
                console.error('Checkout error:', error);
              }}
            />
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0 lg:col-span-5">
            <div className="sticky top-8">
              <OrderSummary editable showItems compactItems />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
