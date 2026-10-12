import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  test('renders children', () => {
    render(<Button>Click me</Button>)

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  test('renders as child element when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/todo">Go</a>
      </Button>
    )

    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute(
      'href',
      '/todo'
    )
  })
})
