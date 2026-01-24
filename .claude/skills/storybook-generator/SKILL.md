---
name: storybook-generator
description: Generate Storybook stories for React components using CSF format. This skill should be used when creating .stories.tsx files, documenting component variants and states, or setting up Storybook for UI components.
---

# Storybook Generator

Generate comprehensive Storybook stories following CSF (Component Story Format) best practices.

## When to Use

- Creating a new `.stories.tsx` file for a component
- Documenting component variants, sizes, and states
- Setting up interactive controls for component props

## Story File Structure

Story files should be named `[component-name].stories.tsx` and placed alongside component files.

```
src/components/ui/
├── button.tsx
└── button.stories.tsx
```

## Template

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { ComponentName } from './component-name'

type Story = StoryObj<typeof ComponentName>

export default {
  component: ComponentName,
  title: 'ui/component-name',
  parameters: {
    docs: {
      description: {
        component: `
Brief description of what the component does.

## Import

\`\`\`tsx
import { ComponentName } from '@/components/ui/component-name'
\`\`\`

## Usage

\`\`\`tsx
<ComponentName variant="default">Content</ComponentName>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      description: 'Visual style variant',
      control: 'select',
      options: ['default', 'outline', 'ghost'],
      table: {
        defaultValue: { summary: 'default' },
        type: { summary: 'default | outline | ghost' },
      },
    },
    size: {
      description: 'Size of the component',
      control: 'select',
      options: ['sm', 'default', 'lg'],
      table: {
        defaultValue: { summary: 'default' },
        type: { summary: 'sm | default | lg' },
      },
    },
    disabled: {
      description: 'Disables the component',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
        type: { summary: 'boolean' },
      },
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
  },
} satisfies Meta<typeof ComponentName>

// Default story - uses Story type for args interaction
export const Default: Story = {
  render: args => <ComponentName {...args} />,
  args: {
    children: 'Content',
  },
}

// Other stories - use function component exports
export const Variants = () => (
  <div className="flex gap-4">
    <ComponentName variant="default">Default</ComponentName>
    <ComponentName variant="outline">Outline</ComponentName>
    <ComponentName variant="ghost">Ghost</ComponentName>
  </div>
)

export const Sizes = () => (
  <div className="flex items-center gap-4">
    <ComponentName size="sm">Small</ComponentName>
    <ComponentName size="default">Default</ComponentName>
    <ComponentName size="lg">Large</ComponentName>
  </div>
)
```

## Key Rules

### Story Exports

1. **Default story only** uses `Story` type with object notation (for args controls)
2. **All other stories** use function component exports

```typescript
// ✅ Default - object notation
export const Default: Story = {
  render: args => <Component {...args} />,
  args: { children: 'Content' },
}

// ✅ Others - function exports
export const Variants = () => <Component variant="outline">Outline</Component>
```

### Meta Configuration Requirements

1. Include `## Import` section with correct import path
2. Include `## Usage` section with basic example
3. Document ALL props in `argTypes` with:
   - `description`: Clear explanation
   - `control`: Appropriate control type (select, boolean, text, etc.)
   - `table.defaultValue`: Default value if applicable
   - `table.type`: Type definition

### Showcase Helper Components

For components with many variants/states, create helper components:

```typescript
const VariantShowcase = ({ variant }: { variant: 'default' | 'outline' }) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground w-20 text-sm">default</span>
      <Component variant={variant}>Label</Component>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-muted-foreground w-20 text-sm">disabled</span>
      <Component variant={variant} disabled>Label</Component>
    </div>
  </div>
)

export const Primary = () => <VariantShowcase variant="default" />
export const Outline = () => <VariantShowcase variant="outline" />
```

### Title Conventions

```typescript
title: 'ui/button' // UI components
title: 'shared/error-boundary' // Shared components
title: 'features/auth/login' // Feature-specific
```

## Recommended Stories

For most components, include:

1. **Default** - Interactive with args controls
2. **Variants** - All visual variants side by side
3. **Sizes** - All size options (if applicable)
4. **States** - Disabled, loading, error states
5. **Overview** - Comprehensive showcase (for complex components)

## Checklist

- [ ] File named `[component].stories.tsx`
- [ ] Meta has `## Import` and `## Usage` in description
- [ ] All props documented in argTypes
- [ ] Default story uses Story type
- [ ] Other stories use function exports
- [ ] Variants and Sizes stories included
