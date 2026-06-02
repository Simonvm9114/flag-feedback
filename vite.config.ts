import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** Vite config: dev playground under `dev/`, library build to `dist/`. */
export default defineConfig(({ command }) => ({
  plugins: command === 'build' ? [dts({ rollupTypes: true, insertTypesEntry: true })] : [],
  ...(command === 'serve' ? { root: 'dev' } : {}),
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FlagFeedback',
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'flag-feedback.esm.js' : 'flag-feedback.umd.js'),
    },
    emptyOutDir: true,
  },
}));
