# E-Commerce Cart & Checkout System

A modular, production-ready cart and checkout system for Next.js 16+ with TypeScript and Tailwind CSS.

## Features

- **Zero dependencies** for state management (React Context + useReducer)
- **Persistent cart** with localStorage (SSR-safe)
- **Payment gateway agnostic** - collects order info and redirects to external payment
- **Fully typed** with TypeScript
- **Responsive design** with Tailwind CSS
- **Modular** - copy into any Next.js project

## Installation

### Via npm (recommended)

```bash
# Add .npmrc to your project root (one-time setup)
echo "@baraddmarketing:registry=https://npm.pkg.github.com" >> .npmrc

# Install the package
npm install @baraddmarketing/cart-checkout
```

### Manual copy

Alternatively, copy the entire `cart_checkout` folder into your project and update imports.

## Quick Start

### 1. Wrap your app with CartProvider

```tsx
// app/layout.tsx
import { CartProvider, CartDrawer } from '@baraddmarketing/cart-checkout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
```

### 2. Add cart icon to your header

```tsx
// components/Header.tsx
import { CartIcon } from '@baraddmarketing/cart-checkout';

export function Header() {
  return (
    <header>
      <nav>
        {/* ... */}
        <CartIcon />
      </nav>
    </header>
  );
}
```

### 3. Add to cart button on product pages

```tsx
// app/products/[id]/page.tsx
import { AddToCartButton } from '@baraddmarketing/cart-checkout';

export default function ProductPage() {
  const product = {
    id: '1',
    name: 'Example Product',
    price: 29.99,
    image: '/products/example.jpg',
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <AddToCartButton product={product} showQuantitySelector />
    </div>
  );
}
```

### 4. Link to checkout page

The checkout page is at `/checkout`. The `CartDrawer` has a built-in checkout button that navigates there.

## Components

### `<CartProvider>`

Wraps your app and provides cart state to all children.

```tsx
<CartProvider storageKey="my-store-cart">
  {children}
</CartProvider>
```

### `<CartDrawer>`

Side cart drawer that slides in from the right.

```tsx
<CartDrawer
  checkoutUrl="/checkout"
  title="Your Cart"
  emptyMessage="No items yet"
  checkoutButtonText="Proceed to Checkout"
  onCheckout={() => router.push('/checkout')}
  onContinueShopping={() => router.push('/products')}
/>
```

### `<CartIcon>`

Cart icon button with item count badge.

```tsx
<CartIcon showEmptyBadge={false} />
```

### `<AddToCartButton>`

Button to add products to cart.

```tsx
<AddToCartButton
  product={product}
  quantity={1}
  showQuantitySelector={true}
  openCartOnAdd={true}
  onAdd={(product, qty) => console.log('Added:', product, qty)}
/>
```

### `<CartItem>`

Displays a single cart item. Supports compact and full modes.

```tsx
<CartItem
  item={cartItem}
  editable={true}
  compact={false}
/>
```

### `<OrderSummary>`

Shows cart contents and totals. Used on checkout page.

```tsx
<OrderSummary
  editable={false}
  showItems={true}
  compactItems={true}
  shippingCost={5.99}
  tax={4.50}
  discount={10}
  discountLabel="Promo: SAVE10"
/>
```

### `<CheckoutForm>`

Complete checkout form with shipping/billing address collection.

```tsx
<CheckoutForm
  onCreateOrder={async (formData, items, totals) => {
    // Call your API to create order
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ formData, items, totals }),
    });
    const { order, paymentUrl } = await response.json();

    return {
      order,
      paymentRedirect: {
        url: paymentUrl,
        method: 'GET',
      },
    };
  }}
  onOrderCreated={(orderId) => console.log('Order:', orderId)}
  onError={(error) => console.error(error)}
  showBillingAddress={true}
  showNotes={true}
  submitButtonText="Continue to Payment"
/>
```

## Hook: useCart

Access cart state and actions from any component.

```tsx
import { useCart } from '@baraddmarketing/cart-checkout';

function MyComponent() {
  const {
    // State
    items,
    isOpen,
    isLoading,
    itemCount,
    subtotal,
    isEmpty,

    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    getItem,
  } = useCart();

  return (
    <button onClick={() => addItem({ id: '1', name: 'Test', price: 10 })}>
      Add Item ({itemCount} in cart)
    </button>
  );
}
```

## Types

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  sku?: string;
  variant?: ProductVariant;
  metadata?: Record<string, unknown>;
}

interface ProductVariant {
  id: string;
  name: string;
  options: Record<string, string>; // e.g., { size: 'M', color: 'Blue' }
}

interface CartItem {
  product: Product;
  quantity: number;
  itemKey: string;
}

interface OrderData {
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
}
```

## Payment Gateway Integration

The system is payment gateway agnostic. When the checkout form is submitted:

1. Your `onCreateOrder` function is called with form data and cart items
2. You create the order in your backend
3. Return a `PaymentRedirectConfig` with the payment gateway URL
4. The user is redirected to complete payment

### Example: Stripe Integration

```tsx
const handleCreateOrder = async (formData, items, totals) => {
  // Create order and Stripe checkout session on your backend
  const response = await fetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({ formData, items, totals }),
  });

  const { order, stripeUrl } = await response.json();

  return {
    order,
    paymentRedirect: {
      url: stripeUrl,
      method: 'GET',
    },
  };
};
```

### Example: PayPal Integration

```tsx
const handleCreateOrder = async (formData, items, totals) => {
  const response = await fetch('/api/checkout/paypal', {
    method: 'POST',
    body: JSON.stringify({ formData, items, totals }),
  });

  const { order, approvalUrl } = await response.json();

  return {
    order,
    paymentRedirect: {
      url: approvalUrl,
      method: 'GET',
    },
  };
};
```

## Customization

### Styling

All components use Tailwind CSS classes. Override by:
1. Passing `className` props
2. Modifying the component source directly

### Shipping & Tax Calculation

Edit `lib/cart-utils.ts`:

```typescript
export function calculateShipping(subtotal: number): number {
  // Your shipping logic
  if (subtotal >= 100) return 0; // Free over $100
  if (subtotal >= 50) return 4.99;
  return 9.99;
}

export function calculateTax(subtotal: number): number {
  // Your tax logic
  return subtotal * 0.08; // 8% tax
}
```

### Price Format

```typescript
import { formatPrice } from '@baraddmarketing/cart-checkout';

formatPrice(29.99, 'USD', 'en-US'); // "$29.99"
formatPrice(29.99, 'EUR', 'de-DE'); // "29,99 €"
```

## File Structure

```
cart_checkout/
├── components/
│   └── cart/
│       ├── AddToCartButton.tsx
│       ├── CartDrawer.tsx
│       ├── CartIcon.tsx
│       ├── CartItem.tsx
│       ├── CheckoutForm.tsx
│       ├── OrderSummary.tsx
│       └── index.ts
├── context/
│   └── CartContext.tsx
├── hooks/
│   └── useCart.ts
├── lib/
│   └── cart-utils.ts
├── types/
│   └── cart.ts
├── app/
│   └── checkout/
│       └── page.tsx
├── index.ts
└── README.md
```

## License

MIT
