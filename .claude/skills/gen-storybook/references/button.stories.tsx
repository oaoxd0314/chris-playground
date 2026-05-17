import type { Meta, StoryObj } from '@storybook/react-vite'

import { PlusIcon } from '@alison-ui/react/icons'

import { Button } from '.'

export default {
  component: Button,
  title: 'ui/button',
  parameters: {
    docs: {
      description: {
        component: `
A customizable button component with multiple variants and sizes.

## Import

\`\`\`tsx
import { Button } from '@alison-ui/react/button'
\`\`\`

## Usage

\`\`\`tsx
<Button variant="default" size="default">
  Click me
</Button>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      description:
        'The visual style variant of the button. Controls the color scheme and appearance.',
      control: 'select',
      options: [
        'default',
        'outline',
        'ghost',
        'link',
        'destructive',
        'secondary',
      ],
      table: {
        defaultValue: { summary: 'default' },
        type: {
          summary: 'default | outline | ghost | link | destructive | secondary',
        },
      },
    },
    size: {
      description:
        'The size of the button. Icon sizes are optimized for displaying only an icon.',
      control: 'select',
      options: ['default', 'sm', 'icon-sm', 'icon', 'icon-lg', 'lg'],
      table: {
        defaultValue: { summary: 'default' },
        type: { summary: 'default | sm | icon-sm | icon | icon-lg | lg' },
      },
    },
    disabled: {
      description:
        'Disables the button, preventing user interaction and applying disabled styling.',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    loading: {
      description:
        'Shows a loading spinner and disables the button. Useful for async operations.',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    asChild: {
      description:
        'When true, the button will merge its props with its immediate child element instead of rendering as a button. Useful for creating button-styled links.',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    children: {
      description: 'The content to display inside the button.',
      control: 'text',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the button.',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Button>

type Story = StoryObj<typeof Button>

export const Default: Story = {
  render: args => <Button {...args} />,
  args: {
    children: 'Button',
  },
}

const VariantShowcase = ({
  variant,
}: {
  variant:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'secondary'
}) => {
  const variantLabel = variant.charAt(0).toUpperCase() + variant.slice(1)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">default</div>
        <Button variant={variant}>{variantLabel}</Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">sm</div>
        <Button variant={variant} size="sm">
          {variantLabel}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon-sm</div>
        <Button variant={variant} size="icon-sm">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon</div>
        <Button variant={variant} size="icon">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon-lg</div>
        <Button variant={variant} size="icon-lg">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">lg</div>
        <Button variant={variant} size="lg">
          {variantLabel}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">disabled</div>
        <Button variant={variant} disabled>
          {variantLabel}
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">loading</div>
        <Button variant={variant} loading>
          {variantLabel}
        </Button>
      </div>
    </div>
  )
}

export const Primary = () => <VariantShowcase variant="default" />

export const Outline = () => <VariantShowcase variant="outline" />

export const Ghost = () => <VariantShowcase variant="ghost" />

export const Link = () => <VariantShowcase variant="link" />

export const Destructive = () => <VariantShowcase variant="destructive" />

export const Secondary = () => <VariantShowcase variant="secondary" />

export const Overview = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Primary</h3>
        <Primary />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Outline</h3>
        <Outline />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Ghost</h3>
        <Ghost />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Link</h3>
        <Link />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Destructive</h3>
        <Destructive />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Secondary</h3>
        <Secondary />
      </div>
    </div>
  )
}

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">default</div>
        <Button>Button</Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">sm</div>
        <Button size="sm">Button</Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon-sm</div>
        <Button size="icon-sm">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon</div>
        <Button size="icon">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">icon-lg</div>
        <Button size="icon-lg">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">lg</div>
        <Button size="lg">Button</Button>
      </div>
    </div>
  )
}

export const Variants = () => {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="secondary">Secondary</Button>
    </div>
  )
}

export const Loading = () => {
  return (
    <div className="flex gap-4">
      <Button loading>Default</Button>
      <Button loading variant="outline">
        Outline
      </Button>
      <Button loading variant="ghost">
        Ghost
      </Button>
      <Button loading variant="link">
        Link
      </Button>
      <Button loading variant="destructive">
        Destructive
      </Button>
      <Button loading variant="secondary">
        Secondary
      </Button>
    </div>
  )
}
