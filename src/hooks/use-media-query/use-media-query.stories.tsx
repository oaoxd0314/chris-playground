import type { Meta } from '@storybook/react-vite'
import { useMediaQuery } from '.'

export default {
  title: 'Hooks/useMediaQuery',
  parameters: {
    docs: {
      description: {
        component: `
A React hook for responsive design that tracks CSS media query matches in real-time.

## Import

\`\`\`tsx
import { useMediaQuery } from '@/hooks/use-media-query'
\`\`\`

## Usage

\`\`\`tsx
const isMobile = useMediaQuery('(max-width: 768px)')
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
const isLandscape = useMediaQuery('(orientation: landscape)')

return (
  <div>
    {isMobile ? 'Mobile View' : 'Desktop View'}
  </div>
)
\`\`\`

## Parameters

- \`query\`: string - A CSS media query string

## Returns

- boolean - True if the media query matches, false otherwise

## Examples

\`\`\`tsx
// Viewport width
useMediaQuery('(min-width: 1024px)')
useMediaQuery('(max-width: 768px)')

// Device features
useMediaQuery('(prefers-color-scheme: dark)')
useMediaQuery('(prefers-reduced-motion: reduce)')

// Orientation
useMediaQuery('(orientation: portrait)')
useMediaQuery('(orientation: landscape)')
\`\`\`
        `,
      },
    },
  },
} satisfies Meta

export const Overview = () => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <div className="space-y-4">
      <div className="rounded-md border p-4">
        <h3 className="mb-2 font-semibold">Current Device Type:</h3>
        <div className="text-lg">
          {isDesktop && '🖥️ Desktop (≥1024px)'}
          {isTablet && '📱 Tablet (768px - 1023px)'}
          {isMobile && '📱 Mobile (<768px)'}
        </div>
      </div>

      <div className="rounded-md border p-4">
        <h3 className="mb-2 font-semibold">Color Scheme Preference:</h3>
        <div className="text-lg">
          {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </div>
      </div>

      <div className="text-muted-foreground text-sm">
        Resize your browser window to see the values change in real-time.
      </div>
    </div>
  )
}
