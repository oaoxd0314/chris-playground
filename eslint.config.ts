import { tanstackConfig } from '@tanstack/eslint-config'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  ...tanstackConfig,
  prettier,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      'src/routeTree.gen.ts',
    ],
  },
]
