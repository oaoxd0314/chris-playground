# Storybook Development Guide

This guide defines the standard approach for writing Storybook stories in this project.

## Standard Template

All Storybook stories should follow the pattern established in `packages/alison-ui/src/components/button/button.stories.tsx`.

## File Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Component } from '.'

export default {
  component: Component,
  title: 'ui/component-name',
  parameters: {
    docs: {
      description: {
        component: `
Component description here.

## Import

\`\`\`tsx
import { Component } from '@alison-ui/react/component-name'
\`\`\`

## Usage

\`\`\`tsx
<Component prop="value">
  Content
</Component>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    // Prop definitions here
  },
} satisfies Meta<typeof Component>

type Story = StoryObj<typeof Component>

export const Default: Story = {
  render: args => <Component {...args} />,
  args: {
    children: 'Default',
  },
}

export const Variants = () => (
  <div className="flex gap-4">
    <Component variant="default">Default</Component>
    <Component variant="outline">Outline</Component>
  </div>
)
```

## Key Requirements

### 1. Meta Configuration

```typescript
export default {
  component: Component,
  title: 'ui/component-name', // or 'product/component-name' for product-ui
  parameters: {
    docs: {
      description: {
        component: `...`,
      },
    },
  },
  argTypes: {
    // Detailed prop documentation
  },
} satisfies Meta<typeof Component>
```

### 2. Component Description

**MUST include** in `parameters.docs.description.component`:

- Brief component description
- `## Import` section with import statement
- `## Usage` section with basic usage example

Example:

```typescript
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
```

### 3. ArgTypes Documentation

Each prop MUST have:

- `description`: Clear explanation of the prop's purpose
- `control`: Appropriate control type (select, boolean, text, etc.)
- `table.defaultValue`: Default value if applicable
- `table.type`: Type definition

Example:

```typescript
argTypes: {
  variant: {
    description: 'The visual style variant of the button. Controls the color scheme and appearance.',
    control: 'select',
    options: ['default', 'outline', 'ghost', 'link', 'destructive', 'secondary'],
    table: {
      defaultValue: { summary: 'default' },
      type: { summary: 'default | outline | ghost | link | destructive | secondary' },
    },
  },
  disabled: {
    description: 'Disables the button, preventing user interaction and applying disabled styling.',
    control: 'boolean',
    table: {
      defaultValue: { summary: 'false' },
      type: { summary: 'boolean' },
    },
  },
}
```

### 4. Story Exports

**IMPORTANT**: Follow this exact pattern from `button.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite'

// Define Story type
type Story = StoryObj<typeof Component>

// ✅ Default story ONLY - uses Story type for args interaction
export const Default: Story = {
  render: args => <Component {...args} />,
  args: {
    children: 'Content',
  },
}

// ✅ All other stories - function component exports
export const Variants = () => (
  <div className="flex gap-4">
    <Component variant="default">Default</Component>
    <Component variant="outline">Outline</Component>
  </div>
)

export const WithIcon = () => (
  <Component>
    <Icon />
    Content
  </Component>
)
```

**Key Rules**:

- Import both `Meta` and `StoryObj` from '@storybook/react-vite'
- Define `type Story = StoryObj<typeof Component>`
- **ONLY** Default story uses `Story` type (enables args controls in Storybook)
- All other stories use function component exports

### 5. Required Stories

Every component SHOULD have at minimum:

1. **Default** - Basic usage example
2. **Variants** - Show all variant options (if applicable)
3. **Sizes** - Show all size options (if applicable)
4. **Overview** - Comprehensive showcase of all combinations

Example structure:

```typescript
export const Default = () => <Component>Default</Component>

export const Variants = () => (
  <div className="flex gap-4">
    <Component variant="default">Default</Component>
    <Component variant="outline">Outline</Component>
    <Component variant="ghost">Ghost</Component>
  </div>
)

export const Sizes = () => (
  <div className="flex flex-col gap-2">
    <Component size="sm">Small</Component>
    <Component size="default">Default</Component>
    <Component size="lg">Large</Component>
  </div>
)

export const Overview = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Variants</h3>
        <Variants />
      </div>
      <div>
        <h3 className="mb-4 text-lg font-semibold">Sizes</h3>
        <Sizes />
      </div>
    </div>
  )
}
```

### 6. Showcase Components

For complex components with multiple props, create helper components:

```typescript
const VariantShowcase = ({ variant }: { variant: 'default' | 'outline' | 'ghost' }) => {
  const variantLabel = variant.charAt(0).toUpperCase() + variant.slice(1)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">default</div>
        <Component variant={variant}>{variantLabel}</Component>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">disabled</div>
        <Component variant={variant} disabled>{variantLabel}</Component>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground w-20 text-sm">loading</div>
        <Component variant={variant} loading>{variantLabel}</Component>
      </div>
    </div>
  )
}

export const Primary = () => <VariantShowcase variant="default" />
export const Outline = () => <VariantShowcase variant="outline" />
export const Ghost = () => <VariantShowcase variant="ghost" />
```

## Component-Specific Guidelines

### UI Components (@alison-ui/react)

- **Title prefix**: `ui/`
- **Example**: `title: 'ui/button'`
- **Import path**: `@alison-ui/react/component-name`
- Focus on showcasing all visual states and variants

### Product Components (@product-ui/react)

- **Title prefix**: `product/` for general components
- **Title prefix**: `product/features/{domain}` for domain-specific components
- **Examples**:
  - `title: 'product/info-section'`
  - `title: 'product/features/mgcs/request-card'`
- **Import paths**:
  - `@product-ui/react/component-name`
  - `@product-ui/react/features/{domain}/component-name`
- Include realistic data examples and use cases

## Running Storybook

```bash
# Alison UI (generic components)
pnpm nx sb @alison-ui/react

# Product UI (product-specific components)
pnpm nx sb @product-ui/react
```

## Generating Storybook Stories

Claude Code will automatically use the `gen-storybook` skill when you ask to create or update Storybook stories. The skill ensures comprehensive story generation following this guide's conventions:

- Follows the button.stories.tsx template
- Generates complete Meta configuration
- Adds comprehensive argTypes documentation
- Creates multiple story variants (Default, Variants, Sizes, Overview)
- Includes Import and Usage sections in component description

**Usage**: Simply ask Claude to "create stories for [component]" or "update the stories for [component]" and the skill will be invoked automatically.

**Important**: Review and adjust the generated stories to ensure they match your component's specific props and use cases.

## Best Practices

1. **Self-documenting**: Stories should be clear enough to serve as documentation
2. **Visual testing**: Show all states (default, hover, disabled, loading, error, etc.)
3. **Accessibility**: Include examples with screen reader text and keyboard navigation
4. **Responsive**: Demonstrate responsive behavior when applicable
5. **Real data**: Use realistic examples, not Lorem Ipsum
6. **Edge cases**: Show empty states, long content, overflow scenarios

## Anti-patterns

❌ **Don't**:

- Use Story type for non-Default stories
- Skip `type Story = StoryObj<typeof Component>` definition
- Skip argTypes documentation
- Omit Import/Usage sections in description
- Use object notation for stories other than Default
- Hardcode values without showing variants
- Mix component logic with story presentation

✅ **Do**:

- Import both `Meta` and `StoryObj` types
- Use Story type ONLY for Default story
- Use function component exports for all other stories
- Document all props thoroughly in argTypes
- Include practical usage examples
- Follow the button.stories.tsx template exactly
- Create showcase components for complex demos
- Keep stories focused and single-purpose

## Reference Template

For the complete reference implementation, see:

```
packages/alison-ui/src/components/button/button.stories.tsx
```

This template demonstrates:

- Complete Meta configuration
- Comprehensive argTypes documentation
- Multiple story variants
- Showcase helper components
- Overview story with full feature coverage
