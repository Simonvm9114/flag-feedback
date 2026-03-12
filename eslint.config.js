import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        customElements: 'readonly',
        HTMLElement: 'readonly',
        Image: 'readonly',
        location: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
      },
    },
  },
];
