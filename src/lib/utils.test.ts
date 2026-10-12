import { cn } from './utils'

describe('cn', () => {
  test('merges class names', () => {
    expect(cn('px-2', 'text-sm')).toBe('px-2 text-sm')
  })

  test('drops falsy values', () => {
    expect(cn('px-2', false, undefined, null, 'text-sm')).toBe('px-2 text-sm')
  })

  test('resolves conflicting tailwind classes with the last one', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
