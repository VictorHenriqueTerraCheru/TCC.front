import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Fronteiras da arquitetura (ver "Arquitetura" no CLAUDE.md):
// - uma feature só enxerga outra pelo index.ts dela;
// - common/ e infrastructure/ não conhecem features/ nem app/.
const importarFeaturePorDentro = {
  group: ['@/features/*/*'],
  message: 'Importe outra feature só pelo index.ts dela (@/features/<area>).',
}
const importarCamadaDeCima = {
  group: ['@/features', '@/features/*', '@/app', '@/app/*'],
  message: 'common/ e infrastructure/ não dependem de features/ nem de app/.',
}

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'src/infrastructure/api/schema.d.ts', 'public']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      prettier,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [importarFeaturePorDentro] }],
    },
  },
  {
    files: ['src/common/**/*.{ts,tsx}', 'src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [importarCamadaDeCima] }],
    },
  },
  {
    // Componentes do shadcn exportam variantes junto do componente.
    files: ['src/common/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
