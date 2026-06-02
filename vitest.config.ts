import { defineConfig } from 'vitest/config';

/** Vitest config for unit and DOM tests. */
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
});
