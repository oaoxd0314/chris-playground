import type { Meta } from '@storybook/react-vite'
import type { Breakpoint } from '.'
import { useBreakPointBetween, useBreakPointDown, useBreakPointUp } from '.'

export default {
  title: 'Hooks/useBreakPoints',
  parameters: {
    docs: {
      description: {
        component: `
A collection of React hooks for Tailwind CSS breakpoint-based responsive design.

## Import

\`\`\`tsx
import {
  useBreakPointDown,
  useBreakPointUp,
  useBreakPointBetween,
  useBreakPointOnly,
  useBreakPointNot,
} from '@/hooks/use-break-points'
\`\`\`

## Available Hooks

### useBreakPointDown
Matches when viewport is **smaller than** the specified breakpoint.

\`\`\`tsx
const isMobile = useBreakPointDown('md') // true when < 768px
\`\`\`

### useBreakPointUp
Matches when viewport is **larger than or equal to** the specified breakpoint.

\`\`\`tsx
const isDesktop = useBreakPointUp('lg') // true when ≥ 1024px
\`\`\`

### useBreakPointBetween
Matches when viewport is **between** two breakpoints.

\`\`\`tsx
const isTablet = useBreakPointBetween('md', 'lg') // true when 768px - 1023px
\`\`\`

## Breakpoints

Based on Tailwind CSS default breakpoints:
- \`sm\`: 640px
- \`md\`: 768px
- \`lg\`: 1024px
- \`xl\`: 1280px
- \`2xl\`: 1536px

## Usage Example

\`\`\`tsx
const Component = () => {
  const isMobile = useBreakPointDown('md')
  const isDesktop = useBreakPointUp('lg')

  return (
    <div>
      {isMobile && <MobileNav />}
      {isDesktop && <DesktopNav />}
    </div>
  )
}
\`\`\`
        `,
      },
    },
  },
} satisfies Meta

export const Overview = () => {
  const breakpoints: Array<Breakpoint> = ['sm', 'md', 'lg', 'xl', '2xl']

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <h3 className="mb-4 font-semibold">useBreakPointDown (smaller than)</h3>
        <div className="space-y-2">
          {breakpoints.map(bp => {
            const matches = useBreakPointDown(bp)
            return (
              <div key={bp} className="flex items-center gap-2">
                <span className="w-12 font-mono text-sm">{bp}:</span>
                <span
                  className={`rounded px-2 py-1 text-sm ${matches ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                >
                  {matches ? '✓ Matches' : '✗ No match'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="mb-4 font-semibold">useBreakPointUp (larger than)</h3>
        <div className="space-y-2">
          {breakpoints.map(bp => {
            const matches = useBreakPointUp(bp)
            return (
              <div key={bp} className="flex items-center gap-2">
                <span className="w-12 font-mono text-sm">{bp}:</span>
                <span
                  className={`rounded px-2 py-1 text-sm ${matches ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
                >
                  {matches ? '✓ Matches' : '✗ No match'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="mb-4 font-semibold">useBreakPointBetween</h3>
        <div className="space-y-2">
          <BreakpointBetweenDemo start="sm" end="md" />
          <BreakpointBetweenDemo start="md" end="lg" />
          <BreakpointBetweenDemo start="lg" end="xl" />
          <BreakpointBetweenDemo start="xl" end="2xl" />
        </div>
      </div>

      <div className="text-muted-foreground text-sm">
        Resize your browser window to see the breakpoint matches change.
      </div>
    </div>
  )
}

function BreakpointBetweenDemo({
  start,
  end,
}: {
  start: Breakpoint
  end: Breakpoint
}) {
  const matches = useBreakPointBetween(start, end)
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm">
        {start} - {end}:
      </span>
      <span
        className={`rounded px-2 py-1 text-sm ${matches ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
      >
        {matches ? '✓ Matches' : '✗ No match'}
      </span>
    </div>
  )
}
