import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.nuxt/**', '**/.output/**'],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  {
    rules: {
      // The React-Vue bridge intentionally uses `any` for cross-framework type boundaries
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/multi-word-component-names': 'off',
    },
  },

  eslintConfigPrettier,
]
