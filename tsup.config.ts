import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'index.ts',
    'components/cart/index.ts',
    'context/CartContext.tsx',
    'hooks/useCart.ts',
    'lib/cart-utils.ts',
    'types/cart.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'next'],
  banner: {
    js: '"use client";',
  },
});
