'use client';

import { useState, useCallback, type FormEvent } from 'react';
import { useCartContext } from '../../context/CartContext';
import {
  calculateTotals,
  redirectToPayment,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
} from '../../lib/cart-utils';
import type {
  CheckoutFormValues,
  ShippingAddress,
  BillingAddress,
  CreateOrderFn,
} from '../../types/cart';

interface CheckoutFormProps {
  /** Function to create order and get payment redirect */
  onCreateOrder: CreateOrderFn;
  /** Callback on successful order creation (before redirect) */
  onOrderCreated?: (orderId: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Custom class names */
  className?: string;
  /** Show billing address section */
  showBillingAddress?: boolean;
  /** Show order notes field */
  showNotes?: boolean;
  /** Submit button text */
  submitButtonText?: string;
}

const initialAddress: ShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

const initialBilling: BillingAddress = {
  ...initialAddress,
  sameAsShipping: true,
};

interface FormErrors {
  [key: string]: string;
}

export function CheckoutForm({
  onCreateOrder,
  onOrderCreated,
  onError,
  className = '',
  showBillingAddress = true,
  showNotes = true,
  submitButtonText = 'Continue to Payment',
}: CheckoutFormProps) {
  const { state, clearCart } = useCartContext();
  const { items } = state;

  const [shipping, setShipping] = useState<ShippingAddress>(initialAddress);
  const [billing, setBilling] = useState<BillingAddress>(initialBilling);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Shipping validation
    if (!shipping.firstName.trim()) newErrors['shipping.firstName'] = 'First name is required';
    if (!shipping.lastName.trim()) newErrors['shipping.lastName'] = 'Last name is required';
    if (!shipping.email.trim()) {
      newErrors['shipping.email'] = 'Email is required';
    } else if (!isValidEmail(shipping.email)) {
      newErrors['shipping.email'] = 'Please enter a valid email';
    }
    if (shipping.phone && !isValidPhone(shipping.phone)) {
      newErrors['shipping.phone'] = 'Please enter a valid phone number';
    }
    if (!shipping.address1.trim()) newErrors['shipping.address1'] = 'Address is required';
    if (!shipping.city.trim()) newErrors['shipping.city'] = 'City is required';
    if (!shipping.state.trim()) newErrors['shipping.state'] = 'State is required';
    if (!shipping.postalCode.trim()) {
      newErrors['shipping.postalCode'] = 'Postal code is required';
    } else if (!isValidPostalCode(shipping.postalCode, shipping.country)) {
      newErrors['shipping.postalCode'] = 'Please enter a valid postal code';
    }

    // Billing validation (only if not same as shipping)
    if (showBillingAddress && !billing.sameAsShipping) {
      if (!billing.firstName.trim()) newErrors['billing.firstName'] = 'First name is required';
      if (!billing.lastName.trim()) newErrors['billing.lastName'] = 'Last name is required';
      if (!billing.email.trim()) {
        newErrors['billing.email'] = 'Email is required';
      } else if (!isValidEmail(billing.email)) {
        newErrors['billing.email'] = 'Please enter a valid email';
      }
      if (!billing.address1.trim()) newErrors['billing.address1'] = 'Address is required';
      if (!billing.city.trim()) newErrors['billing.city'] = 'City is required';
      if (!billing.state.trim()) newErrors['billing.state'] = 'State is required';
      if (!billing.postalCode.trim()) {
        newErrors['billing.postalCode'] = 'Postal code is required';
      } else if (!isValidPostalCode(billing.postalCode, billing.country)) {
        newErrors['billing.postalCode'] = 'Please enter a valid postal code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [shipping, billing, showBillingAddress]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;
      if (items.length === 0) {
        setErrors({ form: 'Your cart is empty' });
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        const totals = calculateTotals(items);
        const finalBilling = billing.sameAsShipping ? { ...shipping, sameAsShipping: true } : billing;

        const formData: CheckoutFormValues = {
          shipping,
          billing: finalBilling,
          notes: showNotes ? notes : undefined,
        };

        const { order, paymentRedirect } = await onCreateOrder(formData, items, totals);

        onOrderCreated?.(order.id);
        clearCart();
        redirectToPayment(paymentRedirect);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create order');
        setErrors({ form: error.message });
        onError?.(error);
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      items,
      shipping,
      billing,
      notes,
      showNotes,
      onCreateOrder,
      onOrderCreated,
      onError,
      clearCart,
    ]
  );

  const updateShipping = useCallback((field: keyof ShippingAddress, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`shipping.${field}`];
      delete newErrors.form;
      return newErrors;
    });
  }, []);

  const updateBilling = useCallback((field: keyof BillingAddress, value: string | boolean) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`billing.${field}`];
      delete newErrors.form;
      return newErrors;
    });
  }, []);

  const inputClasses = (error?: string) =>
    `block w-full rounded-lg border ${
      error ? 'border-red-300' : 'border-gray-300'
    } px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-1 focus:ring-black text-sm`;

  const labelClasses = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {/* Form Error */}
      {errors.form && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{errors.form}</div>
      )}

      {/* Shipping Address */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="shipping-firstName" className={labelClasses}>
              First Name
            </label>
            <input
              type="text"
              id="shipping-firstName"
              autoComplete="given-name"
              value={shipping.firstName}
              onChange={(e) => updateShipping('firstName', e.target.value)}
              className={inputClasses(errors['shipping.firstName'])}
              aria-invalid={!!errors['shipping.firstName']}
            />
            {errors['shipping.firstName'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.firstName']}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping-lastName" className={labelClasses}>
              Last Name
            </label>
            <input
              type="text"
              id="shipping-lastName"
              autoComplete="family-name"
              value={shipping.lastName}
              onChange={(e) => updateShipping('lastName', e.target.value)}
              className={inputClasses(errors['shipping.lastName'])}
              aria-invalid={!!errors['shipping.lastName']}
            />
            {errors['shipping.lastName'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.lastName']}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="shipping-email" className={labelClasses}>
              Email
            </label>
            <input
              type="email"
              id="shipping-email"
              autoComplete="email"
              value={shipping.email}
              onChange={(e) => updateShipping('email', e.target.value)}
              className={inputClasses(errors['shipping.email'])}
              aria-invalid={!!errors['shipping.email']}
            />
            {errors['shipping.email'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.email']}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="shipping-phone" className={labelClasses}>
              Phone <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="tel"
              id="shipping-phone"
              autoComplete="tel"
              value={shipping.phone}
              onChange={(e) => updateShipping('phone', e.target.value)}
              className={inputClasses(errors['shipping.phone'])}
              aria-invalid={!!errors['shipping.phone']}
            />
            {errors['shipping.phone'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.phone']}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="shipping-address1" className={labelClasses}>
              Address
            </label>
            <input
              type="text"
              id="shipping-address1"
              autoComplete="address-line1"
              value={shipping.address1}
              onChange={(e) => updateShipping('address1', e.target.value)}
              className={inputClasses(errors['shipping.address1'])}
              aria-invalid={!!errors['shipping.address1']}
            />
            {errors['shipping.address1'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.address1']}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="shipping-address2" className={labelClasses}>
              Apartment, suite, etc. <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              id="shipping-address2"
              autoComplete="address-line2"
              value={shipping.address2}
              onChange={(e) => updateShipping('address2', e.target.value)}
              className={inputClasses()}
            />
          </div>

          <div>
            <label htmlFor="shipping-city" className={labelClasses}>
              City
            </label>
            <input
              type="text"
              id="shipping-city"
              autoComplete="address-level2"
              value={shipping.city}
              onChange={(e) => updateShipping('city', e.target.value)}
              className={inputClasses(errors['shipping.city'])}
              aria-invalid={!!errors['shipping.city']}
            />
            {errors['shipping.city'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.city']}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping-state" className={labelClasses}>
              State / Province
            </label>
            <input
              type="text"
              id="shipping-state"
              autoComplete="address-level1"
              value={shipping.state}
              onChange={(e) => updateShipping('state', e.target.value)}
              className={inputClasses(errors['shipping.state'])}
              aria-invalid={!!errors['shipping.state']}
            />
            {errors['shipping.state'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.state']}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping-postalCode" className={labelClasses}>
              Postal Code
            </label>
            <input
              type="text"
              id="shipping-postalCode"
              autoComplete="postal-code"
              value={shipping.postalCode}
              onChange={(e) => updateShipping('postalCode', e.target.value)}
              className={inputClasses(errors['shipping.postalCode'])}
              aria-invalid={!!errors['shipping.postalCode']}
            />
            {errors['shipping.postalCode'] && (
              <p className="mt-1 text-sm text-red-600">{errors['shipping.postalCode']}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping-country" className={labelClasses}>
              Country
            </label>
            <select
              id="shipping-country"
              autoComplete="country"
              value={shipping.country}
              onChange={(e) => updateShipping('country', e.target.value)}
              className={inputClasses()}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      {showBillingAddress && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h3>

          <label className="flex items-center gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={billing.sameAsShipping}
              onChange={(e) => updateBilling('sameAsShipping', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">Same as shipping address</span>
          </label>

          {!billing.sameAsShipping && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="billing-firstName" className={labelClasses}>
                  First Name
                </label>
                <input
                  type="text"
                  id="billing-firstName"
                  autoComplete="billing given-name"
                  value={billing.firstName}
                  onChange={(e) => updateBilling('firstName', e.target.value)}
                  className={inputClasses(errors['billing.firstName'])}
                  aria-invalid={!!errors['billing.firstName']}
                />
                {errors['billing.firstName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.firstName']}</p>
                )}
              </div>

              <div>
                <label htmlFor="billing-lastName" className={labelClasses}>
                  Last Name
                </label>
                <input
                  type="text"
                  id="billing-lastName"
                  autoComplete="billing family-name"
                  value={billing.lastName}
                  onChange={(e) => updateBilling('lastName', e.target.value)}
                  className={inputClasses(errors['billing.lastName'])}
                  aria-invalid={!!errors['billing.lastName']}
                />
                {errors['billing.lastName'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.lastName']}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="billing-email" className={labelClasses}>
                  Email
                </label>
                <input
                  type="email"
                  id="billing-email"
                  autoComplete="billing email"
                  value={billing.email}
                  onChange={(e) => updateBilling('email', e.target.value)}
                  className={inputClasses(errors['billing.email'])}
                  aria-invalid={!!errors['billing.email']}
                />
                {errors['billing.email'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.email']}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="billing-address1" className={labelClasses}>
                  Address
                </label>
                <input
                  type="text"
                  id="billing-address1"
                  autoComplete="billing address-line1"
                  value={billing.address1}
                  onChange={(e) => updateBilling('address1', e.target.value)}
                  className={inputClasses(errors['billing.address1'])}
                  aria-invalid={!!errors['billing.address1']}
                />
                {errors['billing.address1'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.address1']}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="billing-address2" className={labelClasses}>
                  Apartment, suite, etc. <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  id="billing-address2"
                  autoComplete="billing address-line2"
                  value={billing.address2}
                  onChange={(e) => updateBilling('address2', e.target.value)}
                  className={inputClasses()}
                />
              </div>

              <div>
                <label htmlFor="billing-city" className={labelClasses}>
                  City
                </label>
                <input
                  type="text"
                  id="billing-city"
                  autoComplete="billing address-level2"
                  value={billing.city}
                  onChange={(e) => updateBilling('city', e.target.value)}
                  className={inputClasses(errors['billing.city'])}
                  aria-invalid={!!errors['billing.city']}
                />
                {errors['billing.city'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.city']}</p>
                )}
              </div>

              <div>
                <label htmlFor="billing-state" className={labelClasses}>
                  State / Province
                </label>
                <input
                  type="text"
                  id="billing-state"
                  autoComplete="billing address-level1"
                  value={billing.state}
                  onChange={(e) => updateBilling('state', e.target.value)}
                  className={inputClasses(errors['billing.state'])}
                  aria-invalid={!!errors['billing.state']}
                />
                {errors['billing.state'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.state']}</p>
                )}
              </div>

              <div>
                <label htmlFor="billing-postalCode" className={labelClasses}>
                  Postal Code
                </label>
                <input
                  type="text"
                  id="billing-postalCode"
                  autoComplete="billing postal-code"
                  value={billing.postalCode}
                  onChange={(e) => updateBilling('postalCode', e.target.value)}
                  className={inputClasses(errors['billing.postalCode'])}
                  aria-invalid={!!errors['billing.postalCode']}
                />
                {errors['billing.postalCode'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['billing.postalCode']}</p>
                )}
              </div>

              <div>
                <label htmlFor="billing-country" className={labelClasses}>
                  Country
                </label>
                <select
                  id="billing-country"
                  autoComplete="billing country"
                  value={billing.country}
                  onChange={(e) => updateBilling('country', e.target.value)}
                  className={inputClasses()}
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Notes */}
      {showNotes && (
        <div className="mb-8">
          <label htmlFor="notes" className={labelClasses}>
            Order Notes <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions for your order..."
            className={inputClasses()}
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className="w-full rounded-lg bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
            Processing...
          </>
        ) : (
          <>
            {submitButtonText}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
