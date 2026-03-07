import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'FlagFeedback',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es'
          ? 'flag-feedback.esm.js'
          : 'flag-feedback.umd.js',
    },
    // Bundle all dependencies — integration must be truly one-import
    rollupOptions: {},
  },
});
