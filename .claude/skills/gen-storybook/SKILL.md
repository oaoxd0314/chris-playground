---
name: gen-storybook
description: Generate comprehensive Storybook stories following CSF 3.0 best practices and project conventions. Use this skill when creating new Storybook stories, updating existing stories, or when asked to generate stories for UI components in @alison-ui/react or @product-ui/react packages. Triggers include phrases like "gen-storybook", "create stories", "add storybook", "write stories", or when working with component files that need story documentation.
---

# Storybook Story Generator

## Overview

Generate comprehensive, well-documented Storybook stories following Component Story Format (CSF) 3.0 and project-specific conventions. This skill ensures consistent story structure, complete prop documentation, and proper showcase patterns across all UI components.

## Quick Reference

**Template location**: `references/button.stories.tsx` (authoritative reference implementation)
**Documentation**: `references/storybook.md` (complete guidelines)
**Run Storybook**:

- Alison UI: `pnpm nx sb @alison-ui/react` (port 6006)
- Product UI: `pnpm nx sb @product-ui/react` (port 6008)

## Story Generation Workflow

### 1. Identify Component Context

Before generating stories, determine:

- **Component location**: Which package does it belong to?
  - `packages/alison-ui/src/components/` → Generic UI components
  - `packages/product-ui/src/components/` → Product-specific shared components
  - `packages/product-ui/src/features/{domain}/` → Domain-specific components

- **Component props**: Read the component file to understand:
  - Available variants (e.g., 'default', 'outline', 'ghost')
  - Size options (e.g., 'sm', 'default', 'lg')
  - Boolean flags (e.g., disabled, loading)
  - Content props (e.g., children, icon)

### 2. Generate Meta Configuration

Follow this exact structure from `references/button.stories.tsx`:

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Component } from '.'

export default {
  component: Component,
  title: 'ui/component-name', // See Title Conventions below
  parameters: {
    docs: {
      description: {
        component: `
[Brief component description in 1-2 sentences]

## Import

\`\`\`tsx
import { Component } from '@alison-ui/react/component-name'
\`\`\`

## Usage

\`\`\`tsx
<Component variant="default" size="default">
  Content
</Component>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    // Document ALL props here
  },
} satisfies Meta<typeof Component>
```

**Title Conventions**:

- `@alison-ui/react`: `title: 'ui/component-name'`
- `@product-ui/react` (general): `title: 'product/component-name'`
- `@product-ui/react` (domain-specific): `title: 'product/features/{domain}/component-name'`

### 3. Document Props in argTypes

**EVERY prop MUST include**:

```typescript
argTypes: {
  variant: {
    description: 'The visual style variant. Controls color scheme and appearance.',
    control: 'select',
    options: ['default', 'outline', 'ghost'],
    table: {
      defaultValue: { summary: 'default' },
      type: { summary: 'default | outline | ghost' },
    },
  },
  disabled: {
    description: 'Disables the component, preventing interaction.',
    control: 'boolean',
    table: {
      defaultValue: { summary: 'false' },
      type: { summary: 'boolean' },
    },
  },
  className: {
    description: 'Additional CSS classes to apply.',
    control: 'text',
    table: {
      type: { summary: 'string' },
    },
  },
}
```

**Required fields for each prop**:

- `description`: Clear explanation
- `control`: Appropriate control type (select, boolean, text, number)
- `table.defaultValue`: Default value if applicable
- `table.type`: TypeScript type definition

### 4. Create Story Exports

**CRITICAL PATTERN** - Follow this EXACTLY:

```typescript
// Define Story type (required)
type Story = StoryObj<typeof Component>

// ✅ Default story ONLY uses Story type (enables args controls)
export const Default: Story = {
  render: args => <Component {...args} />,
  args: {
    children: 'Content',
  },
}

// ✅ All other stories use function component exports
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
```

**Why this pattern?**

- Default story with `Story` type allows interactive args controls in Storybook
- Function component exports for other stories provide cleaner, more readable code
- Each story is easily shareable and serves as a visual test case

### 5. Create Showcase Helper Components

For components with multiple states (default, disabled, loading, etc.), create helper components:

```typescript
const VariantShowcase = ({
  variant
}: {
  variant: 'default' | 'outline' | 'ghost'
}) => {
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

### 6. Create Overview Story

Combine all showcases into a comprehensive overview:

```typescript
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
    </div>
  )
}
```

## Required Stories (Minimum)

Every component story file SHOULD include:

1. **Default** - Basic usage with interactive args controls
2. **Variants** - Show all variant options (if applicable)
3. **Sizes** - Show all size options (if applicable)
4. **Overview** - Comprehensive showcase of all combinations

Additional stories as needed:

- **Loading** - Loading states
- **Disabled** - Disabled states
- **WithIcon** - Icon combinations
- **Complex** - Advanced use cases

## Common Patterns

### Simple Components (No Complex States)

```typescript
export const Variants = () => (
  <div className="flex gap-4">
    <Component variant="default">Default</Component>
    <Component variant="outline">Outline</Component>
  </div>
)
```

### Complex Components (Multiple States)

Use showcase helper components (see Step 5 above).

### Components with Mock Data

Define data factories:

```typescript
const getUser = (overrides = {}) => ({
  username: "John Doe",
  email: "john@example.com",
  avatar: "https://example.com/avatar.png",
  ...overrides,
})

export const WithUser = () => (
  <Component user={getUser()} />
)
```

### Components Needing Context

Use decorators:

```typescript
const withProvider = (Story) => (
  <ThemeProvider>
    <Story />
  </ThemeProvider>
)

export const WithTheme = () => <Component />
WithTheme.decorators = [withProvider]
```

## Best Practices

Follow these principles when generating stories:

1. **Self-documenting**: Stories should be clear enough to serve as documentation
2. **Visual testing**: Show all states (default, hover, disabled, loading, error, etc.)
3. **Accessibility**: Include examples with screen reader text and keyboard navigation
4. **Responsive**: Demonstrate responsive behavior when applicable
5. **Real data**: Use realistic examples, not Lorem Ipsum or placeholder text
6. **Edge cases**: Show empty states, long content, overflow scenarios
7. **Single responsibility**: Each story focuses on one specific aspect or state
8. **Practical examples**: Include real-world usage patterns

## Anti-patterns

❌ **Don't**:

- Use Story type for non-Default stories (breaks the pattern)
- Skip `type Story = StoryObj<typeof Component>` definition
- Skip argTypes documentation (makes props undiscoverable)
- Omit Import/Usage sections in component description
- Use object notation (CSF 2.0) for stories other than Default
- Hardcode values without showing variants or states
- Mix component logic with story presentation
- Create stories that aren't self-contained
- Use external data sources that hide implementation

✅ **Do**:

- Import both `Meta` and `StoryObj` types
- Use Story type ONLY for Default story (enables args controls)
- Use function component exports for all other stories
- Document all props thoroughly in argTypes
- Include practical usage examples in description
- Follow the button.stories.tsx template exactly
- Create showcase components for complex state matrices
- Keep stories focused and single-purpose
- Define mock data inline for code visibility

## Quality Checklist

Before completing story generation, verify:

- [ ] Imports include both `Meta` and `StoryObj` from '@storybook/react-vite'
- [ ] Meta has component description with `## Import` and `## Usage` sections
- [ ] ALL props documented in argTypes with description, control, table.type
- [ ] `type Story = StoryObj<typeof Component>` defined after meta
- [ ] Default story uses `Story` type with object notation
- [ ] All other stories use function component exports
- [ ] Title prefix matches package (`ui/`, `product/`, or `product/features/{domain}/`)
- [ ] Required stories present: Default, Variants, Sizes, Overview
- [ ] Showcase helper components created for complex state matrices
- [ ] File saved as `[component-name].stories.tsx` alongside component
- [ ] Stories follow best practices (realistic data, edge cases, accessibility)
- [ ] No anti-patterns present (proper type usage, complete documentation)

## Troubleshooting

### Story not appearing in Storybook

- Check title prefix matches package convention
- Ensure file ends with `.stories.tsx`
- Verify Storybook is running on correct port

### Args controls not working

- Ensure Default story uses `Story` type (not function export)
- Verify argTypes are defined in meta
- Check that render function spreads {...args}

### "Show code" doesn't display complete example

- Define helper components inline within story render function
- Avoid importing external utilities or mock data from separate files
- Keep mock data within the story for visibility

## References

This skill includes reference materials in the `references/` directory:

- **button.stories.tsx** - Authoritative template implementation showing all patterns and conventions
- **storybook.md** - Complete Storybook development guide with detailed explanations

**Usage**: Refer to these files when generating stories to ensure consistency with established patterns. The button.stories.tsx template demonstrates production-ready story structure used across the project.
