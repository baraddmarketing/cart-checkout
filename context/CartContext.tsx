'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  CartState,
  CartAction,
  CartContextValue,
  CartItem,
  Product,
} from '../types/cart';
import { generateItemKey, calculateSubtotal, calculateItemCount } from '../lib/cart-utils';

const CART_STORAGE_KEY = 'cart_items';

const initialState: CartState = {
  items: [],
  isOpen: false,
  isLoading: true,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const itemKey = generateItemKey(product);
      const existingIndex = state.items.findIndex((item) => item.itemKey === itemKey);

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { product, quantity, itemKey }],
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter((item) => item.itemKey !== action.payload.itemKey),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemKey, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.itemKey !== itemKey),
        };
      }

      return {
        ...state,
        items: state.items.map((item) =>
          item.itemKey === itemKey ? { ...item, quantity } : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'HYDRATE':
      return { ...state, items: action.payload, isLoading: false };

    default:
      return state;
  }
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
  /** Optional: Custom storage key for localStorage */
  storageKey?: string;
}

export function CartProvider({ children, storageKey = CART_STORAGE_KEY }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        dispatch({ type: 'HYDRATE', payload: items });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      console.warn('Failed to parse cart from localStorage');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [storageKey]);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    if (!state.isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.items));
      } catch {
        console.warn('Failed to save cart to localStorage');
      }
    }
  }, [state.items, state.isLoading, storageKey]);

  // Convenience methods
  const addItem = useCallback((product: Product, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemKey } });
  }, []);

  const updateQuantity = useCallback((itemKey: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemKey, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const getItem = useCallback(
    (itemKey: string) => state.items.find((item) => item.itemKey === itemKey),
    [state.items]
  );

  // Computed values
  const itemCount = useMemo(() => calculateItemCount(state.items), [state.items]);
  const subtotal = useMemo(() => calculateSubtotal(state.items), [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      state,
      dispatch,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      getItem,
    }),
    [
      state,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
      getItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
