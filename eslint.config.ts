import { tanstackConfig } from '@tanstack/eslint-config'
import perfectionist from 'eslint-plugin-perfectionist'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
  ...tanstackConfig,
  prettier,
  {
    plugins: {
      perfectionist,
    },
    rules: {
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['^@/', '^~/'],
          newlinesBetween: 0,
          groups: [
            'react',
            'tanstack',
            'type-import',
            ['value-builtin', 'value-external'],
            'type-internal',
            'value-internal',
            ['type-parent', 'type-sibling', 'type-index'],
            ['value-parent', 'value-sibling', 'value-index'],
            'unknown',
          ],
          customGroups: [
            {
              groupName: 'react',
              elementNamePattern: ['^react$', '^react-.+'],
            },
            { groupName: 'tanstack', elementNamePattern: '^@tanstack/.+' },
          ],
        },
      ],
      'perfectionist/sort-exports': 'error',
      'import/order': 'off',
    },
  },
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/build/**',
      'src/routeTree.gen.ts',
      '.claude/**',
    ],
  },
]
